import { Page } from "playwright";
import path from "path";
import { FileManager } from "./fileManager";

export async function checkCorreoVigenteModal(
  page: Page,
  fileManager: FileManager
): Promise<boolean> {
  console.log("🔍 Verificando modal de actualización de datos...");

  const modalSelector = "#myMainCorreoVigente";

  try {
    // Esperar si la modal aparece
    const modal = await page.waitForSelector(modalSelector, { timeout: 5000 });

    if (modal) {
      console.log("📸 Modal detectada. Tomando captura de pantalla...");

      const modalPath = path.join(
        fileManager.getDirectory(),
        "actualizacion_datos_pendiente.png"
      );
      await modal.screenshot({ path: modalPath });

      // Guardar en el archivo de reporte
      fileManager.append(
        "report.md",
        `## ⚠️ ACCIÓN REQUERIDA: ACTUALIZACIÓN DE DATOS PENDIENTE\n\n`
      );
      fileManager.append(
        "report.md",
        `> Es necesario actualizar los datos. Chequear imagen adjunta.\n\n`
      );
      fileManager.append(
        "report.md",
        `![Actualización de datos pendiente](${modalPath})\n\n`
      );

      // 🔥 Ocultar la modal usando JavaScript para evitar bloqueos
      console.log("🛠 Ocultando modal de actualización en la interfaz...");
      await page.evaluate(() => {
        const modal = document.querySelector(
          "#myMainCorreoVigente"
        ) as HTMLElement;
        if (modal) {
          modal.style.display = "none !important";
          modal.style.visibility = "hidden !important";

          modal.remove();
        }
      });

      console.log("✅ Modal de actualización oculta.");
    }
    return true;
  } catch (error) {
    console.log(
      "✅ No se detectó la modal de actualización de datos, continuando..."
    );
    return false;
  }
}

export async function modalCaptured(
  page: Page,
  fileManager: FileManager
): Promise<boolean> {
  console.log("🔍 Buscando modal emergente...");

  const modalSelector = "#ModalEmergente .modal-content";
  const closeButtonSelector = "#ModalEmergente button.close";

  try {
    // Esperar hasta que la modal aparezca
    const modal = await page.waitForSelector(modalSelector, { timeout: 5000 });

    if (modal) {
      console.log("📸 Modal detectada. Tomando captura de pantalla...");
      const modalPath = path.join(
        fileManager.getDirectory(),
        "modal_emergente_cerrada.png"
      );
      await modal.screenshot({ path: modalPath });

      const modalText = await modal.innerText();

      // Guardar información en el archivo de reporte
      fileManager.append("report.md", `## Modal emergente detectada\n\n`);
      fileManager.append("report.md", `![Modal emergente](${modalPath})\n\n`);
      fileManager.append(
        "report.md",
        `## Contenido del modal:\n\n${modalText}\n\n`
      );

      console.log("❌ Cerrando modal...");
      await page.click(closeButtonSelector);
    }
    return true;
  } catch (error) {
    console.log("✅ No se detectó modal, continuando...");
    return false;
  }
}

export async function takeScreenshotOfResponsibilities(
  page: Page,
  fileManager: FileManager
): Promise<void> {
  console.log("📸 Intentando capturar responsabilidades tributarias...");

  const selector = "#contenidoObligaciones";

  try {
    const element = await page.waitForSelector(selector, { timeout: 10000 });

    if (element) {
      const screenshotPath = path.join(
        fileManager.getDirectory(),
        "responsabilidades_tributarias.png"
      );
      await element.screenshot({ path: screenshotPath });

      // Guardar referencia en el archivo Markdown
      fileManager.append("report.md", `## Responsabilidades tributarias\n\n`);
      fileManager.append(
        "report.md",
        `![Responsabilidades tributarias](${screenshotPath})\n\n`
      );

      console.log(`✅ Captura guardada en: ${screenshotPath}`);
    }
  } catch (error) {
    console.log("⚠️ No se encontró el elemento #contenidoObligaciones.");
  }
}

