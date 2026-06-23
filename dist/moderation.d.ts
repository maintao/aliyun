import * as $Green20220302 from "@alicloud/green20220302";
export interface ModerationConfig {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint?: string;
}
/** 风险等级 */
export declare enum RiskLevel {
    /** 无风险 */
    None = "none",
    /** 低风险 */
    Low = "low",
    /** 中风险 */
    Medium = "medium",
    /** 高风险 */
    High = "high"
}
export interface ImageModerationOptions {
    /** 公网可访问的图片 URL */
    imageUrl: string;
    /** 待检测数据的唯一标识，可选 */
    dataId?: string;
    /**
     * 检测场景，默认 baselineCheck（通用基线检测）
     * @see https://help.aliyun.com/document_detail/467826.html
     */
    service?: string;
}
export declare class ModerationClient {
    private client;
    readonly endpoint: string;
    constructor(config: ModerationConfig);
    /**
     * 图片审核增强版 — 检查图片合规性
     * @see https://api.aliyun.com/document/Green/2022-03-02/ImageModeration
     */
    imageModeration(options: ImageModerationOptions): Promise<$Green20220302.ImageModerationResponse>;
    /**
     * 图片风险检测（简化版）— 直接返回图片是否有风险
     */
    isImageRisky(options: ImageModerationOptions): Promise<boolean>;
    /**
     * 判断图片风险等级是否达到或高于指定等级
     * @param options.imageUrl 公网可访问的图片 URL
     * @param options.level 风险等级（high / medium / low），图片风险等级达到或高于该值时返回 true
     */
    isImageRiskLevelNotBelow(options: {
        imageUrl: string;
        level: RiskLevel;
    }): Promise<boolean>;
}
/**
 * 判断审核结果是否有风险
 * riskLevel 不为 "none" 即视为有风险
 */
export declare function hasRisk(response: Awaited<ReturnType<ModerationClient["imageModeration"]>>): boolean;
//# sourceMappingURL=moderation.d.ts.map