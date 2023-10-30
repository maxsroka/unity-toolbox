import Assets from "../../helpers/assets";
import { extensions } from "vscode";
import * as assert from "assert";

suite("Assets", () => {
    test("initialize", async () => {
        const context = await extensions.getExtension("pixl.unity-toolbox")?.activate();
        Assets.initialize(context);

        assert.deepStrictEqual(Assets.all[".cs"].size, 1);
    });
});