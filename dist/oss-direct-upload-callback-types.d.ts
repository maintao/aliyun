/// <reference types="node" />
/**
 * 上传回调配置，用于 PostObject 表单域 `callback`。
 *
 * 通常通过 {@link OSSDirectUploadServer.getPostSignature} 的 `callback` 选项传入，
 * 也可单独使用 {@link encodeOSSDirectUploadCallback} 编码。
 *
 * @example
 * ```ts
 * const callback: OSSDirectUploadCallbackConfig = {
 *   callbackUrl: "https://api.example.com/oss/callback",
 *   customVars: { userId: "123" },
 * };
 * ```
 */
export interface OSSDirectUploadCallbackConfig {
    /** 上传成功后 OSS POST 回调的业务服务器地址（须公网可达） */
    callbackUrl: string;
    /**
     * 回调请求体模板，支持 OSS 系统变量如 `${bucket}`、`${object}`、`${size}` 等。
     * 默认：`bucket=${bucket}&object=${object}&size=${size}&mimeType=${mimeType}&etag=${etag}`
     * @see https://help.aliyun.com/zh/oss/developer-reference/callback
     */
    callbackBody?: string;
    /** 回调 body 格式，默认 `application/x-www-form-urlencoded` */
    callbackBodyType?: "application/x-www-form-urlencoded" | "application/json";
    /** 回调请求的 Host 头，默认从 callbackUrl 解析 */
    callbackHost?: string;
    /** callbackUrl 为 HTTPS 时建议设为 true，避免 SNI 导致回调失败 */
    callbackSNI?: boolean;
    /** 自定义变量，编码为 `callback-var` 表单域（键自动加 `x:` 前缀） */
    customVars?: Record<string, string>;
}
/**
 * OSS 回调通知解析后的载荷。
 * 具体字段取决于签发签名时的 `callbackBody` 模板。
 */
export interface OSSDirectUploadCallbackPayload {
    bucket?: string;
    object?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
    etag?: string;
    height?: string;
    width?: string;
    format?: string;
    [key: string]: string | number | undefined;
}
/**
 * 传入 {@link handleOSSUploadCallback} 的请求，与具体 Web 框架解耦。
 *
 * @example
 * ```ts
 * // Express 示例（需先读取 raw body）
 * const result = await handleOSSUploadCallback({
 *   path: req.url,
 *   headers: req.headers,
 *   body: rawBody,
 * });
 * ```
 */
export interface OSSCallbackIncomingRequest {
    /** 请求路径，含 query，如 `/api/oss/callback?id=1` */
    path: string;
    headers: Record<string, string | string[] | undefined>;
    /** 原始请求体，不要提前 JSON 解析 */
    body: string | Buffer;
}
/** {@link handleOSSUploadCallback} 的可选配置 */
export interface OSSCallbackHandleOptions {
    /** 自定义公钥拉取，默认 HTTP GET 并缓存 */
    fetchPublicKey?: (url: string) => Promise<string>;
    /** 公钥 PEM 缓存，key 为公钥 URL */
    publicKeyCache?: Map<string, string>;
    /** 签名验证通过后的业务处理 */
    onVerified?: (payload: OSSDirectUploadCallbackPayload) => void | Promise<void>;
    /** 返回给 OSS 的响应体，默认 `{"Status":"OK"}` */
    responseBody?: string;
    /** 解析 body 时的 Content-Type，默认从请求头读取 */
    contentType?: string;
}
/** {@link handleOSSUploadCallback} 的返回结果，可直接写入 HTTP 响应 */
export interface OSSCallbackHandleResult {
    /** 验签及业务处理是否成功 */
    ok: boolean;
    /** 建议返回的 HTTP 状态码 */
    status: number;
    /** 应写入 HTTP 响应体的内容 */
    body: string;
    /** 验签成功后解析出的回调载荷 */
    payload?: OSSDirectUploadCallbackPayload;
    /** 失败时的错误描述 */
    error?: string;
}
/** {@link encodeOSSDirectUploadCallback} 的返回值，用于 PostObject 表单域 */
export interface OSSDirectUploadCallbackFields {
    /** Base64 编码的 `callback` 表单域值 */
    callback: string;
    /** Base64 编码的 `callback-var` 表单域值 */
    callback_var?: string;
}
//# sourceMappingURL=oss-direct-upload-callback-types.d.ts.map