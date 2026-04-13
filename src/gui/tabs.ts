import Workspace from "../filesystem/workspace.js";
import ContextMenu from "./contextMenu.js";
import LangIcons from "./langIcons.js";

export default class Tabs {

    private static _instance: Tabs;
    
    private element: HTMLElement;

    private constructor() {
        this.element = document.getElementById('tabs') || document.createElement('div');
    }

    public static getInstance(): Tabs {
        if (!this._instance) {
            this._instance = new Tabs();
        }
        return this._instance;
    }

    public renderTabs() {
        this.element.innerHTML = "";
        const workspace = Workspace.getInstance();

        workspace.getOpenTabs().forEach(file => {

            const tab = document.createElement("div");
            tab.className = "tab" + (file === workspace.getActiveFile() ? " active" : "");
            tab.textContent = file.dirty ? "● " : "";
            tab.append(LangIcons.createIcon(file.name));
            tab.append(file.name);

            const close = document.createElement("a");
            close.className = "codicon codicon-close close";
            close.onclick = e => {
                e.stopPropagation();
                workspace.closeFile(file);
            };

            tab.appendChild(close);
            tab.onclick = () => workspace.openFile(file);
            tab.oncontextmenu = e => ContextMenu.getInstance().open(e, file);
            this.element.appendChild(tab);
        });
    }
}
