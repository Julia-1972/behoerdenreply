import { ru } from "./ru";
import { de } from "./de";

export type Lang = "ru" | "de";

export const dictionaries = { ru, de };

export type Dictionary = typeof ru;
