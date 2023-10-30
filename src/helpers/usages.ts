import { Range, CodeLens, Command } from "vscode";
import Assets from "./assets";

export default class Usages {
    static getCodeLens(guid: string, range: Range, extension: string, name: string, titleType: TitleType): CodeLens {
        const usages = this.getUsages(guid, extension);
        const command = this.getCommand(extension, name, usages, titleType);

        return new CodeLens(range, command);
    }

    private static getUsages(guid: string, extension: string): string[] {
        const usages = [];

        for (const path of Assets.all[extension]) {
            const references = Assets.references.get(path);
            if (references === undefined || !references.includes(guid)) continue;

            usages.push(path);
        }

        return usages;
    }

    private static getCommand(extension: string, name: string, usages: string[], titleType: TitleType): Command {
        return {
            command: "",
            title: this.formatTitle(name, usages.length, titleType),
            tooltip: this.formatTooltip(extension, usages)
        }
    }

    private static formatTitle(base: string, count: number, type: TitleType): string {
        let title = "";

        if (count === 0) {
            title = `0 ${base} ${type.plural}`;
        } else if (count === 1) {
            title = `1 ${base} ${type.singular}`;
        } else if (count < 10) {
            title = `${count} ${base} ${type.plural}`;
        } else {
            title = `9+ ${base} ${type.plural}`;
        }

        return title;
    }

    private static formatTooltip(extension: string, usages: string[]): string {
        let tooltip = "";

        for (const usage of usages) {
            tooltip += usage
                .slice(0, usage.length - extension.length)
                .slice(usage.indexOf("Assets\\"))
                + "\n";
        }

        return tooltip;
    }
}

type TitleType = {
    singular: string,
    plural: string
}