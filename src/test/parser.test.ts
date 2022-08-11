import assert = require("assert");
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
});