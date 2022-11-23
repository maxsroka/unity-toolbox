import * as fs from "fs";
import { workspace } from "vscode";
import * as path from "path";

export default class AssetParser {
    scripts: string[] = []
    scenes: string[] = []
    prefabs: string[] = []
    guidExp = new RegExp(/guid: (.*)/);

    refresh() {
        this.scripts = [];
        this.scenes = [];
        this.prefabs = [];

        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined) return;
        const assets = path.join(workspaceFolders[0].uri.fsPath, "Assets");

        const files = this.getFilesInDir(assets);

        for (const file of files) {
            if (file.endsWith(".unity")) {
                this.scenes.push(file);
            } else if (file.endsWith(".cs.meta")) {
                this.scripts.push(file);
            } else if (file.endsWith(".prefab")) {
                this.prefabs.push(file);
            }
        }
    }

    findReferences(guid: string, files: string[]): string[] {
        const result = [];

        for (const file of files) {
            const content = fs.readFileSync(file, "utf-8");

            if (content.includes(guid)) {
                result.push(file);
            }
        }

        return result;
    }

    getGuid(filePath: string): string | undefined {
        const metaPath = this.scripts.find((val) => val === filePath + ".meta");
        if (metaPath === undefined) return undefined;

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