import { CancellationToken, CodeLens, CodeLensProvider, Command, Position, ProviderResult, TextDocument, workspace } from 'vscode';
import { parser } from './extension';

export default class UnityMessageCodeLensProvider implements CodeLensProvider {
    provideCodeLenses(doc: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const lines = doc.getText().split('\n');
        const list = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (!parser.hasUnityMessage(line)) continue;

            const requiredClass = workspace.getConfiguration('unityToolbox').get('codeLens.requiredClass');
            const baseClass = parser.getBaseClass(lines, i);

            if (baseClass === undefined) continue;

            if (requiredClass === "any derived class" && baseClass === "") continue;

            if (requiredClass === "MonoBehaviour or NetworkBehaviour" && baseClass !== "MonoBehaviour" && baseClass !== "NetworkBehaviour") continue;

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
