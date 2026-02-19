export type ParsedCommand = {
    command: string;
    args: string[];
    raw: string;
};

export function parse(input: string): ParsedCommand | null {
    if (!input || !input.trim()) {
        return null;
    }

    const tokens = tokenize(input);
    if (tokens.length === 0) return null;

    const [command, ...args] = tokens;

    return {
        command,
        args,
        raw: input,
    };
}

function tokenize(input: string) {
    const tokens = [];

    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];

        if (ch === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (ch === " " && !insideQuotes) {
            if (current) {
                tokens.push(current);
                current = "";
            }
            continue;
        }

        current += ch;
    }

    if (current) tokens.push(current);

    return tokens;
}
