require.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs" }
});

let editor;
let workspace;
let contextMenu;
let fileHandle;
let dropdownOpen = false;
let autoSaveTimeout;

/**
 * Duration to wait between changes until autosaving in seconds.
 */
const autoSaveDuration = 2;

const libURLs = [
    'https://unpkg.com/typescript@latest/lib/lib.d.ts',
    'https://cdn.jsdelivr.net/npm/monaco-editor@latest/monaco.d.ts'
];

require(["vs/editor/editor.main"], () => {

    monaco.editor.defineTheme("vscode-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: { "editor.background": "#1f1f1f" }
    });

    // Enable TypeScript Support
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        allowNonTsExtensions: true,
        strict: true,
        esModuleInterop: true,
        allowJs: false,
        allowImportingTsExtensions: true
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false
    });

    libURLs.forEach((url) => {
        fetch(url)
            .then(response => response.text())
            .then(typeDefinitions => {
                loadTSLibrary(typeDefinitions, `libs/${url.split('/').reverse()[0]}`);
            }).catch((e) => {
                alert('Error: ' + e);
            });
    });

    editor = monaco.editor.create(document.getElementById("editor"), {
        theme: "vscode-dark",
        automaticLayout: false,
        minimap: { enabled: true },
        fontSize: 12,
        tabSize: 4,
        insertSpaces: true,
        smoothScrolling: true,
        cursorSmoothCaretAnimation: true,
        copyWithSyntaxHighlighting: true,
        wrappingStrategy: "advanced"
    });

    editor.addAction({
        id: 'buildHTMLProject',
        label: 'Build HTML Project',
        run: () => {
            const htmlContent = buildCombinedHTML(); // Get this from your editor
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    });

    editor.addAction({
        id: 'buildTSProject',
        label: 'Build TS Project',
        run: () => {
            compileTSProject();
        }
    })

    layoutEditor();
    loadWorkspace(defaultProject());

    initAutoSave();

});

function loadTSLibrary(code, path) {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(code, path);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(code, path);
}

function layoutEditor() {
    const el = document.getElementById("editor");
    editor.layout({
        width: el.clientWidth,
        height: el.clientHeight
    });
}

window.addEventListener("resize", layoutEditor);

/* =========================
     MENU DROPDOWNS
========================= */

const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

dropdownToggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
        const dropdownMenu = toggle.nextElementSibling;
        const dropdownToggle = toggle;
        dropdownMenu.classList.toggle('show');
        dropdownToggle.classList.toggle('open');

        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach((menu) => {
            if (!menu.previousElementSibling.contains(e.target)) {
                menu.classList.remove('show');
                menu.previousElementSibling.classList.remove('open');
            }
        });

        dropdownOpen = !dropdownOpen;
        e.stopPropagation();
    });

    toggle.addEventListener('mouseover', (e) => {
        if (dropdownOpen) {
            const dropdownMenu = toggle.nextElementSibling;
            const dropdownToggle = toggle;
            dropdownMenu.classList.add('show');
            dropdownToggle.classList.add('open');
            dropdownOpen = true;

            const dropdownMenus = document.querySelectorAll('.dropdown-menu');
            dropdownMenus.forEach((menu) => {
                if (!menu.previousElementSibling.contains(e.target)) {
                    menu.classList.remove('show');
                    menu.previousElementSibling.classList.remove('open');
                }
            });
        }
    })
});

document.addEventListener('click', (e) => {
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach((menu) => {
        if (!menu.previousElementSibling.contains(e.target)) {
            menu.classList.remove('show');
            menu.previousElementSibling.classList.remove('open');
            dropdownOpen = false;
        }
    });
});

/* =========================
        FULLSCREEN
========================= */

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.body.requestFullscreen();

        screen.orientation.lock('landscape').catch((error) => {
            alert('Error locking orientation: ' + error);
        });
    }
}

/* =========================
         WORKSPACE
========================= */

function defaultProject() {
    return {
        root: {
            type: "folder",
            name: "",
            children: [
                {
                    type: "folder",
                    name: "src",
                    children: [
                        {
                            type: "file",
                            name: "main.js",
                            content: "console.log('Hello Mobaco');"
                        }
                    ]
                }
            ]
        }
    };
}

