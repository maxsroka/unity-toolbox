import { CancellationToken, CompletionItemKind, SnippetString, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument, CompletionItemTag } from "vscode";
import { parser } from "./extension"
import * as messages from "./unity-messages.json";

export default class UnityMessageSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, ctx: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const lines = doc.getText().split("\n");
        if (!parser.isInBehaviour(lines, pos)) return;

        const items = [];
        const existingMethods = parser.findAllMethodsNames(lines);

        for (const msg of messages) {
            if (existingMethods.includes(msg.name)) continue;

            const item = new CompletionItem(msg.name);
            item.kind = CompletionItemKind.Method;
            item.detail = `${msg.name} (Unity Message)`;
            item.documentation = msg.description;
            item.insertText = new SnippetString(msg.body.join("\n"));

            items.push(item);
        }

        return items;
    }
}