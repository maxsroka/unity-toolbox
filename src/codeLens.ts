import { CancellationToken, CodeLens, CodeLensProvider, Command, Position, ProviderResult, TextDocument } from 'vscode';
import { parser } from './extension';
import { assetParser } from './extension';

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

export class UsagesCodeLensProvider implements CodeLensProvider {
    provideCodeLenses(doc: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const lines = doc.getText().split('\n');
        const list = [];

        const guid = assetParser.getGuid(doc.fileName);
        if (guid === undefined) return;

        list.push(...this.getSceneUsages(doc, lines, guid));
        list.push(...this.getPrefabUsages(doc, lines, guid));

        return list;
    }

    getSceneUsages(doc: TextDocument, lines: string[], guid: string): CodeLens[] {
        const behaviour = parser.findBehaviour(lines);
        if (behaviour === undefined) return [];

        const list = [];
        const refs = assetParser.findReferences(guid, assetParser.scenes);

        const title = this.formatTitle("scene", refs.length);
        const tooltip = this.formatTooltip(refs, 6);

        const cmd: Command = {
            command: "",
            title: title,
            tooltip: tooltip,
        };

        list.push(new CodeLens(doc.lineAt(behaviour).range, cmd));

        return list;
    }

    getPrefabUsages(doc: TextDocument, lines: string[], guid: string): CodeLens[] {
        const behaviour = parser.findBehaviour(lines);
        if (behaviour === undefined) return [];

        const list = [];
        const refs = assetParser.findReferences(guid, assetParser.prefabs);

        const title = this.formatTitle("prefab", refs.length);
        const tooltip = this.formatTooltip(refs, 7);

        const cmd: Command = {
            command: "",
            title: title,
            tooltip: tooltip,
        };

        list.push(new CodeLens(doc.lineAt(behaviour).range, cmd));

        return list;
    }

    formatTitle(word: string, count: number): string {
        let title = "";

        if (count == 0) {
            title = `0 ${word} usages`;
        } else if (count == 1) {
            title = `1 ${word} usage`;
        } else if (count < 10) {
            title = `${count} ${word} usages`;
        } else {
            title = `9+ ${word} usages`;
        }

        return title;
    }

    formatTooltip(refs: string[], extensionLength: number): string {
        let tooltip = "";

        for (const prefab of refs) {
            let name = prefab;
            name = name.slice(0, prefab.length - extensionLength);
            name = name.substring(name.indexOf("Assets\\"))
            name += "\n";

            tooltip += name;
        }

        return tooltip;
    }
}