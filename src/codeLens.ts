import { CancellationToken, CodeLens, CodeLensProvider, Command, Range, ProviderResult, TextDocument } from 'vscode';
import { debug } from './extension';

export class UnityMessageProvider implements CodeLensProvider {
    constructor() {

    }

    provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        console.time('codelense');
        const list = [];
        const text = document.getText();
        const hasBehaviourExp = new RegExp(/.*class.*: *(Mono|Network)Behaviour/);

        if (!hasBehaviourExp.test(text)) return;

        const isVoidMethodExp = new RegExp(/void.*\(.*\)/);
        const isUnityMessageExp = new RegExp(/void.*(Start|Update|FixedUpdate)\(.*\)/);
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].match(isVoidMethodExp)) continue;
            if (!lines[i].match(isUnityMessageExp)) continue;

            let cmd: Command = {
                command: "",
                title: "$(symbol-method) Unity Message",
            }

            var line = document.lineAt(i);
            list.push(new CodeLens(line.range, cmd));
        }

        console.timeEnd('codelense');
        return list;
    }
}