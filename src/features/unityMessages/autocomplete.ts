import { CancellationToken, CompletionContext, CompletionItem, CompletionItemLabel, CompletionItemKind, CompletionItemProvider, CompletionList, ExtensionContext, MarkdownString, Position, ProviderResult, SnippetString, TextDocument, languages } from "vscode";
import Script from "../../helpers/script";
import * as style from "../styleConfiguration/style"
import UnityMessages from "../../helpers/unityMessages";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(languages.registerCompletionItemProvider(
        { language: "csharp" },
        new UnityMessageCompletionItemProvider()
    ));
}

class UnityMessageCompletionItemProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const script = new Script(document.getText());
        const classes = script.getClasses();

        const c = classes.find(c => script.getBracketPair(c.name.range.end)?.contains(position));
        if (c === undefined || !c.isComponent(document.fileName)) return;
        const methods = c.getMethods();

        const items = [];

        for (const [name, message] of UnityMessages.all) {
            if (methods.find(method => method.name.text === name && UnityMessages.have(method))) continue;

            const item = new CompletionItem({
                label: message.name,
                description: message.body[0]
            });
            item.kind = CompletionItemKind.Method;
            item.detail = `${message.name} (Unity Message)`;

            const snippet = style.styleMethod(message.body).join("\n");
            item.documentation = new MarkdownString("```csharp\n" + snippet.replace("$0", "") + "\n```");
            item.insertText = new SnippetString(snippet);

            items.push(item);
        }

        return items;
    }
}