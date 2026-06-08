"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const oss_1 = require("./oss");
const ecs_1 = require("./ecs");
const vi_1 = require("./vi");
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
//# sourceMappingURL=test.js.map