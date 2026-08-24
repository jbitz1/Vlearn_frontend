const fs = require('fs');
let content = fs.readFileSync('src/Components/Teacher/TeacherSideNav.jsx', 'utf8');
content = content.replace(/\];\n\s*\];/, '];');
fs.writeFileSync('src/Components/Teacher/TeacherSideNav.jsx', content);
