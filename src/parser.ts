import { TextDocument, Position } from "vscode";
import * as messages from "./unity-messages.json";

export default class Parser {
    private findBehaviourExp = new RegExp(/class.*: *(Mono|Network)Behaviour/);
    private findMethodNameExp = new RegExp(/void *(.*?) *\(.*\)/);
    private isUnityMessageExp: RegExp;

    constructor() {
        let methodsNames = "";

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

            methodsNames += msg.name;

            if (i < messages.length - 1) {
                methodsNames += "|";
            }
        }

        this.isUnityMessageExp = new RegExp("void *(" + methodsNames + ") *\\(.*\\)");
        // ^ needs double escape (\\) because a single one would get lost when adding strings
    }

    /**
     * Checks if there is a Unity message in the line.
     */
    hasUnityMessage(line: string): boolean {
        return this.isUnityMessageExp.test(line);
    }

    /**
     * Finds the name of a method. It must have the return type of `void`.
     */
    findMethodsName(line: string): string | undefined {
        const matches = line.match(this.findMethodNameExp);

        if (matches !== null) {
            return matches[1];
        }
    }

    /**
     * Finds the position of the first `MonoBehaviour` or `NetworkBehaviour` definition. The returned character is always zero.
     */
    findBehaviour(lines: string[]): number | undefined {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (this.findBehaviourExp.test(line)) {
                return i;
            }
        }
    }

    findClosingBracket(lines: string[], openingBracketLine: number): number | undefined {
        let count = 0;
        for (let i = openingBracketLine; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes("{")) {
                count += 1;
            }

            if (line.includes("}")) {
                count -= 1;

                if (count === 0) {
                    return i;
                }
            }
        }
    }

    findOpeningBracket(lines: string[], startLine: number): number | undefined {
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes("{")) {
                return i;
            }
        }
    }

    findAllMethodsNames(lines: string[]): string[] {
        const names = [];

        for (const line of lines) {
            const name = this.findMethodsName(line);

            if (name !== undefined) {
                names.push(name);
            }
        }

        return names;
    }

    /**
     * Returns if the line is on the top level inside curly brackets pair.
     */
    isLineTopLevel(lines: string[], openingBracketLineIndex: number, lineIndex: number): boolean {
        let count = 0;
        for (let i = openingBracketLineIndex; i < lines.length; i++) {
            const line = lines[i];

            if (i === lineIndex && count === 1 && !line.includes("}")) {
                return true;
            }

            if (line.includes("{")) {
                count += 1;
            }

            if (line.includes("}")) {
                count -= 1;
            }
        }

        return false;
    }

    isInBehaviour(lines: string[], line: number): boolean {
        const behaviourLine = this.findBehaviour(lines);
        if (behaviourLine === undefined) return false;
        const openingLine = this.findOpeningBracket(lines, behaviourLine);
        if (openingLine === undefined) return false;
        const closingLine = this.findClosingBracket(lines, openingLine);
        if (closingLine === undefined) return false;

        return line > openingLine && line < closingLine && this.isLineTopLevel(lines, openingLine, line);
    }
}