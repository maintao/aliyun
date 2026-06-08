export declare function getFileExtension(filePath: string, includeDot?: boolean): string;
export declare function getFileName(filePath: string): string | undefined;
export declare function imageUrlResize({ url, width }: {
    url: string;
    width: number;
}): string;
export declare function imageUrlInfo(url: string): string;
export declare function getImageInfo(url: string): Promise<{
    url: string;
    format: any;
    size: number;
    width: number;
    height: number;
}>;
export declare function getImageInfoBatch(urls: string[]): Promise<any[]>;
//# sourceMappingURL=oss-utils.d.ts.map