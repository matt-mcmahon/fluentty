import { assertEquals } from "../remote/asserts.ts";
import { checkForErrors, configureTestProcess } from "./test_process.ts";
import { strip } from "./utils.ts";

const startTestProcess = configureTestProcess(
  "source/question.process.ts",
);

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
