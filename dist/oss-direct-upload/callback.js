"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOSSUploadCallback = exports.parseOSSCallbackBody = exports.verifyOSSCallbackSignature = exports.buildOSSCallbackAuthString = exports.encodeOSSDirectUploadCallback = void 0;
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const ALLOWED_PUB_KEY_PREFIXES = [
    "http://gosspublic.alicdn.com/",
    "https://gosspublic.alicdn.com/",
];
const DEFAULT_CALLBACK_BODY = "bucket=${bucket}&object=${object}&size=${size}&mimeType=${mimeType}&etag=${etag}";
const defaultPublicKeyCache = new Map();
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
function encodeOSSDirectUploadCallback(config) {
    var _a, _b;
    const callback = {
        callbackUrl: config.callbackUrl,
        callbackBody: (_a = config.callbackBody) !== null && _a !== void 0 ? _a : DEFAULT_CALLBACK_BODY,
        callbackBodyType: (_b = config.callbackBodyType) !== null && _b !== void 0 ? _b : "application/x-www-form-urlencoded",
    };
    if (config.callbackHost) {
        callback.callbackHost = config.callbackHost;
    }
    if (config.callbackSNI != null) {
        callback.callbackSNI = config.callbackSNI;
    }
    const result = {
        callback: Buffer.from(JSON.stringify(callback), "utf8").toString("base64"),
    };
    if (config.customVars && Object.keys(config.customVars).length > 0) {
        const vars = {};
        for (const [key, value] of Object.entries(config.customVars)) {
            vars[key.startsWith("x:") ? key : `x:${key}`] = value;
        }
        result.callback_var = Buffer.from(JSON.stringify(vars), "utf8").toString("base64");
    }
    return result;
}
exports.encodeOSSDirectUploadCallback = encodeOSSDirectUploadCallback;
function isAllowedPubKeyUrl(url) {
    return ALLOWED_PUB_KEY_PREFIXES.some((prefix) => url.startsWith(prefix));
}
function getHeader(headers, name) {
    const target = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() !== target) {
            continue;
        }
        return Array.isArray(value) ? value[0] : value;
    }
    return undefined;
}
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
function buildOSSCallbackAuthString(path, body) {
    const queryIndex = path.indexOf("?");
    if (queryIndex === -1) {
        return decodeURIComponent(path) + "\n" + body;
    }
    return decodeURIComponent(path.slice(0, queryIndex)) + path.slice(queryIndex) + "\n" + body;
}
exports.buildOSSCallbackAuthString = buildOSSCallbackAuthString;
async function fetchPublicKeyPem(url, cache, fetchPublicKey) {
    const cached = cache.get(url);
    if (cached) {
        return cached;
    }
    const pem = fetchPublicKey
        ? await fetchPublicKey(url)
        : (await axios_1.default.get(url, { responseType: "text" })).data;
    cache.set(url, pem);
    return pem;
}
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
function verifyOSSCallbackSignature(publicKeyPem, authString, signature) {
    const verifier = (0, crypto_1.createVerify)("RSA-MD5");
    verifier.update(authString, "utf8");
    return verifier.verify(publicKeyPem, Uint8Array.from(signature));
}
exports.verifyOSSCallbackSignature = verifyOSSCallbackSignature;
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
function parseOSSCallbackBody(body, contentType = "application/x-www-form-urlencoded") {
    const text = typeof body === "string" ? body : body.toString("utf8");
    if (contentType.includes("application/json")) {
        return JSON.parse(text);
    }
    const payload = {};
    for (const [key, value] of new URLSearchParams(text).entries()) {
        if (key === "size") {
            payload.size = parseInt(value, 10);
            continue;
        }
        payload[key] = value;
    }
    return payload;
}
exports.parseOSSCallbackBody = parseOSSCallbackBody;
function fail(status, error) {
    return {
        ok: false,
        status,
        body: JSON.stringify({ Status: "Error", Message: error }),
        error,
    };
}
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
async function handleOSSUploadCallback(request, options = {}) {
    var _a, _b, _c, _d;
    const pubKeyUrlBase64 = getHeader(request.headers, "x-oss-pub-key-url");
    const authorizationBase64 = getHeader(request.headers, "authorization");
    if (!pubKeyUrlBase64 || !authorizationBase64) {
        return fail(400, "缺少 x-oss-pub-key-url 或 authorization 请求头");
    }
    let pubKeyUrl;
    try {
        pubKeyUrl = Buffer.from(pubKeyUrlBase64, "base64").toString("utf8");
    }
    catch (_e) {
        return fail(400, "x-oss-pub-key-url 解码失败");
    }
    if (!isAllowedPubKeyUrl(pubKeyUrl)) {
        return fail(400, "公钥 URL 不在允许列表内");
    }
    const cache = (_a = options.publicKeyCache) !== null && _a !== void 0 ? _a : defaultPublicKeyCache;
    let publicKeyPem;
    try {
        publicKeyPem = await fetchPublicKeyPem(pubKeyUrl, cache, options.fetchPublicKey);
    }
    catch (_f) {
        return fail(400, "获取 OSS 公钥失败");
    }
    let signature;
    try {
        signature = Buffer.from(authorizationBase64, "base64");
    }
    catch (_g) {
        return fail(400, "authorization 解码失败");
    }
    const bodyText = typeof request.body === "string" ? request.body : request.body.toString("utf8");
    const authString = buildOSSCallbackAuthString(request.path, bodyText);
    if (!verifyOSSCallbackSignature(publicKeyPem, authString, signature)) {
        return fail(400, "回调签名验证失败");
    }
    const contentType = (_c = (_b = options.contentType) !== null && _b !== void 0 ? _b : getHeader(request.headers, "content-type")) !== null && _c !== void 0 ? _c : "application/x-www-form-urlencoded";
    const payload = parseOSSCallbackBody(bodyText, contentType);
    if (options.onVerified) {
        await options.onVerified(payload);
    }
    return {
        ok: true,
        status: 200,
        body: (_d = options.responseBody) !== null && _d !== void 0 ? _d : '{"Status":"OK"}',
        payload,
    };
}
exports.handleOSSUploadCallback = handleOSSUploadCallback;
//# sourceMappingURL=callback.js.map