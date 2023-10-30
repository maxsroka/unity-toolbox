import { CancellationToken, CodeLens, CodeLensProvider, Command, Event, ExtensionContext, Position, ProviderResult, Range, TextDocument, languages } from "vscode";
import Script from "../../helpers/script";
import UnityMessages from "../../helpers/unityMessages";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(languages.registerCodeLensProvider(
        { language: "csharp" },
        new UnityMessageCodeLensProvider()
    ));
}

class UnityMessageCodeLensProvider implements CodeLensProvider {
    provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const script = new Script(document.getText());
        const items = [];

        const classes = script.getClasses();
        const c = classes.find(c => c.isComponent(document.fileName));
        if (c === undefined) return;

        const methods = c.getMethods();
        for (const method of methods) {
            const range = document.getWordRangeAtPosition(method.name.range.start);
            if (range === undefined) return;

            const message = UnityMessages.get(method);
            if (message === null) continue;

            const cmd: Command = {
                command: "vscode.open",
                arguments: [UnityMessages.getDoc(method.name.text)],
                title: "$(symbol-method) Unity Message",
                tooltip: "This method is called by Unity"
            };

            const item = new CodeLens(range, cmd);
            items.push(item);
        }

        return items;
    }
}