import * as fs from "fs";
import { workspace } from "vscode";
import * as path from "path";

export default class SceneParser {
    scripts: string[] = []
    scenes: string[] = []
    guidExp = new RegExp(/guid: (.*)/);

    refresh() {
        this.scripts = [];
        this.scenes = [];

        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders === undefined) return;
        const assets = path.join(workspaceFolders[0].uri.fsPath, "Assets");

        const files = this.getFilesInDir(assets);

        for (const file of files) {
            if (file.endsWith(".unity")) {
                this.scenes.push(file);
            } else if (file.endsWith(".cs.meta")) {
                this.scripts.push(file);
            }
        }

        for (const script of this.scripts) {
            console.log("script: " + script);
        }

        for (const scene of this.scenes) {
            console.log("scene: " + scene);
        }
    }

    findSceneReferences(guid: string): string[] {
        const scenes = [];

        for (const scene of this.scenes) {
            const content = fs.readFileSync(scene, "utf-8");

            if (content.includes(guid)) {
                scenes.push(scene);
            }
        }

        return scenes;
    }

    getGuid(filePath: string): string | undefined {
        const metaPath = this.scripts.find((val) => val === filePath + ".meta");
        if (metaPath === undefined) return undefined;

        const meta = fs.readFileSync(metaPath, "utf-8");
        if (meta === undefined) return undefined;

        const matches = meta.match(this.guidExp);
        if (matches === null) return undefined;

        console.log(matches[1]);
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