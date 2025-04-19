import * as vscode from 'vscode';
import axios from 'axios';
import crypto from 'crypto';
import { createTranslator } from './translators';
import { TranslatorConfig } from './interfaces/config';
import { BaiduTranslateResponse } from './interfaces/responses';

// 获取用户配置
function getConfig(): TranslatorConfig {
    const config = vscode.workspace.getConfiguration('translator');
    const service = config.get<string>('service', 'baidu');

    const baseConfig = {
        sourceLang: config.get<string>('language.source', 'auto'),
        targetLang: config.get<string>('language.target', 'zh')
    };

    switch (service) {
        case 'baidu':
            return {
                ...baseConfig,
                type: 'baidu',
                appId: config.get<string>('baidu.appId', ''),
                apiKey: config.get<string>('baidu.key', '')
            };
        case 'youdao':
            return {
                ...baseConfig,
                type: 'youdao',
                appId: config.get<string>('youdao.appId', ''),
                apiKey: config.get<string>('youdao.key', '')
            };
        case 'llm':
            return {
                ...baseConfig,
                type: 'llm',
                provider: config.get<string>('llm.provider', 'deepseek'),
                apiKey: config.get<string>('llm.key', ''),
                model: config.get<string>('llm.model', 'deepseek-chat'),
                prompt: config.get<string>('llm.prompt', '将下面的文本翻译成{targetLang}：\n{text}'),
                endpoint: config.get<string>('llm.endpoint', 'https://api.deepseek.com/v1/chat/completions')
            };
        default:
            throw new Error(`不支持的翻译服务: ${service}`);
    }
}

// 调用百度翻译 API
async function translateText(text: string, sourceLang: string, targetLang: string, appId: string, apiKey: string): Promise<string> {
    if (!appId || !apiKey) {
        throw new Error('Baidu Translate App ID or API Key is not set.');
    }

    const salt = Math.random().toString();
    const sign = crypto.createHash('md5').update(appId + text + salt + apiKey).digest('hex');

    const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    const response = await axios.get(url, {
        params: {
            q: text,
            from: sourceLang,
            to: targetLang,
            appid: appId,
            salt: salt,
            sign: sign
        }
    });

    const data = response.data as BaiduTranslateResponse;

    if (data.error_code) {
        throw new Error(`Translation failed: ${data.error_msg}`);
    }

    if (data.trans_result && data.trans_result.length > 0) {
        return data.trans_result[0].dst;
    }

    throw new Error('Translation failed: No result found.');
}

// 创建装饰类型
const translationDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
        margin: '0 0 0 1.2em',
        backgroundColor: '#2d2d2d',
        border: '1px solid #3d3d3d',
        textDecoration: 'none'
    }
});

// 显示翻译结果
function showTranslationResult(editor: vscode.TextEditor, selection: vscode.Selection, translatedText: string) {
    // 清除之前的装饰
    editor.setDecorations(translationDecorationType, []);
    
    const decorationOptions = {
        range: selection,
        renderOptions: {
            after: {
                contentText: `  ${translatedText}  `,
                color: '#ffffff',
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: '13px',
                fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
            }
        }
    };

    editor.setDecorations(translationDecorationType, [decorationOptions]);
}

// 插件激活时的入口函数
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('translator.translate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showErrorMessage('No text selected.');
            return;
        }

        const config = getConfig();
        try {
            const translator = createTranslator(config);

            const translatedText = await translator.translate(selectedText, {
                sourceLang: config.sourceLang,
                targetLang: config.targetLang,
                prompt: 'llm' === config.type ? config.prompt : undefined
            });

            showTranslationResult(editor, selection, translatedText);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Translation failed: ${errorMessage}`);
        }
    });

    // 注册清理装饰的事件
    vscode.window.onDidChangeTextEditorSelection(() => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(translationDecorationType, []);
        }
    });

    context.subscriptions.push(disposable);
}

// 插件停用时的清理逻辑
export function deactivate() {
    // 清除所有装饰
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.setDecorations(translationDecorationType, []);
    }
}