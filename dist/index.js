"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUrlResize = exports.getFileName = exports.getFileExtension = exports.OSSClient = void 0;
const ali_oss_1 = __importDefault(require("ali-oss"));
const axios_1 = __importDefault(require("axios"));
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
function getFileExtension(filePath, includeDot = false) {
    let fileName = filePath.split("/").pop() || "";
    const regex = /\.(\w+)$/;
    const match = fileName.match(regex);
    if (!match) {
        return "";
    }
    let extension = match[1];
    if (!extension) {
        return "";
    }
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
function imageUrlResize({ url, width }) {
    // Check if URL is empty or invalid
    if (!url)
        return url;
    // Check if URL already has query parameters
    const hasQueryParams = url.includes("?");
    // Add the OSS resize parameter
    const resizeParam = `x-oss-process=image/resize,w_${width}`;
    // Combine URL with resize parameter
    return `${url}${hasQueryParams ? "&" : "?"}${resizeParam}`;
}
exports.imageUrlResize = imageUrlResize;
//# sourceMappingURL=index.js.map