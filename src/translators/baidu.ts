import axios from 'axios';
import crypto from 'crypto';
import { Translator, TranslateOptions } from '../interfaces/translator';

interface BaiduTranslateResponse {
    error_code?: string;
    error_msg?: string;
    from: string;
    to: string;
    trans_result: Array<{ src: string; dst: string }>;
}

export class BaiduTranslator extends Translator {
    constructor(private appId: string, private apiKey: string) {
        super();
    }

    async translate(text: string, options: TranslateOptions): Promise<string> {
        const salt = Math.random().toString();
        const sign = crypto.createHash('md5')
            .update(this.appId + text + salt + this.apiKey)
            .digest('hex');

        const response = await axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
            params: {
                q: text,
                from: options.sourceLang,
                to: options.targetLang,
                appid: this.appId,
                salt,
                sign
            }
        });

        const data = response.data as BaiduTranslateResponse;
        if (data.error_code) {
            throw new Error(`百度翻译错误: ${data.error_msg}`);
        }

        return data.trans_result[0].dst;
    }
}
