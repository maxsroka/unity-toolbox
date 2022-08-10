import assert = require("assert");
import Parser from "../parser";

const parser = new Parser();

suite("parser", () => {
    suite("findMethodName", () => {
        test("no curly brackets", () => {
            const name = parser.findMethodName("void Test()");

            assert.equal(name, "Test");
        });

        test("curly bracket with space", () => {
            const name = parser.findMethodName("void Test() {");

            assert.equal(name, "Test");
        });

        test("curly bracket without space", () => {
            const name = parser.findMethodName("void Test(){");

            assert.equal(name, "Test");
        });

        test("curly brackets with space not together", () => {
            const name = parser.findMethodName("void Test() { }");

            assert.equal(name, "Test");
        });

        test("curly brackets with space together", () => {
            const name = parser.findMethodName("void Test() {}");

            assert.equal(name, "Test");
        });

        test("curly brackets without space not together", () => {
            const name = parser.findMethodName("void Test(){ }");

            assert.equal(name, "Test");
        });

        test("curly brackets without space together", () => {
            const name = parser.findMethodName("void Test(){}");

            assert.equal(name, "Test");
        });

        test("debug log", () => {
            const name = parser.findMethodName("void Test() { Debug.Log(\"Message\"); }");

            assert.equal(name, "Test");
        });

        test("parameter", () => {
            const name = parser.findMethodName("void Test(int x)");

            assert.equal(name, "Test");
        });

        test("parameters", () => {
            const name = parser.findMethodName("void Test(int x, string y, Test z)");

            assert.equal(name, "Test");
        });

        test("space before brackets", () => {
            const name = parser.findMethodName("void Test ()");

            assert.equal(name, "Test");
        });

        test("spaces before brackets", () => {
            const name = parser.findMethodName("void Test    ()");

            assert.equal(name, "Test");
        });

        test("comment", () => {
            const name = parser.findMethodName("void Test() // comment");

            assert.equal(name, "Test");
        });
    });
});