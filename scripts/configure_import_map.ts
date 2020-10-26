import {
  accept,
  ask,
  defaultTo,
  prompt,
  retry,
  verifyWriteTextFile,
} from "./prompt.ts";
import { exists } from "./remote/fs.ts";
import { Set } from "./configure.ts";

const createEmptyImportMap = (filename: string) =>
  verifyWriteTextFile(filename)(JSON.stringify({ imports: {} }, null, "\t"));

export const configImportMap = async (set: Set) =>
  ask("Use an import-map")
    .then(accept("y", "n"))
    .then(defaultTo("n"))
    .then(retry())
    .then(prompt)
    .then(async (input) =>
      input === "n"
        ? set("IMPORT_MAP")("") // set empty string to disable
        : ask("Import-map filename")
          .then(defaultTo("import_map.json"))
          .then(prompt)
          .then(async (filename) =>
            Promise.all([
              exists(filename)
                .then(async (exists: boolean) =>
                  exists === false && createEmptyImportMap(filename)
                ),
              set("IMPORT_MAP")(filename),
            ])
          )
    );
