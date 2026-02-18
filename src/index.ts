import axios, { AxiosInstance } from 'axios';

interface LogPayload {
    message: string;
    level: 'info' | 'warn' | 'error';
    timestamp: string;
    metadata?: object;
}

export class LogStreamer {
    private apiKey: string;
    private httpClient: AxiosInstance;

    private baseUrl: string = 'http://localhost:3001/api/log';

    constructor(apikey: string) {
        if (!apikey) {
            throw new Error('[TraceLog] API key is required.')
        }
        this.apiKey = apikey;

        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "Authorization": `ApiKey ${this.apiKey}`,
                "Content-Type": "application/json",
            }
        });
    }

    public info(message: string, metadata: object = {}) {
        this.sendLog('info', message, metadata);
    }

    public error(message: string, metadata: object = {}) {
        this.sendLog('error', message, metadata);
    }

    private async sendLog(level: 'info' | 'warn' | 'error', message: string, metadata: object) {
        const payload: LogPayload = {
            message,
            level,
            metadata,
            timestamp: new Date().toISOString()
        }

        try {
            await this.httpClient.post('/ingest', payload);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('[TraceLog Error] Sunucuya ulaşılamadı:', error.message);
            }
        }
    }
}
