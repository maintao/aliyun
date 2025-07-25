// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import Ecs20140526, * as $Ecs20140526 from "@alicloud/ecs20140526";
import * as $OpenApi from "@alicloud/openapi-client";

export interface ECSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
}

export class ECSClient {
  private client: Ecs20140526;
  public readonly endpoint: string;

  constructor(config: ECSConfig) {
    this.client = new Ecs20140526(config as $OpenApi.Config);
    this.endpoint = config.endpoint;
  }

  async reboot(instanceId: string): Promise<void> {
    let rebootInstanceRequest = new $Ecs20140526.RebootInstanceRequest({
      instanceId,
      forceStop: true,
      dryRun: false,
    });
    try {
      // 复制代码运行请自行打印 API 的返回值
      const res = await this.client.rebootInstance(rebootInstanceRequest);
      console.log("重启成功", res);
    } catch (error: any) {
      // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
      // 错误 message
      console.log(error?.message);
      // 诊断地址
      console.log(error?.data["Recommend"]);
    }
  }
}
