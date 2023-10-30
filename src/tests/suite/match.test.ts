import { Position } from "vscode";
import Match from "../../helpers/match";

suite("Match", () => {
    test("new", () => {
        new Match(new Position(5, 10), ["SomeContent"]);
    });
});