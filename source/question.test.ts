import { assertEquals } from "../remote/asserts.ts";
import { configureTestProcess } from "./io.helpers.ts";
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
      const expected = "Choose your Knight:";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("sir");

    {
      const actual = strip(await tp.read());
      const expected = "Choose your Knight:";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("lance");

    {
      const actual = strip(await tp.read());
      const expected = "Choose your Knight:";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("sir l");

    {
      const actual = strip(await tp.read());
      const expected = "Sir Lancelot the Brave" +
        ", do you approach the bridge of death? (yes/no)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write();

    {
      const actual = strip(await tp.read());
      const expected = "Sir Lancelot the Brave" +
        ", do you approach the bridge of death? (yes/no)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("yes");

    {
      const actual = strip(await tp.read());
      const expected = "What is your name?";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("lancelot");

    {
      const actual = strip(await tp.read());
      const expected = "What is your quest?";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("I seek a shrubbery!");

    {
      const actual = strip(await tp.read());
      const expected = "What is your quest?";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("I seek the grail?");

    {
      const actual = strip(await tp.read());
      const expected = "What is your favorite color? (red/green)";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("blue");

    {
      const actual = strip(await tp.read());
      const expected = "African or European?";
      const message = `expected:\n\t${Deno.inspect(expected)}\n` +
        `got:\n\t${Deno.inspect(actual)}`;
      assertEquals(actual, expected, message);
    }

    await tp.write("e");

    {
      const data = strip(await tp.read());
      try {
        const actual = JSON.parse(data);
        const expected = [
          "Sir Lancelot the Brave",
          "I seek the grail!",
          "\u001b[34mblue\u001b[39m",
          "European",
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
