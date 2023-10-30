import { Position, Range } from "vscode";
import Token from "../../helpers/token";
import Script from "../../helpers/script";
import * as assert from "assert";

suite("Token", () => {
    test("new", () => {
        new Token(new Range(new Position(0, 0), new Position(0, 10)), "Test");
    });

    suite("fromMatch", () => {
        test("found", () => {
            const script = new Script("class MyClass");
            const match = script.searchSingle(/(class)( +)(.*)/g);
            if (match === null) assert.fail();

            const keyword = Token.fromMatch(match, 0);
            const spaces = Token.fromMatch(match, 1);
            const name = Token.fromMatch(match, 2);

            assert.deepStrictEqual(keyword, new Token(new Range(new Position(0, 0), new Position(0, 5)), "class"));
            assert.deepStrictEqual(spaces, new Token(new Range(new Position(0, 5), new Position(0, 6)), " "));
            assert.deepStrictEqual(name, new Token(new Range(new Position(0, 6), new Position(0, 13)), "MyClass"));
        });

        test("not found", () => {
            const script = new Script("struct MyStruct");
            const match = script.searchSingle(/(class)( +)(.*)/g);

            assert.deepStrictEqual(match, null);
        });

        test("optional group missing", () => {
            const script = new Script("classMyClass");
            const match = script.searchSingle(/(class)( ?)(.*)/g);
            if (match === null) assert.fail();

            const keyword = Token.fromMatch(match, 0);
            const spaces = Token.fromMatch(match, 1);
            const name = Token.fromMatch(match, 2);

            assert.deepStrictEqual(keyword, new Token(new Range(new Position(0, 0), new Position(0, 5)), "class"));
            assert.deepStrictEqual(spaces, new Token(new Range(new Position(0, 5), new Position(0, 5)), ""));
            assert.deepStrictEqual(name, new Token(new Range(new Position(0, 5), new Position(0, 12)), "MyClass"));
        });
    });
});