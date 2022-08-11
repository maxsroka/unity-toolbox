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

    getExistingMethodsNames(doc: TextDocument): string[] {
        const lines = doc.getText().split("\n");
        const names = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (!this.isInBehaviour(doc, new Position(i, 0))) continue;

            const methodName = this.findMethodsName(line);

            if (methodName !== undefined) {
                names.push(methodName);
            }
        }

        return names;
    }

    isInBehaviour(doc: TextDocument, pos: Position): boolean {
        const text = doc.getText();
        const lines = text.split("\n");

        const behaviourPos = this.findBehaviour(doc);
        if (behaviourPos === undefined) return false;
        const openingPos = this.findOpeningBracket(doc, behaviourPos);
        if (openingPos === undefined) return false;
        const closingPos = this.findClosingBracket(doc, openingPos);
        if (closingPos === undefined) return false;

        return pos.isAfter(openingPos) && pos.isBeforeOrEqual(closingPos) && this.isTopLevel(doc, openingPos, pos);
    }

    isTopLevel(doc: TextDocument, openingPos: Position, pos: Position): boolean {
        const lines = doc.getText().split("\n");

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

    findClosingBracket(doc: TextDocument, openingPos: Position): Position | undefined {
        const lines = doc.getText().split("\n");

        let count = 1;
        for (let i = openingPos.line + 1; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes("{")) {
                count += 1;
            }

            const char = line.indexOf("}");
            if (char !== -1) {
                count -= 1;

                if (count === 0) {
                    return new Position(i, char);
                }
            }
        }
    }

    findOpeningBracket(doc: TextDocument, behaviourPos: Position): Position | undefined {
        const lines = doc.getText().split("\n");

        for (let i = behaviourPos.line; i < lines.length; i++) {
            const line = lines[i];
            const char = line.search(/{/);

            if (char !== -1) {
                return new Position(i, char);
            }
        }
    }

    findBehaviour(doc: TextDocument): Position | undefined {
        const text = doc.getText();
        const lines = text.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!this.findBehaviourExp.test(line)) continue;

            return new Position(i + 1, 0);
        }
    }
}