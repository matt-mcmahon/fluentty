import { describe } from "../remote/describe.ts";
import { configureTestProcess } from "./test_process.ts";
import { strip } from "./utils.ts";

const spawnTP = configureTestProcess("source/question.process.ts");

describe("Question class", async ({ assert, inspect }) => {
  const tp = spawnTP();

  await tp.then(async (tp) => {
    {
      const actual = strip(await tp.read());
      const expected = "Choose your Knight:";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("sir");

    {
      const actual = strip(await tp.read());
      const expected = "Choose your Knight:";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("lance");

    {
      const actual = strip(await tp.read());
      const expected = "Choose your Knight:";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("sir l");

    {
      const actual = strip(await tp.read());
      const expected = "Sir Lancelot the Brave" +
        ", do you approach the bridge of death? (yes/no)";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("yes");

    {
      const actual = strip(await tp.read());
      const expected = "What is your name?";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("lancelot");

    {
      const actual = strip(await tp.read());
      const expected = "What is your quest?";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("I seek a shrubbery!");

    {
      const actual = strip(await tp.read());
      const expected = "What is your quest?";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("I seek the grail?");

    {
      const actual = strip(await tp.read());
      const expected = "What is your favorite color? (red/green)";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
    }

    await tp.write("blue");

    {
      const actual = strip(await tp.read());
      const expected = "African or European?";
      const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
      assert({ actual, expected, message });
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
        const message = inspect`expected:\n\t${expected}\ngot:\n\t${actual}`;
        assert({ actual, expected, message });
      } catch (err) {
        console.error(`\ngiven: "${data}"\nerror: `, err);
      }
    }
  })
    .catch((err) => console.error(err))
    .finally(async () => (await tp).end());
});
