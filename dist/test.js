"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const oss_1 = require("./oss");
const oss_direct_upload_1 = require("./oss-direct-upload");
const ecs_1 = require("./ecs");
const vi_1 = require("./vi");
const moderation_1 = require("./moderation");
const node_buffer_1 = require("node:buffer");
const crypto_1 = require("crypto");
require("dotenv").config();
// ─── 配置 ────────────────────────────────────────────────
const config = {
    region: process.env.REGION,
    bucket: process.env.BUCKET,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
};
const ossClient = new oss_1.OSSClient(config);
console.log("region:", ossClient.region);
console.log("bucket:", ossClient.bucket);
// ─── 测试用例 ─────────────────────────────────────────────
// 1. OSS 批量从 URL 上传
async function testOSSBatchUpload() {
    const downloads = [
        {
            url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
            name: `/temp/1.png`,
        },
        {
            url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
            name: `/temp/2.png`,
        },
        {
            url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
            name: `/temp/3.png`,
        },
        {
            url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
            name: `/temp/4.png`,
        },
        {
            url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
            name: `/temp/5.png`,
        },
        {
            url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
            name: `/temp/6.png`,
        },
    ];
    const results = await ossClient.batchUploadFromUrl({
        list: downloads,
        concurrency: 5,
    });
    console.log("done", results.length);
}
// 2. OSS 工具函数（图片缩放、获取图片信息）
async function testOSSUtils() {
    console.log((0, index_1.imageUrlResize)({
        url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
        width: 125,
    }));
    console.log(await (0, index_1.getImageInfo)("https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png"));
}
// 3. ECS 重启
async function testECS() {
    const ecsClient = new ecs_1.ECSClient({
        endpoint: process.env.ECS_ENDPOINT,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
    });
    await ecsClient.reboot(process.env.ECS_INSTANCE_ID);
}
// 4. 高清人体分割
async function testVI() {
    var _a, _b;
    const viClient = new vi_1.VIClient({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
    });
    const result = await viClient.segmentHDBody("https://xxx.com/test.jpg");
    const url = (_b = (_a = result.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.imageURL;
    if (!url) {
        throw new Error("url is required");
    }
    console.log(url);
}
// 5. OSS 直传（服务端签名 + 客户端 PostObject 上传）
async function testOSSDirectUpload() {
    const uploadServer = new oss_direct_upload_1.OSSDirectUploadServer({
        region: config.region,
        bucket: config.bucket,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
    });
    const key = `temp/direct-upload-test/${(0, crypto_1.randomUUID)()}.txt`;
    const signature = await uploadServer.getPostSignature({
        dir: "temp/direct-upload-test/",
        key,
    });
    console.log("[oss-direct-upload] 签名已生成", { key, host: signature.host });
    const content = `OSS direct upload test at ${new Date().toISOString()}`;
    const file = new node_buffer_1.File([content], "direct-upload-test.txt", {
        type: "text/plain",
    });
    const result = await (0, oss_direct_upload_1.directUploadToOSS)({
        file: file,
        signature,
    });
    console.log("[oss-direct-upload] 上传成功", result);
}
// 6. 图片合规审核
async function testImageModeration() {
    var _a;
    const moderationClient = new moderation_1.ModerationClient({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
    });
    const result = await moderationClient.imageModeration({
        imageUrl: "https://inews.gtimg.com/news_bt/O14wyoHRb-iB6aGn6ZCgWBlgB3ZPe1KNfm5k3uABbg5rcAA/641",
    });
    const body = result.body;
    if (!body) {
        throw new Error("response body is required");
    }
    console.log("requestId:", body.requestId);
    console.log("code:", body.code);
    console.log("msg:", body.msg);
    if (body.code === 200 && body.data) {
        console.log("dataId:", body.data.dataId);
        console.log("riskLevel:", body.data.riskLevel);
        for (const item of (_a = body.data.result) !== null && _a !== void 0 ? _a : []) {
            console.log(`  - [${item.label}] ${item.description} (confidence: ${item.confidence})`);
        }
    }
    else {
        console.log("image moderation not success. code:", body.code);
    }
}
// 7. 图片风险检测（简化版）
async function testIsImageRisky() {
    const moderationClient = new moderation_1.ModerationClient({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
    });
    const risky = await moderationClient.isImageRisky({
        imageUrl: "https://inews.gtimg.com/news_bt/O14wyoHRb-iB6aGn6ZCgWBlgB3ZPe1KNfm5k3uABbg5rcAA/641",
    });
    console.log("isImageRisky:", risky);
    console.log("hasRisk (same result):", risky);
}
// 8. 图片风险等级判断
async function testIsImageRiskLevelNotBelow() {
    const moderationClient = new moderation_1.ModerationClient({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
    });
    const imageUrl = "https://inews.gtimg.com/news_bt/O14wyoHRb-iB6aGn6ZCgWBlgB3ZPe1KNfm5k3uABbg5rcAA/641";
    const notBelowLow = await moderationClient.isImageRiskLevelNotBelow({
        imageUrl,
        level: moderation_1.RiskLevel.Low,
    });
    const notBelowMedium = await moderationClient.isImageRiskLevelNotBelow({
        imageUrl,
        level: moderation_1.RiskLevel.Medium,
    });
    const notBelowHigh = await moderationClient.isImageRiskLevelNotBelow({
        imageUrl,
        level: moderation_1.RiskLevel.High,
    });
    console.log(`risk >= low: ${notBelowLow}`);
    console.log(`risk >= medium: ${notBelowMedium}`);
    console.log(`risk >= high: ${notBelowHigh}`);
}
// 9. 图片调整大小（持久化，保持宽高比）
async function testResizeImage() {
    const sourceName = `temp/resize-test-${Date.now()}.png`;
    await ossClient.uploadFromUrl("https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png", sourceName);
    const saveAs = sourceName.replace(".png", "-300w.png");
    const result = await ossClient.resizeImage(sourceName, saveAs, 300);
    console.log("resizeImage:", result);
}
// 10. 图片高清压缩（持久化）
async function testCompressImage() {
    const sourceName = `temp/compress-test-${Date.now()}.png`;
    await ossClient.uploadFromUrl("https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png", sourceName);
    const saveAs = sourceName.replace(".png", "-q90.png");
    const result = await ossClient.compressImage(sourceName, saveAs, 90);
    console.log("compressImage:", result);
}
// ─── 运行测试 ─────────────────────────────────────────────
// 取消注释需要运行的测试用例即可
// testOSSBatchUpload().catch(console.error);
// testOSSUtils().catch(console.error);
// testECS().catch(console.error);
// testVI().catch(console.error);
// testOSSDirectUpload().catch(console.error);
// testImageModeration().catch(console.error);
// testIsImageRisky().catch(console.error);
// testIsImageRiskLevelNotBelow().catch(console.error);
testResizeImage().catch(console.error);
testCompressImage().catch(console.error);
//# sourceMappingURL=test.js.map