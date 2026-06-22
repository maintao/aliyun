import Imageseg20191230, * as $Imageseg20191230 from "@alicloud/imageseg20191230";
import * as $OpenApi from "@alicloud/openapi-client";

export interface VIConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
}

const DEFAULT_ENDPOINT = "imageseg.cn-shanghai.aliyuncs.com";

function assertShanghaiOssUrl(imageURL: string) {
  let hostname: string;
  try {
    hostname = new URL(imageURL).hostname;
  } catch {
    throw new Error(`Invalid ImageURL: ${imageURL}`);
  }
  const isShanghaiOss =
    hostname.endsWith(".oss-cn-shanghai.aliyuncs.com") ||
    hostname === "oss-cn-shanghai.aliyuncs.com";
  if (!isShanghaiOss) {
    throw new Error(
      `ImageURL must use Shanghai OSS standard domain (*.oss-cn-shanghai.aliyuncs.com), got: ${imageURL}`,
    );
  }
}

export class VIClient {
  private client: Imageseg20191230;
  public readonly endpoint: string;

  constructor(config: VIConfig) {
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.client = new Imageseg20191230({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: this.endpoint,
      readTimeout: 10 * 1000, // 高清抠图时间可能会比较久，默认的3秒可能不够，设置10秒超时
    } as $OpenApi.Config);
  }

  async segmentHDBody(imageURL: string) {
    assertShanghaiOssUrl(imageURL);

    const totalStart = Date.now();
    const request = new $Imageseg20191230.SegmentHDBodyRequest({
      imageURL,
    });
    const res = await this.client.segmentHDBody(request);
    console.log(`segmentHDBody: segment ${Date.now() - totalStart}ms`);
    return res;
  }
}
