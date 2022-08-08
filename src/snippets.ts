import { CancellationToken, CompletionItemKind, SnippetString, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument, CompletionItemTag } from "vscode";
import { isInBehaviour } from "./parser";
import * as messages from "./unity-messages.json";

export class UnityMessageSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, ctx: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        if (!isInBehaviour(doc, pos)) return;

        const items = [];

        for (const msg of messages) {
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