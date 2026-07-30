import { randomInt } from "crypto";

/**
 * Palavras simples e fáceis de ler/digitar (sem acentos) para compor a senha.
 * A senha é definitiva: a assinante pode trocar depois no app ou usar
 * "esqueci minha senha".
 */
const WORDS = [
  "Graca",
  "Luz",
  "Fe",
  "Paz",
  "Alma",
  "Vida",
  "Ceu",
  "Amor",
  "Flor",
  "Aurora",
  "Louvor",
  "Manha",
  "Doce",
  "Serena",
  "Brilho",
  "Semente",
  "Jardim",
  "Estrela",
  "Caminho",
  "Esperanca",
];

const SYMBOLS = "!@#$&*";

function pick<T>(list: readonly T[]): T {
  return list[randomInt(list.length)];
}

/**
 * Gera uma senha definitiva, forte e fácil de digitar.
 * Formato: Palavra + Palavra + 3 dígitos + símbolo (ex.: LuzJardim482!)
 */
export function generateMemorablePassword(): string {
  let first = pick(WORDS);
  let second = pick(WORDS);
  while (second === first) second = pick(WORDS);
  const digits = String(randomInt(100, 1000));
  const symbol = SYMBOLS[randomInt(SYMBOLS.length)];
  return `${first}${second}${digits}${symbol}`;
}
