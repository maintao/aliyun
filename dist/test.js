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
// const downloads = [
//   {
//     url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
//     name: `/temp/1.png`,
//   },
//   {
//     url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
//     name: `/temp/2.png`,
//   },
//   {
//     url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
//     name: `/temp/3.png`,
//   },
//   {
//     url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
//     name: `/temp/4.png`,
//   },
//   {
//     url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
//     name: `/temp/5.png`,
//   },
//   {
//     url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
//     name: `/temp/6.png`,
//   },
// ];
// client
//   .batchUploadFromUrl(downloads, 5)
//   .then((results) => {
//     console.log("done");
//   })
//   .catch((err) => {
//     console.error(err);
//   });
(async function test() {
    console.log((0, index_1.imageUrlResize)({
        url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
        width: 125,
    }));
    console.log(await (0, index_1.getImageInfo)("https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png"));
    const urls = [
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-01.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-02.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-03.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-04.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-05.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-06.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-07.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-08.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-09.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-10.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-11.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-12.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-13.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-14.jpg",
        "https://cdn.fnmain.com/mp-insurance/calendar/2024/2024-01-15.jpg",
    ];
    console.log(await (0, index_1.getImageInfoBatch)(urls));
})();
//# sourceMappingURL=test.js.map