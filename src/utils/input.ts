import readlineSync from "readline-sync";

export function getInput(message: string, defaultValue?: string) {
  return readlineSync.question(message, { defaultInput: defaultValue });
}
