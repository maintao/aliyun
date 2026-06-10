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
    async batchUploadFromUrl(list, concurrency) {
        const results = [];
        for (let i = 0; i < list.length; i += concurrency) {
            const concurrentJobs = list.slice(i, i + concurrency);
            const promises = concurrentJobs.map((item) => this.uploadFromUrl(item.url, item.name));
            const result = await Promise.all(promises);
            results.push(...result);
        }
        return results;
    }
}
exports.OSSClient = OSSClient;
//# sourceMappingURL=oss.js.map