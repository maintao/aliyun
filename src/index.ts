import OSS from "ali-oss";
import axios, { AxiosResponse } from "axios";

export interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

export class OSSClient {
  private client: OSS;
  public readonly region: string;
  public readonly bucket: string;

  constructor(config: OSSConfig) {
    this.client = new OSS(config);
    this.region = config.region;
    this.bucket = config.bucket;
  }

  async uploadFromUrl(url: string, name: string) {
    let response: AxiosResponse<any>;
    try {
      response = await axios({
        method: "get",
        url: url,
        responseType: "stream",
      });
    } catch (err) {
      console.error(err);
      return;
    }

    const stream = response.data;
    const result = await this.client.putStream(name, stream);
    return result;
  }

  async batchUploadFromUrl(list: { url: string; name: string }[], concurrency: number) {
    const results = [];
    for (let i = 0; i < list.length; i += concurrency) {
      const concurrentJobs = list.slice(i, i + concurrency);
      const promises = concurrentJobs.map((item) => this.uploadFromUrl(item.url, item.name));
      const result = await Promise.all(promises);
      results.push(...result);
    }
    return results;
  }
}

export function getFileExtension(filePath: string, includeDot = false): string {
  let fileName = filePath.split("/").pop() || "";

  const regex = /\.(\w+)$/;
  const match = fileName.match(regex);
  if (!match) {
    return "";
  }

  let extension = match[1];
  if (!extension) {
    return "";
  }

  if (includeDot) {
    extension = "." + extension;
  }
  return extension;
}

export function getFileName(filePath: string) {
  let fileName = filePath.split("/").pop();
  return fileName;
}

export function imageUrlResize({ url, width }: { url: string; width: number }): string {
  return appendQueryParams(url, {
    "x-oss-process": `image/resize,w_${width}`,
  });
}

export function imageUrlInfo(url: string): string {
  return appendQueryParams(url, {
    "x-oss-process": `image/info`,
  });
}

export async function getImageInfo(url: string) {
  console.log(new Date().toISOString());
  const { data } = await axios.get(imageUrlInfo(url));
  const ret = {
    url,
    format: data.Format.value,
    size: parseInt(data.FileSize.value),
    width: parseInt(data.ImageWidth.value),
    height: parseInt(data.ImageHeight.value),
  };
  return ret;
}

export async function getImageInfoBatch(urls: string[]) {
  const ret: any[] = [];
  const takeFive = takeN(urls, 5);
  while (true) {
    const urls = takeFive();
    if (!urls) {
      break;
    }
    const results = await Promise.all(urls.map((url) => getImageInfo(url)));
    ret.push(...results);
  }
  return ret;
}

function appendQueryParams(url: string, params: Record<string, string>): string {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });
  return urlObj.toString();
}

function takeN<T>(list: T[], N: number) {
  let index = 0;
  return function () {
    if (index >= list.length) {
      return null;
    }

    const items = list.slice(index, index + N);
    index += N;
    return items;
  };
}
