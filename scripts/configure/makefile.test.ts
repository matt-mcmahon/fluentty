import { assertEquals } from "../../remote/asserts.ts";
import { exists } from "../../remote/fs.ts";
import { forceWriteTextFile } from "../prompt.ts";
import {
  checkForErrors,
  configureTestProcess,
  makeExpects,
  strip,
} from "../utils.ts";
import { configMakefiles } from "./makefile.ts";

const startTestProcess = configureTestProcess(
  "scripts/configure/makefile.process.ts",
);

async function test(path: string, data: string) {
  {
    const actual = await exists(path);
    const expected = true;
    assertEquals(actual, expected, `${path} should exist`);
  }
  {
    const actual = await Deno.readTextFile(path);
    const expected = data;
    assertEquals(
      actual,
      expected,
      `${path}:\n\tactual: ${actual}\n\texpected: ${expected}`,
    );
  }
}

Deno.test("makefile.ts :: no target files, default answers", async () => {
  const tp = await startTestProcess();

  const path1 = `${tp.tempDir}/path1.mk`;
  const path2 = `${tp.tempDir}/path2.mk`;

  const original1 = `all: original ${path1}`;
  const original2 = `all: original ${path2}`;

  const overwrite1 = `all: overwrite ${path1}`;
  const overwrite2 = `all: overwrite ${path2}`;

  {
    const actual = strip(await tp.read());
    const expected = "Create Makefiles: (yes/no)";
    assertEquals(actual, expected);
  }

  await tp.write();

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await test(path1, overwrite1);
  await test(path2, overwrite2);

  await tp.end();
});

Deno.test("makefile.ts :: existing target files, overwrite #1, not #2", async () => {
  const tp = await startTestProcess();

  const path1 = `${tp.tempDir}/path1.mk`;
  const path2 = `${tp.tempDir}/path2.mk`;

  const original1 = `all: original ${path1}`;
  const original2 = `all: original ${path2}`;

  const overwrite1 = `all: overwrite ${path1}`;
  const overwrite2 = `all: overwrite ${path2}`;

  await forceWriteTextFile(path1, original1);
  await forceWriteTextFile(path2, original2);

  {
    const actual = strip(await tp.read());
    const expected = "Create Makefiles: (yes/no)";
    assertEquals(actual, expected);
  }

  await tp.write("yes");

  {
    const actual = strip(await tp.read());
    const expected = `File ${path1} exists, overwrite: (yes/no)`;
    assertEquals(actual, expected);
  }

  await tp.write("yes");

  {
    const actual = strip(await tp.read());
    const expected = `File ${path2} exists, overwrite: (yes/no)`;
    assertEquals(actual, expected);
  }

  await tp.write("no");

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await test(path1, overwrite1);
  await test(path2, original2);

  await tp.end();
});
