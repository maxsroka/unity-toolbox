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
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("basic NetworkBehaviour", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : NetworkBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("multiple", () => {
            const line = parser.findBehaviour([
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

            assert.equal(line, 2);
        });

        test("private", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "private class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("private no keyword", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("no spaces", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test:MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("more spaces", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public  class  Test  :  MonoBehaviour",
                "{",
                "",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("parent", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "   class Nested : MonoBehaviour { }",
                "}",
            ]);

            assert.equal(line, 2);
        });

        test("nested", () => {
            const line = parser.findBehaviour([
                "using UnityEngine",
                "",
                "public class Parent",
                "{",
                "   class Test : MonoBehaviour { }",
                "}",
            ]);

            assert.equal(line, 4);
        });

        suite("curly brackets", () => {
            test("1", () => {
                const line = parser.findBehaviour([
                    "using UnityEngine",
                    "",
                    "public class Test : MonoBehaviour {",
                    "",
                    "}",
                ]);

                assert.equal(line, 2);
            });

            test("2", () => {
                const line = parser.findBehaviour([
                    "using UnityEngine",
                    "",
                    "public class Test : MonoBehaviour { }",
                ]);

                assert.equal(line, 2);
            });

            test("3", () => {
                const line = parser.findBehaviour([
                    "using UnityEngine",
                    "",
                    "public class Test : MonoBehaviour{}",
                ]);

                assert.equal(line, 2);
            });
        });
    });

    suite("findClosingBracket", () => {
        test("basic", () => {
            const line = parser.findClosingBracket([
                "void Test()",
                "{",
                "",
                "}",
            ], 1);

            assert.equal(line, 3);
        });

        test("brackets same line", () => {
            const line = parser.findClosingBracket([
                "void Test(){}",
            ], 0);

            assert.equal(line, 0);
        });

        test("bracket same line", () => {
            const line = parser.findClosingBracket([
                "void Test() {",
                "",
                "}",
            ], 0);

            assert.equal(line, 2);
        });

        test("parent", () => {
            const line = parser.findClosingBracket([
                "void Test()",
                "{",
                "   {",
                "       void Nested() { }",
                "   }",
                "}",
            ], 1);

            assert.equal(line, 5);
        });

        test("nested", () => {
            const line = parser.findClosingBracket([
                "void Test()",
                "{",
                "   {",
                "       void Nested() { }",
                "   }",
                "}",
            ], 2);

            assert.equal(line, 4);
        });
    });

    suite("findOpeningBracket", () => {
        test("basic", () => {
            const line = parser.findOpeningBracket([
                "void Test()",
                "{",
                "",
                "}",
            ], 0);

            assert.equal(line, 1);
        });

        test("brackets same line", () => {
            const line = parser.findOpeningBracket([
                "void Test(){}",
            ], 0);

            assert.equal(line, 0);
        });

        test("bracket same line", () => {
            const line = parser.findOpeningBracket([
                "void Test() {",
                "",
                "}",
            ], 0);

            assert.equal(line, 0);
        });

        test("parent", () => {
            const line = parser.findOpeningBracket([
                "void Test()",
                "{",
                "   {",
                "       void Nested() { }",
                "   }",
                "}",
            ], 0);

            assert.equal(line, 1);
        });

        test("nested", () => {
            const line = parser.findOpeningBracket([
                "void Test()",
                "{",
                "   void Nested1()",
                "   {",
                "       void Nested2() { }",
                "   }",
                "}",
            ], 2);

            assert.equal(line, 3);
        });

        test("start end same line", () => {
            const line = parser.findOpeningBracket([
                "void Test()",
                "{",
                "   {",
                "       void Nested() { }",
                "   }",
                "}",
            ], 2);

            assert.equal(line, 2);
        });
    });

    suite("findAllMethodsNames", () => {
        test("basic", () => {
            const names = parser.findAllMethodsNames([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "   void Start()",
                "   {",
                "       ",
                "   }",
                "}",
            ]);

            assert.equal(names[0], "Start");
        });

        test("same class name", () => {
            const names = parser.findAllMethodsNames([
                "using UnityEngine;",
                "",
                "public class Start : MonoBehaviour",
                "{",
                "   void Start()",
                "   {",
                "       ",
                "   }",
                "}",
            ]);

            assert.equal(names[0], "Start");
        });

        test("no methods", () => {
            const names = parser.findAllMethodsNames([
                "using UnityEngine;",
                "",
                "public class MyClass : MonoBehaviour",
                "{",
                "   ",
                "}",
            ]);

            assert.equal(names[0], undefined);
        })

        test("multiple", () => {
            const names = parser.findAllMethodsNames([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "   void Start()",
                "   {",
                "       ",
                "   }",
                "   ",
                "   void Update() { }",
                "}",
            ]);

            assert.equal(names[0], "Start");
            assert.equal(names[1], "Update");
        });
    });

    suite("isLineTopLevel", () => {
        test("basic true", () => {
            const is = parser.isLineTopLevel([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 3, 4);

            assert.equal(is, true);
        });

        test("basic false", () => {
            const is = parser.isLineTopLevel([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 3, 1);

            assert.equal(is, false);
        });

        test("pos is closing", () => {
            const is = parser.isLineTopLevel([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 3, 5);

            assert.equal(is, false);
        });

        test("pos is opening", () => {
            const is = parser.isLineTopLevel([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 3, 3);

            assert.equal(is, false);
        });

        test("bracket definition line", () => {
            const is = parser.isLineTopLevel([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour {",
                "",
                "}",
            ], 2, 3);

            assert.equal(is, true);
        });
    });

    suite("isInBehaviour", () => {
        test("basic true", () => {
            const is = parser.isInBehaviour([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 4);

            assert.equal(is, true);
        });

        test("basic false", () => {
            const is = parser.isInBehaviour([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 1);

            assert.equal(is, false);
        });

        test("closing pos", () => {
            const is = parser.isInBehaviour([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 5);

            assert.equal(is, false);
        });

        test("opening pos", () => {
            const is = parser.isInBehaviour([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour",
                "{",
                "",
                "}",
            ], 3);

            assert.equal(is, false);
        });

        test("bracket definition line", () => {
            const is = parser.isInBehaviour([
                "using UnityEngine;",
                "",
                "public class Test : MonoBehaviour {",
                "",
                "}",
            ], 3);

            assert.equal(is, true);
        });
    });
});