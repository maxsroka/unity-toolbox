import { Position, Range } from "vscode";
import Class from "../../helpers/class";
import Script from "../../helpers/script";
import Token from "../../helpers/token";
import * as assert from "assert";
import Method from "../../helpers/method";

suite("Class", () => {
    test("new", () => {
        const script = new Script("class MyClass { }");

        new Class(script, new Token(new Range(new Position(0, 6), new Position(0, 13)), "MyClass"), null);
    });

    suite("isComponent", () => {
        test("true", () => {
            const script = new Script("class MyClass : MonoBehaviour { }");
            const classes = script.getClasses();
            const isComponent = classes[0].isComponent("MyClass.cs");

            assert.deepStrictEqual(isComponent, true);
        });

        test("no parent", () => {
            const script = new Script("class MyClass { }");
            const classes = script.getClasses();
            const isComponent = classes[0].isComponent("MyClass.cs");

            assert.deepStrictEqual(isComponent, false);
        });

        test("wrong parent", () => {
            const script = new Script("class MyClass : IInteractable { }");
            const classes = script.getClasses();
            const isComponent = classes[0].isComponent("MyClass.cs");

            assert.deepStrictEqual(isComponent, false);
        });

        test("wrong file name", () => {
            const script = new Script("class MyClass : MonoBehaviour { }");
            const classes = script.getClasses();
            const isComponent = classes[0].isComponent("NotMyClass.cs");

            assert.deepStrictEqual(isComponent, false);
        });
    });

    suite("isScriptableObject", () => {
        test("true", () => {
            const script = new Script("class MyClass : ScriptableObject { }");
            const classes = script.getClasses();
            const isScriptableObject = classes[0].isScriptableObject("MyClass.cs");

            assert.deepStrictEqual(isScriptableObject, true);
        });

        test("no parent", () => {
            const script = new Script("class MyClass { }");
            const classes = script.getClasses();
            const isScriptableObject = classes[0].isScriptableObject("MyClass.cs");

            assert.deepStrictEqual(isScriptableObject, false);
        });

        test("wrong parent", () => {
            const script = new Script("class MyClass : IInteractable { }");
            const classes = script.getClasses();
            const isScriptableObject = classes[0].isScriptableObject("MyClass.cs");

            assert.deepStrictEqual(isScriptableObject, false);
        });

        test("wrong file name", () => {
            const script = new Script("class MyClass : ScriptableObject { }");
            const classes = script.getClasses();
            const isScriptableObject = classes[0].isScriptableObject("NotMyClass.cs");

            assert.deepStrictEqual(isScriptableObject, false);
        });
    });

    suite("getMethods", () => {
        test("found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{
    void MyMethod()
    {

    }
}
`);

            const classes = script.getClasses();
            const methods = classes[0].getMethods();

            assert.deepStrictEqual(methods, [
                new Method(script,
                    new Token(new Range(new Position(5, 4), new Position(5, 8)), "void"),
                    new Token(new Range(new Position(5, 9), new Position(5, 17)), "MyMethod")
                )
            ]);
        });

        test("not found", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{

}
`);

            const classes = script.getClasses();
            const methods = classes[0].getMethods();

            assert.deepStrictEqual(methods, []);
        });

        test("multiple same line", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{
    void MyMethod1() { } void MyMethod2() { }
}
`);

            const classes = script.getClasses();
            const methods = classes[0].getMethods();

            assert.deepStrictEqual(methods, [
                new Method(script,
                    new Token(new Range(new Position(5, 4), new Position(5, 8)), "void"),
                    new Token(new Range(new Position(5, 9), new Position(5, 18)), "MyMethod1")
                ),
                new Method(script,
                    new Token(new Range(new Position(5, 25), new Position(5, 29)), "void"),
                    new Token(new Range(new Position(5, 30), new Position(5, 39)), "MyMethod2")
                )
            ]);
        });

        test("multiple different lines", () => {
            const script = new Script(`
using UnityEngine;

public class MyClass : MonoBehaviour
{
    void MyMethod1() { } 
    void MyMethod2() { }
}
`);

            const classes = script.getClasses();
            const methods = classes[0].getMethods();

            assert.deepStrictEqual(methods, [
                new Method(script,
                    new Token(new Range(new Position(5, 4), new Position(5, 8)), "void"),
                    new Token(new Range(new Position(5, 9), new Position(5, 18)), "MyMethod1")
                ),
                new Method(script,
                    new Token(new Range(new Position(6, 4), new Position(6, 8)), "void"),
                    new Token(new Range(new Position(6, 9), new Position(6, 18)), "MyMethod2")
                )
            ]);
        });

        suite("rules", () => {
            test("requires name", () => {
                const script = new Script("class MyClass { void  () { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, []);
            });

            test("requires type", () => {
                const script = new Script("class MyClass { MyMethod() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, []);
            });

            test("allows 1 character name", () => {
                const script = new Script("class MyClass { void M() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 20)), "void"),
                        new Token(new Range(new Position(0, 21), new Position(0, 22)), "M")
                    ),
                ]);
            });

            test("allows 1 character type", () => {
                const script = new Script("class MyClass { T MyMethod() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 17)), "T"),
                        new Token(new Range(new Position(0, 18), new Position(0, 26)), "MyMethod")
                    ),
                ]);
            });

            test("allows bracket behind name", () => {
                const script = new Script("class MyClass { void MyMethod(){ } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 20)), "void"),
                        new Token(new Range(new Position(0, 21), new Position(0, 29)), "MyMethod")
                    ),
                ]);
            });

            test("allows additional keywords", () => {
                const script = new Script("class MyClass { public abstract void MyMethod(){ } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 32), new Position(0, 36)), "void"),
                        new Token(new Range(new Position(0, 37), new Position(0, 45)), "MyMethod")
                    ),
                ]);
            });

            test("allows _ prefix", () => {
                const script = new Script("class MyClass { void _MyMethod() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 20)), "void"),
                        new Token(new Range(new Position(0, 21), new Position(0, 30)), "_MyMethod")
                    ),
                ]);
            });

            test("allows _ postfix", () => {
                const script = new Script("class MyClass { void My_Method() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 20)), "void"),
                        new Token(new Range(new Position(0, 21), new Position(0, 30)), "My_Method")
                    ),
                ]);
            });

            test("disallows number prefix", () => {
                const script = new Script("class MyClass { void 0MyMethod() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, []);
            });

            test("allows number postfix", () => {
                const script = new Script("class MyClass { void MyMethod1() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 20)), "void"),
                        new Token(new Range(new Position(0, 21), new Position(0, 30)), "MyMethod1")
                    ),
                ]);
            });

            test("disallows - prefix", () => {
                const script = new Script("class MyClass { void -MyMethod() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, []);
            });

            test("disallows - postfix", () => {
                const script = new Script("class MyClass { void My-Method() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, []);
            });

            test("allows unicode", () => {
                const script = new Script("class MyClass { void KątDînerKočkaНомерσαλάτα() { } }");
                const classes = script.getClasses();
                const methods = classes[0].getMethods();

                assert.deepStrictEqual(methods, [
                    new Method(script,
                        new Token(new Range(new Position(0, 16), new Position(0, 20)), "void"),
                        new Token(new Range(new Position(0, 21), new Position(0, 45)), "KątDînerKočkaНомерσαλάτα")
                    ),
                ]);
            });
        });
    });
});