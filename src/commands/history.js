export default {
    name: "history",
    description: "Show command history",
    usage: "history",

    man: {
        synopsis: "history",
        description:
            "Lists out all of the used commands in current session. Note that current use of `history` is not logged.",
    },

    async execute(_, context) {
        if (context) {
            const history = [...(context?.history ?? [])];
            history.splice(-1);

            if (!Array.isArray(history) || history.length === 0) {
                return {
                    type: "text",
                    payload: "",
                };
            }
            return {
                type: "list",
                payload: [...history],
            };
        }
    },
};
