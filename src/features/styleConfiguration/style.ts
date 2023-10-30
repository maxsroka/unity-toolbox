import { workspace } from "vscode";

const UNITY_TOOLBOX_CONFIG = "unityToolbox";
const BRACKETS_STYLE_CONFIG = "bracketsStyle";
const PRIVATE_ACCESS_MODIFIER_STYLE_CONFIG = "privateAccessModifier";

enum BracketsStyle {
    NewLine = "new line",
    SameLineWithSpace = "same line, with space",
    SameLineWithoutSpace = "same line, without space",
}

export function styleClass(snippet: string[]): string[] {
    return styleBrackets(snippet);
}

export function styleMethod(snippet: string[]): string[] {
    let result = [...snippet];
    stylePrivateAccessModifier(result);
    result = styleBrackets(result);

    return result;
}

/**
 * Applies the chosen bracket style to all opening brackets in a snippet.
 * The source snippet muse use the default style (opening bracket on new line).
 * @param snippet the source snippet.
 * @returns the source snippet with style applied.
 */
function styleBrackets(snippet: string[]): string[] {
    const style = workspace.getConfiguration(UNITY_TOOLBOX_CONFIG).get<BracketsStyle>(BRACKETS_STYLE_CONFIG);
    if (style === undefined) return [];
    if (style === BracketsStyle.NewLine) return snippet;

    let result = [];

    let skipNextLine = false;
    for (let line = 0; line < snippet.length; line++) {
        const definition = line + 1 < snippet.length && snippet[line + 1].trim() === "{";

        if (definition) {
            skipNextLine = true;

            const bracket = style === BracketsStyle.SameLineWithSpace ? " {" : "{";
            result.push(snippet[line] + bracket);
        } else if (skipNextLine) {
            skipNextLine = false;
            continue;
        } else {
            result.push(snippet[line]);
        }
    }

    return result;
}

/**
 * Applies the chosen private access modifier style to a snippet.
 * The source snippet muse use the default modifier style (no modifier) and the default bracket style (new line).
 * This modifies the provided array instead of returning a new one.
 * @param snippet the source snippet.
 */
function stylePrivateAccessModifier(snippet: string[]) {
    const style = workspace.getConfiguration(UNITY_TOOLBOX_CONFIG).get<boolean>(PRIVATE_ACCESS_MODIFIER_STYLE_CONFIG);
    if (style === undefined || !style) return;

    const bracket = snippet.findIndex(line => line.trim() === "{");
    const definition = bracket === 0 ? 0 : bracket - 1;
    snippet[definition] = "private " + snippet[definition];
}