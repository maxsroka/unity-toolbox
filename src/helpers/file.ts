import { Position, Range } from "vscode";
import Match from "./match";

/**
 * An abstraction of a file (.cs, .meta, .shader, ...).
 */
export default class File {
    readonly text: string;
    readonly lines: string[];
    readonly start: Position = new Position(0, 0);
    readonly end: Position;

    constructor(text: string) {
        this.text = text;
        this.lines = text.split("\n");
        this.end = new Position(this.lines.length - 1, this.lines[this.lines.length - 1].length)
    }

    /**
     * Performs a regular expression search in a given range (whole file by default) and returns the first match.
     * @param single returns only the first match if true.
     * @param expression what to search.
     * @param range where to search.
     * @returns an array of matches.
     */
    private search(
        single: boolean,
        expression: RegExp,
        range = new Range(this.start, this.end)
    ): Match[] {
        if (!expression.global) {
            throw new Error("search() requires a global regular expression.");
        }

        const results: Match[] = [];

        for (let line = range.start.line; line <= range.end.line; line++) {
            while (true) {
                const match = expression.exec(this.lines[line]);
                if (match === null) break;

                const position = new Position(line, match.index);
                if (!range.contains(position)) continue;

                results.push(new Match(position, match.slice(1)));

                if (single) {
                    return results;
                }
            }
        }

        return results;
    }

    /**
     * Performs a regular expression search in a given range (whole file by default) and returns the first match.
     * @param expression what to search.
     * @param range where to search.
     * @returns a match if found, otherwise null.
    */
    searchSingle(
        expression: RegExp,
        range = new Range(this.start, this.end)
    ): Match | null {
        const matches = this.search(true, expression, range);
        return matches.length === 0 ? null : matches[0];
    }

    /**
    * Performs a regular expression search in a given range (whole file by default) and returns all matches.
    * @param expression what to search.
    * @param range where to search.
    * @returns an array of matches.
    */
    searchMultiple(
        expression: RegExp,
        range = new Range(this.start, this.end)
    ): Match[] {
        return this.search(false, expression, range);
    }
}