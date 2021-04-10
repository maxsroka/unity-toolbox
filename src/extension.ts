import { ExtensionContext, languages } from 'vscode';
import { CodeLens } from './features/codeLens';
import { registerCommands } from './features/commands';

export function activate(context: ExtensionContext) {
    registerCommands(context);
    registerCodeLens();
}

function registerCodeLens() {
    languages.registerCodeLensProvider({ language: "csharp" }, new CodeLens());
}

export function deactivate() { }