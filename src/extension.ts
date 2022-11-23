import { commands, ExtensionContext, languages, window } from 'vscode';
import { UnityMessageCodeLensProvider, UsedInCodeLensProvider } from './codeLens';
import { UnityMessageSnippetsProvider, ScriptTemplatesSnippetsProvider } from "./snippets";
import UnityMessageHoverProvider from "./hover";
import Parser from './parser';
import searchInUnityDocumentation from './search';
import SceneParser from './sceneParser';

export const debug = window.createOutputChannel("Unity Toolbox");
export const parser = new Parser();
export const sceneParser = new SceneParser();

export function activate(ctx: ExtensionContext) {
    languages.registerCodeLensProvider({ language: "csharp" }, new UnityMessageCodeLensProvider());
    languages.registerCodeLensProvider({ language: "csharp" }, new UsedInCodeLensProvider());
    languages.registerCompletionItemProvider({ language: "csharp" }, new UnityMessageSnippetsProvider());
    languages.registerHoverProvider({ language: "csharp" }, new UnityMessageHoverProvider());
    languages.registerCompletionItemProvider({ language: "csharp" }, new ScriptTemplatesSnippetsProvider());
    commands.registerCommand("unityToolbox.searchInUnityDocumentation", searchInUnityDocumentation);
}