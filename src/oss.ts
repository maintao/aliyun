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

export interface BatchUploadFromUrlItem {
  url: string;
  name: string;
}

export interface BatchUploadFromUrlProgress {
  completed: number;
  total: number;
}

export type BatchUploadFromUrlOnSuccess = (
  item: BatchUploadFromUrlItem,
  result: NonNullable<Awaited<ReturnType<OSSClient["uploadFromUrl"]>>>,
  progress: BatchUploadFromUrlProgress,
) => void;

export type BatchUploadFromUrlOnFailure = (
  item: BatchUploadFromUrlItem,
  error: unknown,
  progress: BatchUploadFromUrlProgress,
) => void;

export interface BatchUploadFromUrlOptions {
  list: BatchUploadFromUrlItem[];
  concurrency: number;
  onSuccess?: BatchUploadFromUrlOnSuccess;
  onFailure?: BatchUploadFromUrlOnFailure;
}

/** OSS 图片持久化处理结果 */
export interface ProcessObjectSaveResult {
  res: unknown;
  status: number;
}

/**
 * ali-oss 的 processObjectSave 方法未在 @types/ali-oss 中声明，
 * 这里单独定义类型以便类型安全地调用。
 */
interface OSSProcessClient {
  processObjectSave(
    sourceObject: string,
    targetObject: string,
    process: string,
    targetBucket?: string,
  ): Promise<ProcessObjectSaveResult>;
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
        timeout: 120000,
      });
    } catch (err) {
      console.error(err);
      return;
    }

    const stream = response.data;
    const result = await this.client.putStream(name, stream);
    return result;
  }

  async batchUploadFromUrl(options: BatchUploadFromUrlOptions) {
    const { list, concurrency, onSuccess, onFailure } = options;
    const total = list.length;
    let completed = 0;
    const results = [];
    for (let i = 0; i < list.length; i += concurrency) {
      const concurrentJobs = list.slice(i, i + concurrency);
      const promises = concurrentJobs.map(async (item) => {
        try {
          const result = await this.uploadFromUrl(item.url, item.name);
          completed++;
          const progress = { completed, total };
          if (result) {
            console.log(`[${completed}/${total}] uploadFromUrl ok ${item.url} -> ${item.name}`);
            onSuccess?.(item, result, progress);
            return result;
          }
          const error = new Error(`Failed to download: ${item.url}`);
          console.log(`[${completed}/${total}] uploadFromUrl failed ${item.url} -> ${item.name}`);
          onFailure?.(item, error, progress);
          return undefined;
        } catch (err) {
          completed++;
          const progress = { completed, total };
          console.log(`[${completed}/${total}] uploadFromUrl failed ${item.url} -> ${item.name}`);
          onFailure?.(item, err, progress);
          return undefined;
        }
      });
      const result = await Promise.all(promises);
      results.push(...result);
    }
    return results;
  }

  /**
   * 调整图片宽度（保持宽高比），并将结果持久化保存为新的 OSS 对象
   * @param name 源对象名称（OSS key）
   * @param saveAs 目标对象名称
   * @param width 目标宽度（像素）
   * @see https://help.aliyun.com/zh/oss/developer-reference/imgresize
   */
  async resizeImage(name: string, saveAs: string, width: number): Promise<ProcessObjectSaveResult> {
    const process = `image/resize,w_${width}`;
    const client = this.client as unknown as OSSProcessClient;
    const result = await client.processObjectSave(name, saveAs, process);
    console.log(`resizeImage: ${name} -> ${saveAs} (w=${width})`);
    return result;
  }

  /**
   * 图片高清压缩（默认 quality 90，几乎不影响清晰度），并将结果持久化保存为新的 OSS 对象
   * @param name 源对象名称（OSS key）
   * @param saveAs 目标对象名称
   * @param quality 质量 0-100，默认 90
   * @see https://help.aliyun.com/zh/oss/developer-reference/imgquality
   */
  async compressImage(
    name: string,
    saveAs: string,
    quality = 90,
  ): Promise<ProcessObjectSaveResult> {
    const process = `image/quality,q_${quality}`;
    const client = this.client as unknown as OSSProcessClient;
    const result = await client.processObjectSave(name, saveAs, process);
    console.log(`compressImage: ${name} -> ${saveAs} (q=${quality})`);
    return result;
  }
}
