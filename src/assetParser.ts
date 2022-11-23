import * as fs from "fs";
import { RelativePattern, TextDocumentChangeReason, Uri, workspace, WorkspaceEdit } from "vscode";
import * as path from "path";

export default class AssetParser {
    scripts = new Set<string>();
    scenes = new Set<string>();
    prefabs = new Set<string>();
    guidExp = new RegExp(/guid: (.*)/);

    constructor() {
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined) return;
        const assets = path.join(workspaceFolders[0].uri.fsPath, "Assets");

        const files = this.getFilesInDir(assets);

        for (const file of files) {
            this.tryAdd(file);
        }

        const watcher = workspace.createFileSystemWatcher("**/*.{unity,cs.meta,prefab}");
        watcher.onDidCreate((uri) => {
            console.log("create");
            this.tryAdd(uri.fsPath);
            console.log(this.scripts.size);
        });

        watcher.onDidDelete((uri) => {
            console.log("delete");
            this.tryRemove(uri.fsPath);
            console.log(this.scripts.size);
        })
    }

    tryAdd(file: string) {
        if (this.tryAddParticular(file, ".cs.meta", this.scripts)) return;
        if (this.tryAddParticular(file, ".prefab", this.prefabs)) return;
        if (this.tryAddParticular(file, ".unity", this.scenes)) return;
    }

    tryAddParticular(file: string, extension: string, files: Set<string>): boolean {
        if (file.endsWith(extension)) {
            files.add(file);
            return true;
        }

        return false;
    }

    tryRemove(file: string) {
        if (this.tryRemoveParticular(file, ".cs.meta", this.scripts)) return;
        if (this.tryRemoveParticular(file, ".prefab", this.prefabs)) return;
        if (this.tryRemoveParticular(file, ".unity", this.scenes)) return;
    }

    tryRemoveParticular(file: string, extension: string, files: Set<string>): boolean {
        if (file.endsWith(extension)) {
            return files.delete(file);
        }

        return false;
    }

    findReferences(guid: string, files: Set<string>): string[] {
        const result = [];

        for (const file of files.values()) {
            const content = fs.readFileSync(file, "utf-8");

            if (content.includes(guid)) {
                result.push(file);
            }
        }

        return result;
    }

    getGuid(filePath: string): string | undefined {
        const metaPath = filePath + ".meta";
        if (!this.scripts.has(metaPath)) return undefined;

        const meta = fs.readFileSync(metaPath, "utf-8");
        if (meta === undefined) return undefined;

        const matches = meta.match(this.guidExp);
        if (matches === null) return undefined;

        return matches[1];
    }

    getFilesInDir(dir: string): string[] {
        const files: string[] = [];

        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);

            if (fs.lstatSync(filePath).isDirectory()) {
                files.push(...this.getFilesInDir(filePath));
            } else {
                files.push(filePath);
            }
        });

        return files;
    }
}