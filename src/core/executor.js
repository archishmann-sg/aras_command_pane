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

    const before = snapshot(context);
    try {
        const result = await command.execute(args, context);

        validate(before, context);

        if (!result || !result.type) {
            return errorResult(`Command '${name}' returned an invalid result`);
        }
        return result;
    } catch (e) {
        Object.assign(context, before);
        return errorResult(e.message || `Command '${name}' failed`);
    }
}

function snapshot(context) {
    return {
        user: context.user,
        cwd: context.cwd,
        env: { ...context.env },
    };
}

function validate(snapshot, context) {
    for (const key of Object.keys(snapshot)) {
        if (!(key in context)) {
            throw new Error(`Context key removed: ${key}`);
        }
    }

    if (context.user !== snapshot.user) {
        throw new Error("Illegal mutation: user is read-only");
    }

    if (typeof context.cwd !== "string") {
        throw new Error("Invalid context: cwd must be string");
    }

    if (typeof context.env !== "object" || context.env === null) {
        throw new Error("Invalid context: env must be object");
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