function loadWorkspace(project) {

    if (workspace) {
        disposeModels(workspace.root);
    }

    try {
        workspace = {
            root: hydrate(project.root),
            openTabs: [],
            activeFile: null
        };
        renderExplorer();
    } catch (e) {
        alert("Error: " + e.stack);
    }
    renderTabs();
}

async function openProject() {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{ accept: { "text/mep": [".mep"] } }]
        });

        fileHandle = handle;
        const file = await handle.getFile();
        const text = await file.text();

        loadWorkspace(JSON.parse(text));
    } catch (e) {
        alert("Error: " + e.stack);
    }

}

function disposeModels(node) {
    if (node.type === "folder") {
        return {
            type: "folder",
            name: node.name,
            children: node.children.map(disposeModels)
        };
    }

    const text = node.model.getValue();
    node.model.dispose();

    return {
        type: "file",
        name: node.name,
        content: text
    };
}

function dehydrate(node) {
    if (node.type === "folder") {
        return {
            type: "folder",
            name: node.name,
            children: node.children.map(dehydrate)
        };
    }

    const text = node.model.getValue();

    return {
        type: "file",
        name: node.name,
        content: text
    };
}

async function saveProject(allowNewFile) {
    try {
        if (allowNewFile) {
            if (!fileHandle) {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: "untitled.mep",
                    types: [{ accept: { "text/mep": [".mep"] } }]
                });
            }
        } else {
            if (!fileHandle) return;
        }
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify({ root: dehydrate(workspace.root) }));
        await writable.close();
        workspace.openTabs.forEach((file) => {
            file.dirty = false;
        });
        renderTabs();
    } catch (e) {
        alert("Error: " + e.stack);
    }
}

function hydrate(node, parent = null, path = 'file:/') {

    const fullPath = `${path}/${node.name}`;

    if (node.type === "folder") {
        return {
            type: "folder",
            name: node.name,
            parent,
            expanded: true,
            path: fullPath,
            children: node.children.map(c => hydrate(c, node, fullPath))
        };
    }

    const virtualFilePath = monaco.Uri.parse(fullPath);

    const model = monaco.editor.createModel(node.content, detectLanguage(node.name), virtualFilePath);
    model.onDidChangeContent(() => {
        workspace.activeFile.dirty = true;
        renderTabs();
    });

    return {
        type: "file",
        name: node.name,
        parent,
        model,
        position: null,
        scrollPos: { top: null, left: null },
        dirty: false,
        path: fullPath
    };
}

function* getFiles(node) {
    if (node.type === 'file') {
        yield node;
    } else if (node.children) {
        for (const child of node.children) {
            yield* getFiles(child);
        }
    }
}

function buildCombinedHTML() {

    try {

        const files = [...getFiles(dehydrate(workspace.root))];

        const htmlContent = files.filter(file => detectLanguage(file.name) === 'html');
        const cssContent = files.filter(file => detectLanguage(file.name) === 'css');
        const jsContent = files.filter(file => detectLanguage(file.name) === 'javascript');

        if (htmlContent.length > 1) {
            alert('Only one html file allowed');
        }

        const doc = new DOMParser().parseFromString(htmlContent[0].content, "text/html");

        // Check for parsing errors
        if (doc.querySelector('parsererror')) {
            alert('error');
            throw new Error('Error parsing HTML');
        }

        cssContent.forEach((file) => {
            const style = doc.createElement("style");
            style.textContent = file.content;
            doc.head.appendChild(style);
        });

        jsContent.forEach((file) => {
            const script = doc.createElement("script");
            script.textContent = file.content;
            doc.body.appendChild(script);
        });

        // Return the combined HTML
        return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
    } catch (e) {
        alert("Error: " + e);
    }
}

