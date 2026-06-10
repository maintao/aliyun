import { OSSDirectUploadPolicyOptions, OSSDirectUploadSignature } from "./oss-direct-upload-types";
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
export declare class OSSDirectUploadServer {
    private readonly config;
    /**
     * @param config OSS 连接与签名配置，`accessKeySecret` 仅保存在服务端内存中
     */
    constructor(config: OSSDirectUploadServerConfig);
    /**
     * 生成 Web 端 PostObject 直传所需的签名参数。
     *
     * 将返回值 JSON 序列化后发给前端；前端使用 {@link directUploadToOSS} 或
     * {@link fetchSignatureAndUploadToOSS} 完成上传。
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
    getPostSignature(options: OSSDirectUploadPolicyOptions): Promise<OSSDirectUploadSignature>;
}
//# sourceMappingURL=oss-direct-upload-server.d.ts.map