export async function captureTaxpayerData(
  page: Page,
  fileManager: FileManager
): Promise<void> {
  console.log("📸 Capturando datos personales y tributarios...");

  const boxUserInfoSelector = "#box_profile";
  const menuDatosContribuyenteSelector = "#menu_datos_contribuyente";

  try {
    // 📌 Abrir la sección de datos del contribuyente
    const datosPersonalesButton = await page.waitForSelector(
      menuDatosContribuyenteSelector,
      { timeout: 10000 }
    );
    await datosPersonalesButton.click();

    // 🕵️ Esperar a que aparezca el perfil
    const profileDiv = await page.waitForSelector(boxUserInfoSelector, {
      timeout: 10000,
    });
    const profileText = await profileDiv.innerText();
    const profilePath = path.join(
      fileManager.getDirectory(),
      "datos_personales.png"
    );
    await profileDiv.screenshot({ path: profilePath });

    // 📝 Guardar en Markdown
    fileManager.append(
      "report.md",
      `## Datos personales y tributarios del contribuyente\n\n`
    );
    fileManager.append("report.md", `${profileText}\n\n---\n\n`);
    fileManager.append(
      "report.md",
      `![Datos personales y tributarios](${profilePath})\n\n`
    );

    console.log("✅ ¡Captura de datos personales y tributarios guardada!");
  } catch (error) {
    console.error("⚠️ Error al capturar los datos del contribuyente:", error);
  }
}

const selectors = [
  {
    opener: "a[href='#collapse1Cntrb']",
    content: "div[id='divdirection']",
    name: "Direcciones",
  },
  {
    opener: "a[href='#collapse11Cntrb']",
    content: "div[id='collapse11Cntrb']",
    name: "Teléfonos y Correos Electrónicos",
  },
  {
    opener: "a[href='#collapse2Cntrb']",
    content: "div[id='collapse2Cntrb']",
    name: "Inicio de Actividades y término de giro",
  },
  {
    opener: "a[href='#collapse3Cntrb']",
    content: "div[id='collapse3Cntrb']",
    name: "Representantes legales",
  },
  {
    opener: "a[href='#collapse4Cntrb']",
    content: "div[id='collapse4Cntrb']",
    name: "Socios y Capital",
  },
  {
    opener: "a[href='#collapse6Cntrb']",
    content: "div[id='collapse6Cntrb']",
    name: "Actividades Económicas",
  },
  {
    opener: "a[href='#collapse7Cntrb']",
    content: "div[id='collapse7Cntrb']",
    name: "Sociedades a las que pertenece el contribuyente",
  },
  {
    opener: "a[href='#collapse13Cntrb']",
    content: "div[id='collapse13Cntrb']",
    name: "Características del contribuyente",
  },
  {
    opener: "a[href='#collapse14Cntrb']",
    content: "div[id='collapse14Cntrb']",
    name: "Apoderados de Grupos Empresariales",
  },
  {
    opener: "a[href='#collapse10Cntrb']",
    content: "div[id='collapse10Cntrb']",
    name: "Documentos tributarios autorizados",
  },
  {
    opener: "a[href='#collapse14Cntrb']",
    content: "div[id='collapse14Cntrb']",
    name: "Bienes Raíces",
  },
  {
    opener: "a[href='#collapse9Cntrb']",
    content: "div[id='collapse9Cntrb']",
    name: "Oficina del SII para trámites presenciales",
  },
];

export async function processSelectors(
  page: Page,
  fileManager: FileManager
): Promise<void> {
  console.log("📌 Procesando selectores...");

  for (let index = 0; index < selectors.length; index++) {
    const { opener, content, name } = selectors[index];

    try {
      // Intentar hacer clic en el opener
      const openerElement = await page.waitForSelector(opener, {
        timeout: 10000,
      });
      await openerElement.click();
      console.log(`Procesando sección '${name}'...`);

      // Esperar a que el contenido cargue
      await page.waitForSelector(content, { timeout: 5000 });

      // Extraer el contenido HTML
      const contentElement = await page.$(content);
      const contentHtml = contentElement
        ? await contentElement.innerHTML()
        : "⚠️ Contenido no encontrado";

      // Guardar en archivo Markdown
      fileManager.append("report.md", `### Sección ${index + 1} - ${name}\n\n`);
      fileManager.append("report.md", contentHtml);
      fileManager.append("report.md", "\n\n---\n\n");

      // Cerrar el opener (haciendo clic de nuevo)
      await openerElement.click();
      console.log(`✅ Sección '${name}' procesada y cerrada.`);

      // Esperar un poco para evitar bloqueos
      await page.waitForTimeout(2000);
    } catch (error) {
      console.error(`❌ [${index + 1}] Error al procesar '${opener}':`, error);
    }
  }

  console.log("🏁 Proceso de selectores completado.");
}

