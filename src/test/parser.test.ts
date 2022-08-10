import assert = require("assert");
import Parser from "../parser";

const parser = new Parser();

suite("parser", () => {
    suite("findMethodsName", () => {
        test("no curly brackets", () => {
            const name = parser.findMethodsName("void Test()");

            assert.equal(name, "Test");
        });

        test("curly bracket with space", () => {
            const name = parser.findMethodsName("void Test() {");

            assert.equal(name, "Test");
        });

        test("curly bracket without space", () => {
            const name = parser.findMethodsName("void Test(){");

            assert.equal(name, "Test");
        });

        test("curly brackets with space not together", () => {
            const name = parser.findMethodsName("void Test() { }");

            assert.equal(name, "Test");
        });

        test("curly brackets with space together", () => {
            const name = parser.findMethodsName("void Test() {}");

            assert.equal(name, "Test");
        });

        test("curly brackets without space not together", () => {
            const name = parser.findMethodsName("void Test(){ }");

            assert.equal(name, "Test");
        });

        test("curly brackets without space together", () => {
            const name = parser.findMethodsName("void Test(){}");

            assert.equal(name, "Test");
        });

        test("debug log", () => {
            const name = parser.findMethodsName("void Test() { Debug.Log(\"Message\"); }");

            assert.equal(name, "Test");
        });

        test("parameter", () => {
            const name = parser.findMethodsName("void Test(int x)");

            assert.equal(name, "Test");
        });

        test("parameters", () => {
            const name = parser.findMethodsName("void Test(int x, string y, Test z)");

            assert.equal(name, "Test");
        });

        test("space before brackets", () => {
            const name = parser.findMethodsName("void Test ()");

            assert.equal(name, "Test");
        });

        test("spaces before brackets", () => {
            const name = parser.findMethodsName("void Test    ()");

            assert.equal(name, "Test");
        });

        test("comment", () => {
            const name = parser.findMethodsName("void Test() // comment");

            assert.equal(name, "Test");
        });
    });
});