import type { SetEnv } from "../configure.ts";
import {
  ask,
  askYesNo,
  defaultTo,
  ifNo,
  ifYes,
  prompt,
  verifyWriteTextFile,
} from "../prompt.ts";

function createEmptyImportMap(filename: string) {
  return verifyWriteTextFile(filename)(
    JSON.stringify({ imports: {} }, null, "\t"),
  );
}

async function noImportMap(set: SetEnv) {
  await set("IMPORT_MAP")(""); // set empty string to disable
}

async function useImportMap(set: SetEnv) {
  await ask("Import-map filename")
    .then(defaultTo("import_map.json"))
    .then(prompt)
    .then(set("IMPORT_MAP"))
    .then(createEmptyImportMap);
}

export async function configImportMap(set: SetEnv) {
  await askYesNo("Use an import-map")
    .then(defaultTo("no"))
    .then(prompt)
    .then(ifNo(() => noImportMap(set)))
    .then(ifYes(() => useImportMap(set)));
}
