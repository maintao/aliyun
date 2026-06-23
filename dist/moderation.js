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
exports.hasRisk = exports.ModerationClient = exports.RiskLevel = void 0;
const green20220302_1 = __importStar(require("@alicloud/green20220302")), $Green20220302 = green20220302_1;
const DEFAULT_ENDPOINT = "green-cip.cn-beijing.aliyuncs.com";
/** 风险等级 */
var RiskLevel;
(function (RiskLevel) {
    /** 无风险 */
    RiskLevel["None"] = "none";
    /** 低风险 */
    RiskLevel["Low"] = "low";
    /** 中风险 */
    RiskLevel["Medium"] = "medium";
    /** 高风险 */
    RiskLevel["High"] = "high";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
/** 风险等级权重，用于比较 */
const RISK_WEIGHT = {
    [RiskLevel.None]: 0,
    [RiskLevel.Low]: 1,
    [RiskLevel.Medium]: 2,
    [RiskLevel.High]: 3,
};
class ModerationClient {
    constructor(config) {
        var _a;
        this.endpoint = (_a = config.endpoint) !== null && _a !== void 0 ? _a : DEFAULT_ENDPOINT;
        this.client = new green20220302_1.default({
            accessKeyId: config.accessKeyId,
            accessKeySecret: config.accessKeySecret,
            endpoint: this.endpoint,
            connectTimeout: 10000,
            readTimeout: 30000,
        });
    }
    /**
     * 图片审核增强版 — 检查图片合规性
     * @see https://api.aliyun.com/document/Green/2022-03-02/ImageModeration
     */
    async imageModeration(options) {
        const { imageUrl, dataId, service = "baselineCheck" } = options;
        const serviceParameters = { imageUrl };
        if (dataId) {
            serviceParameters.dataId = dataId;
        }
        const request = new $Green20220302.ImageModerationRequest({
            service,
            serviceParameters: JSON.stringify(serviceParameters),
        });
        const totalStart = Date.now();
        const res = await this.client.imageModeration(request);
        console.log(`imageModeration: ${Date.now() - totalStart}ms`);
        return res;
    }
    /**
     * 图片风险检测（简化版）— 直接返回图片是否有风险
     */
    async isImageRisky(options) {
        const res = await this.imageModeration(options);
        return hasRisk(res);
    }
    /**
     * 判断图片风险等级是否达到或高于指定等级
     * @param options.imageUrl 公网可访问的图片 URL
     * @param options.level 风险等级（high / medium / low），图片风险等级达到或高于该值时返回 true
     */
    async isImageRiskLevelNotBelow(options) {
        var _a, _b, _c;
        const res = await this.imageModeration({ imageUrl: options.imageUrl });
        const actual = (_c = (_b = (_a = res.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.riskLevel) !== null && _c !== void 0 ? _c : RiskLevel.None;
        return RISK_WEIGHT[actual] >= RISK_WEIGHT[options.level];
    }
}
exports.ModerationClient = ModerationClient;
/**
 * 判断审核结果是否有风险
 * riskLevel 不为 "none" 即视为有风险
 */
function hasRisk(response) {
    var _a, _b;
    return ((_b = (_a = response.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.riskLevel) !== "none";
}
exports.hasRisk = hasRisk;
//# sourceMappingURL=moderation.js.map