import { Translator, TranslatorConfig } from '../interfaces/translator';
import { BaiduTranslator } from './baidu';
import { YoudaoTranslator } from './youdao';
import { LLMTranslator } from './llm';

export function createTranslator(config: TranslatorConfig): Translator {
    switch (config.type) {
        case 'baidu':
            return new BaiduTranslator(config.appId!, config.apiKey!);
        case 'youdao':
            return new YoudaoTranslator(config.appId!, config.apiKey!);
        case 'llm':
            return new LLMTranslator(config.apiKey!, config.model!, config.prompt);
        default:
            throw new Error(`不支持的翻译服务类型: ${config.type}`);
    }
}
