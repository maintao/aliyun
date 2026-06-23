import Green20220302, * as $Green20220302 from "@alicloud/green20220302";

export interface ModerationConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
}

const DEFAULT_ENDPOINT = "green-cip.cn-beijing.aliyuncs.com";

/** 风险等级 */
export enum RiskLevel {
  /** 无风险 */
  None = "none",
  /** 低风险 */
  Low = "low",
  /** 中风险 */
  Medium = "medium",
  /** 高风险 */
  High = "high",
}

/** 风险等级权重，用于比较 */
const RISK_WEIGHT: Record<string, number> = {
  [RiskLevel.None]: 0,
  [RiskLevel.Low]: 1,
  [RiskLevel.Medium]: 2,
  [RiskLevel.High]: 3,
};

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

export class ModerationClient {
  private client: Green20220302;
  public readonly endpoint: string;

  constructor(config: ModerationConfig) {
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.client = new Green20220302({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: this.endpoint,
      connectTimeout: 10000,
      readTimeout: 30000,
    } as ConstructorParameters<typeof Green20220302>[0]);
  }

  /**
   * 图片审核增强版 — 检查图片合规性
   * @see https://api.aliyun.com/document/Green/2022-03-02/ImageModeration
   */
  async imageModeration(options: ImageModerationOptions) {
    const { imageUrl, dataId, service = "baselineCheck" } = options;

    const serviceParameters: Record<string, string> = { imageUrl };
    if (dataId) {
      serviceParameters.dataId = dataId;
    }

    const request = new $Green20220302.ImageModerationRequest({
      service,
      serviceParameters: JSON.stringify(serviceParameters),
    });

    const totalStart = Date.now();
    const res = await this.client.imageModeration(request);
    console.log(`imageModeration: ${Date.now() - totalStart}ms`);
    return res;
  }

  /**
   * 图片风险检测（简化版）— 直接返回图片是否有风险
   */
  async isImageRisky(options: ImageModerationOptions): Promise<boolean> {
    const res = await this.imageModeration(options);
    return hasRisk(res);
  }

  /**
   * 判断图片风险等级是否达到或高于指定等级
   * @param options.imageUrl 公网可访问的图片 URL
   * @param options.level 风险等级（high / medium / low），图片风险等级达到或高于该值时返回 true
   */
  async isImageRiskLevelNotBelow(options: {
    imageUrl: string;
    level: RiskLevel;
  }): Promise<boolean> {
    const res = await this.imageModeration({ imageUrl: options.imageUrl });
    const actual = res.body?.data?.riskLevel ?? RiskLevel.None;
    return RISK_WEIGHT[actual] >= RISK_WEIGHT[options.level];
  }
}

/**
 * 判断审核结果是否有风险
 * riskLevel 不为 "none" 即视为有风险
 */
export function hasRisk(
  response: Awaited<ReturnType<ModerationClient["imageModeration"]>>,
): boolean {
  return response.body?.data?.riskLevel !== "none";
}
