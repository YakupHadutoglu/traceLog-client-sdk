export declare class LogStreamer {
    private apiKey;
    private httpClient;
    private endpoint;
    constructor(apikey: string);
    info(message: string, metadata?: object): Promise<void>;
    error(message: string, metadata?: object): Promise<void>;
    private sendLog;
}
