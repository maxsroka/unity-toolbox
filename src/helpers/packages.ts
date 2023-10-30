import { ExtensionContext, Uri, workspace } from "vscode";
import Logger from "./logger";

type PackagesJSON = {
    dependencies: {}
}

/**
 * Static helper for reading installed packages.
 */
export default class Packages {
    private static all = new Set<string>();

    static initialize(context: ExtensionContext) {
        const folders = workspace.workspaceFolders;
        if (folders === undefined || folders.length === 0) return;

        const path = Uri.joinPath(folders[0].uri, "Packages\\manifest.json");
        this.update(path);

        const watcher = workspace.createFileSystemWatcher(path.fsPath);
        watcher.onDidChange(uri => this.update(uri));
        context.subscriptions.push(watcher);
    }

    private static update(path: Uri) {
        workspace.fs.readFile(path).then(data => {
            const content = Buffer.from(data).toString("utf-8");

            try {
                const json = JSON.parse(content) as PackagesJSON;

                this.all.clear();
                for (const dependency in json.dependencies) {
                    this.all.add(dependency);
                }
            } catch (error) {
                Logger.warn("couldn't update packages: " + error);
            }
        });
    }

    static have(name: string): boolean {
        return this.all.has(name);
    }
}
