export interface TraceLogOptions {
    projectId: string;
    apiKey: string;
    backendUrl?: string;
}
export declare class TraceLog {
    private projectId;
    private apiKey;
    private backendUrl;
    private globalContext;
    private sensitiveKeys;
    constructor(options: TraceLogOptions);
    setContext(contextData: Record<string, any>): void;
    clearContext(): void;
    log(level: 'info' | 'warn' | 'error' | 'fatal' | 'debug', message: string, metadata?: any): Promise<void>;
    private setupGracefulShutdown;
}
