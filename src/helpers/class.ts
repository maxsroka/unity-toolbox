import Script from "./script";
import Method from "./method";
import Token from "./token";
import Assets from "./assets";
import * as path from "path";

/**
 * An abstraction of a C# class.
 */
export default class Class {
    readonly script: Script;
    readonly name: Token;
    readonly parent: string | null;

    constructor(script: Script, name: Token, parent: string | null) {
        this.script = script;
        this.name = name;
        this.parent = parent;
    }

    /**
     * Determines if the class is a component (derives from MonoBehaviour). 
     * @param filePath path to the file the class is in.
     * @returns whether the class is a component.
     */
    isComponent(filePath: string): boolean {
        if (this.parent === null) return false;
        if (!this.isParentEqualFileName(filePath)) return false;

        return this.doesDeriveFrom(this.parent, "MonoBehaviour");
    }

    /**
    * Determines if the class derives from ScriptableObject. 
    * @param filePath path to the file the class is in.
    * @returns whether the class is a ScriptableObject.
    */
    isScriptableObject(filePath: string): boolean {
        if (this.parent === null) return false;
        if (!this.isParentEqualFileName(filePath)) return false;

        return this.doesDeriveFrom(this.parent, "ScriptableObject");
    }

    isParentEqualFileName(filePath: string): boolean {
        return path.parse(filePath).name === this.name.text;
    }

    /**
    * Recursively searches for parents to determine if the class derives from another class.
    * Note:
    * Only the first parent of each class is used.
    * That's because if a class derives from another class, it's always the first parent in C#. 
    * Deriving from multiple classes is not allowed in C#.
    * @param parent name of a class to start searching from.
    * @param from name of the class to search for.
    * @returns name of the last parent or null.
    */
    private doesDeriveFrom(parent: string, from: string): boolean {
        if (parent === from) return true;

        const grandparents = Assets.parents.get(parent);
        if (grandparents === undefined || grandparents.length === 0) return false;

        const grandparent = grandparents[0];
        return this.doesDeriveFrom(grandparent, from);
    }

    getMethods(): Method[] {
        const range = this.script.getBracketPair(this.name.range.end);
        if (range === null) return [];
        return this.script
            .searchMultiple(/([\p{L}_@]{1}[\p{L}0-9_]*)( +)([\p{L}_@]{1}[\p{L}0-9_]*)\(.*?\)/gu, range)
            .map(match => new Method(
                this.script,
                Token.fromMatch(match, 0),
                Token.fromMatch(match, 2)
            ));
    }
}