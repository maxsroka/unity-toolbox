import { Position, Range } from "vscode";
import Script from "./script";
import Token from "./token";

/**
 * An abstraction of a C# method.
 */
export default class Method {
    readonly script: Script;
    readonly type: Token;
    readonly name: Token;

    constructor(script: Script, type: Token, name: Token) {
        this.script = script;
        this.type = type;
        this.name = name;
    }
}