import Editor from '../editor.js';
import Explorer from '../gui/explorer.js';
import Tabs from '../gui/tabs.js';
import { Folder, File, Node, NodeType } from './node.js';

export default class Workspace {
    private static _instance: Workspace;
    private _node: Folder;
    private _fileHandle: FileSystemFileHandle | undefined;
    private _openTabs: File[] = [];
    private _activeFile: File | undefined;

    private constructor() {
        this._node = new Folder('');
        this._node.expanded = true;
    }

    public static getInstance(): Workspace {
        if (!Workspace._instance) {
            Workspace._instance = new Workspace();
        }
        return Workspace._instance;
    }

    getNode(): Folder {
        return this._node;
    }

    async fromUserFile(): Promise<void> {
        //@ts-ignore
        const [handle] = await window.showOpenFilePicker({ types: [{ accept: { "text/mep": [".mep"] } }] });
        this._fileHandle = handle;
        const file = await handle.getFile();
        const text = await file.text();
        this._initFromJSON(text);
        Tabs.getInstance().renderTabs();
        Explorer.getInstance().renderExplorer();
    }

    async saveToFile() {
        if (this._fileHandle) {
            const writable = await this._fileHandle.createWritable();
            await writable.write(this.toString());
            await writable.close();
        }
    }

    openFile(file: File|undefined) {

        const editor = Editor.getInstance();

        if (!file) {
            editor.setModel(null);
            this._activeFile = undefined;
            Tabs.getInstance().renderTabs();
            return;
        }

        if (!this._openTabs.includes(file)) {
            this._openTabs.push(file);
        }
        if (this._activeFile) {
            this._activeFile.position = editor.getPosition();
            this._activeFile.vertScrollPosition = editor.getScrollTop();
            this._activeFile.horizScrollPosition = editor.getScrollLeft();
        }
        this._activeFile = file;
        editor.setModel(file.model);
        if (this._activeFile.position) {
            editor.setPosition(this._activeFile.position);
            editor.setScrollTop(this._activeFile.vertScrollPosition);
            editor.setScrollLeft(this._activeFile.horizScrollPosition);
        }
        editor.focus();
        Tabs.getInstance().renderTabs();
    }

    closeFile(file: File) {
        this._openTabs.splice(this._openTabs.indexOf(file), 1);
        if (this._activeFile === file) this.openFile(this._openTabs[0]);
        Tabs.getInstance().renderTabs();
    }

    private *getFiles(node: Node): Generator<File> {
        if (node.type == NodeType.File) {
            yield node as File;
        } else if ((node as Folder).children) {
            for (const child of (node as Folder).children) {
                yield* this.getFiles(child);
            }
        }
    }

    public getFileFromUri(uri: monaco.Uri|undefined): File|undefined {
        const files = [...this.getFiles(this._node)];
        if (!uri) return;
        return files.find((file) => {
            return file.model.uri === uri;
        });
    }

    createFile(name: string, folder: Folder) {
        new File(name, folder, '');
        this.saveToFile();
    }

    createFolder(name: string, folder: Folder) {
        new Folder(name, folder);
        this.saveToFile();
    }

    toString(): string {
        return JSON.stringify({ root: this._dehydrate(this._node) });
    }

    private _initFromJSON(json: string): void {
        this._node = new Folder('');
        this._openTabs = [];
        this._activeFile = undefined;
        const input = JSON.parse(json);
        input.root.children.forEach((ch: any) => {
            this._node.addChild(this._hydrate(ch, this._node));
        });
    }

    private _hydrate(node: any, parent: Folder): Node {
        if (node.type == "folder") {
            const hydrated = new Folder(
                node.name,
                parent
            );
            node.children.forEach((ch: any) => {
                hydrated.addChild(this._hydrate(ch, hydrated));
            });
            return hydrated;
        } else {
            return new File(
                node.name,
                parent,
                node.content
            );
        }
    }

    private _dehydrate(node: Node): any {
        if (node.type == NodeType.Folder) {
            return {
                type: "folder",
                name: node.name,
                children: (node as Folder).children.map(this._dehydrate)
            };
        } else {
            return {
                type: "file",
                name: node.name,
                content: (node as File).model.getValue()
            };
        }
    }

    public getOpenTabs(): File[] {
        return this._openTabs;
    }

    public getActiveFile(): File | undefined {
        return this._activeFile;
    }
}