async function compileTSProject() {

    try {

        const files = {};

        for (const file of getFiles(workspace.root)) {
            if (file.name.endsWith(".ts")) {
                files[file.path] = file.model.getValue();
            }
        }

        const compilerHost = {
            fileExists: fileName => files[fileName] !== undefined,
            readFile: fileName => files[fileName],
            getSourceFile: (fileName, languageVersion) => {
                if (!files[fileName]) return undefined;

                return ts.createSourceFile(
                    fileName,
                    files[fileName],
                    languageVersion
                );
            },
            writeFile: (filePath, content) => {
                alert("Compiled: " + filePath);
                alert(content);

                const name = filePath.replace('.js', '').replaceAll('file:///', '').replaceAll('/', '-');
                var output = doc.createElement('script');

                output.type = 'module';
                output.id = name;
                output.textContent = content;

                
                alert(name);
                alert(`<!DOCTYPE html>\n${}`);
            },
            getDefaultLibFileName: () => "lib.d.ts",
            useCaseSensitiveFileNames: () => true,
            getCanonicalFileName: f => f,
            getCurrentDirectory: () => "",
            getNewLine: () => "\n",
            getDirectories: () => []
        };

        const program = ts.createProgram(Object.keys(files), {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2020
        }, compilerHost);

        program.emit();
    } catch (e) {
        alert(e.stack);
    }
}

async function exportProject() {
    let exportHandle = await window.showSaveFilePicker({
        suggestedName: "index.html",
        types: [{ accept: { "text/html": [".html"] } }]
    });
    const writable = await exportHandle.createWritable();
    await writable.write(buildCombinedHTML());
    await writable.close();
}

/* =========================
   LANGUAGE DETECTION
========================= */

function detectLanguage(name) {
    const ext = name.split(".").pop();
    return {
        js: "javascript",
        ts: "typescript",
        json: "json",
        md: "markdown",
        html: "html",
        css: "css"
    }[ext] || "plaintext";
}

/* =========================
   EXPLORER
========================= */

function renderExplorer() {
    const el = document.getElementById("explorer");
    el.innerHTML = "";
    renderNode(el, workspace.root);
}

function renderNode(container, node) {
    const row = document.createElement("div");
    row.className = "node" + (node.type === "folder" ? " folder" : "");
    row.appendChild(document.createElement("span"));
    row.firstElementChild.textContent = node.name || "WORKSPACE";
    row.oncontextmenu = e => openExplorerMenu(e, node);

    if (node.type === "folder") {

        const dropIcon = document.createElement("span");
        dropIcon.classList = "codicon codicon-chevron-down";
        row.firstElementChild.prepend(dropIcon);

        row.onclick = () => {
            node.expanded = !node.expanded;
            renderExplorer();
        };
        container.appendChild(row);

        if (node.expanded) {
            dropIcon.classList.replace('codicon-chevron-right', 'codicon-chevron-down');
            const children = document.createElement("div");
            children.className = "children";
            node.children.forEach(c => renderNode(children, c));
            container.appendChild(children);
        } else {
            dropIcon.classList.replace('codicon-chevron-down', 'codicon-chevron-right');
        }
    }

    if (node.type === "file") {
        row.onclick = () => openFile(node);
        container.appendChild(row);
    }
}

/* =========================
           TABS
========================= */

function openFile(file) {
    if (!workspace.openTabs.includes(file)) {
        workspace.openTabs.push(file);
    }
    if (workspace.activeFile) {
        workspace.activeFile.position = editor.getPosition();
        workspace.activeFile.scrollPos.top = editor.getScrollTop();
        workspace.activeFile.scrollPos.left = editor.getScrollLeft();
    }
    workspace.activeFile = file;
    editor.setModel(file.model);
    if (workspace.activeFile.position) {
        editor.setPosition(workspace.activeFile.position);
        editor.setScrollTop(workspace.activeFile.scrollPos.top);
        editor.setScrollLeft(workspace.activeFile.scrollPos.left);
    }
    editor.focus();
    renderTabs();
    renderStatus();
}

function updateCursorPos(line, column) {
    const cursorPos = document.getElementById('cursor-position')
    if (cursorPos) {
        cursorPos.textContent = `Ln ${line}, Col ${column}`;
    }
}

function renderStatus() {
    const statusRight = document.getElementById('status-right');

    if (workspace.activeFile) {
        if (!document.getElementById('cursor-position')) {
            const cursorPos = document.createElement("span");
            const position = editor.getPosition();
            cursorPos.id = "cursor-position";
            cursorPos.style.flex = 1;
            cursorPos.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;

            statusRight.appendChild(cursorPos);
        }
    }
}

