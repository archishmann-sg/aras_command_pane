import { Command } from ".";
import { listCommands } from "../core/registry";

export default {
    name: "help",
    description: "List available commands",
    usage: "help",

    man: {
        synopsis: "help",
    },

    async execute(_, _context) {
        return {
            type: "list",
            payload: listCommands().map((cmd) => ({
                name: cmd.name,
                description: cmd.description,
            })),
        };
    },
} as Command;
