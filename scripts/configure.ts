import { configCache } from "./configure_cache.ts";
import { configImportMap } from "./configure_import_map.ts";
import { configMakefiles } from "./configure_makefile.ts";
import { configNPM } from "./configure_npm.ts";
import { configPackageJSON } from "./configure_package.ts";
import { verifyWriteTextFile } from "./prompt.ts";

export type Env = Map<string, string>;
export type Set = (
  key: string,
) => (value: Promise<string> | string) => Promise<void>;

const envToString = async (env: Env) =>
  [...env.entries()].map((e) => e.join("=")).join("\n");

const env = new Map<string, string>();

const set: Set = (key: string) =>
  async (value: Promise<string> | string) => {
    env.set(key, await Promise.resolve(value));
  };

await configImportMap(set);
await configNPM(set);
await configCache(set);
await configPackageJSON(set);

await envToString(env)
  .then(verifyWriteTextFile(".env"))
  .then(configMakefiles);
