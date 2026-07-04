"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSSClient = void 0;
const ali_oss_1 = __importDefault(require("ali-oss"));
const axios_1 = __importDefault(require("axios"));
__exportStar(require("./oss-utils"), exports);
__exportStar(require("./oss-direct-upload"), exports);
class OSSClient {
    constructor(config) {
        this.client = new ali_oss_1.default(config);
        this.region = config.region;
        this.bucket = config.bucket;
    }
    async uploadFromUrl(url, name) {
        let response;
        try {
            response = await (0, axios_1.default)({
                method: "get",
                url: url,
                responseType: "stream",
                timeout: 120000,
            });
        }
        catch (err) {
            console.error(err);
            return;
        }
        const stream = response.data;
        const result = await this.client.putStream(name, stream);
        return result;
    }
    async batchUploadFromUrl(options) {
        const { list, concurrency, onSuccess, onFailure } = options;
        const total = list.length;
        let completed = 0;
        const results = [];
        for (let i = 0; i < list.length; i += concurrency) {
            const concurrentJobs = list.slice(i, i + concurrency);
            const promises = concurrentJobs.map(async (item) => {
                try {
                    const result = await this.uploadFromUrl(item.url, item.name);
                    completed++;
                    const progress = { completed, total };
                    if (result) {
                        console.log(`[${completed}/${total}] uploadFromUrl ok ${item.url} -> ${item.name}`);
                        onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(item, result, progress);
                        return result;
                    }
                    const error = new Error(`Failed to download: ${item.url}`);
                    console.log(`[${completed}/${total}] uploadFromUrl failed ${item.url} -> ${item.name}`);
                    onFailure === null || onFailure === void 0 ? void 0 : onFailure(item, error, progress);
                    return undefined;
                }
                catch (err) {
                    completed++;
                    const progress = { completed, total };
                    console.log(`[${completed}/${total}] uploadFromUrl failed ${item.url} -> ${item.name}`);
                    onFailure === null || onFailure === void 0 ? void 0 : onFailure(item, err, progress);
                    return undefined;
                }
            });
            const result = await Promise.all(promises);
            results.push(...result);
        }
        return results;
    }
    /**
     * 调整图片宽度（保持宽高比），并将结果持久化保存为新的 OSS 对象
     * @param name 源对象名称（OSS key）
     * @param saveAs 目标对象名称
     * @param width 目标宽度（像素）
     * @see https://help.aliyun.com/zh/oss/developer-reference/imgresize
     */
    async resizeImage(name, saveAs, width) {
        const process = `image/resize,w_${width}`;
        const client = this.client;
        const result = await client.processObjectSave(name, saveAs, process);
        console.log(`resizeImage: ${name} -> ${saveAs} (w=${width})`);
        return result;
    }
    /**
     * 图片高清压缩（默认 quality 90，几乎不影响清晰度），并将结果持久化保存为新的 OSS 对象
     * @param name 源对象名称（OSS key）
     * @param saveAs 目标对象名称
     * @param quality 质量 0-100，默认 90
     * @see https://help.aliyun.com/zh/oss/developer-reference/imgquality
     */
    async compressImage(name, saveAs, quality = 90) {
        const process = `image/quality,q_${quality}`;
        const client = this.client;
        const result = await client.processObjectSave(name, saveAs, process);
        console.log(`compressImage: ${name} -> ${saveAs} (q=${quality})`);
        return result;
    }
}
exports.OSSClient = OSSClient;
//# sourceMappingURL=oss.js.map