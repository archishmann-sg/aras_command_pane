import { createTerminal } from "./terminal";
(function () {
    if (window.__ARAS_COMMAND_PANE__) return;
    window.__ARAS_COMMAND_PANE__ = true;

    const PANE_HEIGHT = 240;
    const SHORTCUT = { key: "`", ctrl: true, shift: false, alt: false };

    const mainPage = document.querySelector(".main-page");
    if (!mainPage) {
        console.warn("Aras main-page not found");
        return;
    }

    const pane = document.createElement("div");
    pane.id = "aras-command-pane";
    pane.style.position = "fixed";
    pane.style.left = "0";
    pane.style.right = "0";
    pane.style.bottom = "0";
    pane.style.height = `${PANE_HEIGHT}px`;
    pane.style.background = "#111";
    pane.style.color = "#fff";
    pane.style.fontFamily = "monospace";
    pane.style.zIndex = "9999";
    pane.style.display = "none";
    pane.style.borderTop = "1px solid #333";
    pane.style.boxShadow = "0 -8px 24px rgba(0,0,0,0.6)";
    pane.style.padding = "8px";
    pane.textContent =
        "Aras Command Panel. Press 'help' to get list of commands";

    const RESIZE_HANDLE_HEIGHT = 6;
    const MIN_HEIGHT = 120;
    const MAX_HEIGHT = window.innerHeight * 0.8;

    const resizeHandle = document.createElement("div");
    resizeHandle.id = "aras-command-resize-handle";

    Object.assign(resizeHandle.style, {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        height: `${RESIZE_HANDLE_HEIGHT}px`,
        cursor: "ns-resize",
        background: "rgba(255,255,255,0.08)",
        zIndex: "10000",
    });

    pane.appendChild(resizeHandle);

    document.body.appendChild(pane);

    let open = false;
    const terminal = createTerminal(pane);

    function openPane() {
        pane.style.display = "block";
        mainPage.style.paddingBottom = `${PANE_HEIGHT}px`;
        open = true;
        terminal.focus();
    }

    function closePane() {
        pane.style.display = "none";
        mainPage.style.paddingBottom = "";
        open = false;
    }

    function togglePane() {
        open ? closePane() : openPane();
    }

    let startY = 0;
    let startHeight = 0;
    let dragging = false;

    resizeHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();

        dragging = true;
        startY = e.clientY;
        startHeight = pane.getBoundingClientRect().height;

        document.body.style.cursor = "ns-resize";

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
        if (!dragging) return;

        const delta = startY - e.clientY;
        let newHeight = startHeight + delta;

        newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

        pane.style.height = `${newHeight}px`;

        // Keep Aras content visible
        const mainPage = document.querySelector(".main-page");
        if (mainPage) {
            mainPage.style.paddingBottom = `${newHeight}px`;
        }
    }

    function onMouseUp() {
        dragging = false;

        document.body.style.cursor = "";

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("keydown", (e) => {
        if (
            e.key.toLowerCase() === SHORTCUT.key &&
            e.ctrlKey === SHORTCUT.ctrl &&
            e.shiftKey === SHORTCUT.shift &&
            e.altKey === SHORTCUT.alt
        ) {
            e.preventDefault();
            togglePane();
        }
    });
})();
(function () {
    const HINT_ID = "aras-command-hint";
    const SEARCH_ID = "aras-es-toolbar-input";

    if (document.getElementById(HINT_ID)) return;

    function tryInject() {
        if (document.getElementById(HINT_ID)) return true;

        const searchBar = document.getElementById(SEARCH_ID);
        if (!searchBar || !searchBar.parentElement) return false;

        const hint = document.createElement("div");
        hint.id = HINT_ID;
        hint.textContent = "⌨ Ctrl+` — Command Panel";

        Object.assign(hint.style, {
            marginLeft: "8px",
            fontSize: "11px",
            color: "#888",
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
            alignSelf: "center",
        });

        searchBar.parentElement.insertBefore(hint, searchBar.nextSibling);
        return true;
    }

    if (tryInject()) return;

    const observer = new MutationObserver(() => {
        if (tryInject()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    setTimeout(() => {
        observer.disconnect();
    }, 15000);
})();
