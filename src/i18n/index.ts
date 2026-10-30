import { bn } from "./bn";
import { en } from "./en";

export type Language = "bn" | "en";
export type TranslationKey = keyof typeof bn;

export const translations = { bn, en };

export function getTranslation(lang: Language = "bn") {
  return translations[lang] || translations.bn;
}
