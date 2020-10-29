import { assertEquals } from "../../remote/asserts.ts";
import { forceWriteTextFile, verifyWriteTextFile } from "../prompt.ts";
import { checkForErrors, configureTestProcess, strip } from "../utils.ts";

const spawnTest = configureTestProcess(
  "scripts/configure/import_map.process.ts",
);

const promptUseImportMap = "Use an import-map: (yes/no)";
const promptImportMapFileName = "Import-map filename: (import_map.json)";
const promptOverwriteFile = (file: string) =>
  `File ${file} exists, overwrite: (yes/no)`;

Deno.test("import_map.ts :: default values", async () => {
  const tp = await spawnTest();

  {
    const actual = strip(await tp.read()).trim();
    const expected = promptUseImportMap;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write();

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.end();
});

Deno.test("import_map.ts :: no cache", async () => {
  const tp = await spawnTest();

  const importMapFile = `${tp.tempDir}/import-map.json`;
  const importMapData = { imports: { "source code path": "mapped path" } };

  await forceWriteTextFile(importMapFile, JSON.stringify(importMapData));

  {
    const actual = strip(await tp.read());
    const expected = promptUseImportMap;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("yes");

  {
    const actual = strip(await tp.read());
    const expected = promptImportMapFileName;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write(importMapFile);

  {
    const actual = strip(await tp.read());
    const expected = promptOverwriteFile(importMapFile);
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("yes");

  {
    const actual = JSON.parse(await tp.read());
    const expected = { IMPORT_MAP: importMapFile };
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = JSON.parse(await Deno.readTextFile(importMapFile));
    const expected = { imports: {} };
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.end();
});

Deno.test("import_map.ts :: custom file names", async () => {
  const tp = await spawnTest();

  const importMapFile = `${tp.tempDir}/import-map.json`;
  const importMapData = { imports: { "source code path": "mapped path" } };

  await forceWriteTextFile(importMapFile, JSON.stringify(importMapData));

  {
    const actual = strip(await tp.read());
    const expected = promptUseImportMap;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("yes");

  {
    const actual = strip(await tp.read());
    const expected = promptImportMapFileName;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write(importMapFile);

  {
    const actual = strip(await tp.read());
    const expected = promptOverwriteFile(importMapFile);
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("no");

  {
    const actual = JSON.parse(await tp.read());
    const expected = { IMPORT_MAP: importMapFile };
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = JSON.parse(await Deno.readTextFile(importMapFile));
    const expected = importMapData;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.end();
});
