import { configCache } from "./configure/cache.ts";
import { configImportMap } from "./configure/import_map.ts";
import { configMakefiles } from "./configure/makefile.ts";
import { configNPM } from "./configure/npm.ts";
import { configPackageJSON } from "./configure/package.ts";
import { verifyWriteTextFile } from "./prompt.ts";

import denoMk from "./makefiles/deno.ts";
import nodeMk from "./makefiles/node.ts";

export type Env = Map<string, string>;

const envToString = async (env: Env) =>
  [...env.entries()].map((e) => e.join("=")).join("\n");

const env = new Map<string, string>();

export type Set = typeof set;

const set = (key: string) =>
  async (value: string) => {
    env.set(key, await Promise.resolve(value));
    return value;
  };

await configImportMap(set);
await configNPM(set);
await configCache(set);
await configPackageJSON(set);

await envToString(env)
  .then(verifyWriteTextFile(".env"))
  .then();

await configMakefiles([
  ["Makefile", denoMk],
  ["platform/node/Makefile", nodeMk],
]);