import { execute } from "./core/executor";
import { CommandExecResult, Man, registerCommands } from "./commands";
import { getCurrentUser } from "./core/utils";

// TODO: Might need to rename this type
export type Terminal = {
	focus: () => void;
	print: (text: string) => void;
};

export type TerminalContext = {
	user: Item | undefined;
	cwd: string;
	history: string[];
	env: Object; // TODO
};

export function createTerminal(container: HTMLElement): Terminal {
	const style = document.createElement("style");
	style.textContent = `
    .aras-terminal {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-family: monospace;
      font-size: 12px;
    }

    .aras-terminal-output {
      flex: 1 1 auto;
      overflow-y: auto;
      white-space: pre-wrap;
      padding: 4px;
    }

    .aras-terminal-line {
      display: flex;
      border-top: 1px solid #333;
      border-bottom: 4px solid;
      padding: 4px;
    }

    .aras-terminal-prompt {
      margin-right: 4px;
    }

    .aras-terminal-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
    }
  `;
	document.head.appendChild(style);

	const root = document.createElement("div");
	root.className = "aras-terminal";

	const output = document.createElement("div");
	output.className = "aras-terminal-output";

	const line = document.createElement("div");
	line.className = "aras-terminal-line";

	const prompt = document.createElement("span");
	prompt.className = "aras-terminal-prompt";
	prompt.textContent = ">";

	const input = document.createElement("input");
	input.className = "aras-terminal-input";
	input.type = "text";
	input.autocomplete = "off";
	input.spellcheck = false;

	line.appendChild(prompt);
	line.appendChild(input);

	root.appendChild(output);
	root.appendChild(line);

	container.appendChild(root);

	let historyIndex = -1;
	let user: Item | undefined;
	let resolving: Promise<Item> | undefined = undefined;
	let context: TerminalContext = {
		user,
		cwd: "/",
		history: [] as string[],
		env: {}, // TODO
	};
	registerCommands();
	initContext();

	async function resolveCurrentUser() {
		if (user) return user;
		if (resolving) return resolving;

		resolving = (async () => {
			const currentUser = await getCurrentUser();

			user = Object.freeze(currentUser);
			resolving = undefined;
			return user;
		})();

		return resolving;
	}

	function renderPrompt() {
		if (!context.user) {
			throw new Error("Expected user on context");
		}
		prompt.textContent = `[${context.user.getProperty("login_name")}:${context.cwd}] $ `;
	}

	function print(text: string) {
		const div = document.createElement("div");
		div.textContent = text;
		output.appendChild(div);
		output.scrollTop = output.scrollHeight;
	}

	async function initContext() {
		const user = await resolveCurrentUser();
		context.user = user;
		context.cwd = "/";
		renderPrompt();
	}

	async function run(command: string) {
		print(`> ${command}`);

		const result = await execute(command, context);

		if (!result) return;

		render(result);
	}

	function render(result: CommandExecResult) {
		switch (result.type) {
			case "text":
				print(result.payload);
				break;
			case "list":
				renderList(result.payload);
				break;
			case "action":
				handleAction(result.payload);
				break;
			case "error":
				print(`Error: ${result.payload.message}`);
				break;
			case "man":
				renderMan(result.payload);
				break;
			default:
				print(`Unsupported result type: ${(result as any).type}`);
		}
	}

	function renderList(items: (string | { name: string; description: string })[]) {
		if (!Array.isArray(items) || items.length === 0) {
			print("(empty)");
			return;
		}
		for (const item of items) {
			if (typeof item === "string") {
				print(item);
			} else if (item.name) {
				print(`${item.name} - ${item.description || ""}`);
			} else {
				print(JSON.stringify(item));
			}
		}
	}

	function handleAction(action: { kind: string }) {
		switch (action.kind) {
			case "clear-terminal":
				output.innerHTML = "";
				break;
			default:
				print(`Unknown action: ${action.kind}`);
		}
	}

	function renderSection(section: string, content: string | string[]) {
		if (!content) return;

		const heading = section.replace(/_/g, " ").toUpperCase();

		print("");
		print(heading);
		print("-".repeat(heading.length));

		const lines = Array.isArray(content) ? content : content.split("\n");

		for (const line of lines) {
			print(`\t ${line}`);
		}
	}

	function renderMan({ name, description, man }: Man) {
		const order = (man._order as string[] | null) ?? Object.keys(man);

		print(`${name} - ${description}`);
		for (const key of order) {
			if (key.startsWith("_")) continue;

			renderSection(key, man[key]);
		}
	}

	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			const value = input.value.trim();
			if (!value) return;

			context.history.push(value);
			historyIndex = context.history.length;
			input.value = "";

			run(value);
			renderPrompt();
			e.preventDefault();
		}

		if (e.key === "ArrowUp") {
			if (historyIndex > 0) {
				historyIndex--;
				input.value = context.history[historyIndex];
			}
			e.preventDefault();
		}

		if (e.key === "ArrowDown") {
			if (historyIndex < context.history.length - 1) {
				historyIndex++;
				input.value = context.history[historyIndex];
			} else {
				historyIndex = context.history.length;
				input.value = "";
			}
			e.preventDefault();
		}
	});

	return {
		focus() {
			input.focus();
		},
		print,
	};
}
