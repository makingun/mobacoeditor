import Workspace from "./filesystem/workspace.js";

export default class Editor {
    private static _instance: Editor;
    private _monacoEditor: monaco.editor.IStandaloneCodeEditor;

    static thn: monaco.editor.ICodeEditorOpener;

    private constructor() {

        this._configureEditor();

        this._monacoEditor = monaco.editor.create(
            document.getElementById("editor") || new HTMLElement(),
            {
                theme: "vscode-dark",
                automaticLayout: false,
                minimap: { enabled: true },
                fontSize: 12,
                tabSize: 4,
                insertSpaces: true,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                copyWithSyntaxHighlighting: true,
                wrappingStrategy: "advanced"
            }
        );
        this._monacoEditor.setModel(null);
    }

    private _configureEditor() {
        monaco.editor.defineTheme("vscode-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#1f1f1f",
                // "menu.background": "#1f1f1f",
                // "menu.selectionBackground": "#0078d4"
            }
        });

        // Enable TypeScript Support
        monaco.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.typescript.ScriptTarget.ES2020,
            module: monaco.typescript.ModuleKind.ESNext,
            moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
            allowNonTsExtensions: true,
            strict: true,
            esModuleInterop: true,
            allowJs: false,
            allowImportingTsExtensions: false
        });

        monaco.editor.registerEditorOpener({
            openCodeEditor: (source, resource, selectionOrPosition) => {
                const workspace = Workspace.getInstance();
                const target = workspace.getFileFromUri(resource);
                if (target) {
                    workspace.openFile(target);
                } else {
                    return Promise.resolve(false);
                }
                if (selectionOrPosition instanceof monaco.Position) {
                    source.setPosition(selectionOrPosition);
                } else if (selectionOrPosition instanceof monaco.Selection) {
                    source.setSelection(selectionOrPosition);
                } else {
                    return Promise.resolve(false);
                }
                return Promise.resolve(true);
            }
        });

        monaco.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false
        });
    }

    public static getInstance(): monaco.editor.IStandaloneCodeEditor {
        if (!Editor._instance) {
            Editor._instance = new Editor();
        }
        return Editor._instance._monacoEditor;
    }

}
