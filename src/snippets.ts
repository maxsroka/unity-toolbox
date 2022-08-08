import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument } from "vscode";
import { isInBehaviour } from "./parser";

export class UnityMessageSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, ctx: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        console.log(isInBehaviour(doc, pos));

        throw new Error("Method not implemented.");
    }
}