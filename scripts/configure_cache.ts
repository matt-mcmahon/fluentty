import { accept, ask, defaultTo, prompt, retry } from "./prompt.ts";
import { Set } from "./configure.ts";

export const configCache = (set: Set) =>
  ask("Enable local Deno cache")
    .then(accept("y", "n"))
    .then(defaultTo("y"))
    .then(retry())
    .then(prompt)
    .then(async (input) => {
      return input === "y" && ask("Local Deno cache directory")
        .then(defaultTo(".deno"))
        .then(prompt)
        .then(set("DENO_DIR"))
        .then(() => ask("Lock-File Name"))
        .then(defaultTo("lock_file.json"))
        .then(prompt)
        .then(set("LOCK_FILE"));
    });
