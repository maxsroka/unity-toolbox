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

        let title = "";
        if (refs.length == 0) {
            title = "0 scene usages";
        } else if (refs.length == 1) {
            title = "1 scene usage";
        } else if (refs.length < 10) {
            title = `${refs.length} scene usages`;
        } else {
            title = `9+ scene usages`;
        }

        let tooltip = "";
        for (const scene of refs) {
            let name = scene;
            name = name.slice(0, scene.length - 6); // remove .unity
            name = name.substring(name.indexOf("Assets\\"))
            name += "\n";

            tooltip += name;
        }

        const cmd: Command = {
            command: "",
            title: title,
            tooltip: tooltip,
        };

        list.push(new CodeLens(doc.lineAt(behaviour).range, cmd));

        return list;
    }
}