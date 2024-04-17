"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileName = exports.getFileExtension = exports.OSSClient = void 0;
const ali_oss_1 = __importDefault(require("ali-oss"));
const axios_1 = __importDefault(require("axios"));
class OSSClient {
    constructor(config) {
        this.client = new ali_oss_1.default(config);
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
function getFileExtension(filePath, includeDot = false) {
    let extension = filePath.split(".").pop();
    if (includeDot) {
        extension = "." + extension;
    }
    return extension;
}
exports.getFileExtension = getFileExtension;
function getFileName(filePath) {
    let fileName = filePath.split("/").pop();
    return fileName;
}
exports.getFileName = getFileName;
//# sourceMappingURL=index.js.map