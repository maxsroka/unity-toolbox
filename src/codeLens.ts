import { CancellationToken, CodeLens, CodeLensProvider, Command, ProviderResult, TextDocument } from 'vscode';
import { debug } from './extension';
import { findBehaviour } from './parser';
import * as messages from "./unity-messages.json";

export class UnityMessageCodeLensProvider implements CodeLensProvider {
    hasBehaviourExp = new RegExp(/.*class.*: *(Mono|Network)Behaviour/);
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

    provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const list = [];
        const text = document.getText();

        if (!this.hasBehaviourExp.test(text)) return;

        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].match(this.isVoidMethodExp)) continue;
            if (!lines[i].match(this.isUnityMessageExp)) continue;

            let cmd: Command = {
                command: "",
                title: "$(symbol-method) Unity Message",
                tooltip: "This method is called by Unity"
            }

            var line = document.lineAt(i);
            list.push(new CodeLens(line.range, cmd));
        }

        return list;
    }
}