import { register } from "../core/registry";
import help from "./help";
import clear from "./clear";
import history from "./history";
import man from "./man";
import { TerminalContext } from "../terminal";

export type Command = {
	name: string;
	description: string;
	usage: string;
    aliases?: string[];

	// TODO: Man
	man: Man["man"];

	execute(args: string[], context: TerminalContext): Promise<CommandExecResult>;
};

export type CommandExecResult =
	| {
			type: "text";
			payload: string;
	  }
	| { type: "list"; payload: (string | { name: string; description: string })[] }
	| { type: "action"; payload: { kind: "clear-terminal" } }
	| { type: "error"; payload: { message: string } }
	| { type: "man"; payload: Man };

export type Man = {
    name: string;
    description: string;
    
    // key of _order defines display order
    man: Record<string, string | string[]>;
}

export function registerCommands() {
	register(help);
	register(clear);
	register(history);
	register(man);
}
