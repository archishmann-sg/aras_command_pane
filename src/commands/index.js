import { register } from "../core/registry";
import help from "./help";
import clear from "./clear";
import history from "./history";
import man from "./man";

export function registerCommands() {
    register(help);
    register(clear);
    register(history);
    register(man);
}
