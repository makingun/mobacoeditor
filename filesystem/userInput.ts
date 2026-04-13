import { File, Folder, Node } from "./node.js";

export default class UserInput {
    static createFile(parent: Folder) {
        const name = prompt('File Name:');
        if (name) {
            new File(name, parent, '');
        }
    }
    static createFolder(parent: Folder) {
        const name = prompt('Folder Name:');
        if (name) {
            new Folder(name, parent);
        }
    }
    static renameNode(node: Node) {
        const name = prompt('New Name:');
        if (name) {
            node.rename(name);
        }
    }
    static deleteNode(node: Node) {
        node.delete();
    }
}
