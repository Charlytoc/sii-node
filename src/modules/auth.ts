import { chromium, Browser, Page } from "playwright";

const LOGIN_PAGE = "https://misiir.sii.cl/cgi_misii/siihome.cgi";

export async function login(
  rut: string,
  clave: string
): Promise<{ browser: Browser; page: Page } | null> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🌍 Navegando a la página de login...");
  await page.goto(LOGIN_PAGE);

  console.log("✍️ Ingresando credenciales...");
  await page.fill("#rutcntr", rut);
  await page.fill("#clave", clave);

  console.log("🔄 Haciendo clic en el botón de ingresar...");
  await Promise.all([
    page.click("#bt_ingresar"),
    page.waitForNavigation({ waitUntil: "networkidle" }),
  ]);

  // Verificar si el login fue exitoso
  const loginError = await page.locator("div.alert-danger").count();
  if (loginError > 0) {
    console.error(
      "❌ Error en el inicio de sesión. Verifica las credenciales."
    );
    await browser.close();
    return null;
  }

  console.log("✅ ¡Inicio de sesión exitoso!");
  return { browser, page };
}
