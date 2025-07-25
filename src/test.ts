import { get } from "http";
import {
  ECSClient,
  getFileExtension,
  getImageInfo,
  getImageInfoBatch,
  imageUrlInfo,
  imageUrlResize,
  OSSClient,
} from "./index";
require("dotenv").config();

// Usage
const config = {
  region: process.env.REGION as string,
  bucket: process.env.BUCKET as string,
  accessKeyId: process.env.ACCESS_KEY_ID as string,
  accessKeySecret: process.env.ACCESS_KEY_SECRET as string,
};
const client = new OSSClient(config);

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

(async function testOSS() {
  console.log(
    imageUrlResize({
      url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
      width: 125,
    })
  );

  console.log(await getImageInfo("https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png"));
})();

// 测试 ECS 重启
(async function testECS() {
  const ecsClient = new ECSClient({
    endpoint: process.env.ECS_ENDPOINT as string,
    accessKeyId: process.env.ACCESS_KEY_ID as string,
    accessKeySecret: process.env.ACCESS_KEY_SECRET as string,
  });
  await ecsClient.reboot(process.env.ECS_INSTANCE_ID as string);
})();
