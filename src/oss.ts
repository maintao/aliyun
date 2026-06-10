import OSS from "ali-oss";
import axios, { AxiosResponse } from "axios";

export * from "./oss-utils";
export * from "./oss-direct-upload";

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
      const promises = concurrentJobs.map((item) => {
        return this.uploadFromUrl(item.url, item.name).then((result) => {
          console.log("uploadFromUrl ", item.url);
          return result;
        });
      });
      const result = await Promise.all(promises);
      results.push(...result);
    }
    return results;
  }
}
