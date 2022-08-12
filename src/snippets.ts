import { CancellationToken, CompletionItemKind, SnippetString, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument, CompletionItemTag, workspace } from "vscode";
import { parser } from "./extension"
import * as messages from "./unity-messages.json";

export default class UnityMessageSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, ctx: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const lines = doc.getText().split("\n");
        if (!parser.isInBehaviour(lines, pos.line)) return;

        const items = [];
        const existingMethods = parser.findAllMethodsNames(lines);

        for (const msg of messages) {
            if (existingMethods.includes(msg.name)) continue;

            const item = new CompletionItem(msg.name);
            item.kind = CompletionItemKind.Method;
            item.detail = `${msg.name} (Unity Message)`;
            item.documentation = msg.description;

            let snippet: string[];
            const bracketsStyle = workspace.getConfiguration("unityToolbox").get("bracketsStyle");

            if (bracketsStyle === BracketsStyle.NewLine) {
                snippet = msg.body;
            } else {
                snippet = [];
                const bracket = bracketsStyle === BracketsStyle.SameLineWithSpace ? " {" : "{";

                snippet[0] = msg.body[0] + bracket;

                for (let i = 2; i < msg.body.length; i++) {
                    snippet.push(msg.body[i]);
                }
            }

            item.insertText = new SnippetString(snippet.join("\n"));

            items.push(item);
        }

        return items;
    }
}

enum BracketsStyle {
    NewLine = "new line",
    SameLineWithSpace = "same line, with space",
    SameLineWithoutSpace = "same line, without space",
}