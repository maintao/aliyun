import { get } from "http";
import { getImageInfo, imageUrlResize } from "./index";
import { OSSClient } from "./oss";
import { ECSClient } from "./ecs";
import { VIClient } from "./vi";
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
  console.log(
    imageUrlResize({
      url: "https://cdn.fnmain.com/maintao/blog/2024/mowen-trans/404.png",
      width: 125,
    }),
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

// 测试高清人体分割
(async function testVI() {
  const viClient = new VIClient({
    accessKeyId: process.env.ACCESS_KEY_ID as string,
    accessKeySecret: process.env.ACCESS_KEY_SECRET as string,
  });
  const result = await viClient.segmentHDBody("https://xxx.com/test.jpg");
  const url = result.body?.data?.imageURL;
  if (!url) {
    throw new Error("url is required");
  }
  console.log(url);
})();
