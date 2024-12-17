"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageInfoBatch = exports.getImageInfo = exports.imageUrlInfo = exports.imageUrlResize = exports.getFileName = exports.getFileExtension = exports.OSSClient = void 0;
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
    return appendQueryParams(url, {
        "x-oss-process": `image/resize,w_${width}`,
    });
}
exports.imageUrlResize = imageUrlResize;
function imageUrlInfo(url) {
    return appendQueryParams(url, {
        "x-oss-process": `image/info`,
    });
}
exports.imageUrlInfo = imageUrlInfo;
async function getImageInfo(url) {
    console.log(new Date().toISOString());
    const { data } = await axios_1.default.get(imageUrlInfo(url));
    const ret = {
        url,
        format: data.Format.value,
        size: parseInt(data.FileSize.value),
        width: parseInt(data.ImageWidth.value),
        height: parseInt(data.ImageHeight.value),
    };
    return ret;
}
exports.getImageInfo = getImageInfo;
async function getImageInfoBatch(urls) {
    const ret = [];
    const takeFive = takeN(urls, 5);
    while (true) {
        const urls = takeFive();
        if (!urls) {
            break;
        }
        const results = await Promise.all(urls.map((url) => getImageInfo(url)));
        ret.push(...results);
    }
    return ret;
}
exports.getImageInfoBatch = getImageInfoBatch;
function appendQueryParams(url, params) {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
    });
    return urlObj.toString();
}
function takeN(list, N) {
    let index = 0;
    return function () {
        if (index >= list.length) {
            return null;
        }
        const items = list.slice(index, index + N);
        index += N;
        return items;
    };
}
//# sourceMappingURL=index.js.map