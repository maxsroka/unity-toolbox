import { ExtensionContext, window, workspace } from "vscode";
import * as fs from "fs";
import * as path from "path";
import Logger from "./logger";
import Script from "./script";

const ALL_EXTENSIONS = [
    ".prefab",
    ".unity",
    ".cs",
    ".asset"
]

const REFERENCES_EXTENSIONS = [
    ".prefab",
    ".unity",
    ".asset"
]

const PARENTS_EXTENSION = ".cs";

type AssetSet = {
    [index: string]: Set<string>
}

/**
 * Static helper for reading assets.
 */
export default class Assets {
    static all: AssetSet = {};
    static references = new Map<string, string[]>();
    static parents = new Map<string, string[]>();

    static initialize(context: ExtensionContext) {
        // data
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0) return;

        const workspaceFolder = workspaceFolders[0];
        const assetsFolder = path.join(workspaceFolder.uri.fsPath, "Assets");

        for (const extension of ALL_EXTENSIONS) {
            this.all[extension] = new Set<string>();
        }

        const assets = this.getFilesInDirectory(assetsFolder);
        for (const asset of assets) {
            this.tryAdd(asset);
        }

        // watcher
        const watcher = workspace.createFileSystemWatcher("**/*.{unity,prefab,cs,asset}");

        watcher.onDidCreate(uri => this.tryAdd(uri.fsPath));
        watcher.onDidChange(uri => this.tryAdd(uri.fsPath));
        watcher.onDidDelete(uri => this.tryDelete(uri.fsPath));

        context.subscriptions.push(watcher);
    }

    private static tryAdd(asset: string) {
        const extension = path.extname(asset);
        if (!ALL_EXTENSIONS.includes(extension)) return null;

        const file = this.readFile(asset);
        if (file === null) return;

        this.all[extension].add(asset);

        if (REFERENCES_EXTENSIONS.includes(extension)) {
            this.references.set(asset, this.getGuids(file));
        }

        if (extension === PARENTS_EXTENSION) {
            this.parents.set(path.parse(asset).name, this.getParents(file));
        }
    }

    private static tryDelete(asset: string) {
        const extension = path.extname(asset);
        if (!ALL_EXTENSIONS.includes(extension)) return null;

        this.all[extension].delete(asset);

        if (REFERENCES_EXTENSIONS.includes(extension)) {
            this.references.delete(asset);
        }

        if (extension === PARENTS_EXTENSION) {
            this.parents.delete(path.parse(asset).name);
        }
    }

    /**
    * Reads a file and returns its content.
    * @param path path to the file.
    * @returns the content or null.
    */
    static readFile(path: string): string | null {
        let file;

        try {
            file = fs.readFileSync(path, "utf-8");
        } catch (error) {
            Logger.warn("couldn't read file: " + error);
            return null;
        }

        return file;
    }

    /**
    * Searches a file for all parents of all classes in that file.
    * @param file content of the file.
    * @returns names of all parents.
    */
    private static getParents(file: string): string[] {
        const parents = [];

        const script = new Script(file);
        const classes = script.getClasses();
        for (const c of classes) {
            if (c.parent === null) continue;

            parents.push(c.parent);
        }

        return parents;
    }

    /**
     * Searches a file for a guid.
     * @param file content of the file.
     * @returns guid if found, null if not.
     */
    static getGuid(file: string): string | null {
        const match = file.match(/guid: ([a-zA-Z0-9]+)/);
        if (match === null) return null;

        return match[1];
    }

    /**
     * Searches a file for all guids.
     * @param file content of the file.
     * @returns array of guids if found any, empty array if not.
     */
    static getGuids(file: string): string[] {
        const guids: string[] = [];

        const matches = file.matchAll(/guid: ([a-zA-Z0-9]+)/g);
        for (const match of matches) {
            guids.push(match[1]);
        }

        return guids;
    }

    /**
     * Searches a directory recursively and returns file paths of all found files.
     * @param directory path to a directory.
     * @returns array of file paths.
     */
    private static getFilesInDirectory(directory: string): string[] {
        const files: string[] = [];

        try {
            fs.readdirSync(directory).forEach(file => {
                const child = path.join(directory, file);

                if (fs.lstatSync(child).isDirectory()) {
                    files.push(...this.getFilesInDirectory(child));
                } else {
                    files.push(child);
                }
            });
        } catch (error) {
            Logger.warn("couldn't get files in directory: " + error);
            return [];
        }

        return files;
    }
}