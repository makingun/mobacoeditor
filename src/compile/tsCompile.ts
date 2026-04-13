// function modifyImports(scriptString, modifierFn) {
//     // Regular expression to match import statements
//     const importRegex = /import\s+[\s\S]*?\s+['"]([^'"]+)['"]/g;

//     return scriptString.replace(importRegex, (match, importPath) => {
//         const newPath = modifierFn(importPath);
//         return match.replace(importPath, newPath);
//     });
// }

// async function compileTSProject() {

//     try {

//         const doc = new DOMParser().parseFromString(buildCombinedHTML(), "text/html");

//         const importMap = { imports: {}, };

//         const files = {};

//         for (const file of getFiles(workspace.root)) {
//             if (file.name.endsWith(".ts")) {
//                 files[file.path] = file.model.getValue();
//             }
//         }

//         const compilerHost = {
//             fileExists: fileName => files[fileName] !== undefined,
//             readFile: fileName => files[fileName],
//             getSourceFile: (fileName, languageVersion) => {
//                 if (!files[fileName]) return undefined;

//                 return ts.createSourceFile(
//                     fileName,
//                     files[fileName],
//                     languageVersion
//                 );
//             },
//             writeFile: (filePath, content) => {

//                 const entry = (filePath == "file:///src/main.js");

//                 let path = filePath.split('/');
//                 path.pop();

//                 const modified = modifyImports(content, (importPath) => {
//                     if (importPath.startsWith('./')) {
//                         return `${path.join('/')}${importPath.substring(1)}`;
//                     }
//                     return importPath;
//                 });

//                 if (entry) {
//                     var output = doc.createElement('script');
//                     output.type = 'module';
//                     output.textContent = modified;

//                     doc.body.appendChild(output);
//                 } else {
//                     importMap.imports[filePath] = `data:text/javascript,${modified}`;
//                 }
//             },
//             getDefaultLibFileName: () => "lib.d.ts",
//             useCaseSensitiveFileNames: () => true,
//             getCanonicalFileName: f => f,
//             getCurrentDirectory: () => "",
//             getNewLine: () => "\n",
//             getDirectories: () => []
//         };

//         const program = ts.createProgram(Object.keys(files), {
//             module: ts.ModuleKind.ESNext,
//             target: ts.ScriptTarget.ES2020
//         }, compilerHost);

//         await program.emit();

//         const impmap = doc.createElement('script');
//         impmap.type = "importmap";
//         impmap.textContent = JSON.stringify(importMap);

//         doc.head.appendChild(impmap);

//         return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
//     } catch (e) {
//         return `<html><body>Error Compiling: ${e.stack}</body></html>`;
//     }
// }



// async function exportProject() {
//     let exportHandle = await window.showSaveFilePicker({
//         suggestedName: "index.html",
//         types: [{ accept: { "text/html": [".html"] } }]
//     });
//     const writable = await exportHandle.createWritable();
//     await writable.write(buildCombinedHTML());
//     await writable.close();
// }
