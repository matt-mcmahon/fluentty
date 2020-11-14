import { describe } from "../remote/describe.ts";
import { assertThrowsAsync, fail } from "../remote/asserts.ts";
import { brightWhite, dim, stripColor } from "../remote/colors.ts";
import { Prompt } from "./prompt.ts";

describe("Prompt.prototype.suggestions - sort order", ({ assert }) => {
  {
    const a1 = [1, 2, 3];
    const a2 = [4, 2, 5];
    const actual = [...new Set([...a1, ...a2])];
    const expected = [1, 2, 3, 4, 5];
    assert({ actual, expected });
  }

  {
    const [a, b, c, d, e, f] = ["a", "b", "c", "d", "e", "f"];
    const p1 = Prompt.of({ message: "First", suggestions: [a, b, c, d] });
    const p2 = Prompt.of({ message: "Second", suggestions: [b, e, f] });
    const p3 = p1.concat(p2);
    const actual = stripColor(p3.hint).trim();
    const expected = `(a, b, c, d, e, f)`;
    assert({ actual, expected });
  }
});

describe("Prompt.prototype.validate", ({ assert }) => {
  const message = "To be or not to be:";
  const prompt = Prompt.from(message);

  assert({ actual: prompt.message, expected: message });

  {
    // A prompt with zero validators should accept any input
    const actual = prompt.validate("foo");
    const expected = "foo";
    assert({ actual, expected });
  }

  {
    // A prompt with zero validators should accept even empty input
    const actual = prompt.validate("");
    const expected = "";
    assert({ actual, expected });
  }

  const suggestions = ["be", "not be"];
  prompt.suggestions = suggestions;
  prompt.validators = [(input) => {
    return suggestions.find((suggestion) => suggestion === input) ?? false;
  }];

  {
    const actual = stripColor(prompt.hint);
    const expected = "(be/not be) ";
    assert({ actual, expected });
  }

  {
    const actual = stripColor(prompt.toString());
    const expected = `To be or not to be: (be/not be) `;
    assert({ actual, expected });
  }

  prompt.defaultTo = "be";

  {
    const actual = prompt.hint;
    const expected = ["(", "be", "/", "not be", ") "].map(
      (v) => v === "be" ? brightWhite(v) : dim(v),
    ).join("");
    assert({ actual, expected });
  }

  try {
    const actual = prompt.validate("be");
    const expected = "be";
    assert({ actual, expected });
  } catch (err) {
    fail(err);
  }

  try {
    const actual = prompt.validate("not be");
    const expected = "not be";
    assert({ actual, expected });
  } catch (err) {
    fail(err);
  }

  assertThrowsAsync(async () => {
    prompt.validate("junk");
  }, TypeError);
});

describe("Prompt.prototype.concat", ({ assert }) => {
  const m1 = "Prompt 1";
  const s1 = (s: string) => s + " world";
  const f1 = (s: string) => `${s.toUpperCase()}!`;
  const p1 = Prompt.of({ message: m1, sanitizers: [s1], formatters: [f1] });

  {
    const input = "hello";
    const actual = p1.validate(input);
    const expected = f1(s1(input));
    const message = p1.toString();
    assert({ actual, expected, message });
  }

  const m2 = "Prompt 2";
  const s2 = (s: string) => (s + " ").repeat(3).trim();
  const f2 = (s: string) => s + " ...";
  const p2 = Prompt.of({ message: m2, sanitizers: [s2], formatters: [f2] });

  {
    const input = "HELLO WORLD!";
    const actual = p2.validate(input);
    const expected = f2(s2(input));
    assert({ actual, expected });
  }

  const p3 = p1.concat(p2);

  {
    const input = "hello";
    const actual = p3.validate(input);
    const expected = f2(f1(s2(s1(input))));
    const message = p1.toString();
    assert({ actual, expected, message });
  }
});

describe("Prompt.prototype.defaultTo", ({ assert }) => {
  const p1 = Prompt.of({
    message: "I have a default value",
    defaultTo: "default 1",
  });

  {
    const actual = p1.validate("");
    const expected = "default 1";
    assert({ actual, expected });
  }

  const p2 = p1.concat({ defaultTo: "default 2" });

  {
    const actual = p2.validate("");
    const expected = "default 2";
    assert({ actual, expected });
  }

  const p3 = p2.concat({ validators: [() => false] });

  {
    const actual = p3.validate("");
    const expected = "default 2";
    assert({ actual, expected });
  }

  {
    const actual = p3.validate("default 2");
    const expected = "default 2";
    assert({ actual, expected });
  }
});
