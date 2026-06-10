"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSignatureAndUploadToOSS = exports.directUploadToOSS = void 0;
function buildObjectUrl(host, key) {
    const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
    return `${host.replace(/\/$/, "")}/${normalizedKey}`;
}
function buildUploadFormData(file, signature, key) {
    const formData = new FormData();
    formData.append("success_action_status", signature.success_action_status);
    formData.append("policy", signature.policy);
    formData.append("x-oss-signature", signature.signature);
    formData.append("x-oss-signature-version", signature.x_oss_signature_version);
    formData.append("x-oss-credential", signature.x_oss_credential);
    formData.append("x-oss-date", signature.x_oss_date);
    formData.append("key", key);
    if (signature.security_token) {
        formData.append("x-oss-security-token", signature.security_token);
    }
    if (signature.callback) {
        formData.append("callback", signature.callback);
    }
    if (signature.callback_var) {
        formData.append("callback-var", signature.callback_var);
    }
    formData.append("file", file);
    return formData;
}
function uploadWithXHR(file, signature, formData, key, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", signature.host, true);
        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) {
                return;
            }
            onProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ key, url: buildObjectUrl(signature.host, key) });
                return;
            }
            reject(new Error(`OSS 直传失败: ${xhr.status} ${xhr.statusText}${xhr.responseText ? ` - ${xhr.responseText}` : ""}`));
        };
        xhr.onerror = () => {
            reject(new Error("OSS 直传失败: 网络错误"));
        };
        xhr.send(formData);
    });
}
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
async function directUploadToOSS(options) {
    var _a;
    const { file, signature, key: keyOverride, onProgress } = options;
    const key = (_a = keyOverride !== null && keyOverride !== void 0 ? keyOverride : signature.key) !== null && _a !== void 0 ? _a : `${signature.dir}${file.name}`;
    const formData = buildUploadFormData(file, signature, key);
    if (onProgress) {
        return uploadWithXHR(file, signature, formData, key, onProgress);
    }
    const response = await fetch(signature.host, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`OSS 直传失败: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
    }
    return { key, url: buildObjectUrl(signature.host, key) };
}
exports.directUploadToOSS = directUploadToOSS;
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
async function fetchSignatureAndUploadToOSS(options) {
    const { file, signatureUrl, signatureFetch, key, onProgress } = options;
    const response = await fetch(signatureUrl, Object.assign({ method: "GET" }, signatureFetch));
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`获取 OSS 上传签名失败: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
    }
    const signature = (await response.json());
    return directUploadToOSS({ file, signature, key, onProgress });
}
exports.fetchSignatureAndUploadToOSS = fetchSignatureAndUploadToOSS;
//# sourceMappingURL=oss-direct-upload-web.js.map