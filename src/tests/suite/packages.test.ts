import Packages from "../../helpers/packages";
import * as vscode from "vscode";
import * as assert from "assert";

suite("Packages", () => {
    test("initialize", async () => {
        const context = await vscode.extensions.getExtension("pixl.unity-toolbox")?.activate();
        Packages.initialize(context);
    });

    test("have", async () => {
        const context = await vscode.extensions.getExtension("pixl.unity-toolbox")?.activate();
        Packages.initialize(context);

        assert.deepStrictEqual(Packages.have("com.test.vox2mesh"), true);
        assert.deepStrictEqual(Packages.have("com.test.examplePackage"), false);
    });
});