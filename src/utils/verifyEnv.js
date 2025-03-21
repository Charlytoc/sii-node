const fs = require("fs");
const readline = require("readline");

const envFile = ".env";

// Verificar si el archivo .env ya existe
if (fs.existsSync(envFile)) {
    console.log(`✅ El archivo ${envFile} ya existe. No se necesita crear uno nuevo.`);
} else {
    // Crear la interfaz de lectura de la terminal
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Pedir la clave de OpenAI al usuario
    rl.question("Ingrese su clave de OpenAI: ", (apiKey) => {
        rl.close();
        const trimmedKey = apiKey.trim();

        // Crear el archivo .env con la clave
        fs.writeFileSync(envFile, `OPENAI_API_KEY=${trimmedKey}\n`, { encoding: "utf-8" });

        console.log(`✅ Archivo ${envFile} creado con éxito.`);
    });
}
