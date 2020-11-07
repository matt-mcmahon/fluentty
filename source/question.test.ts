import { assertEquals } from "../remote/asserts.ts";
import { configureTestProcess } from "./test_helpers.ts";
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
      const expected = "Do you approach the bridge of death: (yes/no)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("yes");

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
      const expected = "What is your favorite color: (red, green, blue)";
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
        "Arthur, King of the Britain's",
        "[1m[103m[31mI seek the grail![39m[49m[22m",
        "blue",
        "left",
      ];
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.end();
  },
});
