import { execute } from "./core/executor";
import { registerCommands } from "./commands";

export function createTerminal(container) {
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

    const history = [];
    let historyIndex = -1;
    let user = null;
    let resolving = null;
    registerCommands();

    async function resolveCurrentUser() {
        if (user) return user;
        if (resolving) return resolving;

        resolving = (async () => {
            const innovator = top.Innovator();
        })();
    }

    function print(text) {
        const div = document.createElement("div");
        div.textContent = text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    async function initContext() {
        const user = await resolveCurrentUser();
        return {
            history,
            user,
        };
    }

    async function run(command) {
        print(`> ${command}`);

        const result = await execute(command, initContext());

        if (!result) return;

        render(result);
    }

    function render(result) {
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
                print(`Unsupported result type: ${result.type}`);
        }
    }

    function renderList(items) {
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

    function handleAction(action) {
        switch (action.kind) {
            case "clear-terminal":
                output.innerHTML = "";
                break;
            default:
                print(`Unknown action: ${action.kind}`);
        }
    }

    function renderSection(section, content) {
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

    function renderMan({ name, description, man }) {
        const order = man._order ?? Object.keys(man);

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

            history.push(value);
            historyIndex = history.length;
            input.value = "";

            run(value);
            e.preventDefault();
        }

        if (e.key === "ArrowUp") {
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            }
            e.preventDefault();
        }

        if (e.key === "ArrowDown") {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
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
