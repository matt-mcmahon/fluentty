import {
  assert,
  assertEquals,
  assertNotStrictEquals,
  fail,
} from "../remote/asserts.ts";
import { Prompt } from "./promptly.ts";
import { checkForErrors, configureTestProcess } from "./test_process.ts";
import { strip } from "./utils.ts";

const startTestProcess = configureTestProcess(
  "source/promptly.process.ts",
);

Deno.test({
  name: "Prompt class",
  ignore: false,
  async fn() {
    const message = "To be or not to be";
    const p1 = Prompt.from(message);

    assertEquals(p1.message, message);
    assertEquals(p1.retry === true, false, "p1 should NOT retry, #1");

    const p2 = Prompt.set("retry")(true)(p1);

    assertNotStrictEquals(p1, p2, "p1 and p2 should not be the same reference");
    assertEquals(p1.retry === true, false, "p1 should NOT retry, #2");
    assertEquals(p2.retry === true, true, "p2 should retry");

    const accept = ["be", "not be"];
    const p3 = Prompt.set("accept")(accept)(p2);

    assertEquals(p2.accept, []);
    assertEquals(p3.accept, accept);

    try {
      const actual = await Prompt.check(p3)("be");
      const expected = "be";
      assertEquals(actual, expected);
    } catch (err) {
      fail(err);
    }

    try {
      const actual = await Prompt.check(p3)("not be");
      const expected = "not be";
      assertEquals(actual, expected);
    } catch (err) {
      fail(err);
    }

    try {
      const actual = await Prompt.check(p3)("junk");
      const expected = "junk";
      assertEquals(actual, expected);
    } catch (err) {
      assert(err instanceof TypeError, "should fail with a TypeError");
    }
  },
});

Deno.test({
  name: "Question class",
  ignore: false,
  async fn() {
    const tp = await startTestProcess();

    {
      const actual = strip(await tp.read());
      const expected = "What is your name:";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("Arthur, King of the Britain's");

    {
      const actual = strip(await tp.read());
      const expected = "What is your quest:";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("wut");

    {
      const actual = strip(await tp.read());
      const expected = "What is your quest:";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("I seek the grail");

    {
      const actual = strip(await tp.read());
      const expected = "What is your favorite color: (red, green, blue, ...)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write();

    {
      const actual = strip(await tp.read());
      const expected = "Which way?: (left/right)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("ahead");

    // {
    //   const err = strip(await tp.readError());
    //   const actual = err.includes("TypeError");
    //   const expected = true;
    //   const message = `expected TypeError, got:\n\t${Deno.inspect(err)}\n`;
    //   assertEquals(actual, expected, message);
    // }

    {
      const actual = strip(await tp.read());
      const expected = "Which way?: (left/right)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write();

    // {
    //   const err = strip(await tp.readError());
    //   const actual = err.includes("TypeError");
    //   const expected = true;
    //   const message = `expected TypeError, got:\n\t${Deno.inspect(err)}\n`;
    //   assertEquals(actual, expected, message);
    // }

    {
      const actual = strip(await tp.read());
      const expected = "Which way?: (left/right)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("left");

    {
      const actual = JSON.parse(strip(await tp.read()));
      const expected = [
        "Arthur, King of the",
        '"I seek the grail!"',
        "...",
        "left",
      ].sort();
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    {
      const actual = await checkForErrors(tp);
      const expected = "";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.end();
  },
});
