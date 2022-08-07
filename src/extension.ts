import { ExtensionContext, languages, window, workspace } from 'vscode';
import { UnityMessageCodeLensProvider } from './codeLens';

export const debug = window.createOutputChannel("Unity Toolbox");

export function activate(context: ExtensionContext) {
    languages.registerCodeLensProvider({ language: "csharp" }, new UnityMessageCodeLensProvider());
}