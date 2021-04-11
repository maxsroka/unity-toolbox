import { OutputChannel, window } from 'vscode';

let debugChannel: OutputChannel;

export function initOutput() {
    debugChannel = window.createOutputChannel("Unity Toolbox");
}

export function debugLog(message: string) {
    debugChannel.appendLine(message);
}