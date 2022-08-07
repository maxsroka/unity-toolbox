import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, Position, ProviderResult, SnippetString, TextDocument } from "vscode";
import * as messages from "./unity-messages.json";

export class UnityMessageCompletionItemProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const items = [];

        for (const msg of messages) {
            const item = new CompletionItem(msg.name);
            item.kind = CompletionItemKind.Method;
            item.insertText = new SnippetString(msg.body.join("\n"));

            items.push(item);
        }

        return items;
    }
}