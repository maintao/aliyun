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
}
//# sourceMappingURL=oss.d.ts.map