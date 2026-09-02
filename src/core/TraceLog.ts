import axios from "axios";
import { maskSensitiveData } from "../utils/redactor";

export interface TraceLogOptions {
    projectId: string;
    apiKey: string;
    backendUrl?: string;
    batchSize?: number;
    flushInterval?: number;
}

export class TraceLog {
    private projectId: string;
    private apiKey: string;
    private backendUrl: string;
    private globalContext: Record<string, any> = {};
    private sensitiveKeys: string[] = ['password', 'token', 'secret', 'credit_card', 'authorization', 'ssn'];

    private logBuffer: any[] = [];
    private batchSize: number;
    private flushInterval: number;
    private timer: NodeJS.Timeout | null = null;
    private isFlushing: boolean = false;
    private flushPromise: Promise<void> | null = null;

    constructor(options: TraceLogOptions) {
        this.projectId = options.projectId;
        this.apiKey = options.apiKey;
        this.backendUrl = options.backendUrl || 'http://localhost:3000';
        this.batchSize = options.batchSize || 50;
        this.flushInterval = options.flushInterval || 5000;
        this.startTimer();
        this.setupGracefulShutdown();
    }

    public setContext(contextData: Record<string, any>) {
        this.globalContext = { ...this.globalContext, ...contextData };
    }

    public clearContext() {
        this.globalContext = {};
    }

    public async log(level: 'info' | 'warn' | 'error' | 'fatal' | 'debug', message: string, metadata: any = {}) {
        try {
            const safeMetadata = maskSensitiveData({ ...this.globalContext, ...metadata }, this.sensitiveKeys);

            const logEntry = {
                level,
                message,
                metadata: safeMetadata,
                timestamp: new Date().toISOString(),
                projectId: this.projectId
            }

            this.logBuffer.push(logEntry);

            if (this.logBuffer.length >= this.batchSize) {
                this._triggerFlush();
            }
        } catch (error: any) {
            console.error('[TraceLog SDK Error]: Log could not be sent:', error.message);
        }
    }

    private _triggerFlush(): void {
        if (this.isFlushing || this.logBuffer.length === 0) return;
        this.flushPromise = this._doFlush();
    }

    private async _doFlush(): Promise<void> {
        if (this.logBuffer.length === 0 || this.isFlushing) return;

        this.isFlushing = true;
        const logsToSend = [...this.logBuffer];
        this.logBuffer = [];

        try {
            await axios.post(`${this.backendUrl}/log/ingest/batch`, logsToSend, {
                headers: {
                    'Authorization': `ApiKey ${this.apiKey}`,
                    'x-project-id': this.projectId,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
        } catch (error: any) {
            this.logBuffer = [...logsToSend, ...this.logBuffer];
            console.error('[TraceLog SDK Error]: Batch log could not be sent:', error.message);
        } finally {
            this.isFlushing = false;
            this.flushPromise = null;
            if (this.logBuffer.length >= this.batchSize) {
                this._triggerFlush();
            }
        }
    }

    public async flush(): Promise<void> {
        if (this.flushPromise) await this.flushPromise;
        if (this.logBuffer.length === 0) return;
        await this._doFlush();
    }

    private startTimer() {
        this.timer = setInterval(() => {
            this._triggerFlush();
        }, this.flushInterval);
    }

    private setupGracefulShutdown() {
        const handleExit = async (signal: string) => {
            await this.log('fatal', `System Shutdown Triggered: ${signal}`, { action: 'shutdown' });
            await this.flush();
            if (this.timer) clearInterval(this.timer);
        }
        process.on('SIGTERM', () => handleExit('SIGTERM'));
        process.on('SIGINT', () => handleExit('SIGINT'));
    }
}
