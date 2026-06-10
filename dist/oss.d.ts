import OSS from "ali-oss";
export * from "./oss-utils";
export * from "./oss-direct-upload";
export interface OSSConfig {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
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
    batchUploadFromUrl(list: {
        url: string;
        name: string;
    }[], concurrency: number): Promise<({
        name: string;
        res: OSS.NormalSuccessResponse;
    } | undefined)[]>;
}
//# sourceMappingURL=oss.d.ts.map