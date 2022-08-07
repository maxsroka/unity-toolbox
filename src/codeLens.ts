import { CancellationToken, CodeLens, CodeLensProvider, Command, Range, ProviderResult, TextDocument } from 'vscode';
import { debug } from './extension';

export class UnityMessageProvider implements CodeLensProvider {
    constructor() {

    }

    provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const list = [];
        const text = document.getText();
        const hasBehaviourExp = new RegExp(/.*class.*: *(Mono|Network)Behaviour/);

        if (!hasBehaviourExp.test(text)) return;

        const isUnityMessageExp = new RegExp(/.*void Start()/);
        const lines = text.split('\n');

        for (const line in lines) {
            if (line.match(isUnityMessageExp)) {
                let cmd: Command = {
                    command: "",
                    title: "$(symbol-method) Unity Message",
                }

                list.push(new CodeLens(new Range(0, 0, 0, 0), cmd));
            }
        }

        return list;
    }
}