export async function captureF29Form(
  page: Page,
  fileManager: FileManager
): Promise<void> {
  console.log("📌 Obteniendo formulario F29...");

  try {
    // Navegar a "Servicios Online"
    const serviciosOnline = await page.waitForSelector(
      "a[href='https://www.sii.cl/servicios_online/']",
      { timeout: 10000 }
    );
    await serviciosOnline.click();
    console.log("✅ Servicios online encontrado y clickeado.");

    // Navegar a "Impuestos Mensuales"
    const impuestosMensuales = await page.waitForSelector(
      "a[id='linkpadre_1042']",
      { timeout: 10000 }
    );
    await impuestosMensuales.click();
    console.log("✅ Impuestos mensuales encontrado y clickeado.");

    // Navegar a "Consulta y Seguimiento (F29 y F50)"
    const consultaSeguimiento = await page.waitForSelector(
      "a[href='1042-3266.html']",
      { timeout: 10000 }
    );
    await consultaSeguimiento.click();
    console.log("✅ Consulta y seguimiento encontrado y clickeado.");

    // Navegar a "Consulta Integral F29"
    const consultaIntegralF29 = await page.waitForSelector(
      "//a[text()='Consulta Integral F29']",
      { timeout: 20000 }
    );
    await consultaIntegralF29.click();
    console.log("✅ Consulta integral F29 encontrado y clickeado.");

    // Esperar que el enlace "F29 (+)" esté disponible
    const f29 = await page.waitForSelector("//a[text()='F29 (+)']", {
      timeout: 20000,
    });
    console.log("✅ F29 encontrado.");

    let FOUND_PROBLEMS = false;

    // Verificar si hay alertas en el formulario
    if (await page.$(".gw-panel-center-alert")) {
      console.log(
        "⚠️ Se encontró el elemento 'gw-panel-center-alert', hay que chequear el formulario F29."
      );
      FOUND_PROBLEMS = true;
    } else {
      console.log("✅ No se encontró el elemento '.gw-panel-center-alert'.");
    }

    await f29.click();

    // Esperar que el contenido del formulario cargue
    await page.waitForSelector("div.gw-par", { timeout: 20000 });

    // Capturar el formulario
    const formulario = await page.waitForSelector(
      "table.gw-sii-tabla-interior",
      { timeout: 20000 }
    );
    const screenshotPath = path.join(
      fileManager.getDirectory(),
      "f29_form.png"
    );
    await formulario.screenshot({ path: screenshotPath });

    // Guardar en Markdown
    fileManager.append("report.md", "## Formulario F29 \n\n");
    if (FOUND_PROBLEMS) {
      fileManager.append(
        "report.md",
        "> ⚠️ **Problemas encontrados en el formulario F29, por favor chequear manualmente.**\n\n"
      );
    } else {
      fileManager.append(
        "report.md",
        "> ✅ **Aparentemente no se encontraron problemas en el formulario F29, chequear imagen adjunta.**\n\n"
      );
    }
    fileManager.append("report.md", `![Formulario F29](${screenshotPath})\n\n`);

    console.log("✅ ¡Screenshot del formulario F29 guardado!");
  } catch (error) {
    console.error("❌ Error al capturar el formulario F29:", error);
  }
}

export async function captureDeclarations(
  page: Page,
  fileManager: FileManager,
  companyName: string
): Promise<void> {
  console.log("📌 Obteniendo Declaraciones Juradas...");

  try {
    // Ir a la página de servicios online
    await page.goto("https://www.sii.cl/servicios_online/");

    // Click en "Declaraciones Juradas"
    const declaracionesJuradas = await page.waitForSelector(
      "a[id='linkpadre_1043']",
      { timeout: 10000 }
    );
    await declaracionesJuradas.click();
    console.log("✅ Declaraciones Juradas encontrado y clickeado.");

    // Click en "Declaraciones Juradas Renta"
    const declaracionesJuradasRenta = await page.waitForSelector(
      "a[href='1043-1518.html']",
      { timeout: 10000 }
    );
    await declaracionesJuradasRenta.click();
    console.log("✅ Declaraciones Juradas Renta encontrado y clickeado.");

    // Click en "Consulta Declaraciones Juradas"
    const consultaDeclaracionesJuradas = await page.waitForSelector(
      "a[href='#collapseConsultas']",
      { timeout: 10000 }
    );
    await consultaDeclaracionesJuradas.click();
    console.log("✅ Consulta Declaraciones Juradas encontrado y clickeado.");

    // Ir a la página de consulta
    await page.goto("https://www4.sii.cl/djconsultarentaui/internet/#/");

    // Esperar que la tabla de consulta cargue
    const consultaEstadoGiros = await page.waitForSelector("#consulta", {
      timeout: 100000,
    });
    console.log("✅ Consulta Estado Giros Emitidos encontrado.");

    // Esperar 5 segundos extra para asegurar que la página está completamente cargada
    await page.waitForTimeout(5000);

    console.log("📸 Tomando screenshot de la tabla...");
    const screenshotPath = path.join(
      fileManager.getDirectory(),
      "consulta_estado_giros_emitidos.png"
    );
    await consultaEstadoGiros.screenshot({ path: screenshotPath });

    let FOUND_PROBLEMS = false;

    // Verificar si existe un elemento con el texto "Observada"
    if (await page.$("//span[text()='Observada']")) {
      console.log(
        `⚠️ Se encontraron declaraciones "Observadas" en la empresa ${companyName}.`
      );
      FOUND_PROBLEMS = true;
    } else {
      console.log("✅ No se encontraron declaraciones 'Observadas'.");
    }

    // Guardar en Markdown
    fileManager.append(
      "report.md",
      "## Consulta estado y giros emitidos (declaraciones juradas de renta) \n\n"
    );
    if (FOUND_PROBLEMS) {
      fileManager.append(
        "report.md",
        "> ⚠️ **Problemas encontrados en el estado de las declaraciones juradas de la empresa, se encontraron declaraciones observadas.**\n\n"
      );
    } else {
      fileManager.append(
        "report.md",
        "> ✅ **Aparentemente no se encontraron problemas en el estado de las declaraciones juradas de la empresa, chequear imagen adjunta para confirmar.**\n\n"
      );
    }
    fileManager.append(
      "report.md",
      `![Consulta estado y giros emitidos](${screenshotPath})\n\n`
    );

    console.log("✅ ¡Screenshot de consulta estado y giros emitidos guardado!");
  } catch (error) {
    console.error("❌ Error al capturar las declaraciones juradas:", error);
  }
}

