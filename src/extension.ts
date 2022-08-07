import { ExtensionContext, languages, window } from 'vscode';
import { UnityMessageProvider } from './codeLens';

export const debug = window.createOutputChannel("Unity Toolbox");

export function activate(context: ExtensionContext) {
    languages.registerCodeLensProvider({ language: "csharp" }, new UnityMessageProvider());
}