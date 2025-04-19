import axios from 'axios';
import crypto from 'crypto';
import { Translator, TranslateOptions } from '../interfaces/translator';

interface YoudaoTranslateResponse {
    errorCode: string;
    translation?: string[];
}

export class YoudaoTranslator extends Translator {
    constructor(private appId: string, private apiKey: string) {
        super();
    }

    async translate(text: string, options: TranslateOptions): Promise<string> {
        const salt = Date.now();
        const curtime = Math.round(Date.now() / 1000);
        const sign = crypto.createHash('sha256')
            .update(this.appId + text + salt + curtime + this.apiKey)
            .digest('hex');

        const response = await axios.post('https://openapi.youdao.com/api', {
            q: text,
            from: options.sourceLang,
            to: options.targetLang,
            appKey: this.appId,
            salt,
            sign,
            signType: 'v3',
            curtime
        });

        const data = response.data as YoudaoTranslateResponse;
        if (data.errorCode !== '0') {
            throw new Error(`有道翻译错误: ${data.errorCode}`);
        }

        return data.translation?.[0] || '';
    }
}
