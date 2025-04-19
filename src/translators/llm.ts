import axios from 'axios';
import { Translator, TranslateOptions } from '../interfaces/translator';

interface LLMResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export class LLMTranslator extends Translator {
    constructor(
        private apiKey: string,
        private model: string,
        private defaultPrompt?: string,
        private endpoint?: string
    ) {
        super();
    }

    async translate(text: string, options: TranslateOptions): Promise<string> {
        const prompt = (options.prompt || this.defaultPrompt || '')
            .replace('{text}', text)
            .replace('{targetLang}', options.targetLang);

        const apiEndpoint = this.endpoint || this.getDefaultEndpoint();

        const response = await axios.post(
            apiEndpoint,
            {
                model: this.model,
                messages: [{ role: 'user', content: prompt }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = response.data as LLMResponse;
        return data.choices[0].message.content.trim();
    }

    private getDefaultEndpoint(): string {
        switch (this.model) {
            case 'deepseek-chat':
                return 'https://api.deepseek.com/v1/chat/completions';
            case 'qwen':
                return 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
            default:
                return 'https://api.openai.com/v1/chat/completions';
        }
    }
}
