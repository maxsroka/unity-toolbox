import { Position, Range } from "vscode"
import Match from "./match";

/**
 * An abstraction of a token (keyword).
 */
export default class Token {
    readonly range: Range;
    readonly text: string;

    constructor(range: Range, text: string) {
        this.range = range;
        this.text = text;
    }

    static fromMatch(match: Match, index: number): Token {
        let start = new Position(match.position.line, match.position.character);
        let end = new Position(match.position.line, match.position.character);

        for (let i = 0; i < index; i++) {
            start = start.translate(0, match.content[i].length);
        }

        for (let i = 0; i <= index; i++) {
            end = end.translate(0, match.content[i].length);
        }

        const range = new Range(start, end);
        const content = match.content[index];

        return new Token(range, content);
    }
}