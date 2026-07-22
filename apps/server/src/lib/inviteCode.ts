import { Group } from "../models/Group.ts";

// Solo letras (el concepto es un código de 5 letras), sin I/O para evitar
// confusión al leerlas o dictarlas en voz alta.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ".replace(/[IO]/g, "");
const CODE_LENGTH = 5;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueGroupCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const exists = await Group.exists({ code });
    if (!exists) return code;
  }
  throw new Error("No se pudo generar un código de grupo único");
}
