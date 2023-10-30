import { Position, Range } from "vscode";
import Method from "../../helpers/method";
import Script from "../../helpers/script";
import Token from "../../helpers/token";

suite("Method", () => {
    test("new", () => {
        const script = new Script("void Method() { }");

        new Method(script,
            new Token(new Range(new Position(0, 0), new Position(0, 4)), "void"),
            new Token(new Range(new Position(0, 5), new Position(0, 11)), "Method")
        );
    });
})