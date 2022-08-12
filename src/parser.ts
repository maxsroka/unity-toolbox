import * as messages from "./unity-messages.json";

export default class Parser {
    private findBehaviourExp = new RegExp(/class.*: *(Mono|Network)Behaviour/);
    private findMethodNameExp = new RegExp(/void *(.*?) *\(.*\)/);
    private hasUnityMessageExp: RegExp;

    constructor() {
        let methodsNames = "";

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

            methodsNames += msg.name;

            if (i < messages.length - 1) {
                methodsNames += "|";
            }
        }

        this.hasUnityMessageExp = new RegExp("void *(" + methodsNames + ") *\\(.*\\)");
        // ^ needs double escape (\\) because a single one would get lost when adding strings
    }

    /**
     * Checks if there is a Unity message in a line.
     */
    hasUnityMessage(line: string): boolean {
        return this.hasUnityMessageExp.test(line);
    }

    /**
     * Finds the name of a method in a line. The method must have the return type of `void`.
     */
    findMethodsName(line: string): string | undefined {
        const matches = line.match(this.findMethodNameExp);

        if (matches !== null) {
            return matches[1];
        }
    }

    /**
     * Finds the first line with `MonoBehaviour` or `NetworkBehaviour` definition.
     */
    findBehaviour(lines: string[]): number | undefined {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (this.findBehaviourExp.test(line)) {
                return i;
            }
        }
    }

    /**
     * Finds the line with the closing curly bracket.
     */
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

    /**
     * Finds the first line with an opening curly bracket.
     */
    findOpeningBracket(lines: string[], startLine: number): number | undefined {
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes("{")) {
                return i;
            }
        }
    }

    /**
     * Finds the names of all methods.
     */
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
     * Returns if a line is on the top level inside curly brackets pair.
     */
    isLineOnBracketsLevel(lines: string[], openingBracketLine: number, lineIndex: number): boolean {
        let count = 0;
        for (let i = openingBracketLine; i < lines.length; i++) {
            const line = lines[i];

            if (i === lineIndex && count === 1 && !line.includes("{") && !line.includes("}")) {
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

    /**
     * Checks if a line is inside a `MonoBehaviour` or `NetworkBehaviour`. 
     */
    isInBehaviour(lines: string[], line: number): boolean {
        const behaviourLine = this.findBehaviour(lines);
        if (behaviourLine === undefined) return false;
        const openingLine = this.findOpeningBracket(lines, behaviourLine);
        if (openingLine === undefined) return false;
        const closingLine = this.findClosingBracket(lines, openingLine);
        if (closingLine === undefined) return false;

        return line > openingLine && line < closingLine && this.isLineOnBracketsLevel(lines, openingLine, line);
    }
}