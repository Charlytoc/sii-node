import { exec } from "child_process";
import { createCompletionOpenAI } from "../modules/ai";

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  // 🔥 Reemplazar espacios y dos puntos con guiones bajos
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

function extractMarkdown(text: string): string {
  // Expresión regular para encontrar el contenido dentro de ```markdown ... ```
  const match = text.match(/```markdown\n(.*?)\n```/);

  if (match) {
    return match[1].trim();
  }

  return text.trim();
}

export async function formatMarkdown(
  markdownContent: string,
  from_company: string
): Promise<string> {
  console.log(
    `FerConsultorAI está terminando el markdown de la empresa ${from_company}...`
  );
  const markdown = await createCompletionOpenAI(
    "gpt-4o-mini",
    `You are a helpful assistant capable of formatting HTML content to markdown in an engaging way. Use rich formatting when needed, lists, headings, etc. Return only the markdown content, no other text or comments. If there are images present in the original content, include them in the resulting markdown file using the exact path provided in the original file. You need also to convert table into lists, after your formatting, Pandoc will be used to convert your response to docx.\n\n You can use a frontmatter to add the title and the date of the report. The title should be 'Reporte SII para ${from_company}' The author should be 'FerConsultorAI': Today is: ${getCurrentDateTime()}`,
    markdownContent
  );
  return extractMarkdown(markdown);
}

export async function convertMarkdownToDocx(
  markdown_path: string,
  plantilla_docx_path: string,
  output_docx_path: string
): Promise<string | null> {
  // """
  // Convierte un archivo Markdown a DOCX utilizando una plantilla personalizada.

  // Args:
  //     markdown_path (str): Ruta del archivo Markdown de entrada.
  //     plantilla_docx_path (str): Ruta del archivo de plantilla DOCX.
  //     output_docx_path (str): Ruta de salida para el archivo DOCX generado.

  // Returns:
  //     str: Ruta del archivo DOCX generado si la conversión fue exitosa.
  // """
  try {
    const command = [
      "pandoc",
      markdown_path,
      "-o",
      output_docx_path,
      "--reference-doc",
      plantilla_docx_path,
    ];
    await exec(command.join(" "));
    console.log(`Archivo DOCX generado correctamente en: ${output_docx_path}`);
    return output_docx_path;
  } catch (e) {
    console.log(`Error durante la conversión: ${e}`);
    return null;
  }
}
