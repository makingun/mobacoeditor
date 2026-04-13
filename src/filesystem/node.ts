import { LangUtils } from '../utils/lang.js';

/**
 * Enum for node types.
 */
export enum NodeType {
    Folder,
    File
}

/**
 * Base class for file system nodes.
 */
export class Node {
    /**
     * Private name property.
     * @private
     */
    private _name: string;

    /**
     * Type of the node.
     */
    private _type: NodeType;

    /**
     * Private parent property.
     * @private
     */
    private _parent: Folder | undefined;

    /**
     * Path of the node.
     */
    path: string;

    /**
     * Creates a new node.
     * @param {string} name Name of the node.
     * @param {NodeType} type Type of the node.
     * @param {Folder} [parent] Parent folder.
     */
    constructor(name: string, type: NodeType, parent?: Folder) {
        this._name = name;
        this._type = type;
        this._parent = parent;
        this.path = (parent?.path || '') + '/' + name;
        this._parent?.addChild(this);
    }

    /**
     * Gets the name of the node.
     * @returns {string} Name of the node.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets the type of the node.
     * @returns {NodeType} Type of the node (Folder, File).
     */
    get type(): NodeType {
        return this._type;
    }

    /**
     * Gets the parent folder of the node.
     * @returns {Folder|undefined} Parent folder or undefined if root.
     */
    get parent(): Folder | undefined {
        return this._parent;
    }

    /**
     * Sets the parent folder of the node.
     * @param {Folder|undefined} parent New parent folder.
     */
    set parent(parent: Folder | undefined) {
        this._parent = parent;
        this.path = (parent?.path || '') + '/' + this._name;
    }

    /**
     * Renames the node.
     */
    rename(name: string): void {
        if (!name || typeof name !== 'string') return;
        this._name = name;
        this.path = (this._parent?.path || '') + '/' + name;
    }

    /**
     * Deletes the node.
     */
    delete(): void {
        if (this._parent) {
            this._parent.removeChild(this);
        }
    }

    /**
     * Returns a string representation of the node.
     * @returns {string} String representation of the node.
     */
    toString(): string {
        return `${this.path} (${NodeType[this._type]})`;
    }
}

/**
 * Represents a file in the file system.
 */
export class File extends Node {
    /**
     * Monaco editor model.
     */
    model: monaco.editor.ITextModel;

    position: monaco.Position | null = null;

    dirty: boolean = false;

    vertScrollPosition: number = 0;
    horizScrollPosition: number = 0;

    /**
     * Creates a new file.
     * @param {string} name Name of the file.
     * @param {Folder} parent Parent folder.
     * @param {string} content Content of the file.
     */
    constructor(name: string, parent: Folder, content: string) {
        super(name, NodeType.File, parent);
        this.model = monaco.editor.createModel(
            content,
            LangUtils.detectLanguage(name),
            monaco.Uri.parse(this.path)
        );
    }

    static fromNode(node: Node): File {
        if (!node.parent) {throw new Error('Node must have a parent to become a file')}
        return new File(node.name, node.parent, '');
    }

    /**
     * Deletes the file.
     */
    override delete(): void {
        this.model.dispose();
        super.delete();
    }

    override rename(name: string) {
        const newModel = monaco.editor.createModel(
            this.model.getValue(),
            LangUtils.detectLanguage(name),
            monaco.Uri.parse(
                this.model.uri.toString()
                .replace(this.name, name)
            )
        );

        this.model.dispose();
        this.model = newModel;

        super.rename(name);
    }
}

/**
 * Represents a folder in the file system.
 */
export class Folder extends Node {
    /**
     * Children nodes.
     */
    children: Node[] = [];

    /**
     * Is the folder expanded?
     */
    expanded: boolean = false;

    /**
     * Creates a new folder.
     * @param {string} name Name of the folder.
     * @param {Folder} [parent] Parent folder.
     */
    constructor(name: string, parent?: Folder, path?: string) {
        super(name, NodeType.Folder, parent);
        if (path) this.path = path;
    }

    static fromNode(node: Node): Folder {
        return new Folder(node.name, node.parent);
    }

    /**
     * Adds a child node to the folder.
     * @param {Node} child Child node.
     */
    addChild(child: Node): void {
        if (this.children.includes(child)) return;
        this.children.push(child);
        child.parent = this;
    }

    /**
     * Removes a child node from the folder.
     * @param {Node} child Child node.
     */
    removeChild(child: Node): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = undefined;
        }
    }
}
