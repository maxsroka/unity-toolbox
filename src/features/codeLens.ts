import * as vscode from 'vscode';
import * as eventMethodSnippets from '../event-methods-snippets.json'

export class CodeLens implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    private document: vscode.TextDocument | null = null;

    constructor() {
        let methods = "";
        let keys = Object.keys(eventMethodSnippets);

        for (let i = 0; i < keys.length; i++) {
            methods += keys[i].toString();
            if (i < keys.length - 1) {
                methods += "|";
            }
        }

        this.regex = new RegExp(`void (${methods})()\\b`, "g");

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken) {

        if (vscode.workspace.getConfiguration("unityToolbox").get("codeLensForUnityEventMethods", true)) {
            this.codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();
            this.document = document;

            if (text.match(/:\s*MonoBehaviour/)) {
                let matches;
                while ((matches = regex.exec(text)) !== null) {
                    const line = document.lineAt(document.positionAt(matches.index).line);
                    const indexOf = line.text.indexOf(matches[0]);
                    const position = new vscode.Position(line.lineNumber, indexOf);
                    const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
                    if (range) {
                        this.codeLenses.push(new vscode.CodeLens(range));
                    }
                }
                return this.codeLenses;
            }
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (this.document != null) {
            if (vscode.workspace.getConfiguration("unityToolbox").get("codeLensForUnityEventMethods", true)) {
                let url = this.document.lineAt(codeLens.range.start.line).text;
                url = url.replace(/ /g, "")
                url = url.replace(/void/g, "")
                url = url.slice(0, -2);

                codeLens.command = {
                    title: "Unity Event",
                    tooltip: "Open Documentation",
                    command: "unityToolbox.openDocumentation",
                    arguments: [url],
                };
                return codeLens;
            }
            return null;
        }
    }
}