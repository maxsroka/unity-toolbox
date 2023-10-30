import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, ExtensionContext, MarkdownString, Position, ProviderResult, SnippetString, TextDocument, TextEditorOptions, languages, window, workspace } from "vscode";
import * as templates from "./fileTemplates.json";
import * as style from "../styleConfiguration/style"
import * as path from "path";
import Packages from "../../helpers/packages";
import Script from "../../helpers/script";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(languages.registerCompletionItemProvider(
        { language: "csharp" },
        new FileTemplateCompletionItemProvider()
    ));
}

class FileTemplateCompletionItemProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const items = [];

        const script = new Script(document.getText());
        const classes = script.getClasses();
        const insideClass = classes.some(c => script.getBracketPair(c.name.range.end)?.contains(position));
        if (insideClass) return;

        for (const template of templates) {
            if (template.package !== undefined && !Packages.have(template.package)) continue;

            for (const prefix of template.prefix) {
                const item = new CompletionItem({
                    label: prefix,
                    description: `${template.category} File Template`,
                });
                item.kind = CompletionItemKind.Snippet;
                item.detail = `${template.name} (${template.category} File Template)`;

                const snippet = style.styleClass(template.body).join("\n");
                item.documentation = new MarkdownString(
                    "```csharp\n" +
                    getWithVariables(snippet, document)
                    + "\n```"
                );
                item.insertText = new SnippetString(snippet);

                items.push(item);
            }
        }

        return items;
    }
}

function getWithVariables(snippet: string, document: TextDocument): string {
    return snippet
        .replace(/\$[0-9]/g, "")
        .replace(/(\${[0-9]:)?throw new System\.NotImplementedException\(\);(})?/g, "throw new System.NotImplementedException();")
        .replace(/(\${[0-9]:)?\$WORKSPACE_NAME(})?/g, `${workspace.name}`)
        .replace(/(\${[0-9]:)?\$TM_FILENAME_BASE(})?/g, path.parse(document.fileName).name)
        .replace(/\${1\|struct,class\|}/g, "struct");
}