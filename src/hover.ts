import { CancellationToken, Hover, HoverProvider, Position, ProviderResult, TextDocument } from "vscode";
import { parser } from "./extension";
import * as messages from "./unity-messages.json";

export default class UnityMessageHoverProvider implements HoverProvider {
    provideHover(doc: TextDocument, pos: Position, token: CancellationToken): ProviderResult<Hover> {
        const lines = doc.getText().split("\n");
        const line = lines[pos.line];

        if (!parser.isInBehaviour(doc, pos)) return;

        return {
            contents: ["Hover"]
        }
    }
}