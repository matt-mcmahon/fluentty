import { assertEquals } from "../remote/asserts.ts";
import { configureTestProcess } from "./test_helpers.ts";

const spawnTestProcess = configureTestProcess("source/io.process.ts");

Deno.test(`io`, async () => {
  const tp = await spawnTestProcess();
  {
    const actual = await tp.read();
    const expected = `todo: write io tests`;
    assertEquals(actual, expected);
  }
  await tp.end();
});
