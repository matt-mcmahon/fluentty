import { Set } from "../configure.ts";
import { ask, askYesNo, defaultTo, ifYes, prompt } from "../prompt.ts";

async function acceptDenoDir(set: Set) {
  await ask("Local Deno cache directory")
    .then(defaultTo(".deno"))
    .then(prompt)
    .then(set("DENO_DIR"))
    .then(() => ask("Lock-File Name"))
    .then(defaultTo("lock_file.json"))
    .then(prompt)
    .then(set("LOCK_FILE"));
}

export async function configCache(set: Set) {
  await askYesNo("Enable local Deno cache")
    .then(defaultTo("yes"))
    .then(prompt)
    .then(ifYes(() => acceptDenoDir(set)));
}