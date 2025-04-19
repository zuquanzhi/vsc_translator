# vsc_translator

A VSCode plugin to translate selected text using Google Translate API.

## Features

- Translate selected text with a shortcut.
- Customize API key, source language, and target language in settings.
- Display translation results in a Webview.

## Usage

1. Configure your API key in settings (`translator.apiKey`).
2. Set source and target languages (`translator.sourceLanguage`, `translator.targetLanguage`).
3. Select text and press `Ctrl+Alt+T` to translate.

## Installation

1. Clone this repository.
2. Run `npm install`.
3. Press `F5` to test the plugin.

## Publishing

1. Install `vsce`: `npm install -g vsce`.
2. Package the plugin: `vsce package`.
3. Publish to Marketplace: `vsce publish`.