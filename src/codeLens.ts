import { CancellationToken, CodeLens, CodeLensProvider, Command, Position, ProviderResult, TextDocument } from 'vscode';
import { parser } from './extension';
import { sceneParser } from './extension';

export class UnityMessageCodeLensProvider implements CodeLensProvider {
    provideCodeLenses(doc: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const lines = doc.getText().split('\n');
        const list = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (!parser.hasUnityMessage(line)) continue;
            if (!parser.isInBehaviour(lines, i)) continue;

            const behaviour = parser.findBehaviour(lines);
            if (behaviour === undefined) continue;
            const openingLine = parser.findOpeningBracket(lines, behaviour);
            if (openingLine === undefined) continue;

            if (!parser.isLineOnBracketsLevel(lines, openingLine, i) && parser.findMethodsName(line) === undefined) continue;
            // ^ is on the brackets level or method definition 

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

export class UsedInCodeLensProvider implements CodeLensProvider {
    provideCodeLenses(doc: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const lines = doc.getText().split('\n');
        const list = [];

        const behaviour = parser.findBehaviour(lines);
        if (behaviour === undefined) return;

        sceneParser.refresh();
        const guid = sceneParser.getGuid(doc.fileName);
        if (guid === undefined) return;
        const refs = sceneParser.findSceneReferences(guid);

        if (refs.length == 0) {
            return;
        }

        let text = "";
        if (refs.length == 1) {
            text = "1 scene";
        } else if (refs.length < 10) {
            text = `${refs.length} scenes`;
        } else {
            text = `9+ scenes`;
        }

        const cmd: Command = {
            command: "",
            title: `$(list-unordered) used in ${text}`,
            tooltip: "asd",
        };

        list.push(new CodeLens(doc.lineAt(behaviour).range, cmd));

        return list;
    }
}