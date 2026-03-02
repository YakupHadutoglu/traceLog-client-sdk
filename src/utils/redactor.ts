export const maskSensitiveData = (data: any, sensitiveKeys: string[]) => {
    if (!data || typeof data !== 'object') return data;

    const maskedData: any = Array.isArray(data) ? [...data] : { ...data };

    for (const key in maskedData) {
        if (Object.prototype.hasOwnProperty.call(maskedData, key)) {
            const lowerKey = key.toLocaleLowerCase();
            const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

            if (isSensitive) {
                maskedData[key] = '[REDACTED]';
            } else if (typeof maskedData[key] === 'object') {
                maskedData[key] = maskSensitiveData(maskedData[key],sensitiveKeys);
            }
        }
    }
    return maskedData;
}
