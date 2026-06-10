import { createHmac, type BinaryLike } from "crypto";
import OSS from "ali-oss";
import { encodeOSSDirectUploadCallback } from "./callback";
import { OSSDirectUploadPolicyOptions, OSSDirectUploadSignature } from "./types";

/**
 * {@link OSSDirectUploadServer} 的构造配置。
 * **仅服务端使用**，切勿传入前端或暴露给客户端。
 *
 * @example
 * ```ts
 * // 主账号直签（不传 roleArn）
 * const uploadServer = new OSSDirectUploadServer({
 *   region: "cn-hangzhou",
 *   bucket: "my-bucket",
 *   accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
 *   accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
 * });
 *
 * // STS 模式（推荐生产环境）
 * const uploadServerWithSts = new OSSDirectUploadServer({
 *   region: "cn-hangzhou",
 *   bucket: "my-bucket",
 *   accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
 *   accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
 *   roleArn: process.env.OSS_STS_ROLE_ARN!,
 * });
 * ```
 */
export interface OSSDirectUploadServerConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  /**
   * RAM 角色 ARN，配置后走 STS 临时凭证签名。
   * 不传则使用 accessKeyId/Secret 直签（主账号或长期 AK 模式）。
   */
  roleArn?: string;
  roleSessionName?: string;
  /** 是否使用 HTTPS，默认 true */
  secure?: boolean;
}

function getStandardRegion(region: string): string {
  return region.replace(/^oss-/i, "");
}

