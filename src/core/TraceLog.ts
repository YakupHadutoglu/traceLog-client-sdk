import axios from "axios";
import { maskSensitiveData } from "../utils/redactor";
import { time } from "console";

export interface TraceLogOptions {
    projectId: string;
    apiKey: string;
    backendUrl?: string;
}

export class TraceLog {
    private projectId: string;
    private apiKey: string;
    private backendUrl: string;
    private globalContext: Record<string, any> = {};
    private sensitiveKeys: string[] = ['password', 'token', 'secret', 'credit_card', 'authorization', 'ssn'];

    constructor(options: TraceLogOptions) {
        this.projectId = options.projectId.toString();
        this.apiKey = options.apiKey.replace('ApiKey ', '').trim();
        this.backendUrl = options.backendUrl || 'http://localhost:3001';
        this.setupGracefulShutdown();
    }

    public setContext(contextData: Record<string, any>) {
        this.globalContext = { ...this.globalContext, ...contextData };
    }

    public clearContext() {
        this.globalContext = {};
    }

    public async log(level: 'info' | 'warn'  | 'error' | 'fatal' | 'debug', message: string, metadata: any = {}) {
        try {
            const safeMetadata = maskSensitiveData({ ...this.globalContext, ...metadata }, this.sensitiveKeys);

            await axios.post(`${this.backendUrl}/log/ingest`, {
                level,
                message,
                metadata: safeMetadata,
                timestamp: new Date().toISOString(),
                projectId: this.projectId
            }, {
                headers: {
                    'Authorization': `ApiKey ${this.apiKey}`,
                    'x-project-id': this.projectId,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
        } catch (error: any) {
            console.error('[TraceLog SDK Error]: Log could not be sent:', error.message);
        }
    }

    private setupGracefulShutdown() {
        const handleExit = async (signal: string) => {
            await this.log('fatal', `System Shutdown Triggered: ${signal}`, { action: 'shutdown' });
        }
        process.on('SIGTERM', () => handleExit('SIGTERM'));
        process.on('SIGINT', () => handleExit('SIGINT'));
    }
}
