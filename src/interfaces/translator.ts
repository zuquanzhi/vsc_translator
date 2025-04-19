export interface TranslateOptions {
    sourceLang: string;
    targetLang: string;
    prompt?: string;
}

export interface TranslatorConfig {
    type: string;
    appId?: string;
    apiKey?: string;
    model?: string;
    prompt?: string;
}

export abstract class Translator {
    abstract translate(text: string, options: TranslateOptions): Promise<string>;
}
