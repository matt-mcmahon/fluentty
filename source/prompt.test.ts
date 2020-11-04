import { assertEquals } from "../remote/asserts.ts";
import { checkForErrors, configureTestProcess, strip } from "./utils.ts";

const startTestProcess = configureTestProcess(
  "source/prompt.process.ts",
);

Deno.test("makefile.ts :: no existing files", async () => {
  const tp = await startTestProcess();

  {
    const actual = strip(await tp.read());
    const expected =
      "What is your favorite color: (red, blue, green, no wait...)";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write();

  {
    const actual = strip(await tp.read());
    const expected = "Your favorite color is no wait....";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = strip(await tp.read());
    const expected = "Which way?: (left/right)";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("ahead");

  {
    const err = strip(await tp.readError());
    const actual = err.includes("TypeError");
    const expected = true;
    const message = `expected TypeError, got:\n\t${Deno.inspect(err)}\n`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = strip(await tp.read());
    const expected = "Which way?: (left/right)";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write();

  {
    const err = strip(await tp.readError());
    const actual = err.includes("TypeError");
    const expected = true;
    const message = `expected TypeError, got:\n\t${Deno.inspect(err)}\n`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = strip(await tp.read());
    const expected = "Which way?: (left/right)";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("left");

  {
    const actual = strip(await tp.read());
    const expected = "You go left.";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = strip(await tp.read());
    const expected = "What is your quest:";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("wut");

  {
    const err = strip(await tp.readError());
    const actual = err.includes("TypeError");
    const expected = true;
    const message = `expected TypeError, got:\n\t${Deno.inspect(err)}\n`;
    assertEquals(actual, expected, message);
  }

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
    const expected = `You exclaim to the heavens: \n\n\t"I seek the grail!"`;
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  {
    const actual = strip(await tp.read());
    const expected = "Repository name: (Foo)";
    const message = `expected:\n\t${Deno.inspect(expected)}\n` +
      `got:\n\t${Deno.inspect(actual)}`;
    assertEquals(actual, expected, message);
  }

  await tp.write("holy_grail");

  {
    const actual = strip(await tp.read());
    const expected = `{ name: "holy_grail" }`;
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
});
