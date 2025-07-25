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
exports.ECSClient = void 0;
// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const ecs20140526_1 = __importStar(require("@alicloud/ecs20140526")), $Ecs20140526 = ecs20140526_1;
class ECSClient {
    constructor(config) {
        this.client = new ecs20140526_1.default(config);
        this.endpoint = config.endpoint;
    }
    async reboot(instanceId) {
        let rebootInstanceRequest = new $Ecs20140526.RebootInstanceRequest({
            instanceId,
            forceStop: true,
            dryRun: false,
        });
        try {
            // 复制代码运行请自行打印 API 的返回值
            const res = await this.client.rebootInstance(rebootInstanceRequest);
            console.log("重启成功", res);
        }
        catch (error) {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error === null || error === void 0 ? void 0 : error.message);
            // 诊断地址
            console.log(error === null || error === void 0 ? void 0 : error.data["Recommend"]);
        }
    }
}
exports.ECSClient = ECSClient;
//# sourceMappingURL=ecs.js.map