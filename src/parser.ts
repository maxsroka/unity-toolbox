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
    findBehaviour(lines: string[]): Position | undefined {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!this.findBehaviourExp.test(line)) continue;

            return new Position(i + 1, 0);
        }
    }

    findClosingBracket(lines: string[], openingBracket: Position): Position | undefined {
        let count = 0;
        for (let i = openingBracket.line; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes("{")) {
                count += 1;
            }

            const charIndex = line.indexOf("}");
            if (charIndex !== -1) {
                count -= 1;

                if (count === 0) {
                    return new Position(i, charIndex);
                }
            }
        }
    }

    findOpeningBracket(lines: string[], startPos: Position): Position | undefined {
        for (let i = startPos.line; i < lines.length; i++) {
            const line = lines[i];
            const charIndex = line.indexOf("{");

            if (charIndex !== -1) {
                return new Position(i, charIndex);
            }
        }
    }

    findAllMethodsNames(lines: string[]): string[] {
        const names = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (!this.isInBehaviour(lines, new Position(i, 0))) continue;

            const methodName = this.findMethodsName(line);

            if (methodName !== undefined) {
                names.push(methodName);
            }
        }

        return names;
    }

    isInBehaviour(lines: string[], pos: Position): boolean {
        const behaviourPos = this.findBehaviour(lines);
        if (behaviourPos === undefined) return false;
        const openingPos = this.findOpeningBracket(lines, behaviourPos);
        if (openingPos === undefined) return false;
        const closingPos = this.findClosingBracket(lines, openingPos);
        if (closingPos === undefined) return false;

        return pos.isAfter(openingPos) && pos.isBeforeOrEqual(closingPos) && this.isTopLevel(lines, openingPos, pos);
    }

    isTopLevel(lines: string[], openingPos: Position, pos: Position): boolean {
        let count = 0;
        for (let i = openingPos.line; i < lines.length; i++) {
            const line = lines[i];

            if (i === pos.line) {
                return count === 1;
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
}