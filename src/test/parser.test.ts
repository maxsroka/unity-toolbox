import assert = require("assert");
import Parser from "../parser";

const parser = new Parser();

suite("parser", () => {
    suite("findMethodName", () => {
        test("no brackets", () => {
            const name = parser.findMethodName("void Test()");

            assert.equal(name, "Test");
        });

        test("bracket with space", () => {
            const name = parser.findMethodName("void Test() {");

            assert.equal(name, "Test");
        });

        test("bracket without space", () => {
            const name = parser.findMethodName("void Test(){");

            assert.equal(name, "Test");
        });

        test("brackets with space not together", () => {
            const name = parser.findMethodName("void Test() { }");

            assert.equal(name, "Test");
        });

        test("brackets with space together", () => {
            const name = parser.findMethodName("void Test() {}");

            assert.equal(name, "Test");
        });

        test("brackets without space not together", () => {
            const name = parser.findMethodName("void Test(){ }");

            assert.equal(name, "Test");
        });

        test("brackets without space together", () => {
            const name = parser.findMethodName("void Test(){}");

            assert.equal(name, "Test");
        });

        test("debug log", () => {
            const name = parser.findMethodName("void Test() { Debug.Log(\"Message\") }");

            assert.equal(name, "Test");
        });

        test("parameter", () => {
            const name = parser.findMethodName("void Test(int x)");

            assert.equal(name, "Test");
        });

        test("parameters", () => {
            const name = parser.findMethodName("void Test(int x, string Test, Test test2)");

            assert.equal(name, "Test");
        });
    });
});