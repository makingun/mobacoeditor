import { Folder, Node, NodeType } from "../filesystem/node.js";
import UserInput from "../filesystem/userInput.js";

interface MenuItem {
    label: string;
    action: () => void;
}

export default class ContextMenu {
    private static _instance: ContextMenu;
    private _contextMenuElement: HTMLDivElement | null;

    private constructor() {
        this._contextMenuElement = null;
        document.addEventListener("click", () => this.close());
    }

    public static getInstance(): ContextMenu {
        if (!ContextMenu._instance) {
            ContextMenu._instance = new ContextMenu();
        }
        return ContextMenu._instance;
    }

    public monacoOpen() {

// Create a custom context menu

const menu = new monaco.actions.Menu();

// Define actions
const renameAction = new monaco.actions.Action({
  id: 'rename',
  label: 'Rename',
  run: () => console.log('Rename action triggered')
});

const deleteAction = new monaco.actions.Action({
  id: 'delete',
  label: 'Delete',
  run: () => console.log('Delete action triggered')
});

// Add actions to the menu
menu.addAction(renameAction);
menu.addAction(deleteAction);

// Trigger the context menu
document.getElementById('my-element').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.trigger(e, {
    x: e.clientX,
    y: e.clientY
  });
});
    }

    public open(e: MouseEvent, node: Node): void {
        e.preventDefault();
        this.close();
        this._contextMenuElement = document.createElement("div");
        this._contextMenuElement.className = "context-menu";
        this._contextMenuElement.style.top = `${e.clientY}px`;
        this._contextMenuElement.style.left = `${e.clientX}px`;

        const menuItems = this._getMenuItems(node);
        menuItems.forEach((item) => this._addMenuItem(item));

        document.body.appendChild(this._contextMenuElement);
    }

    public close(): void {
        if (this._contextMenuElement) {
            this._contextMenuElement.remove();
            this._contextMenuElement = null;
        }
    }

    private _getMenuItems(node: Node): MenuItem[] {
        const menuItems: MenuItem[] = [];

        if (node.type === NodeType.Folder) {
            menuItems.push(
                { label: "New File", action: () => UserInput.createFile(node as Folder) },
                { label: "New Folder", action: () => UserInput.createFolder(node as Folder) }
            );
        }

        if (node.name !== "") {
            menuItems.push(
                { label: "Rename", action: () => UserInput.renameNode(node) },
                { label: "Delete", action: () => UserInput.deleteNode(node) }
            );
        }

        return menuItems;
    }

    private _addMenuItem(item: MenuItem): void {
        if (!this._contextMenuElement) return;

        const menuItemElement = document.createElement("div");
        menuItemElement.textContent = item.label;
        menuItemElement.onclick = () => {
            item.action();
            this.close();
        };

        this._contextMenuElement.appendChild(menuItemElement);
    }
}
