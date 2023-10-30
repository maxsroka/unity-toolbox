import Logger from "../../helpers/logger";
import * as vscode from "vscode";

suite("Logger", () => {
    test("initialize", async () => {
        const context = await vscode.extensions.getExtension("pixl.unity-toolbox")?.activate();
        Logger.initialize(context);
    });

    test("log", async () => {
        const context = await vscode.extensions.getExtension("pixl.unity-toolbox")?.activate();
        Logger.initialize(context);

        Logger.info("info");
        Logger.debug("debug");
        Logger.warn("warn");
        Logger.error("error");
        Logger.trace("trace");
    });
});