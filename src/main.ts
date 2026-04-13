import Editor from "./editor.js";
import Workspace from "./filesystem/workspace.js";
import Explorer from "./gui/explorer.js";

const editor = Editor.getInstance();
const workspace = Workspace.getInstance();
const explorer = Explorer.getInstance();

async function setup() {
    await workspace.fromUserFile();
}

document.getElementsByClassName("dropdown-toggle")[0].addEventListener('click', () => {
    setup();
});

editor.addAction(
    {
        id: 'buildHTMLProject',
        label: 'Build HTML Project',
        run: () => {
            const htmlContent = buildCombinedHTML();
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    }
);


function buildCombinedHTML(): string {
    throw new Error("Function not implemented.");
}

function compileTSProject(): string {
    throw new Error("Function not implemented.");
}
