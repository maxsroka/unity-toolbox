import { Position, Range } from "vscode";
import File from "./file";
import Class from "./class";
import Token from "./token";

/**
 * An abstraction of a C# file.
 */
export default class Script extends File {
    constructor(text: string) {
        super(text);
    }

    getClasses(): Class[] {
        return this.searchMultiple(/(class)( +)([\p{L}_@]{1}[\p{L}0-9_]*)([\p{L}0-9_<> ,]* *)?(: *[\p{L}0-9_]*)?/gu).map(match => {
            let parent = null;

            if (match.content[4] !== undefined) {
                parent = match.content[4].substring(1).trim();

                if (parent === "") {
                    parent = null;
                }
            }

            const result = new Class(
                this,
                Token.fromMatch(match, 2),
                parent
            );

            return result;
        });
    }

    getOpeningBracket(start: Position): Position | null {
        const match = this.searchSingle(/{/g, new Range(start, this.end));
        if (match === null) return null

        return match.position;
    }

    getClosingBracket(start: Position): Position | null {
        const matches = this.searchMultiple(/({|})/g, new Range(start, this.end));

        let count = 0;
        for (const match of matches) {
            if (match.content[0] === "{") {
                count += 1;
            }

            if (match.content[0] === "}") {
                count -= 1;

                if (count === 0) {
                    return match.position;
                }
            }
        }

        return null;
    }

    getBracketPair(start: Position): Range | null {
        const opening = this.getOpeningBracket(start);
        if (opening === null) return null;
        const closing = this.getClosingBracket(opening);
        if (closing === null) return null;

        return new Range(opening, closing);
    }
}