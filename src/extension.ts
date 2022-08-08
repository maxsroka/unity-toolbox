import { ExtensionContext, languages, window } from 'vscode';
import { UnityMessageCodeLensProvider } from './codeLens';
import { UnityMessageSnippetsProvider } from "./snippets";

export const debug = window.createOutputChannel("Unity Toolbox");

export function activate(context: ExtensionContext) {
    languages.registerCodeLensProvider({ language: "csharp" }, new UnityMessageCodeLensProvider());
    languages.registerCompletionItemProvider({ language: "csharp" }, new UnityMessageSnippetsProvider());
}