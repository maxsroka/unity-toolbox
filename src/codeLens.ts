import { CancellationToken, CodeLens, CodeLensProvider, Command, Position, ProviderResult, TextDocument } from 'vscode';
import { isInBehaviour } from './parser';
import * as messages from "./unity-messages.json";

export class UnityMessageCodeLensProvider implements CodeLensProvider {
    isVoidMethodExp = new RegExp(/void.*\(.*\)/);
    isUnityMessageExp: RegExp;

    constructor() {
        let methodsNames = "";

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

            methodsNames += msg.name;

            if (i < messages.length - 1) {
                methodsNames += "|";
            }
        }

        this.isUnityMessageExp = new RegExp("void.*(" + methodsNames + ")\(.*\)");
    }

    provideCodeLenses(doc: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const list = [];
        const text = doc.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (!line.match(this.isVoidMethodExp)) continue;
            if (!line.match(this.isUnityMessageExp)) continue;
            if (!isInBehaviour(doc, new Position(i, 0))) continue;

            let cmd: Command = {
                command: "",
                title: "$(symbol-method) Unity Message",
                tooltip: "This method is called by Unity"
            }

            list.push(new CodeLens(doc.lineAt(i).range, cmd));
        }

        return list;
    }
}