import { Folder, Node, NodeType, File } from '../filesystem/node.js';
import Workspace from '../filesystem/workspace.js';
import ContextMenu from './contextMenu.js';
import LangIcons from './langIcons.js';

export default class Explorer {
    private static _instance: Explorer;
    private _domElement: HTMLElement;

    private constructor() {
        this._domElement = document.getElementById("explorer") || new HTMLElement();
    }

    public static getInstance(): Explorer {
        if (!Explorer._instance) {
            Explorer._instance = new Explorer();
        }
        return Explorer._instance;
    }

    private _renderNode(container: HTMLElement, node: Node) {
        const row = document.createElement("div");
        row.className = "node" + (node.type === NodeType.Folder ? " folder" : "");
        const nameElement = document.createElement("span");


        if (nameElement) {
            nameElement.textContent = node.name || "WORKSPACE";
            if (!node.name) nameElement.style.fontWeight = "bold";
            nameElement.classList = "name";
        }

        row.appendChild(nameElement);

        row.oncontextmenu = e => ContextMenu.getInstance().open(e, node);

        if (node.type === NodeType.Folder) {

            const folder = node as Folder;

            const dropIcon = document.createElement("span");
            dropIcon.classList = "codicon codicon-chevron-down";
            row.prepend(dropIcon);

            const folderIcons = document.createElement('div');
            folderIcons.classList.add('folder-icons');

            const addFileIcon = document.createElement("span");
            addFileIcon.classList = "codicon codicon-new-file add-button";
            folderIcons.appendChild(addFileIcon);
            const addFolderIcon = document.createElement("span");
            addFolderIcon.classList = "codicon codicon-new-folder add-button";
            folderIcons.appendChild(addFolderIcon);
            folderIcons.style.display = 'none';
            folderIcons.style.width = '35px';
            folderIcons.style.justifyContent = 'space-between';

            row.onclick = () => {
                folder.expanded = !folder.expanded;
                this.renderExplorer();
            };
            row.onmouseenter = () => {
                folderIcons.style.display = 'flex';
            }
            row.onmouseleave = () => {
                folderIcons.style.display = 'none';
            }

            row.appendChild(folderIcons);

            container.appendChild(row);

            if (folder.expanded) {
                dropIcon.classList.replace('codicon-chevron-right', 'codicon-chevron-down');
                const children = document.createElement("div");
                children.className = "children";
                folder.children.forEach(c => this._renderNode(children, c));
                container.appendChild(children);
            } else {
                dropIcon.classList.replace('codicon-chevron-down', 'codicon-chevron-right');
            }
        }

        if (node.type === NodeType.File) {
            row.onclick = () => Workspace.getInstance().openFile(node as File);
            const iconElement = LangIcons.createIcon(node.name);
            row.prepend(iconElement);
            container.appendChild(row);
        }
    }

    public renderExplorer() {
        this._domElement.innerHTML = '';
        this._renderNode(this._domElement, Workspace.getInstance().getNode());
    }

}
