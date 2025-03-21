import { login } from "./modules/auth";
import { FileManager } from "./modules/fileManager";
import { getInput } from "./utils/input";
import path from "path";
import fs from "fs";
import inquirer from "inquirer";
import {
  convertMarkdownToDocx,
  formatMarkdown,
  getCurrentDateTime,
  slugify,
} from "./utils/lib";
import {
  captureDeclarations,
  captureDeclarationStatus,
  captureF29Form,
  captureTaxpayerData,
  checkCorreoVigenteModal,
  modalCaptured,
  processSelectors,
  takeScreenshotOfResponsibilities,
} from "./modules/scraper";

const SII_REPORTS_DIRECTORY = path.join(process.cwd(), "reports");
const EMPRESAS_CSV = path.join(process.cwd(), "config", "empresas.csv");

async function processCompany(rut: string, clave: string, company: string) {
  console.log(`\n=== 🏢 Procesando empresa: ${company} ===`);

  try {
    const targetDirectory = path.join(
      SII_REPORTS_DIRECTORY,
      slugify(company),
      getCurrentDateTime()
    );
    const fileManager = new FileManager(targetDirectory);
    fileManager.create("report.md");

    console.log("🔑 Iniciando sesión en SII...");
    const returns = await login(rut, clave);
    if (!returns) {
      console.error(
        "❌ No se pudo iniciar sesión. Verifique sus credenciales."
      );
      return;
    }

    const { browser, page } = returns;

    console.log("✅ Sesión iniciada correctamente.");

    await checkCorreoVigenteModal(page, fileManager);
    await modalCaptured(page, fileManager);
    await takeScreenshotOfResponsibilities(page, fileManager);
    await captureTaxpayerData(page, fileManager);
    await processSelectors(page, fileManager);
    await captureF29Form(page, fileManager);
    await captureDeclarations(page, fileManager, company);
    await captureDeclarationStatus(page, fileManager);

    console.log("🚪 Cerrando navegador...");
    await browser.close();

    const formattedMarkdown = await formatMarkdown(
      fileManager.read("report.md"),
      company
    );

    fileManager.create("formatted_report.md");
    fileManager.append("formatted_report.md", formattedMarkdown);

    await convertMarkdownToDocx(
      path.join(targetDirectory, "formatted_report.md"),
      path.join(process.cwd(), "config", "plantilla.docx"),
      path.join(targetDirectory, "report.docx")
    );

    console.log(`✅ Empresa ${company} procesada exitosamente.\n`);
  } catch (error) {
    console.error(`⚠️ Error procesando empresa ${company}:`, error);
  }
}

async function main() {
  console.log("=== 🏢 Bienvenido al Bot de Automatización SII ===");

  const { processType } = await inquirer.prompt([
    {
      type: "list",
      name: "processType",
      message: "¿Desea procesar una empresa o varias?",
      choices: [
        "Procesar una empresa",
        "Seleccionar empresas desde CSV",
        "Procesar todas las empresas desde CSV",
        "Salir",
      ],
    },
  ]);

  if (processType === "Salir") {
    console.log("👋 Hasta luego!");
    process.exit(0);
  }

  if (processType === "Procesar una empresa") {
    const rut = await getInput("Ingrese su RUT: ");
    const clave = await getInput("Ingrese su clave: ");
    const company = await getInput("Ingrese el nombre de la empresa: ");

    await processCompany(rut, clave, company);
    process.exit(0);
  }

  if (!fs.existsSync(EMPRESAS_CSV)) {
    console.error(
      `❌ El archivo ${EMPRESAS_CSV} no existe. Verifique la ruta.`
    );
    process.exit(1);
  }

  const companies: { name: string; rut: string; clave: string }[] = [];
  const csvData = fs.readFileSync(EMPRESAS_CSV, "utf-8");

  csvData.split("\n").forEach((line, index) => {
    if (index === 0 || !line.trim()) return; // Saltar encabezado y líneas vacías
    const [name, rut, clave] = line.split(",");
    if (name && rut && clave) {
      companies.push({
        name: name.trim(),
        rut: rut.trim(),
        clave: clave.trim(),
      });
    }
  });

  if (companies.length === 0) {
    console.error("❌ No se encontraron empresas en el archivo CSV.");
    process.exit(1);
  }

  let selectedCompanies: { name: string; rut: string; clave: string }[];

  if (processType === "Seleccionar empresas desde CSV") {
    const { selected } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "Seleccione las empresas a procesar:",
        choices: companies.map((c) => ({ name: c.name, value: c })),
      },
    ]);

    if (selected.length === 0) {
      console.log("⚠️ No se seleccionaron empresas. Saliendo...");
      process.exit(0);
    }

    selectedCompanies = selected;
  } else {
    selectedCompanies = companies; // Procesar todas las empresas
  }

  // Elegir si procesar en paralelo o secuencialmente
  const { processMode } = await inquirer.prompt([
    {
      type: "list",
      name: "processMode",
      message: "¿Cómo desea procesar las empresas?",
      choices: [
        { name: "🔄 Procesar en paralelo (más rápido)", value: "parallel" },
        { name: "⏳ Procesar una por una (más seguro)", value: "sequential" },
      ],
    },
  ]);

  if (processMode === "parallel") {
    await Promise.all(
      selectedCompanies.map((company) =>
        processCompany(company.rut, company.clave, company.name)
      )
    );
  } else {
    for (const company of selectedCompanies) {
      await processCompany(company.rut, company.clave, company.name);
    }
  }

  console.log("🏁 Procesamiento de empresas completado.");
}

main();
