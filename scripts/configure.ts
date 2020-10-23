import { configPackageJSON } from "./package.ts";
import {
  accept,
  ask,
  defaultTo,
  prompt,
  retry,
  verifyWriteTextFile,
} from "./prompt.ts";
import { exists } from "./remote/fs.ts";
import { link } from "./makefile.ts";

export type Env = Map<string, string>;
export type Set = (key: string) => (value: string) => Promise<void>;

const source = "package.json";
const target = "platform/node/package.json";

const createEmptyImportMap = (filename: string) =>
  verifyWriteTextFile(filename)(JSON.stringify({ imports: {} }, null, "\t"));

const configImportMap = async (set: Set) =>
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

const configNPM = (set: Set) =>
  ask("NPM executable")
    .then(accept("npm", "pnpm", "yarn"))
    .then(defaultTo("npm"))
    .then(retry())
    .then(prompt)
    .then(set("NPM"));

const configCache = (set: Set) =>
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

const configMakefiles = () =>
  ask(
    "Use symlinks for Makefiles in project-root and platform/[name]/* folders",
  )
    .then(accept("y", "n"))
    .then(defaultTo("y"))
    .then(retry())
    .then(prompt)
    .then((y) => {
      if (y === "y") {
        return Promise.all([
          link("scripts/makefiles/deno.mk", "Makefile"),
          link("../../scripts/makefiles/node.mk", "platform/node/Makefile"),
        ]);
      }
    });

export async function configEnv() {
  const env = new Map<string, string>();

  const set: Set = (key: string) =>
    async (value: string) => {
      env.set(key, value);
    };

  await configImportMap(set);
  await configNPM(set);
  await configCache(set);
  return env;
}

const envToString = async (env: Env) =>
  [...env.entries()].map((e) => e.join("=")).join("\n");

await configEnv()
  .then(async (env) => {
    const packageName = await configPackageJSON(source, target);
    return env.set("NPM_PACKAGE_NAME", packageName);
  })
  .then(envToString)
  .then(verifyWriteTextFile(".env"));

await configMakefiles();
