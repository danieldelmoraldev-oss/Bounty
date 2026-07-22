import type { ChallengeDifficulty } from "@bounty/shared";

export interface ChallengeTemplate {
  id: string;
  difficulty: ChallengeDifficulty;
  prompt: string;
}

// Banco fijo para el MVP (Fase 3). Más adelante se puede usar la clave de
// OpenAI ya guardada en el servidor para generar/variar retos; de momento
// esto es rápido, gratis y no depende de que la IA responda a tiempo.
export const CHALLENGE_BANK: ChallengeTemplate[] = [
  { id: "d1-01", difficulty: 1, prompt: "Hazte una foto brindando con alguien que no conocías de antes." },
  { id: "d1-02", difficulty: 1, prompt: "Foto de grupo con las manos formando un corazón." },
  { id: "d1-03", difficulty: 1, prompt: "Grafía un objeto random del sitio y explica en el pie de foto por qué te ha llamado la atención." },
  { id: "d1-04", difficulty: 1, prompt: "Hazle una foto a la mejor pinta de la noche hasta ahora (comida, bebida o look)." },
  { id: "d1-05", difficulty: 1, prompt: "Foto con alguien haciendo la misma pose que tú." },
  { id: "d1-06", difficulty: 1, prompt: "Grafía el ambiente del sitio en un plano general." },
  { id: "d2-01", difficulty: 2, prompt: "Hazle una foto a alguien que se parezca a un famoso (aunque sea un poco)." },
  { id: "d2-02", difficulty: 2, prompt: "Consigue que alguien del grupo baile 5 segundos para la cámara." },
  { id: "d2-03", difficulty: 2, prompt: "Foto con un desconocido haciendo la misma cara de sorpresa." },
  { id: "d2-04", difficulty: 2, prompt: "Grafía a alguien pidiendo algo en la barra/mostrador." },
  { id: "d2-05", difficulty: 2, prompt: "Hazte una foto imitando la pose de una estatua o cuadro cercano." },
  { id: "d2-06", difficulty: 2, prompt: "Consigue un chócala (high five) con alguien que no sea de tu grupo, en foto." },
  { id: "d3-01", difficulty: 3, prompt: "Graba a alguien pidiendo una canción al DJ o poniéndola en la app de música del sitio." },
  { id: "d3-02", difficulty: 3, prompt: "Consigue que un camarero o camarera aparezca en una foto contigo." },
  { id: "d3-03", difficulty: 3, prompt: "Haz un mini-concurso de bailes con alguien del grupo y grábalo." },
  { id: "d3-04", difficulty: 3, prompt: "Consigue que un desconocido te enseñe su mejor truco o talento en vídeo." },
  { id: "d3-05", difficulty: 3, prompt: "Foto de grupo recreando la carátula de un disco famoso." },
  { id: "d4-01", difficulty: 4, prompt: "Canta (aunque sea mal) una estrofa de una canción para la cámara." },
  { id: "d4-02", difficulty: 4, prompt: "Consigue que te firmen la mano o el brazo con boli y foto del resultado." },
  { id: "d4-03", difficulty: 4, prompt: "Graba una entrevista de 15 segundos a un amigo preguntándole por qué es el mejor de la noche." },
  { id: "d4-04", difficulty: 4, prompt: "Intercambia una prenda (gorra, chaqueta, pulsera) con un desconocido y foto de los dos." },
  { id: "d4-05", difficulty: 4, prompt: "Haz que un grupo entero de desconocidos salga en una foto gritando el nombre de vuestro grupo." },
  { id: "d5-01", difficulty: 5, prompt: "Declárale tu amor eterno (en broma) a un desconocido delante de la cámara." },
  { id: "d5-02", difficulty: 5, prompt: "Baila una canción entera sin paras, grábalo aunque sea en varios trozos." },
  { id: "d5-03", difficulty: 5, prompt: "Pide el número de teléfono a un desconocido solo para presumir en el grupo (foto de la cara al pedirlo)." },
  { id: "d5-04", difficulty: 5, prompt: "Consigue que el DJ o camarero diga el nombre de tu grupo por el micro o en voz alta, grábalo." },
  { id: "d5-05", difficulty: 5, prompt: "Recrea la escena más dramática de una peli con dos desconocidos como actores de apoyo, en vídeo." },
];

export function pickRandomTemplate(
  difficulty: ChallengeDifficulty,
  excludeId?: string,
): ChallengeTemplate {
  const pool = CHALLENGE_BANK.filter(
    (t) => t.difficulty === difficulty && t.id !== excludeId,
  );
  const candidates = pool.length > 0 ? pool : CHALLENGE_BANK.filter((t) => t.difficulty === difficulty);
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}