export async function captureDeclarationStatus(
  page: Page,
  fileManager: FileManager
): Promise<void> {
  console.log(
    "📌 Consultando estado de declaración de los últimos 3 períodos..."
  );

  try {
    // Ir a la página de servicios online
    await page.goto("https://www.sii.cl/servicios_online/");

    // Click en "Declaración de Renta"
    const declaracionRenta = await page.waitForSelector(
      "a[id='linkpadre_1044']",
      { timeout: 10000 }
    );
    await declaracionRenta.click();
    console.log("✅ Declaración de Renta encontrado y clickeado.");

    // Click en "Consulta y Seguimiento"
    const consultaSeguimiento = await page.waitForSelector(
      "a[href='1044-2696.html']",
      { timeout: 10000 }
    );
    await consultaSeguimiento.click();
    console.log("✅ Consulta y Seguimiento encontrado y clickeado.");

    // Click en "Consultar Estado de Declaración"
    const consultarEstado = await page.waitForSelector(
      "a[href='https://www4.sii.cl/consultaestadof22ui/']",
      { timeout: 10000 }
    );
    await consultarEstado.click();
    console.log("✅ Consultar Estado de Declaración encontrado y clickeado.");

    const selectUrl = "https://www4.sii.cl/consultaestadof22ui/";

    // Iterar sobre los 3 últimos períodos
    for (let i = 0; i < 3; i++) {
      // Esperar el select y seleccionar la opción `i`
      const selectElement = await page.waitForSelector("select.form-control", {
        timeout: 15000,
      });
      await page.waitForTimeout(5000);
      await selectElement.selectOption({ index: i });

      // Click en el botón "Consultar"
      const botonConsultar = await page.waitForSelector(
        "#formulario-periodo button",
        { timeout: 10000 }
      );
      await botonConsultar.click();

      // Esperar que el contenido cargue
      const cuerpo = await page.waitForSelector("div.web-sii.cuerpo", {
        timeout: 10000,
      });
      await page.waitForTimeout(5000);

      // Capturar la pantalla del resultado
      const screenshotPath = path.join(
        fileManager.getDirectory(),
        `consulta_estado_declaracion_${i + 1}.png`
      );
      await cuerpo.screenshot({ path: screenshotPath });

      // Guardar en Markdown
      fileManager.append(
        "report.md",
        `## Consulta estado de declaración ${i + 1} \n\n`
      );
      fileManager.append(
        "report.md",
        `![Consulta estado de declaración ${i + 1}](${screenshotPath})\n\n`
      );

      console.log(
        `✅ Captura de consulta estado de declaración ${i + 1} guardada.`
      );

      // Volver a la URL inicial antes de la siguiente iteración
      await page.goto(selectUrl);
      await page.waitForTimeout(5000);
    }

    console.log("🏁 Proceso de consulta de estado de declaración completado.");
  } catch (error) {
    console.error("❌ Error al capturar el estado de declaración:", error);
  }
}
