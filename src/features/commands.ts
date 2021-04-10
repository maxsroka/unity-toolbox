import { commands, Uri, ExtensionContext, Disposable } from 'vscode'

export function registerCommands(context: ExtensionContext) {
    context.subscriptions.push(getOpenDocumentationCommand());
}

function getOpenDocumentationCommand(): Disposable {
    return commands.registerCommand('unityToolbox.openDocumentation', (arg: string) => {
        let url: string;

        if (arg)
            url = `https://docs.unity3d.com/ScriptReference/MonoBehaviour.${arg}.html`;
        else
            url = "https://docs.unity3d.com/Manual/index.html";

        commands.executeCommand('vscode.open', Uri.parse(url));
    });
}