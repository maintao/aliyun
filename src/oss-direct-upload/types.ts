import type { OSSDirectUploadCallbackConfig } from "./callback-types";

/**
 * 服务端生成并返回给 Web 端的直传签名参数。
 * 由 {@link OSSDirectUploadServer.getPostSignature} 产出，传给 {@link directUploadToOSS} 使用。
 *
 * @example
 * ```ts
 * // 服务端
 * const signature = await uploadServer.getPostSignature({ dir: "uploads/", key });
 * res.json(signature);
 *
 * // 前端
 * await directUploadToOSS({ file, signature });
 * ```
 */
export interface OSSDirectUploadSignature {
  /** 允许上传的文件前缀目录 */
  dir: string;
  /** 精确 object key；传入 key 选项时由服务端指定，前端须用此 key 上传 */
  key?: string;
  /** Bucket 访问域名，如 `https://bucket.oss-cn-hangzhou.aliyuncs.com` */
  host: string;
  /** Base64 编码的上传 Policy */
  policy: string;
  /** STS 安全令牌；主账号直签模式下不存在 */
  security_token?: string;
  /** Policy 签名（非 AccessKeySecret） */
  signature: string;
  /** 派生密钥参数，含 AccessKeyId */
  x_oss_credential: string;
  /** 请求时间，ISO 8601 格式 */
  x_oss_date: string;
  /** 签名版本，固定为 OSS4-HMAC-SHA256 */
  x_oss_signature_version: "OSS4-HMAC-SHA256";
  /** 上传成功时 OSS 返回的 HTTP 状态码 */
  success_action_status: string;
  /** Base64 编码的上传回调配置（PostObject callback 表单域） */
  callback?: string;
  /** Base64 编码的自定义回调变量（PostObject callback-var 表单域） */
  callback_var?: string;
}

/**
 * {@link OSSDirectUploadServer.getPostSignature} 的 Policy 配置。
 *
 * @example
 * ```ts
 * const signature = await uploadServer.getPostSignature({
 *   dir: "uploads/",
 *   key: `uploads/${userId}/${randomUUID()}.jpg`, // 推荐：精确 key，单次上传
 *   callback: {
 *     callbackUrl: "https://api.example.com/oss/callback",
 *   },
 * });
 * ```
 */
export interface OSSDirectUploadPolicyOptions {
  /** 上传文件前缀目录，如 `uploads/` */
  dir: string;
  /**
   * 精确 object key，如 `uploads/user123/abc.jpg`。
   * 设置后 Policy 使用 `eq` 约束，仅允许上传到该路径（推荐用于单次上传）。
   */
  key?: string;
  /** 签名有效期（秒），默认 20 */
  expireSeconds?: number;
  /** 允许的最小文件大小（字节），默认 1 */
  minSize?: number;
  /** 允许的最大文件大小（字节），默认 10MB */
  maxSize?: number;
  /** 上传成功时 OSS 返回的 HTTP 状态码，默认 200 */
  successActionStatus?: string;
  /** 上传成功后 OSS 向业务服务器发送回调通知的配置 */
  callback?: OSSDirectUploadCallbackConfig;
}

/**
 * {@link directUploadToOSS} 的入参。
 * 适用于已从业务服务端拿到签名的场景。
 *
 * @example
 * ```ts
 * const signature = await fetch("/api/oss/upload-signature").then((r) => r.json());
 * const result = await directUploadToOSS({
 *   file: selectedFile,
 *   signature,
 *   onProgress: (p) => console.log(`${p}%`),
 * });
 * ```
 */
export interface OSSDirectUploadWebOptions {
  /** 待上传的文件 */
  file: File;
  /** 业务服务端返回的签名参数 */
  signature: OSSDirectUploadSignature;
  /** 自定义 OSS object key，默认使用 `signature.key` 或 `${dir}${file.name}` */
  key?: string;
  /** 上传进度回调（0-100）；传入时使用 XMLHttpRequest 以支持进度 */
  onProgress?: (percent: number) => void;
}

/** {@link directUploadToOSS} 的返回值 */
export interface OSSDirectUploadWebResult {
  /** 上传后的 OSS object key */
  key: string;
  /** 上传后的访问 URL */
  url: string;
}
