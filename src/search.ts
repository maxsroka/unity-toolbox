import { commands, Uri, window } from "vscode";

export default function searchInUnityDocumentation() {
    const editor = window.activeTextEditor;
    if (editor === undefined) return;

    const selection = editor.document.getText(editor.selection);

    commands.executeCommand("vscode.open", Uri.parse(`https://docs.unity3d.com/Manual/30_search.html?q=${selection}`))
}