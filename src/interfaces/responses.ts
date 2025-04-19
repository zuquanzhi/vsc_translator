export interface BaiduTranslateResponse {
    error_code?: string;
    error_msg?: string;
    from: string;
    to: string;
    trans_result: Array<{ src: string; dst: string }>;
}

export interface YoudaoTranslateResponse {
    errorCode: string;
    translation?: string[];
}

export interface LLMResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}
