import { CancellationToken, ExtensionContext, Hover, HoverProvider, Position, ProviderResult, TextDocument, languages } from "vscode";
import Script from "../../helpers/script";
import UnityMessages from "../../helpers/unityMessages";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(languages.registerHoverProvider(
        { language: "csharp" },
        new UnityMessageHoverProvider()
    ));
}

class UnityMessageHoverProvider implements HoverProvider {
    provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        const script = new Script(document.getText());
        const classes = script.getClasses();
        const c = classes.find(c => c.isComponent(document.fileName));
        if (c === undefined) return;

        const methods = c.getMethods();
        for (const method of methods) {
            const range = document.getWordRangeAtPosition(method.name.range.start);
            if (!range?.contains(position)) continue;

            const message = UnityMessages.get(method);
            if (message === null) continue;

            return new Hover(`[**${message.name}**](${UnityMessages.getDoc(method.name.text)}) is called by Unity.`, range);
        }
    }
}