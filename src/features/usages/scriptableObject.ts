import { CancellationToken, CodeLens, CodeLensProvider, Command, Event, ExtensionContext, ProviderResult, Range, TextDocument, TextLine, languages } from "vscode";
import Script from "../../helpers/script";
import Assets from "../../helpers/assets";
import Usages from "../../helpers/usages";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(languages.registerCodeLensProvider(
        { language: "csharp", scheme: "file" },
        new ScriptableObjectUsageCodeLensProvider()
    ));
}

export class ScriptableObjectUsageCodeLensProvider implements CodeLensProvider {
    provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const items = [];

        const script = new Script(document.getText());
        const classes = script.getClasses();
        const scriptableObject = classes.find(c => c.isScriptableObject(document.fileName));
        if (scriptableObject === undefined) return;

        const file = Assets.readFile(document.uri.fsPath + ".meta");
        if (file === null) return;

        const guid = Assets.getGuid(file);
        if (guid === null) return;

        const range = scriptableObject.name.range;

        items.push(Usages.getCodeLens(guid, range, ".asset", "", { singular: "asset", plural: "assets" }));

        return items;
    }
}