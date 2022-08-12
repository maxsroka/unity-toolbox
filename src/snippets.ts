import { CancellationToken, CompletionItemKind, SnippetString, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument, CompletionItemTag, workspace } from "vscode";
import { parser } from "./extension"
import * as messages from "./unity-messages.json";
import * as templates from "./script-templates.json";

export class UnityMessageSnippetsProvider implements CompletionItemProvider {
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

            let snippet = applyBracketsStyle(msg.body).join("\n");
            item.insertText = new SnippetString(snippet);

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

function applyBracketsStyle(body: string[]): string[] {
    let snippet: string[];
    const bracketsStyle = workspace.getConfiguration("unityToolbox").get("bracketsStyle");

    if (bracketsStyle === BracketsStyle.NewLine) {
        snippet = body;
    } else {
        snippet = [];
        const bracket = bracketsStyle === BracketsStyle.SameLineWithSpace ? " {" : "{";

        snippet[0] = body[0] + bracket;

        for (let i = 2; i < body.length; i++) {
            snippet.push(body[i]);
        }
    }

    return snippet;
}

export class ScriptTemplatesSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const lines = doc.getText().split("\n");
        const line = lines[pos.line];

        if (!parser.isLineOnBracketsLevel(lines, 0, pos.line)) return;

        const items = [];

        for (const template of templates) {
            const item = new CompletionItem(template.name);
            item.kind = CompletionItemKind.Class;
            item.detail = `${template.name} (Script Template)`;
            item.documentation = template.description;

            let snippet = applyBracketsStyle(template.body).join("\n");
            item.insertText = new SnippetString(snippet);

            items.push(item);
        }

        return items;
    }
}