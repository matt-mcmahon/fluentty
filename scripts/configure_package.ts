import {
  accept,
  ask,
  defaultTo,
  forceWriteTextFile,
  prompt,
  retry,
} from "./prompt.ts";
import { exists } from "./remote/fs.ts";
import { join } from "./remote/path.ts";
import type { Set } from "./configure.ts";

// deno-lint-ignore no-explicit-any
type JSON = any;

const source = "package.json";
const target = "platform/node/package.json";

const readFile = (filePath: string) => Deno.readTextFile(filePath);
const stringifyJSON = async (data: JSON) => JSON.stringify(data, null, "\t");
const parseJSON = async (data: JSON) => JSON.parse(data);

const initNPM = async (cwd: string) => {
  const p = Deno.run({ cmd: ["npm", "init", "-y"], cwd, stdout: "null" });
  await p.status();
  p.close();
  return join(cwd, "package.json");
};

const setRepositoryDirectory = (json: JSON) => {
  json.repository.directory = "platform/node";
  return json;
};

const verifyPrivate = (json: JSON) =>
  ask("Is this a private repository")
    .then(accept("y", "n"))
    .then(defaultTo(json.private ? "y" : "n"))
    .then(prompt)
    .then((isPrivate) => ({ ...json, ...{ private: isPrivate === "y" } }));

const verifyName = (json: JSON) =>
  ask("Repository name")
    .then(defaultTo(json.name))
    .then(prompt)
    .then((name) => ({ ...json, ...{ name } }));

const verifyVersion = (json: JSON) =>
  ask("Repository version")
    .then(defaultTo(json.version))
    .then(prompt)
    .then((version) => ({ ...json, ...{ version } }));

export const configPackageJSON = async (set: Set) => {
  const defaultJSON = {
    type: "commonjs",
    main: "./build/index.js",
    types: "./build/index.d.ts",
    scripts: {
      build: "tsc",
      "build-development": "tsc",
      "build-production": "tsc -p tsconfig.production.json",
      prepack: "cat .gitignore .npmignore-additions > .npmignore",
      test: "tap ./test-build/**/*.test.js",
    },
    devDependencies: {
      "@types/node": "^14.11.4",
      typescript: "^4.0.3",
    },
  };

  const existingJSON = await Deno.readTextFile(target)
    .then(parseJSON)
    .catch(() => ({}));

  const newJSON = await initNPM(".")
    .then(readFile)
    .then(parseJSON)
    .then(setRepositoryDirectory);

  const denoVersion = await Deno.readTextFile("version.json")
    .then(parseJSON)
    .catch(() => null);

  const name = existingJSON.name ?? newJSON.name;
  const version = denoVersion ?? existingJSON.version ?? newJSON.version;

  const json = await exists(target)
    .then(() => ask(`${target} file exists`))
    .then(accept("overwrite", "merge", "cancel"))
    .then(defaultTo("merge"))
    .then(retry())
    .then(prompt).then((strategy) =>
      strategy === "overwrite"
        ? Object.assign({}, existingJSON, newJSON, defaultJSON)
        : strategy === "merge"
        ? Object.assign(
          {},
          existingJSON,
          newJSON,
          defaultJSON,
          { name, version },
        )
        : Promise.reject(new TypeError(strategy))
    )
    .then(verifyName)
    .then(verifyVersion)
    .then(verifyPrivate);

  return stringifyJSON(json)
    .then((json) => forceWriteTextFile(target, json))
    .then(() => Deno.remove(source))
    .then(() => set("NPM_PACKAGE_NAME")(json.name));
};
