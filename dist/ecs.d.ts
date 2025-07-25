export interface ECSConfig {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
}
export declare class ECSClient {
    private client;
    readonly endpoint: string;
    constructor(config: ECSConfig);
    reboot(instanceId: string): Promise<void>;
}
//# sourceMappingURL=ecs.d.ts.map