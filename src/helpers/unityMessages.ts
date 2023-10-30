import * as messages from "../features/unityMessages/unityMessages.json";
import Method from "./method";

type UnityMessage = {
    name: string,
    coroutine: boolean,
    body: string[]
}

/**
 * Static helper for reading Unity Messages.
 */
export default class UnityMessages {
    static all = new Map<string, UnityMessage>();

    static initialize() {
        for (const message of messages) {
            UnityMessages.all.set(message.name, message);
        }
    }

    static get(method: Method): UnityMessage | null {
        const message = this.all.get(method.name.text);
        if (message === undefined) return null;

        const validType = method.type.text === "void" || (message.coroutine && method.type.text === "IEnumerator");
        if (!validType) return null;

        return message;
    }

    static have(method: Method): boolean {
        return this.get(method) !== null;
    }

    static getDoc(name: string): string {
        return `https://docs.unity3d.com/ScriptReference/MonoBehaviour.${name}`;
    }
}