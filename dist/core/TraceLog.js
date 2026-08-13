"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceLog = void 0;
const axios_1 = __importDefault(require("axios"));
const redactor_1 = require("../utils/redactor");
class TraceLog {
    constructor(options) {
        this.globalContext = {};
        this.sensitiveKeys = ['password', 'token', 'secret', 'credit_card', 'authorization', 'ssn'];
        //! Batching veriables
        this.logBuffer = [];
        this.timer = null;
        this.isFlushing = false;
        this.projectId = options.projectId;
        this.apiKey = options.apiKey;
        this.backendUrl = options.backendUrl || 'http://localhost:3000';
        this.batchSize = options.batchSize || 50;
        this.flushInterval = options.flushInterval || 5000;
        this.startTimer();
        this.setupGracefulShutdown();
    }
    setContext(contextData) {
        this.globalContext = { ...this.globalContext, ...contextData };
    }
    clearContext() {
        this.globalContext = {};
    }
    async log(level, message, metadata = {}) {
        try {
            const safeMetadata = (0, redactor_1.maskSensitiveData)({ ...this.globalContext, ...metadata }, this.sensitiveKeys);
            const logEntry = {
                level,
                message,
                metadata: safeMetadata,
                timestamp: new Date().toISOString(),
                projectId: this.projectId
            };
            this.logBuffer.push(logEntry);
            if (this.logBuffer.length >= this.batchSize) {
                await this.flush();
            }
        }
        catch (error) {
            console.error('[TraceLog SDK Error]: Log could not be sent:', error.message);
        }
    }
    async flush() {
        if (this.logBuffer.length === 0 || this.isFlushing)
            return;
        this.isFlushing = true;
        const logsToSend = [...this.logBuffer];
        this.logBuffer = [];
        try {
            await axios_1.default.post(`${this.backendUrl}/log/ingest/batch`, logsToSend, {
                headers: {
                    'Authorization': `ApiKey ${this.apiKey}`,
                    'x-project-id': this.projectId,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
        }
        catch (error) {
            console.error('[TraceLog SDK Error]: Batch log could not be sent:', error.message);
            //! For advanced level: In order not to lose the logs that cannot be sent, they will be added to the beginning of the logBuffer (Retry mechanism).
        }
        finally {
            this.isFlushing = false;
        }
    }
    startTimer() {
        this.timer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }
    setupGracefulShutdown() {
        const handleExit = async (signal) => {
            await this.log('fatal', `System Shutdown Triggered: ${signal}`, { action: 'shutdown' });
            await this.flush();
            if (this.timer)
                clearInterval(this.timer);
        };
        process.on('SIGTERM', () => handleExit('SIGTERM'));
        process.on('SIGINT', () => handleExit('SIGINT'));
    }
}
exports.TraceLog = TraceLog;
