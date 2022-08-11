import assert = require("assert");
import { Position } from "vscode";
import Parser from "../parser";

const parser = new Parser();

suite("parser", () => {
    suite("findMethodsName", () => {
        test("basic", () => {
            const name = parser.findMethodsName("void Test()");

            assert.equal(name, "Test");
        });

        suite("curly brackets", () => {
            test("1", () => assert.equal(parser.findMethodsName("void Test() {"), "Test"));
            test("2", () => assert.equal(parser.findMethodsName("void Test(){"), "Test"));
            test("3", () => assert.equal(parser.findMethodsName("void Test()  {"), "Test"));
            test("4", () => assert.equal(parser.findMethodsName("void Test() {}"), "Test"));
            test("5", () => assert.equal(parser.findMethodsName("void Test(){}"), "Test"));
            test("6", () => assert.equal(parser.findMethodsName("void Test()  {}"), "Test"));
            test("7", () => assert.equal(parser.findMethodsName("void Test() { }"), "Test"));
            test("8", () => assert.equal(parser.findMethodsName("void Test(){ }"), "Test"));
            test("9", () => assert.equal(parser.findMethodsName("void Test()  { }"), "Test"));
        });

        suite("spaces", () => {
            test("1", () => assert.equal(parser.findMethodsName("void  Test()"), "Test"));
            test("2", () => assert.equal(parser.findMethodsName("void Test ()"), "Test"));
            test("3", () => assert.equal(parser.findMethodsName("void Test() "), "Test"));
            test("4", () => assert.equal(parser.findMethodsName("void Test  ()"), "Test"));
            test("5", () => assert.equal(parser.findMethodsName("void Test()  "), "Test"));
            test("6", () => assert.equal(parser.findMethodsName("void  Test  ()  "), "Test"));
        });

        test("debug log", () => {
            const name = parser.findMethodsName("void Test() { Debug.Log(\"Message\"); }");

            assert.equal(name, "Test");
        });

        test("nested", () => {
            const name = parser.findMethodsName("void Test() { void Nested() { } }");

            assert.equal(name, "Test");
        })

        test("parameter", () => {
            const name = parser.findMethodsName("void Test(int x)");

            assert.equal(name, "Test");
        });

        test("parameters", () => {
            const name = parser.findMethodsName("void Test(int x, string y, Test z)");

            assert.equal(name, "Test");
        });

        test("comment", () => {
            const name = parser.findMethodsName("void Test() // comment");

            assert.equal(name, "Test");
        });

        test("no brackets", () => {
            const name = parser.findMethodsName("void Test");

            assert.equal(name, undefined);
        });

        test("no return type", () => {
            const name = parser.findMethodsName("Test()");

            assert.equal(name, undefined);
        });
    });

    suite("hasUnityMessage", () => {
        test("basic", () => {
            const has = parser.hasUnityMessage("void Start()");

            assert.equal(has, true);
        });

        suite("curly brackets", () => {
            test("1", () => assert.equal(parser.hasUnityMessage("void Update() {"), true));
            test("2", () => assert.equal(parser.hasUnityMessage("void Update(){"), true));
            test("3", () => assert.equal(parser.hasUnityMessage("void Update()  {"), true));
            test("4", () => assert.equal(parser.hasUnityMessage("void Update() {}"), true));
            test("5", () => assert.equal(parser.hasUnityMessage("void Update(){}"), true));
            test("6", () => assert.equal(parser.hasUnityMessage("void Update()  {}"), true));
            test("7", () => assert.equal(parser.hasUnityMessage("void Update() { }"), true));
            test("8", () => assert.equal(parser.hasUnityMessage("void Update(){ }"), true));
            test("9", () => assert.equal(parser.hasUnityMessage("void Update()  { }"), true));
        });

        suite("spaces", () => {
            test("1", () => assert.equal(parser.hasUnityMessage("void  FixedUpdate()"), true));
            test("2", () => assert.equal(parser.hasUnityMessage("void FixedUpdate ()"), true));
            test("3", () => assert.equal(parser.hasUnityMessage("void FixedUpdate() "), true));
            test("4", () => assert.equal(parser.hasUnityMessage("void FixedUpdate  ()"), true));
            test("5", () => assert.equal(parser.hasUnityMessage("void FixedUpdate()  "), true));
            test("6", () => assert.equal(parser.hasUnityMessage("void  FixedUpdate  ()  "), true));
        });

        test("debug log", () => {
            const has = parser.hasUnityMessage("void LateUpdate() { Debug.Log(\"Message\"); }");

            assert.equal(has, true);
        });

        test("parent", () => {
            const has = parser.hasUnityMessage("void OnCollisionEnter2D() { void Nested() { } }");

            assert.equal(has, true);
        })

        test("nested", () => {
            const has = parser.hasUnityMessage("void Parent() { void OnTriggerEnter() { } }");

            assert.equal(has, true);
        })

        test("parameter", () => {
            const has = parser.hasUnityMessage("void Awake(int x)");

            assert.equal(has, true);
        });

        test("parameters", () => {
            const has = parser.hasUnityMessage("void OnGUI(int x, string y, Test z)");

            assert.equal(has, true);
        });

        test("comment", () => {
            const has = parser.hasUnityMessage("void Reset() // comment");

            assert.equal(has, true);
        });

        test("no brackets", () => {
            const has = parser.hasUnityMessage("void Validate");

            assert.equal(has, false);
        });

        test("no return type", () => {
            const has = parser.hasUnityMessage("Start()");

            assert.equal(has, false);
        });
    });

    suite("findBehaviour", () => {
        test("basic MonoBehaviour", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("basic NetworkBehaviour", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : NetworkBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("multiple", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
                "",
                "public class SecondOne : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("private", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "private class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("private no keyword", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("no spaces", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test:MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("more spaces", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public  class  Test  :  MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("parent", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "   class Nested : MonoBehaviour { }",
                "}",
            ]);

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("nested", () => {
            const pos = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Parent",
                "{",
                "   class Test : MonoBehaviour { }",
                "}",
            ]);

            assert.equal(pos?.line, 5);
            assert.equal(pos?.character, 0);
        });

        suite("curly brackets", () => {
            test("1", () => {
                const pos = parser.findBehaviour([
                    "using UnityEngine",
                    "",
                    "public class Test : MonoBehaviour {",
                    "",
                    "}",
                ]);

                assert.equal(pos?.line, 3);
                assert.equal(pos?.character, 0);
            });

            test("2", () => {
                const pos = parser.findBehaviour([
                    "using UnityEngine",
                    "",
                    "public class Test : MonoBehaviour { }",
                ]);

                assert.equal(pos?.line, 3);
                assert.equal(pos?.character, 0);
            });

            test("3", () => {
                const pos = parser.findBehaviour([
                    "using UnityEngine",
                    "",
                    "public class Test : MonoBehaviour{}",
                ]);

                assert.equal(pos?.line, 3);
                assert.equal(pos?.character, 0);
            });
        });
    });

    suite("findClosingBracket", () => {
        test("basic", () => {
            const pos = parser.findClosingBracket([
                "void Test()",
                "{",
                "",
                "}",
            ], new Position(1, 0));

            assert.equal(pos?.line, 3);
            assert.equal(pos?.character, 0);
        });

        test("same line", () => {
            const pos = parser.findClosingBracket([
                "void Test(){}",
            ], new Position(0, 12));

            assert.equal(pos?.line, 0);
            assert.equal(pos?.character, 12);
        });

        test("nested", () => {
            const pos = parser.findClosingBracket([
                "void Test()",
                "{",
                "   {",
                "       void Nested() { }",
                "   }",
                "}",
            ], new Position(1, 0));

            assert.equal(pos?.line, 5);
            assert.equal(pos?.character, 0);
        });
    });
});