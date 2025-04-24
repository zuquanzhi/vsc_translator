# VSC Translator

一个支持多种翻译服务的 VSCode 翻译插件，可以快速翻译选中的文本。

## 特性

- 支持多种翻译服务：
  - 百度翻译
  - 有道翻译
  - 大语言模型 (OpenAI/Deepseek/Qwen)
- 快捷键翻译: `Ctrl+T`
- 可拖动的翻译结果显示
- 自定义翻译提示词

## 安装

在 VSCode 扩展商店中搜索 "VSC Translator" 或 "vsc-translator" 并安装。

## 配置

1. 选择翻译服务
```json
"translator.service": "baidu" // 可选: "baidu", "youdao", "llm"
```

2. 配置翻译服务
- 百度翻译:
```json
"translator.baidu.appId": "你的AppID",
"translator.baidu.key": "你的密钥"
```

- 有道翻译:
```json
"translator.youdao.appId": "你的应用ID",
"translator.youdao.key": "你的密钥"
```

- 大语言模型:
```json
"translator.llm.provider": "deepseek",  // 可选: "openai", "deepseek", "qwen"
"translator.llm.key": "你的API密钥",
"translator.llm.model": "deepseek-chat"
```

3. 语言设置
```json
"translator.language": {
  "source": "auto",  // 源语言，auto为自动检测
  "target": "zh"    // 目标语言
}
```

## 使用方法

1. 选中要翻译的文本
2. 按下 `Ctrl+T` 或在命令面板中执行 "Translate Selected Text"
3. 翻译结果会显示在选中文本旁边的可拖动窗口中

## 我太懒了，找不到好用简洁的翻译插件，自己写了个

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.