function renderTabs() {
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = "";

    workspace.openTabs.forEach(file => {
        const tab = document.createElement("div");
        tab.className = "tab" + (file === workspace.activeFile ? " active" : "");
        tab.textContent = file.dirty ? "● " : "";
        tab.append(file.name);

        const close = document.createElement("a");
        close.className = "codicon codicon-close close";
        close.onclick = e => {
            e.stopPropagation();
            closeTab(file);
        };

        tab.appendChild(close);
        tab.onclick = () => openFile(file);
        tab.oncontextmenu = e => openTabMenu(e, file);
        tabs.appendChild(tab);
    });
}

function closeTab(file) {
    workspace.openTabs = workspace.openTabs.filter(f => f !== file);
    if (workspace.activeFile === file) {
        workspace.activeFile = workspace.openTabs[0] || null;

        if (workspace.activeFile) {
            workspace.activeFile.position = editor.getPosition();
        }
        editor.setModel(workspace.activeFile?.model || null);
        editor.setPosition(workspace.activeFile?.position || null);

    }
    renderTabs();
}

/* =========================
       CONTEXT MENUS
========================= */

function openExplorerMenu(e, node) {
    e.preventDefault();
    closeContextMenu();

    contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";
    contextMenu.style.top = e.clientY + "px";
    contextMenu.style.left = e.clientX + "px";

    if (node.type === "folder") {
        addMenuItem("New File", () => createFile(node));
        addMenuItem("New Folder", () => createFolder(node));
    }

    if (node !== workspace.root) {
        addMenuItem("Rename", () => renameNode(node));
        addMenuItem("Delete", () => deleteNode(node));
    }

    document.body.appendChild(contextMenu);
}

function openTabMenu(e, file) {
    e.preventDefault();
    closeContextMenu();

    contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";
    contextMenu.style.top = e.clientY + "px";
    contextMenu.style.left = e.clientX + "px";

    addMenuItem("Close", () => closeTab(file));
    addMenuItem("Close Others", () => {
        workspace.openTabs = [file];
        openFile(file);
    });

    document.body.appendChild(contextMenu);
}

function addMenuItem(label, action) {
    const item = document.createElement("div");
    item.textContent = label;
    item.onclick = () => {
        action();
        closeContextMenu();
    };
    contextMenu.appendChild(item);
}

function closeContextMenu() {
    if (contextMenu) contextMenu.remove();
    contextMenu = null;
}

document.addEventListener("click", closeContextMenu);

/* =========================
          FILE OPS
========================= */

function createFile(folder) {
    const name = prompt("File name?");
    if (!name) return;

    let file = hydrate(
        {
            type: 'file',
            name: name,
            content: ''
        },
        folder,
        folder.path
    );

    folder.children.push(file);
    renderExplorer();
    openFile(file);
}

function createFolder(folder) {
    const name = prompt("Folder name?");
    if (!name) return;

    let dir = hydrate({
        type: "folder",
        name,
        parent: folder,
        expanded: true,
        children: []
    },
        folder,
        folder.path
    );

    folder.children.push(dir);
    renderExplorer();
    renderTabs();
}

function renameNode(node) {
    const name = prompt("New name", node.name);
    if (!name) return;

    node.name = name;
    if (node.type === "file") {
        monaco.editor.setModelLanguage(node.model, detectLanguage(name));
    }
    renderExplorer();
    renderTabs();
}

function deleteNode(node) {
    const parent = node.parent;
    parent.children = parent.children.filter(c => c !== node);
    if (node.type === "file") {
        closeTab(node);
        node.model.dispose();
    }
    renderExplorer();
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'S' && !e.shiftKey) {
        e.preventDefault();
        saveProject(true);
    }
    if (e.ctrlKey && e.key === 'O') {
        e.preventDefault();
        openProject();
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        exportProject();
    }
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

function initAutoSave() {
    editor.onDidChangeModelContent(() => {
        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => saveProject(false), (autoSaveDuration * 1000)); // Save after 1 second of inactivity
    });
}
