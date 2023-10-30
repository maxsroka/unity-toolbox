import * as assert from "assert";
import UnityMessages from "../../helpers/unityMessages";
import Method from "../../helpers/method";
import Script from "../../helpers/script";
import Token from "../../helpers/token";
import { Position, Range } from "vscode";

suite("UnityMessages", () => {
    test("initialize", () => {
        UnityMessages.initialize();

        assert.deepStrictEqual(UnityMessages.all.size > 0, true);
    });

    test("get", () => {
        UnityMessages.initialize();

        const script = new Script("void Start() { }");
        const method = new Method(script,
            new Token(new Range(new Position(0, 0), new Position(0, 4)), "void"),
            new Token(new Range(new Position(0, 5), new Position(0, 10)), "Start")
        );

        const message = UnityMessages.get(method);
        assert.notDeepStrictEqual(message, null);
    });

    test("have", () => {
        UnityMessages.initialize();

        const script = new Script("void Start() { }");
        const method = new Method(script,
            new Token(new Range(new Position(0, 0), new Position(0, 4)), "void"),
            new Token(new Range(new Position(0, 5), new Position(0, 10)), "Start")
        );

        const message = UnityMessages.have(method);
        assert.deepStrictEqual(message, true);
    });

    test("getDoc", () => {
        UnityMessages.initialize();

        const link = UnityMessages.getDoc("Update");
        assert.deepStrictEqual(link, "https://docs.unity3d.com/ScriptReference/MonoBehaviour.Update");
    });
});