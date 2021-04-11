import { ExtensionContext, languages } from 'vscode';
import { CodeLens } from './features/codeLens';
import { registerCommands } from './features/commands';
import { initOutput } from './output';

export function activate(context: ExtensionContext) {
    initOutput();
    registerCommands(context);
    registerCodeLens();
}

function registerCodeLens() {
    languages.registerCodeLensProvider({ language: "csharp" }, new CodeLens());
}

export function deactivate() { }