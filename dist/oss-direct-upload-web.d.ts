import { OSSDirectUploadWebOptions, OSSDirectUploadWebResult, OSSDirectUploadWithSignatureOptions } from "./oss-direct-upload-types";
/**
 * Web 端使用已有签名直传文件到 OSS（PostObject）。
 *
 * 从 `@fnmain/aliyun` 导入，适用于浏览器环境。
 * 若尚未获取签名，请使用 {@link fetchSignatureAndUploadToOSS}。
 *
 * @param options 文件、签名及可选进度回调
 * @returns 上传后的 key 与访问 URL
 *
 * @example
 * ```ts
 * import { directUploadToOSS } from "@fnmain/aliyun";
 *
 * // 方式一：自行请求签名接口
 * const signature = await fetch("/api/oss/upload-signature", { credentials: "include" })
 *   .then((r) => r.json());
 *
 * const result = await directUploadToOSS({
 *   file: selectedFile,
 *   signature,
 *   onProgress: (percent) => console.log(percent),
 * });
 * console.log(result.url);
 * ```
 *
 * @see https://help.aliyun.com/zh/oss/user-guide/uploading-objects-to-oss-directly-from-clients/
 */
export declare function directUploadToOSS(options: OSSDirectUploadWebOptions): Promise<OSSDirectUploadWebResult>;
/**
 * 从业务服务端获取签名并直传文件到 OSS（获取签名 + 上传两步合一）。
 *
 * 从 `@fnmain/aliyun` 导入，适用于浏览器环境。
 * 等价于先请求 `signatureUrl`，再调用 {@link directUploadToOSS}。
 *
 * @param options 文件、签名接口地址及可选 fetch / 进度配置
 * @returns 上传后的 key 与访问 URL
 *
 * @example
 * ```ts
 * import { fetchSignatureAndUploadToOSS } from "@fnmain/aliyun";
 *
 * const result = await fetchSignatureAndUploadToOSS({
 *   file: selectedFile,
 *   signatureUrl: "/api/oss/upload-signature",
 *   signatureFetch: {
 *     credentials: "include",
 *     headers: { Authorization: `Bearer ${token}` },
 *   },
 *   onProgress: (percent) => setProgress(percent),
 * });
 * ```
 */
export declare function fetchSignatureAndUploadToOSS(options: OSSDirectUploadWithSignatureOptions): Promise<OSSDirectUploadWebResult>;
//# sourceMappingURL=oss-direct-upload-web.d.ts.map