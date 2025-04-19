import * as vscode from 'vscode';
import axios from 'axios';
import crypto from 'crypto';

// 定义百度翻译 API 响应的类型
interface BaiduTranslateResponse {
    error_code?: string;
    error_msg?: string;
    from: string;
    to: string;
    trans_result: Array<{ src: string; dst: string }>;
}

// 获取用户配置
function getConfig() {
    const config = vscode.workspace.getConfiguration('translator');
    return {
        appId: config.get<string>('appId', ''), // 默认值为空字符串
        apiKey: config.get<string>('apiKey', ''), // 默认值为空字符串
        sourceLang: config.get<string>('sourceLanguage', 'en'), // 默认值为 'en'
        targetLang: config.get<string>('targetLanguage', 'zh') // 默认值为 'zh'
    };
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

// 使用 Webview 显示翻译结果
function showTranslationInWebview(translatedText: string) {
    const panel = vscode.window.createWebviewPanel(
        'translatorView',
        'Translation Result',
        vscode.ViewColumn.Two,
        {}
    );

    panel.webview.html = `
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Translation Result</h1>
            <p><strong>Translated Text:</strong> ${translatedText}</p>
        </body>
        </html>
    `;
}

// 插件激活时的入口函数
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('translator.translate', async () => {
        // 获取当前选中的文本
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

        // 获取用户配置
        const { appId, apiKey, sourceLang, targetLang } = getConfig();

        if (!appId || !apiKey) {
            vscode.window.showErrorMessage('Baidu Translate App ID or API Key is not set.');
            return;
        }

        if (!sourceLang || !targetLang) {
            vscode.window.showErrorMessage('Source language or target language is not set.');
            return;
        }

        try {
            // 调用翻译 API
            const translatedText = await translateText(selectedText, sourceLang, targetLang, appId, apiKey);
            // 显示翻译结果
            showTranslationInWebview(translatedText);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Translation failed: ${errorMessage}`);
        }
    });

    context.subscriptions.push(disposable);
}

// 插件停用时的清理逻辑
export function deactivate() {}