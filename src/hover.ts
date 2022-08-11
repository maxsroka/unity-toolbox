import { CancellationToken, Hover, HoverProvider, Position, ProviderResult, TextDocument, Range } from "vscode";
import { parser } from "./extension";
import * as messages from "./unity-messages.json";

export default class UnityMessageHoverProvider implements HoverProvider {
    provideHover(doc: TextDocument, pos: Position, token: CancellationToken): ProviderResult<Hover> {
        const lines = doc.getText().split("\n");
        const line = lines[pos.line];

        if (!parser.isInBehaviour(lines, pos)) return;
        if (!parser.hasUnityMessage(line)) return;

        const methodName = parser.findMethodsName(line);
        if (methodName === undefined) return;

        const methodNameStartIndex = line.indexOf(methodName);
        const range = doc.getWordRangeAtPosition(new Position(pos.line, methodNameStartIndex));

        for (const msg of messages) {
            if (msg.name === methodName) {
                return new Hover(msg.description, range);
            }
        }
    }
}