// import Editor from "../editor.js";

// function updateCursorPos(line, column) {
//     const cursorPos = document.getElementById('cursor-position')
//     if (cursorPos) {
//         cursorPos.textContent = `Ln ${line}, Col ${column}`;
//     }
// }

// function renderStatus() {
//     const statusRight = document.getElementById('status-right');

//     if (workspace.activeFile) {
//         if (!document.getElementById('cursor-position')) {
//             const cursorPos = document.createElement("span");
//             const position = editor.getPosition();
//             cursorPos.id = "cursor-position";
//             cursorPos.style.flex = 1;
//             cursorPos.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;

//             statusRight.appendChild(cursorPos);
//         }
//     }
// }

// Editor.getInstance().onDidChangeCursorPosition((i) => {
//     const pos = i.position;
//     updateCursorPos(pos.lineNumber, pos.column);
// })
