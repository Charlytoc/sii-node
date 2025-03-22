const fs = require('fs');
const path = require('path');
const os = require('os');

const workingDir = process.cwd();
const desktopPath = path.join(os.homedir(), 'Desktop');
const batFilePath = path.join(desktopPath, 'run_sii.bat');

const batContent = `@echo off
cd /d "${workingDir}"
echo Working Directory: ${workingDir}
npm run start
pause
`;

fs.writeFile(batFilePath, batContent, (err) => {
    if (err) {
        console.error('Error al crear el archivo BAT:', err);
    } else {
        console.log(`Archivo creado en: ${batFilePath}`);
    }
});
