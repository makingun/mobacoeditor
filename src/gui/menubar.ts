// const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

// dropdownToggles.forEach((toggle) => {
//     toggle.addEventListener('click', (e) => {
//         const dropdownMenu = toggle.nextElementSibling;
//         const dropdownToggle = toggle;
//         dropdownMenu.classList.toggle('show');
//         dropdownToggle.classList.toggle('open');

//         const dropdownMenus = document.querySelectorAll('.dropdown-menu');
//         dropdownMenus.forEach((menu) => {
//             if (!menu.previousElementSibling.contains(e.target)) {
//                 menu.classList.remove('show');
//                 menu.previousElementSibling.classList.remove('open');
//             }
//         });

//         dropdownOpen = !dropdownOpen;
//         e.stopPropagation();
//     });

//     toggle.addEventListener('mouseover', (e) => {
//         if (dropdownOpen) {
//             const dropdownMenu = toggle.nextElementSibling;
//             const dropdownToggle = toggle;
//             dropdownMenu.classList.add('show');
//             dropdownToggle.classList.add('open');
//             dropdownOpen = true;

//             const dropdownMenus = document.querySelectorAll('.dropdown-menu');
//             dropdownMenus.forEach((menu) => {
//                 if (!menu.previousElementSibling.contains(e.target)) {
//                     menu.classList.remove('show');
//                     menu.previousElementSibling.classList.remove('open');
//                 }
//             });
//         }
//     })
// });

// document.addEventListener('click', (e) => {
//     const dropdownMenus = document.querySelectorAll('.dropdown-menu');
//     dropdownMenus.forEach((menu) => {
//         if (!menu.previousElementSibling.contains(e.target)) {
//             menu.classList.remove('show');
//             menu.previousElementSibling.classList.remove('open');
//             dropdownOpen = false;
//         }
//     });
// });
