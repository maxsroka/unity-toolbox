import { QuickPickOptions, SnippetString, window, workspace, commands, ExtensionContext, QuickPickItem, QuickPickItemKind } from "vscode";
import * as templates from "./fileTemplates.json";
import * as style from "../styleConfiguration/style"
import Packages from "../../helpers/packages";

const COMMAND_ID: string = "unityToolbox.insertFileTemplate";
const QUICK_PICK_OPTIONS: QuickPickOptions = {
    placeHolder: "Select a file template"
};
const UNITY_TOOLBOX_FILE_TEMPLATES_CONFIG = "unityToolbox.fileTemplates";
const AUTOMATIC_MENU_CONFIG = "automaticMenu";

export function initialize(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand(COMMAND_ID, insertFileTemplate));
    context.subscriptions.push(workspace.onDidOpenTextDocument((document) => {
        if (!workspace.getConfiguration(UNITY_TOOLBOX_FILE_TEMPLATES_CONFIG).get<boolean>(AUTOMATIC_MENU_CONFIG)) return;

        if (document.languageId === "csharp" && document.getText() === "") {
            commands.executeCommand(COMMAND_ID);
        }
    }));
}

function insertFileTemplate() {
    const items: QuickPickItem[] = [];
    let category = "";

    for (const template of templates) {
        if (template.package !== undefined && !Packages.have(template.package)) continue;

        if (template.category !== category) {
            category = template.category;

            items.push({
                label: template.category,
                kind: QuickPickItemKind.Separator
            });
        }

        items.push({
            label: template.name
        });
    }

    window.showQuickPick(items, QUICK_PICK_OPTIONS).then(pick => {
        if (pick === undefined) return;

        const editor = window.activeTextEditor
        if (editor === undefined) return;

        const template = templates.find(template => template.name === pick.label)
        if (template === undefined) return;

        const snippet = new SnippetString(style.styleClass(template.body).join("\n"));
        editor.insertSnippet(snippet);
    });
}