import { ExtensionContext, Uri, commands, window } from "vscode";

const COMMAND_ID = "unityToolbox.searchUnity";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand(COMMAND_ID, searchUnity));
}

function searchUnity() {
    const editor = window.activeTextEditor;
    if (editor === undefined) return;

    const selection = editor.document.getText(editor.selection);
    commands.executeCommand("vscode.open", Uri.parse(`https://docs.unity3d.com/ScriptReference/30_search.html?q=${selection}`))
}