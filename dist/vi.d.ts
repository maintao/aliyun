import * as $Imageseg20191230 from "@alicloud/imageseg20191230";
export interface VIConfig {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint?: string;
}
export declare class VIClient {
    private client;
    readonly endpoint: string;
    constructor(config: VIConfig);
    segmentHDBody(imageURL: string): Promise<$Imageseg20191230.SegmentHDBodyResponse>;
}
//# sourceMappingURL=vi.d.ts.map