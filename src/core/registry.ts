import { Command } from "../commands";

const commands = new Map<string, Command>();
const aliases = new Map<string, string>(); // Alias->Command-Name

export function register(command: Command) {
	if (!command || !command.name || typeof command.execute !== "function") {
		throw new Error("Invalid command object");
	}

	if (commands.has(command.name)) {
		throw new Error(`Command "${command.name}" is already registered`);
	}

	commands.set(command.name, command);

	if (Array.isArray(command.aliases)) {
		for (const alias of command.aliases) {
			if (aliases.has(alias)) {
				throw new Error(`Alias "${alias}" is already in use`);
			}
			aliases.set(alias, command.name);
		}
	}
}

export function getCommand(name: string): Command | undefined{
	if (commands.has(name)) {
		return commands.get(name);
	}

	if (aliases.has(name)) {
		const commandName = aliases.get(name)!;
		return commands.get(commandName);
	}
	return undefined;
}

export function listCommands() {
	return Array.from(commands.values());
}
