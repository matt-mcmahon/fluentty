import { assertEquals } from "../../remote/asserts.ts";
import { checkForErrors, configureTestProcess, strip } from "../utils.ts";

const promptCache = "Enable local Deno cache: (yes/no)";
const promptDenoDir = "Local Deno cache directory: (.deno)";
const promptLockFileName = "Lock-File Name: (lock_file.json)";

const spawnTestProcess = configureTestProcess(
  "source/configure/cache.process.ts",
);

Deno.test("cache.ts :: default values", async () => {
  const tp = await spawnTestProcess();

  {
    const actual = strip(await tp.read());
    const expected = promptCache;
    const message = "should ask if you want to enable the cache";
    assertEquals(actual, expected, message);
  }

  await tp.write("yes");

  {
    const actual = strip(await tp.read());
    const expected = promptDenoDir;
    const message = "should ask for deno-dir path";
    assertEquals(actual, expected, message);
  }

  await tp.write();

  {
    const actual = strip(await tp.read());
    const expected = promptLockFileName;
    const message = "should ask for a lock-file name";
    assertEquals(actual, expected, message);
  }

  await tp.write();

  {
    const actual = JSON.parse(await tp.read());
    const expected = {
      "DENO_DIR": ".deno",
      "LOCK_FILE": "lock_file.json",
    };
    assertEquals(actual, expected);
  }

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.end();
});

Deno.test("cache.ts :: no cache", async () => {
  const tp = await spawnTestProcess();

  {
    const actual = strip(await tp.read());
    const expected = promptCache;
    const message = "should ask if you want to enable the cache";
    assertEquals(actual, expected, message);
  }

  await tp.write("no");

  {
    const actual = JSON.parse(await tp.read());
    const expected = {};
    assertEquals(actual, expected);
  }

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.end();
});

Deno.test("cache.ts :: custom file names", async () => {
  const tp = await spawnTestProcess();

  {
    const actual = strip(await tp.read());
    const expected = promptCache;
    const message = "should ask if you want to enable the cache";
    assertEquals(actual, expected, message);
  }

  await tp.write("yes");

  {
    const actual = strip(await tp.read());
    const expected = promptDenoDir;
    const message = "should ask for deno-dir path";
    assertEquals(actual, expected, message);
  }

  await tp.write("deno-is-awesome!");

  {
    const actual = strip(await tp.read());
    const expected = promptLockFileName;
    const message = "should ask for a lock-file name";
    assertEquals(actual, expected, message);
  }

  await tp.write("totally-locked.json");

  {
    const actual = JSON.parse(await tp.read());
    const expected = {
      "DENO_DIR": "deno-is-awesome!",
      "LOCK_FILE": "totally-locked.json",
    };
    assertEquals(actual, expected);
  }

  {
    const actual = await checkForErrors(tp);
    const expected = "";
    const message = `error message: ${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.end();
});
