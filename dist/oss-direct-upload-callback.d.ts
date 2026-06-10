/// <reference types="node" />
import { OSSDirectUploadCallbackConfig, OSSDirectUploadCallbackFields, OSSDirectUploadCallbackPayload, OSSCallbackHandleOptions, OSSCallbackHandleResult, OSSCallbackIncomingRequest } from "./oss-direct-upload-callback-types";
/**
 * 将上传回调配置编码为 PostObject 表单域 `callback` / `callback-var`。
 *
 * 通常无需单独调用——{@link OSSDirectUploadServer.getPostSignature} 传入 `callback`
 * 选项时会自动编码。仅在需要手动构造表单时使用。
 *
 * @param config 回调 URL、body 模板及自定义变量
 * @returns Base64 编码后的表单域值
 *
 * @example
 * ```ts
 * import { encodeOSSDirectUploadCallback } from "@fnmain/aliyun/oss";
 *
 * const { callback, callback_var } = encodeOSSDirectUploadCallback({
 *   callbackUrl: "https://api.example.com/oss/callback",
 *   customVars: { orderId: "456" },
 * });
 * ```
 */
export declare function encodeOSSDirectUploadCallback(config: OSSDirectUploadCallbackConfig): OSSDirectUploadCallbackFields;
/**
 * 构造 OSS 回调 RSA 验签用的待签名字符串。
 *
 * 一般无需单独调用——{@link handleOSSUploadCallback} 内部会自动构造。
 * 仅在自行实现验签逻辑时使用。
 *
 * @param path 请求路径（含 query），如 `/api/oss/callback?id=1`
 * @param body 原始 POST body 字符串
 * @returns 待 RSA-MD5 验证的字符串
 *
 * @example
 * ```ts
 * const authString = buildOSSCallbackAuthString(req.url, rawBody);
 * const ok = verifyOSSCallbackSignature(publicKeyPem, authString, signature);
 * ```
 *
 * @see https://help.aliyun.com/zh/oss/developer-reference/callback
 */
export declare function buildOSSCallbackAuthString(path: string, body: string): string;
/**
 * 验证 OSS 回调请求的 RSA-MD5 签名。
 *
 * @param publicKeyPem 从 `x-oss-pub-key-url` 拉取的 OSS 公钥 PEM
 * @param authString {@link buildOSSCallbackAuthString} 构造的待验签字符串
 * @param signature `authorization` 请求头 Base64 解码后的二进制签名
 * @returns 验签是否通过
 *
 * @example
 * ```ts
 * const authString = buildOSSCallbackAuthString(path, body);
 * const signature = Buffer.from(authHeader, "base64");
 * if (!verifyOSSCallbackSignature(publicKeyPem, authString, signature)) {
 *   throw new Error("非法回调");
 * }
 * ```
 */
export declare function verifyOSSCallbackSignature(publicKeyPem: string, authString: string, signature: Buffer | Uint8Array): boolean;
/**
 * 解析 OSS 回调 POST body 为结构化对象。
 *
 * @param body 原始 POST body
 * @param contentType 内容类型，默认 `application/x-www-form-urlencoded`
 * @returns 解析后的回调载荷，字段取决于 `callbackBody` 模板
 *
 * @example
 * ```ts
 * // urlencoded（默认）
 * const payload = parseOSSCallbackBody(
 *   "bucket=my-bucket&object=uploads/a.jpg&size=1024",
 * );
 * console.log(payload.object); // uploads/a.jpg
 *
 * // json
 * const payloadJson = parseOSSCallbackBody('{"bucket":"my-bucket"}', "application/json");
 * ```
 */
export declare function parseOSSCallbackBody(body: string | Buffer, contentType?: string): OSSDirectUploadCallbackPayload;
/**
 * 验证并处理 OSS 上传完成后的回调通知（推荐入口）。
 *
 * 流程：拉取 OSS 公钥 → RSA 验签 → 解析 body → 执行 `onVerified` → 返回 OSS 所需响应。
 * 须在 **5 秒内** 将 `result.body` 写入 HTTP 响应，状态码使用 `result.status`。
 *
 * 从 `@fnmain/aliyun/oss` 导入，**仅运行在服务端**。
 *
 * @param request 回调 HTTP 请求（path、headers、raw body）
 * @param options 公钥缓存、验签后业务处理、自定义响应体等
 * @returns 可直接写入 HTTP 响应的结果
 *
 * @example
 * ```ts
 * import { handleOSSUploadCallback } from "@fnmain/aliyun/oss";
 *
 * app.post("/api/oss/callback", rawBodyMiddleware, async (req, res) => {
 *   const result = await handleOSSUploadCallback(
 *     { path: req.url, headers: req.headers, body: req.body },
 *     {
 *       onVerified: async (payload) => {
 *         await db.uploads.create({ key: payload.object, size: payload.size });
 *       },
 *     },
 *   );
 *   res.status(result.status).type("json").send(result.body);
 * });
 * ```
 *
 * @see https://help.aliyun.com/zh/oss/developer-reference/callback
 */
export declare function handleOSSUploadCallback(request: OSSCallbackIncomingRequest, options?: OSSCallbackHandleOptions): Promise<OSSCallbackHandleResult>;
export * from "./oss-direct-upload-callback-types";
//# sourceMappingURL=oss-direct-upload-callback.d.ts.map