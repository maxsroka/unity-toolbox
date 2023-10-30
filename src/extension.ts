import { ExtensionContext } from "vscode";
import * as fileTemplateInsert from "./features/fileTemplates/insert";
import * as fileTemplateAutocomplete from "./features/fileTemplates/autocomplete";
import * as unitySearch from "./features/unitySearch/search";
import * as unityMessageAutocomplete from "./features/unityMessages/autocomplete";
import * as unityMessageHover from "./features/unityMessages/hover";
import * as unityMessageCodeLens from "./features/unityMessages/codeLens";
import UnityMessages from "./helpers/unityMessages";
import * as componentUsages from "./features/usages/component";
import * as scriptableObjectUsages from "./features/usages/scriptableObject";
import Assets from "./helpers/assets";
import Packages from "./helpers/packages";
import Logger from "./helpers/logger";

export function activate(context: ExtensionContext) {
	console.log('Unity Toolbox is now active!');

	Logger.initialize(context);
	Packages.initialize(context);

	fileTemplateAutocomplete.initialize(context);
	fileTemplateInsert.initialize(context);

	unitySearch.initialize(context);

	UnityMessages.initialize();
	unityMessageAutocomplete.initialize(context);
	unityMessageHover.initialize(context);
	unityMessageCodeLens.initialize(context);

	Assets.initialize(context);
	componentUsages.initialize(context);
	scriptableObjectUsages.initialize(context);

	// context is returned to be used in tests
	return context;
}

export function deactivate() { }