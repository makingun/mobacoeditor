// function buildCombinedHTML() {

//     const files = [...getFiles(dehydrate(workspace.root))];

//     const htmlContent = files.filter(file => detectLanguage(file.name) === 'html');
//     const cssContent = files.filter(file => detectLanguage(file.name) === 'css');
//     const jsContent = files.filter(file => detectLanguage(file.name) === 'javascript');

//     if (htmlContent.length !== 1) {
//         throw new Error('Only exactly one html file allowed');
//     }

//     const doc = new DOMParser().parseFromString(htmlContent[0].content, "text/html");

//     // Check for parsing errors
//     if (doc.querySelector('parsererror')) {
//         alert('error');
//         throw new Error('Error parsing HTML');
//     }

//     cssContent.forEach((file) => {
//         const style = doc.createElement("style");
//         style.textContent = file.content;
//         doc.head.appendChild(style);
//     });

//     jsContent.forEach((file) => {
//         const script = doc.createElement("script");
//         script.textContent = file.content;
//         doc.body.appendChild(script);
//     });

//     // Return the combined HTML
//     return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
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
