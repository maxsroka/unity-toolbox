import { Position, Range } from "vscode";
import File from "../../helpers/file";
import * as assert from "assert";
import Match from "../../helpers/match";

suite("File", () => {
    test("new", () => {
        new File("");
        new File("content");
    });

    test("text", () => {
        const file = new File("text");

        assert.deepStrictEqual(file.text, "text");
    });

    test("lines", () => {
        const singleLine = new File("single line");
        const threeLines = new File("single line\nsecond line\nthird line");

        assert.deepStrictEqual(singleLine.lines.length, 1);
        assert.deepStrictEqual(threeLines.lines.length, 3);
    });

    test("start", () => {
        const file = new File("class MyClass");

        assert.deepStrictEqual(file.start, new Position(0, 0));
    });

    test("end", () => {
        const file = new File(`class MyClass
{

}`);

        assert.deepStrictEqual(file.end, new Position(3, 1));
    });

    suite("searchSingle", () => {
        test("found", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const match = file.searchSingle(/UnityEngine/g);

            assert.deepStrictEqual(match,
                new Match(
                    new Position(1, 6),
                    []
                )
            );
        });

        test("not found", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const match = file.searchSingle(/System/g);

            assert.deepStrictEqual(match, null);
        });

        test("requires global", () => {
            const file = new File("");

            assert.throws(() => file.searchSingle(/class/));
        });

        test("content group", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const match = file.searchSingle(/using +(.*)/g);

            assert.deepStrictEqual(match,
                new Match(
                    new Position(1, 0),
                    ["UnityEngine;"]
                )
            );
        });

        test("custom range", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const match = file.searchSingle(/using +(.*)/g, new Range(new Position(1, 10), file.end));

            assert.deepStrictEqual(match,
                new Match(
                    new Position(2, 0),
                    ["UnityEngine.UI;"]
                )
            );
        });
    });

    suite("searchMultiple", () => {
        test("found", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const matches = file.searchMultiple(/UnityEngine/g);

            assert.deepStrictEqual(matches, [
                new Match(new Position(1, 6), []),
                new Match(new Position(2, 6), [])
            ]);
        });

        test("not found", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const matches = file.searchMultiple(/System/g);

            assert.deepStrictEqual(matches, []);
        });

        test("requires global", () => {
            const file = new File("");

            assert.throws(() => file.searchMultiple(/class/));
        });

        test("content groups", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
`);
            const match = file.searchMultiple(/using +(.*)/g);

            assert.deepStrictEqual(match, [
                new Match(new Position(1, 0), ["UnityEngine;"]),
                new Match(new Position(2, 0), ["UnityEngine.UI;"])
            ]);
        });

        test("custom range", () => {
            const file = new File(`
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
`);
            const matches = file.searchMultiple(/using +(.*)/g, new Range(new Position(1, 10), new Position(2, 10)));

            assert.deepStrictEqual(matches, [
                new Match(new Position(2, 0), ["UnityEngine.UI;"])
            ]);
        });
    });
});