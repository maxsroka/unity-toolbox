import * as fs from "fs";
import { workspace } from "vscode";
import * as path from "path";

export default class SceneParser {
    constructor() {
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined) return;
        const assets = path.join(workspaceFolders[0].uri.fsPath, "Assets");

        let files = this.getFilesInDir(assets);

        for (let i = 0; i < files.length; i++) {
            const el = files[i];
            console.log(el);
        }
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