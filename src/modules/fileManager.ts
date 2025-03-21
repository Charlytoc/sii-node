import fs from "fs";
import path from "path";

export class FileManager {
  private targetDirectoryPath: string;

  constructor(targetDirectoryPath: string) {
    this.targetDirectoryPath = targetDirectoryPath;
    this.init();
  }

  // Inicializa el directorio base (lo crea si no existe)
  private init() {
    if (!fs.existsSync(this.targetDirectoryPath)) {
      fs.mkdirSync(this.targetDirectoryPath, { recursive: true });
      console.log(`📁 Directory created: ${this.targetDirectoryPath}`);
    }
  }

  // Crea un archivo si no existe dentro del directorio base
  create(relativeFilePath: string): string {
    const fullFilePath = path.join(this.targetDirectoryPath, relativeFilePath);

    if (!fs.existsSync(fullFilePath)) {
      fs.writeFileSync(fullFilePath, "", "utf-8");
      console.log(`📄 File created: ${fullFilePath}`);
    } else {
      console.log(`✅ File already exists: ${fullFilePath}`);
    }

    return fullFilePath;
  }

  getDirectory() {
    return this.targetDirectoryPath;
  }

  read(relativeFilePath: string) {
    const fullFilePath = path.join(this.targetDirectoryPath, relativeFilePath);
    return fs.readFileSync(fullFilePath, "utf-8");
  }

  // Agrega contenido a un archivo dentro del directorio base
  append(relativeFilePath: string, content: string) {
    const fullFilePath = path.join(this.targetDirectoryPath, relativeFilePath);

    if (!fs.existsSync(fullFilePath)) {
      console.warn(`⚠️ File does not exist. Creating: ${fullFilePath}`);
      this.create(relativeFilePath);
    }

    fs.appendFileSync(fullFilePath, content + "\n", "utf-8");
  }
}
