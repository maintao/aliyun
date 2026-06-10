import { getImageInfo, imageUrlResize } from "./index";
import { OSSClient } from "./oss";
import {
  OSSDirectUploadServer,
  directUploadToOSS,
  type OSSDirectUploadWebOptions,
} from "./oss-direct-upload";
import { ECSClient } from "./ecs";
import { VIClient } from "./vi";
import { File as NodeFile } from "node:buffer";
import { randomUUID } from "crypto";
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

// 测试 OSS 直传（服务端签名 + 客户端 PostObject 上传）
(async function testOSSDirectUpload() {
  const region = process.env.REGION;
  const bucket = process.env.BUCKET;
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const accessKeySecret = process.env.ACCESS_KEY_SECRET;

  if (!region || !bucket || !accessKeyId || !accessKeySecret) {
    console.warn(
      "[oss-direct-upload] 跳过：缺少 REGION / BUCKET / ACCESS_KEY_ID / ACCESS_KEY_SECRET",
    );
    return;
  }

  const uploadServer = new OSSDirectUploadServer({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
  });

  const key = `temp/direct-upload-test/${randomUUID()}.txt`;
  const signature = await uploadServer.getPostSignature({
    dir: "temp/direct-upload-test/",
    key,
  });

  console.log("[oss-direct-upload] 签名已生成", { key, host: signature.host });

  const content = `OSS direct upload test at ${new Date().toISOString()}`;
  const file = new NodeFile([content], "direct-upload-test.txt", { type: "text/plain" });

  const result = await directUploadToOSS({
    file: file as unknown as OSSDirectUploadWebOptions["file"],
    signature,
  });
  console.log("[oss-direct-upload] 上传成功", result);
})();
