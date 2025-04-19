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

        // 获取用户配置
        const { appId, apiKey, sourceLang, targetLang } = getConfig();

        if (!appId || !apiKey) {
            vscode.window.showErrorMessage('Baidu Translate App ID or API Key is not set.');
            return;
        }

        try {
            const translatedText = await translateText(selectedText, sourceLang, targetLang, appId, apiKey);
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