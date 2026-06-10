import { OSSDirectUploadWebOptions, OSSDirectUploadWebResult } from "./types";
/**
 * Web 端使用已有签名直传文件到 OSS（PostObject）。
 *
 * 从 `@fnmain/aliyun` 导入，适用于浏览器环境。
 * 须先从业务服务端获取签名，再传入 `signature`。
 *
 * @param options 文件、签名及可选进度回调
 * @returns 上传后的 key 与访问 URL
 *
 * @example
 * ```ts
 * import { directUploadToOSS } from "@fnmain/aliyun";
 *
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
//# sourceMappingURL=web.d.ts.map