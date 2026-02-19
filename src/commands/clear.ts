import { Command } from ".";

export default {
    name: "clear",
    aliases: ["cls"],
    description: "Clear the command pane output",
    usage: "clear",

    man: {
        synopsis: "clear",
        description:
            "Clears the terminal screen. Note that command history is not deleted. Only the screen is emptied out.",
    },

    async execute(_, _context) {
        return {
            type: "action",
            payload: {
                kind: "clear-terminal",
            },
        };
    },
} as Command;
