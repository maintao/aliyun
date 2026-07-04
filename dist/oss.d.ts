import OSS from "ali-oss";
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
export type BatchUploadFromUrlOnSuccess = (item: BatchUploadFromUrlItem, result: NonNullable<Awaited<ReturnType<OSSClient["uploadFromUrl"]>>>, progress: BatchUploadFromUrlProgress) => void;
export type BatchUploadFromUrlOnFailure = (item: BatchUploadFromUrlItem, error: unknown, progress: BatchUploadFromUrlProgress) => void;
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
export declare class OSSClient {
    private client;
    readonly region: string;
    readonly bucket: string;
    constructor(config: OSSConfig);
    uploadFromUrl(url: string, name: string): Promise<{
        name: string;
        res: OSS.NormalSuccessResponse;
    } | undefined>;
    batchUploadFromUrl(options: BatchUploadFromUrlOptions): Promise<({
        name: string;
        res: OSS.NormalSuccessResponse;
    } | undefined)[]>;
    /**
     * 调整图片宽度（保持宽高比），并将结果持久化保存为新的 OSS 对象
     * @param name 源对象名称（OSS key）
     * @param saveAs 目标对象名称
     * @param width 目标宽度（像素）
     * @see https://help.aliyun.com/zh/oss/developer-reference/imgresize
     */
    resizeImage(name: string, saveAs: string, width: number): Promise<ProcessObjectSaveResult>;
    /**
     * 图片高清压缩（默认 quality 90，几乎不影响清晰度），并将结果持久化保存为新的 OSS 对象
     * @param name 源对象名称（OSS key）
     * @param saveAs 目标对象名称
     * @param quality 质量 0-100，默认 90
     * @see https://help.aliyun.com/zh/oss/developer-reference/imgquality
     */
    compressImage(name: string, saveAs: string, quality?: number): Promise<ProcessObjectSaveResult>;
}
//# sourceMappingURL=oss.d.ts.map