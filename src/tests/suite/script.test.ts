import { Position, Range } from "vscode";
import Script from "../../helpers/script";
import * as assert from "assert";
import Class from "../../helpers/class";
import Token from "../../helpers/token";

suite("Script", () => {
    test("new", () => {
        new Script("");
        new Script("content");
    });

    suite("getClasses", () => {
        test("found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{

}
`);

            const classes = script.getClasses();

            assert.deepStrictEqual(classes, [
                new Class(script, new Token(new Range(new Position(3, 13), new Position(3, 20)), "MyClass"), "MonoBehaviour")
            ]);
        });

        test("not found", () => {
            const script = new Script(`
using UnityEngine;

public struct MyStruct
{

}
`);

            const classes = script.getClasses();

            assert.deepStrictEqual(classes, []);
        });

        test("multiple same line", () => {
            const script = new Script(`
class MyClass1 { } class MyClass2 { }
`);

            const classes = script.getClasses();

            assert.deepStrictEqual(classes, [
                new Class(script, new Token(new Range(new Position(1, 6), new Position(1, 14)), "MyClass1"), null),
                new Class(script, new Token(new Range(new Position(1, 25), new Position(1, 33)), "MyClass2"), null)
            ]);
        });

        test("multiple different lines", () => {
            const script = new Script(`
class MyClass1 {

}

class MyClass2 {

}
`);

            const classes = script.getClasses();

            assert.deepStrictEqual(classes, [
                new Class(script, new Token(new Range(new Position(1, 6), new Position(1, 14)), "MyClass1"), null),
                new Class(script, new Token(new Range(new Position(5, 6), new Position(5, 14)), "MyClass2"), null)
            ]);
        });

        suite("rules", () => {
            test("requires name", () => {
                const script = new Script("class  { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, []);
            });

            test("allows 1 character name", () => {
                const script = new Script("class A{ }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 7)), "A"), null)
                ]);
            });

            test("allows bracket behind name", () => {
                const script = new Script("class MyClass{ }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 13)), "MyClass"), null)
                ]);
            });

            test("allows parents", () => {
                const script = new Script("class MyClass : MonoBehaviour { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 13)), "MyClass"), "MonoBehaviour")
                ]);
            });

            test("allows generics", () => {
                const script = new Script("class MyClass<T, K> : MonoBehaviour where T : MonoBehaviour { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 13)), "MyClass"), "MonoBehaviour")
                ]);
            });

            test("allows additional keywords", () => {
                const script = new Script("public abstract class MyClass { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 22), new Position(0, 29)), "MyClass"), null)
                ]);
            });

            test("allows @ prefix", () => {
                const script = new Script("class @MyClass { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 14)), "@MyClass"), null)
                ]);
            });

            test("disallows @ postfix", () => {
                const script = new Script("class MyCl@ss { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 10)), "MyCl"), null)
                ]);
            });

            test("allows _ prefix", () => {
                const script = new Script("class _MyClass { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 14)), "_MyClass"), null)
                ]);
            });

            test("allows _ postfix", () => {
                const script = new Script("class My_Class { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 14)), "My_Class"), null)
                ]);
            });

            test("disallows number prefix", () => {
                const script = new Script("class 0MyClass { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, []);
            });

            test("allows number postfix", () => {
                const script = new Script("class MyClass1 { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 14)), "MyClass1"), null)
                ]);
            });

            test("disallows - prefix", () => {
                const script = new Script("class -MyClass { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, []);
            });

            test("disallows - postfix", () => {
                const script = new Script("class My-Class { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 8)), "My"), null)
                ]);
            });

            test("allows unicode", () => {
                const script = new Script("class KątDînerKočkaНомерσαλάτα { }");
                const classes = script.getClasses();

                assert.deepStrictEqual(classes, [
                    new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 30)), "KątDînerKočkaНомерσαλάτα"), null)
                ]);
            });
        });
    });

    suite("getOpeningBracket", () => {
        test("found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{

}
`);

            const bracket = script.getOpeningBracket(script.start);

            assert.deepStrictEqual(bracket, new Position(4, 0));
        });

        test("not found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
`);

            const bracket = script.getOpeningBracket(script.start);

            assert.deepStrictEqual(bracket, null);
        });

        test("line outside of range", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour {

}
`);

            const bracket = script.getOpeningBracket(new Position(4, 0));

            assert.deepStrictEqual(bracket, null);
        });

        test("character outside of range", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour { }
`);

            const bracket = script.getOpeningBracket(new Position(3, 38));

            assert.deepStrictEqual(bracket, null);
        });
    });

    suite("getClosingBracket", () => {
        test("found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{

}
`);

            const bracket = script.getClosingBracket(script.start);

            assert.deepStrictEqual(bracket, new Position(6, 0));
        });

        test("not found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
`);

            const bracket = script.getClosingBracket(script.start);

            assert.deepStrictEqual(bracket, null);
        });

        test("opening bracket line outside of range", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour {
    
}
`);

            const bracket = script.getClosingBracket(new Position(4, 0));

            assert.deepStrictEqual(bracket, null);
        });
    });

    suite("getBracketPair", () => {
        test("found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{

}
`);

            const brackets = script.getBracketPair(script.start);

            assert.deepStrictEqual(brackets, new Range(new Position(4, 0), new Position(6, 0)));
        });

        test("not found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
`);

            const brackets = script.getBracketPair(script.start);

            assert.deepStrictEqual(brackets, null);
        });
    });
});