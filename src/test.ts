import { OSSClient } from "./index";
require("dotenv").config();

// Usage
const config = {
  region: process.env.REGION as string,
  bucket: process.env.BUCKET as string,
  accessKeyId: process.env.ACCESS_KEY_ID as string,
  accessKeySecret: process.env.ACCESS_KEY_SECRET as string,
};
const client = new OSSClient(config);
const downloads = [
  {
    url: "http://cdn.maintao.com/blog/2024/mowen-trans/404.png",
    name: `/temp/1.png`,
  },
  {
    url: "http://cdn.maintao.com/blog/2024/mowen-trans/404.png",
    name: `/temp/2.png`,
  },
  {
    url: "http://cdn.maintao.com/blog/2024/mowen-trans/404.png",
    name: `/temp/3.png`,
  },
  {
    url: "http://cdn.maintao.com/blog/2024/mowen-trans/404.png",
    name: `/temp/4.png`,
  },
  {
    url: "http://cdn.maintao.com/blog/2024/mowen-trans/404.png",
    name: `/temp/5.png`,
  },
  {
    url: "http://cdn.maintao.com/blog/2024/mowen-trans/404x.png",
    name: `/temp/6.png`,
  },
];
client
  .batchUploadFromUrl(downloads, 5)
  .then((results) => {
    console.log(results);
  })
  .catch((err) => {
    console.error(err);
  });
