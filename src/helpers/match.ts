import { Position } from "vscode";

/**
 * A type that contains results of a search.
 */
export default class Match {
    readonly position: Position;
    readonly content: string[];

    constructor(position: Position, content: string[]) {
        this.position = position;
        this.content = content;
    }
}