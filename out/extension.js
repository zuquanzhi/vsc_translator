"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
// 获取用户配置
function getConfig() {
    const config = vscode.workspace.getConfiguration('translator');
    return {
        appId: config.get('appId', ''),
        apiKey: config.get('apiKey', ''),
        sourceLang: config.get('sourceLanguage', 'en'),
        targetLang: config.get('targetLanguage', 'zh') // 默认值为 'zh'
    };
}
// 调用百度翻译 API
function translateText(text, sourceLang, targetLang, appId, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!appId || !apiKey) {
            throw new Error('Baidu Translate App ID or API Key is not set.');
        }
        const salt = Math.random().toString();
        const sign = crypto_1.default.createHash('md5').update(appId + text + salt + apiKey).digest('hex');
        const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
        const response = yield axios_1.default.get(url, {
            params: {
                q: text,
                from: sourceLang,
                to: targetLang,
                appid: appId,
                salt: salt,
                sign: sign
            }
        });
        const data = response.data;
        if (data.error_code) {
            throw new Error(`Translation failed: ${data.error_msg}`);
        }
        if (data.trans_result && data.trans_result.length > 0) {
            return data.trans_result[0].dst;
        }
        throw new Error('Translation failed: No result found.');
    });
}
// 创建装饰类型
const translationDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
        margin: '0 0 0 2em',
        textDecoration: 'none'
    }
});
// 显示翻译结果
function showTranslationResult(editor, selection, translatedText) {
    // 清除之前的装饰
    editor.setDecorations(translationDecorationType, []);
    const decorationOptions = {
        range: selection,
        renderOptions: {
            after: {
                contentText: `➜ ${translatedText}`,
                color: '#888888',
                fontStyle: 'normal'
            }
        }
    };
    editor.setDecorations(translationDecorationType, [decorationOptions]);
}
// 插件激活时的入口函数
function activate(context) {
    let disposable = vscode.commands.registerCommand('translator.translate', () => __awaiter(this, void 0, void 0, function* () {
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
            const translatedText = yield translateText(selectedText, sourceLang, targetLang, appId, apiKey);
            showTranslationResult(editor, selection, translatedText);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Translation failed: ${errorMessage}`);
        }
    }));
    // 注册清理装饰的事件
    vscode.window.onDidChangeTextEditorSelection(() => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(translationDecorationType, []);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// 插件停用时的清理逻辑
function deactivate() {
    // 清除所有装饰
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.setDecorations(translationDecorationType, []);
    }
}
exports.deactivate = deactivate;
