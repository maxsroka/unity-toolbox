import { CancellationToken, Hover, HoverProvider, Position, ProviderResult, TextDocument, Range, workspace } from "vscode";
import { parser } from "./extension";
import * as messages from "./unity-messages.json";

export default class UnityMessageHoverProvider implements HoverProvider {
    provideHover(doc: TextDocument, pos: Position, token: CancellationToken): ProviderResult<Hover> {
        const lines = doc.getText().split("\n");
        const line = lines[pos.line];

        if (!parser.hasUnityMessage(line)) return;

        const requiredClass = workspace.getConfiguration("unityToolbox").get("hover.requiredClass");
        const baseClass = parser.getBaseClass(lines, pos.line);

        if (baseClass === undefined) return;

        if (requiredClass === "any derived class" && baseClass === "") return;

        if (requiredClass === "MonoBehaviour or NetworkBehaviour" && baseClass !== "MonoBehaviour" && baseClass !== "NetworkBehaviour") return;

        const name = parser.findMethodsName(line);
        if (name === undefined) return;

        const msg = messages.find((msg) => msg.name === name)

        if (msg !== undefined) {
            const nameIndex = line.indexOf(name);
            const range = doc.getWordRangeAtPosition(new Position(pos.line, nameIndex));

            return new Hover(msg.description, range);
        }
    }
}
