import OSS from "ali-oss";
export interface OSSConfig {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
}
export declare class OSSClient {
    private client;
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
export declare function getFileExtension(filePath: string, includeDot?: boolean): string | undefined;
export declare function getFileName(filePath: string): string | undefined;
//# sourceMappingURL=index.d.ts.map