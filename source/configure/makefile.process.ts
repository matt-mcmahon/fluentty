import { forceWriteTextFile } from "../prompt.ts";
import { configMakefiles } from "./makefile.ts";

const [tempDir = "temp"] = Deno.args;

const path1 = `${tempDir}/path1.mk`;
const path2 = `${tempDir}/path2.mk`;

await configMakefiles([
  [path1, `all: overwrite ${path1}`],
  [path2, `all: overwrite ${path2}`],
]);
