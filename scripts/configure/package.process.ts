import { configPackageJSON } from "./package.ts";
import { makeSetter } from "../utils.ts";

const [tempDir = "./temp"] = Deno.args;

const [get, set] = makeSetter();

try {
  await configPackageJSON(set, {
    sourceDir: tempDir + "/source",
    targetDir: tempDir + "/target",
  });
} catch (err) {
  console.error(err);
}

console.log(JSON.stringify(get()));
