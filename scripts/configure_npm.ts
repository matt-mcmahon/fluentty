import { accept, ask, defaultTo, prompt, retry } from "./prompt.ts";
import type { Set } from "./configure.ts";

export const configNPM = (set: Set) =>
  ask("NPM executable")
    .then(accept("npm", "pnpm", "yarn"))
    .then(defaultTo("npm"))
    .then(retry())
    .then(prompt)
    .then(set("NPM"));
