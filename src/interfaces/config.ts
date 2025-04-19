export interface BaseConfig {
    type: string;
    sourceLang: string;
    targetLang: string;
}

export interface BaiduConfig extends BaseConfig {
    type: 'baidu';
    appId: string;
    apiKey: string;
}

export interface YoudaoConfig extends BaseConfig {
    type: 'youdao';
    appId: string;
    apiKey: string;
}

export interface LLMConfig extends BaseConfig {
    type: 'llm';
    provider: string;
    apiKey: string;
    model: string;
    prompt: string;
    endpoint: string;
}

export type TranslatorConfig = BaiduConfig | YoudaoConfig | LLMConfig;
