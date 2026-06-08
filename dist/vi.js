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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIClient = void 0;
const imageseg20191230_1 = __importStar(require("@alicloud/imageseg20191230")), $Imageseg20191230 = imageseg20191230_1;
const openapi_core_1 = require("@alicloud/openapi-core");
const DEFAULT_ENDPOINT = "imageseg.cn-shanghai.aliyuncs.com";
function assertShanghaiOssUrl(imageURL) {
    let hostname;
    try {
        hostname = new URL(imageURL).hostname;
    }
    catch (_a) {
        throw new Error(`Invalid ImageURL: ${imageURL}`);
    }
    const isShanghaiOss = hostname.endsWith(".oss-cn-shanghai.aliyuncs.com") ||
        hostname === "oss-cn-shanghai.aliyuncs.com";
    if (!isShanghaiOss) {
        throw new Error(`ImageURL must use Shanghai OSS standard domain (*.oss-cn-shanghai.aliyuncs.com), got: ${imageURL}`);
    }
}
class VIClient {
    constructor(config) {
        var _a;
        this.endpoint = (_a = config.endpoint) !== null && _a !== void 0 ? _a : DEFAULT_ENDPOINT;
        this.client = new imageseg20191230_1.default(new openapi_core_1.$OpenApiUtil.Config({
            accessKeyId: config.accessKeyId,
            accessKeySecret: config.accessKeySecret,
            endpoint: this.endpoint,
        }));
    }
    async segmentHDBody(imageURL) {
        assertShanghaiOssUrl(imageURL);
        const totalStart = Date.now();
        const request = new $Imageseg20191230.SegmentHDBodyRequest({
            imageURL,
        });
        const res = await this.client.segmentHDBody(request);
        console.log(`segmentHDBody: segment ${Date.now() - totalStart}ms`);
        return res;
    }
}
exports.VIClient = VIClient;
//# sourceMappingURL=vi.js.map