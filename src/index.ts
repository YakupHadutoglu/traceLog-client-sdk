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
    private endpoint: string = 'https://apiKey.tracelog.dev/logs/trace-log-projesinin-adresiyle-değişecek';

    constructor(apikey: string) {
        if (!apikey) {
            throw new Error('API key is required to initialize Trace Log LogStreamer')
        }
        this.apiKey = apikey;

        this.httpClient = axios.create({
            baseURL: this.endpoint,
            headers: {
                "Authorization": `ApiKey ${this.apiKey}`,
                "Content-Type": "application/json",

            }
        });
    }
    public info(message: string, metadata: object = {}) {
        return this.sendLog('info', message, metadata);
    }

    public error(message: string, metadata: object = {}) {
        return this.sendLog('error', message, metadata);
    }

    private async sendLog(level: 'info' | 'warn' | 'error', message: string, metadata: object) {
        const payload: LogPayload = {
            message,
            level,
            metadata,
            timestamp: new Date().toLocaleDateString()
        }
        try {
            await this.httpClient.post(this.endpoint , payload);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('[Trace Log Api Client] Log could be not sent', error.response?.data || error.message);
            } else {
                console.error('[Trace Log Api Client] Log could not be sent', error);
            }
        }
    }
}


