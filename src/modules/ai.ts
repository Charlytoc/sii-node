import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables de entorno desde un archivo .env

export async function createCompletionOpenAI(
  model: string = "gpt-4o",
  systemPrompt: string = "You are a helpful assistant.",
  userPrompt: string = "Write a haiku about recursion in programming.",
  apiKey: string = process.env.OPENAI_API_KEY as string
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "❌ API Key de OpenAI no encontrada. Asegúrate de definir 'OPENAI_API_KEY' en tu entorno."
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return (
      completion.choices[0]?.message?.content || "⚠️ No se recibió respuesta."
    );
  } catch (error) {
    console.error("❌ Error al obtener la respuesta de OpenAI:", error);
    return "⚠️ Error al generar la respuesta.";
  }
}
