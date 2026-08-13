export interface TraceLogOptions {
    projectId: string;
    apiKey: string;
    backendUrl?: string;
    batchSize?: number;
    flushInterval?: number;
}
export declare class TraceLog {
    private projectId;
    private apiKey;
    private backendUrl;
    private globalContext;
    private sensitiveKeys;
    private logBuffer;
    private batchSize;
    private flushInterval;
    private timer;
    private isFlushing;
    constructor(options: TraceLogOptions);
    setContext(contextData: Record<string, any>): void;
    clearContext(): void;
    log(level: 'info' | 'warn' | 'error' | 'fatal' | 'debug', message: string, metadata?: any): Promise<void>;
    flush(): Promise<void>;
    private startTimer;
    private setupGracefulShutdown;
}
