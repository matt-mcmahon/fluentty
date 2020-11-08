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

    await tp.write("Arthur, King of the Britains");

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

    await tp.write("red");

    {
      const actual = strip(await tp.read());
      const expected = "African or European: (African/European)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("a");

    {
      const actual = strip(await tp.read());
      const expected =
        "Accept partial, full match: (Sir/Sir not Appearing in this Film)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("sir");

    {
      const data = strip(await tp.read());
      try {
        const actual = JSON.parse(data);
        const expected = [
          "yes",
          "Arthur, King of the Britains",
          "I seek the grail!",
          "[31m%s[39m",
          "African",
          "Sir",
        ];
        const message = `expected:\n\t${Deno.inspect(expected)}\n` +
          `got:\n\t${Deno.inspect(actual)}`;
        assertEquals(actual, expected, message);
      } catch (err) {
        console.error(`\ngiven: "${data}"\nerror: `, err);
      }
    }

    await tp.end();
  },
});
