import { ExtensionContext, LogOutputChannel, window } from "vscode";

/**
 * Static helper for logging.
 */
export default class Logger {
    private static output: LogOutputChannel;

    static initialize(context: ExtensionContext) {
        this.output = window.createOutputChannel("Unity Toolbox", { log: true });
        context.subscriptions.push(this.output);
    }

    static info(message: string) { this.output.info(message) };
    static debug(message: string) { this.output.debug(message) };
    static warn(message: string) { this.output.warn(message) };
    static error(message: string) { this.output.error(message) };
    static trace(message: string) { this.output.trace(message) };
}