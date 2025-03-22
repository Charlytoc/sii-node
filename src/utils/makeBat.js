const fs = require('fs');
const path = require('path');
const os = require('os');

const workingDir = process.cwd();
const desktopPath = path.join(os.homedir(), 'Desktop');
const batFilePath = path.join(desktopPath, 'run_sii.bat');

// Ruta típica de instalación de Git Bash en Windows
const gitBashPath = `"C:\\Program Files\\Git\\bin\\bash.exe"`;

const batContent = `@echo off
${gitBashPath} -c "cd '${workingDir}' && npm run start"
`;

fs.writeFile(batFilePath, batContent, (err) => {
    if (err) {
        console.error('Error al crear el archivo BAT:', err);
    } else {
        console.log(`Archivo creado en: ${batFilePath}`);
    }
});
