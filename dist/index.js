"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogStreamer = void 0;
const axios_1 = __importDefault(require("axios"));
class LogStreamer {
    constructor(apikey) {
        this.endpoint = 'https://apiKey.tracelog.dev/logs/trace-log-projesinin-adresiyle-değişecek';
        if (!apikey) {
            throw new Error('API key is required to initialize Trace Log LogStreamer');
        }
        this.apiKey = apikey;
        this.httpClient = axios_1.default.create({
            baseURL: this.endpoint,
            headers: {
                "Authorization": `ApiKey ${this.apiKey}`,
                "Content-Type": "application/json",
            }
        });
    }
    info(message, metadata = {}) {
        return this.sendLog('info', message, metadata);
    }
    error(message, metadata = {}) {
        return this.sendLog('error', message, metadata);
    }
    async sendLog(level, message, metadata) {
        const payload = {
            message,
            level,
            metadata,
            timestamp: new Date().toLocaleDateString()
        };
        try {
            await this.httpClient.post(this.endpoint, payload);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('[Trace Log Api Client] Log could be not sent', error.response?.data || error.message);
            }
            else {
                console.error('[Trace Log Api Client] Log could not be sent', error);
            }
        }
    }
}
exports.LogStreamer = LogStreamer;
