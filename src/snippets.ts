import { CancellationToken, CompletionItemKind, SnippetString, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument, CompletionItemTag, workspace } from "vscode";
import { parser } from "./extension"
import * as messages from "./unity-messages.json";
import * as templates from "./script-templates.json";

export class UnityMessageSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, ctx: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const lines = doc.getText().split("\n");

        const requiredClass = workspace.getConfiguration("unityToolbox").get("codeSnippets.requiredClass");
        const baseClass = parser.getBaseClass(lines, pos.line);

        if (baseClass === undefined) return;

        if (requiredClass === "any derived class" && baseClass === "") return;

        if (requiredClass === "MonoBehaviour or NetworkBehaviour" && baseClass !== "MonoBehaviour" && baseClass !== "NetworkBehaviour") return;

        const items = [];
        const existingMethods = parser.findAllMethodsNames(lines);

        for (const msg of messages) {
            if (existingMethods.includes(msg.name)) continue;

            const item = new CompletionItem(msg.name);
            item.kind = CompletionItemKind.Method;
            item.detail = `${msg.name} (Unity Message)`;
            item.documentation = msg.description;

            let snippet = applyBracketsStyle(msg.body, 0).join("\n");
            snippet = applyModifiers(snippet);
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

function applyBracketsStyle(body: string[], definitionLine: number): string[] {
    let snippet: string[];
    const bracketsStyle = workspace.getConfiguration("unityToolbox").get("codeSnippets.bracketsStyle");

    if (bracketsStyle === BracketsStyle.NewLine) {
        snippet = body;
    } else {
        snippet = [];
        const bracket = bracketsStyle === BracketsStyle.SameLineWithSpace ? " {" : "{";

        for (let i = 0; i < body.length; i++) {
            if (i === definitionLine) {
                snippet[i] = body[i] + bracket;
                continue;
            } else if (i === definitionLine + 1) {
                continue;
            } else {
                snippet.push(body[i]);
            }
        }
    }

    return snippet;
}

function applyModifiers(snippet: string): string {
    const modifiers = workspace.getConfiguration("unityToolbox").get("codeSnippets.methodModifiers");
    return modifiers + snippet;
}

export class ScriptTemplatesSnippetsProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
        const items = [];

        for (const template of templates) {
            const item = new CompletionItem(template.name);
            item.kind = CompletionItemKind.Class;
            item.detail = `${template.name} (Script Template)`;
            item.documentation = template.description;

            const classLine = parser.findClass(template.body);
            if (classLine === undefined) return;

            const snippet = applyBracketsStyle(template.body, classLine).join("\n");
            item.insertText = new SnippetString(snippet);

            items.push(item);
        }

        return items;
    }
}
