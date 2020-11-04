import type { SetEnv } from "../configure.ts";
import {
  acceptPartial,
  ask,
  askYesNo,
  defaultTo,
  done,
  forceWriteTextFile,
  prompt,
  retry,
  stdout,
} from "../prompt.ts";
import { exists } from "../../remote/fs.ts";
import { join } from "../../remote/path.ts";
import { assert } from "../../remote/asserts.ts";
import type { JSONData } from "../utils.ts";

const commonJSON = {
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

const readFile = (filePath: string) => Deno.readTextFile(filePath);
const parseJSON = async (data: JSONData) => JSON.parse(data);

const initNPM = async (cwd: string) => {
  const p = Deno.run({ cmd: ["npm", "init", "-y"], cwd, stdout: "null" });
  await p.status();
  p.close();
  return join(cwd, "package.json");
};

const setRepositoryDirectory = (directory: string) =>
  (json: JSONData) => {
    if (json.repository) json.repository.directory = directory;
    return json;
  };

const verifyPrivate = (json: JSONData) =>
  askYesNo("Is this a private repository")
    .then(defaultTo(json.private ? "yes" : "no"))
    .then(prompt)
    .then((isPrivate) => ({ ...json, ...{ private: isPrivate === "yes" } }));

const verifyName = (json: JSONData) =>
  ask("Repository name")
    .then(defaultTo(json.name))
    .then(prompt)
    .then((name) => ({ ...json, ...{ name } }));

const verifyVersion = (json: JSONData) =>
  ask("Repository version")
    .then(defaultTo(json.version))
    .then(prompt)
    .then((version) => ({ ...json, ...{ version } }));

const overwriteTargetFile = (targetFile: string) =>
  exists(targetFile)
    .then((exists) =>
      exists
        ? ask(`${targetFile} file exists`)
          .then(acceptPartial("overwrite", "merge", "cancel"))
          .then(defaultTo("merge"))
          .then(retry())
          .then(prompt)
        : "overwrite"
    );

export async function configPackageJSON(
  set: SetEnv,
  { sourceDir = ".", targetDir = "platform/node" } = {},
) {
  const configure = await askYesNo("Automatically Configure package.json Files")
    .then(defaultTo("yes"))
    .then(prompt)
    .then((yes) => yes === "yes");

  if (!configure) return;

  const sourceFile = sourceDir + "/package.json";
  const targetFile = targetDir + "/package.json";

  assert(exists(sourceDir), `ERROR: source dir, ${sourceDir}, does not exist`);
  assert(exists(targetDir), `ERROR: target dir, ${sourceDir}, does not exist`);

  const overwrite = await overwriteTargetFile(targetFile);

  if (overwrite === "cancel") return;

  const existingJSON = overwrite === "merge"
    ? await Deno.readTextFile(targetFile)
      .then(parseJSON).catch(() => ({}))
    : {};

  const newJSON = await initNPM(sourceDir)
    .then(readFile)
    .then(parseJSON)
    .then(setRepositoryDirectory(sourceDir));

  const denoVersion = await Deno.readTextFile("version.json")
    .then(parseJSON)
    .catch(() => null);

  const name = existingJSON.name ?? newJSON.name;
  const version = denoVersion ?? existingJSON.version ?? newJSON.version;

  const json = Object.assign(
    {},
    commonJSON,
    newJSON,
    existingJSON,
    { name, version },
  );

  return verifyName(json)
    .then(verifyVersion)
    .then(verifyPrivate)
    .then((json) => {
      forceWriteTextFile(targetFile, JSON.stringify(json));
      return json.name;
    })
    .then(set("NPM_PACKAGE_NAME"))
    .then(done)
    .finally(() => Deno.remove(sourceFile));
}
