import { TextDocument, Position, LinkedEditingRanges } from "vscode";
import { debug } from "./extension";

export function isInBehaviour(doc: TextDocument, pos: Position): boolean {
    const text = doc.getText();
    const lines = text.split("\n");

    const behaviourPos = findBehaviour(doc);
    if (behaviourPos === undefined) return false;
    const openingPos = findOpeningBracket(doc, behaviourPos);
    if (openingPos === undefined) return false;
    const closingPos = findClosingBracket(doc, openingPos);
    if (closingPos === undefined) return false;

    return pos.isAfter(openingPos) && pos.isBeforeOrEqual(closingPos) && isTopLevel(doc, openingPos, pos);
}

function isTopLevel(doc: TextDocument, openingPos: Position, pos: Position): boolean {
    const lines = doc.getText().split("\n");

    let count = 0;
    for (let i = openingPos.line; i < lines.length; i++) {
        const line = lines[i];

        if (i === pos.line) {
            return count === 1;
        }

        if (line.includes("{")) {
            count += 1;
        } else if (line.includes("}")) {
            count -= 1;
        }
    }

    return false;
}

function findClosingBracket(doc: TextDocument, openingPos: Position): Position | undefined {
    const lines = doc.getText().split("\n");

    let count = 1;
    for (let i = openingPos.line + 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes("{")) {
            count += 1;
        } else {
            const char = line.indexOf("}");

            if (char !== -1) {
                count -= 1;

                if (count === 0) {
                    return new Position(i, char);
                }
            }
        }
    }
}

function findOpeningBracket(doc: TextDocument, behaviourPos: Position): Position | undefined {
    const lines = doc.getText().split("\n");

    for (let i = behaviourPos.line; i < lines.length; i++) {
        const line = lines[i];
        const char = line.search(/{/);

        if (char !== -1) {
            return new Position(i, char);
        }
    }
}

const findBehaviourExp = new RegExp(/class.*: *(Mono|Network)Behaviour/);

export function findBehaviour(doc: TextDocument): Position | undefined {
    const text = doc.getText();
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!findBehaviourExp.test(line)) continue;

        return new Position(i + 1, 0);
    }
}