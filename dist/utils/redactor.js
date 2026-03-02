"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSensitiveData = void 0;
const maskSensitiveData = (data, sensitiveKeys) => {
    if (!data || typeof data !== 'object')
        return data;
    const maskedData = Array.isArray(data) ? [...data] : { ...data };
    for (const key in maskedData) {
        if (Object.prototype.hasOwnProperty.call(maskedData, key)) {
            const lowerKey = key.toLocaleLowerCase();
            const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
            if (isSensitive) {
                maskedData[key] = '[REDACTED]';
            }
            else if (typeof maskedData[key] === 'object') {
                maskedData[key] = (0, exports.maskSensitiveData)(maskedData[key], sensitiveKeys);
            }
        }
    }
    return maskedData;
};
exports.maskSensitiveData = maskSensitiveData;
