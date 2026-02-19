import { Command } from ".";
import { getCommand, listCommands } from "../core/registry";

export default {
    name: "man",
    description: "Show manual for a command",
    usage: "TODO",

    man: {
        synopsis: "man <command>",
        description: "Opens manual page for the requested command.",
        options: "",
        examples: ["man help", "man clear"],
    },

    async execute(args, _context) {
        const commandName = args[0];
        if (!commandName) {
            return {
                type: "list",
                payload: listCommands().map((cmd) => cmd.name),
            };
        }

        const command = getCommand(commandName);

        if (!command || !command.man) {
            return {
                type: "error",
                payload: {
                    message: `No manual entry for ${commandName}`,
                },
            };
        }

        return {
            type: "man",
            payload: {
                name: command.name,
                description: command.description,
                man: command.man,
            },
        };
    },
} as Command;
