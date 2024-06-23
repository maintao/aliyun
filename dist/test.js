"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
require("dotenv").config();
// Usage
const config = {
    region: process.env.REGION,
    bucket: process.env.BUCKET,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
};
const client = new index_1.OSSClient(config);
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
//# sourceMappingURL=test.js.map