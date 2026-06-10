"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const oss_1 = require("./oss");
const oss_direct_upload_1 = require("./oss-direct-upload");
const ecs_1 = require("./ecs");
const vi_1 = require("./vi");
const node_buffer_1 = require("node:buffer");
const crypto_1 = require("crypto");
require("dotenv").config();
// Usage
const config = {
    region: process.env.REGION,
    bucket: process.env.BUCKET,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
};
const client = new oss_1.OSSClient(config);
console.log("region:", client.region);
console.log("bucket:", client.bucket);
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
client
    .batchUploadFromUrl(downloads, 5)
    .then((results) => {
    console.log("done");
})
    .catch((err) => {
    console.error(err);
});
(async function testOSS() {
    console.log((0, index_1.imageUrlResize)({
        url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
        width: 125,
    }));
    console.log(await (0, index_1.getImageInfo)("https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png"));
})();
// 测试 ECS 重启
(async function testECS() {
    const ecsClient = new ecs_1.ECSClient({
        endpoint: process.env.ECS_ENDPOINT,
        accessKeyId: process.env.ACCESS_KEY_ID,
        accessKeySecret: process.env.ACCESS_KEY_SECRET,
    });
    await ecsClient.reboot(process.env.ECS_INSTANCE_ID);
})();
// 测试高清人体分割
(async function testVI() {
    var _a, _b;
    const viClient = new vi_1.VIClient({
        accessKeyId: process.env.ACCESS_KEY_ID,
        accessKeySecret: process.env.ACCESS_KEY_SECRET,
    });
    const result = await viClient.segmentHDBody("https://xxx.com/test.jpg");
    const url = (_b = (_a = result.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.imageURL;
    if (!url) {
        throw new Error("url is required");
    }
    console.log(url);
})();
// 测试 OSS 直传（服务端签名 + 客户端 PostObject 上传）
(async function testOSSDirectUpload() {
    const region = process.env.REGION;
    const bucket = process.env.BUCKET;
    const accessKeyId = process.env.ACCESS_KEY_ID;
    const accessKeySecret = process.env.ACCESS_KEY_SECRET;
    if (!region || !bucket || !accessKeyId || !accessKeySecret) {
        console.warn("[oss-direct-upload] 跳过：缺少 REGION / BUCKET / ACCESS_KEY_ID / ACCESS_KEY_SECRET");
        return;
    }
    const uploadServer = new oss_direct_upload_1.OSSDirectUploadServer({
        region,
        bucket,
        accessKeyId,
        accessKeySecret,
    });
    const key = `temp/direct-upload-test/${(0, crypto_1.randomUUID)()}.txt`;
    const signature = await uploadServer.getPostSignature({
        dir: "temp/direct-upload-test/",
        key,
    });
    console.log("[oss-direct-upload] 签名已生成", { key, host: signature.host });
    const content = `OSS direct upload test at ${new Date().toISOString()}`;
    const file = new node_buffer_1.File([content], "direct-upload-test.txt", { type: "text/plain" });
    const result = await (0, oss_direct_upload_1.directUploadToOSS)({
        file: file,
        signature,
    });
    console.log("[oss-direct-upload] 上传成功", result);
})();
//# sourceMappingURL=test.js.map