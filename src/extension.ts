import { ExtensionContext, languages, window } from 'vscode';
import UnityMessageCodeLensProvider from './codeLens';
import UnityMessageSnippetsProvider from "./snippets";
import UnityMessageHoverProvider from "./hover";
import Parser from './parser';

export const debug = window.createOutputChannel("Unity Toolbox");
export const parser = new Parser();

export function activate(ctx: ExtensionContext) {
    languages.registerCodeLensProvider({ language: "csharp" }, new UnityMessageCodeLensProvider());
    languages.registerCompletionItemProvider({ language: "csharp" }, new UnityMessageSnippetsProvider());
    languages.registerHoverProvider({ language: "csharp" }, new UnityMessageHoverProvider());
}