function formatXOssDate(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function buildHost(bucket: string, region: string, secure: boolean): string {
  const protocol = secure ? "https" : "http";
  return `${protocol}://${bucket}.oss-${getStandardRegion(region)}.aliyuncs.com`;
}

function buildXOssCredential(accessKeyId: string, date: string, region: string): string {
  return `${accessKeyId}/${date}/${getStandardRegion(region)}/oss/aliyun_v4_request`;
}

function hmacSha256(key: BinaryLike, data: string): Uint8Array {
  return Uint8Array.from(createHmac("sha256", key).update(data, "utf8").digest());
}

function signPostObjectPolicyV4(
  accessKeySecret: string,
  region: string,
  xOssDate: string,
  policyBase64: string,
): string {
  const date = xOssDate.split("T")[0];
  let signingKey = hmacSha256(`aliyun_v4${accessKeySecret}`, date);
  signingKey = hmacSha256(signingKey, getStandardRegion(region));
  signingKey = hmacSha256(signingKey, "oss");
  signingKey = hmacSha256(signingKey, "aliyun_v4_request");
  return Buffer.from(hmacSha256(signingKey, policyBase64)).toString("hex");
}

function normalizeDir(dir: string): string {
  if (!dir) {
    return "";
  }
  return dir.endsWith("/") ? dir : `${dir}/`;
}

type PolicyCondition =
  | Record<string, string>
  | [string, string]
  | [string, string, string]
  | [string, number, number];

/**
 * OSS Web 端服务端签名直传（PostObject V4）。
 *
 * - 不传 `roleArn`：主账号 / 长期 AK 直签
 * - 传 `roleArn`：STS 临时凭证签名
 *
 * 从 `@fnmain/aliyun/oss` 导入，**仅运行在服务端**。
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/obtain-signature-information-from-the-server-and-upload-data-to-oss
 *
 * @example
 * ```ts
 * import { OSSDirectUploadServer } from "@fnmain/aliyun/oss";
 * import { randomUUID } from "crypto";
 *
 * const uploadServer = new OSSDirectUploadServer({ region, bucket, accessKeyId, accessKeySecret });
 *
 * app.get("/api/oss/upload-signature", async (req, res) => {
 *   const key = `uploads/${req.user.id}/${randomUUID()}.jpg`;
 *   const signature = await uploadServer.getPostSignature({ dir: "uploads/", key });
 *   res.json(signature);
 * });
 * ```
 */
export class OSSDirectUploadServer {
  private readonly config: OSSDirectUploadServerConfig;

  /**
   * @param config OSS 连接与签名配置，`accessKeySecret` 仅保存在服务端内存中
   */
  constructor(config: OSSDirectUploadServerConfig) {
    this.config = config;
  }

  /**
   * 生成 Web 端 PostObject 直传所需的签名参数。
   *
   * 将返回值 JSON 序列化后发给前端；前端使用 {@link directUploadToOSS} 完成上传。
   *
   * @param options Policy 约束（目录、精确 key、大小、过期时间、回调等）
   * @returns 签名参数，不含 `accessKeySecret`
   *
   * @example
   * ```ts
   * const signature = await uploadServer.getPostSignature({
   *   dir: "uploads/",
   *   key: `uploads/${userId}/${fileId}.png`,
   *   callback: {
   *     callbackUrl: "https://api.example.com/oss/callback",
   *     customVars: { userId },
   *   },
   * });
   * ```
   */
  async getPostSignature(options: OSSDirectUploadPolicyOptions): Promise<OSSDirectUploadSignature> {
    const {
      dir,
      key,
      expireSeconds = 20, // 20 秒有效期
      minSize = 1,
      maxSize = 10 * 1024 * 1024, // 10MB 最大文件大小
      successActionStatus = "200",
      callback,
    } = options;

    const uploadDir = normalizeDir(dir);
    const {
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      roleArn,
      roleSessionName,
      secure = true,
    } = this.config;

    let signingAccessKeyId = accessKeyId;
    let signingAccessKeySecret = accessKeySecret;
    let securityToken: string | undefined;

    if (roleArn) {
      const sts = new OSS.STS({ accessKeyId, accessKeySecret });
      const { credentials } = await sts.assumeRole(
        roleArn,
        undefined,
        expireSeconds,
        roleSessionName ?? "oss-direct-upload",
      );
      signingAccessKeyId = credentials.AccessKeyId;
      signingAccessKeySecret = credentials.AccessKeySecret;
      securityToken = credentials.SecurityToken;
    }

    const now = new Date();
    const expiration = new Date(now.getTime() + expireSeconds * 1000);
    const xOssDate = formatXOssDate(now);
    const date = xOssDate.split("T")[0];
    const xOssCredential = buildXOssCredential(signingAccessKeyId, date, region);

    const conditions: PolicyCondition[] = [
      { bucket },
      { "x-oss-credential": xOssCredential },
      { "x-oss-signature-version": "OSS4-HMAC-SHA256" },
      { "x-oss-date": xOssDate },
      ["content-length-range", minSize, maxSize],
      ["eq", "$success_action_status", successActionStatus],
    ];

    if (securityToken) {
      conditions.splice(4, 0, { "x-oss-security-token": securityToken });
    }

    if (key) {
      conditions.push(["eq", "$key", key]);
    } else {
      conditions.push(["starts-with", "$key", uploadDir]);
    }

    const policy = {
      expiration: expiration.toISOString(),
      conditions,
    };

    const policyBase64 = Buffer.from(JSON.stringify(policy), "utf8").toString("base64");
    const signature = signPostObjectPolicyV4(
      signingAccessKeySecret,
      region,
      xOssDate,
      policyBase64,
    );

    const result: OSSDirectUploadSignature = {
      dir: uploadDir,
      host: buildHost(bucket, region, secure),
      policy: policyBase64,
      signature,
      x_oss_credential: xOssCredential,
      x_oss_date: xOssDate,
      x_oss_signature_version: "OSS4-HMAC-SHA256",
      success_action_status: successActionStatus,
    };

    if (key) {
      result.key = key;
    }
    if (securityToken) {
      result.security_token = securityToken;
    }

    if (callback) {
      const callbackFields = encodeOSSDirectUploadCallback(callback);
      result.callback = callbackFields.callback;
      if (callbackFields.callback_var) {
        result.callback_var = callbackFields.callback_var;
      }
    }

    return result;
  }
}
