import { parse } from "./parser";
import { getCommand } from "./registry";

export async function execute(input, context) {
    let parsed;

    try {
        parsed = parse(input);
    } catch (e) {
        return errorResult(`Parse error: ${e.message}`);
    }

    if (!parsed) {
        return null;
    }

    const { command: name, args } = parsed;

    const command = getCommand(name);

    if (!command) {
        return errorResult(`Unknown commmand:${name}`);
    }

    try {
        const result = await command.execute(args, context);

        if (!result || !result.type) {
            return errorResult(`Command '${name}' returned an invalid result`);
        }
        return result;
    } catch (e) {
        return errorResult(e.message || `Command '${name}' failed`);
    }
}

function errorResult(message) {
    return {
        type: "error",
        payload: {
            message,
        },
    };
}
