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
        this.projectId = options.projectId.toString();
        this.apiKey = options.apiKey.replace('ApiKey ', '').trim();
        this.backendUrl = options.backendUrl || 'http://localhost:3001';
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
            await axios_1.default.post(`${this.backendUrl}/log/ingest`, {
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
        }
        catch (error) {
            console.error('[TraceLog SDK Error]: Log could not be sent:', error.message);
        }
    }
    setupGracefulShutdown() {
        const handleExit = async (signal) => {
            await this.log('fatal', `System Shutdown Triggered: ${signal}`, { action: 'shutdown' });
        };
        process.on('SIGTERM', () => handleExit('SIGTERM'));
        process.on('SIGINT', () => handleExit('SIGINT'));
    }
}
exports.TraceLog = TraceLog;
