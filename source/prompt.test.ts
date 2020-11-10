import { assertEquals, assertThrowsAsync, fail } from "../remote/asserts.ts";
import { brightWhite, dim, stripColor } from "../remote/colors.ts";
import { Prompt } from "./prompt.ts";

Deno.test("Prompt.prototype.suggestions - sort order", () => {
  const a1 = [1, 2, 3];
  const a2 = [4, 2, 5];
  const actual = [...new Set([...a1, ...a2])];
  const expected = [1, 2, 3, 4, 5];
  assertEquals(actual, expected);
});

Deno.test("Prompt.prototype.validate", () => {
  const message = "To be or not to be:";
  const prompt = Prompt.from(message);

  assertEquals(prompt.message, message);

  {
    // A prompt with zero validators should accept any input
    const actual = prompt.validate("foo");
    const expected = "foo";
    assertEquals(actual, expected);
  }

  {
    // A prompt with zero validators should accept even empty input
    const actual = prompt.validate("");
    const expected = "";
    assertEquals(actual, expected);
  }

  const suggestions = ["be", "not be"];
  prompt.suggestions = suggestions;
  prompt.validators = [(input) => {
    return suggestions.find((suggestion) => suggestion === input) ?? false;
  }];

  {
    const actual = stripColor(prompt.hint);
    const expected = "(be/not be) ";
    assertEquals(actual, expected);
  }

  {
    const actual = stripColor(prompt.toString());
    const expected = `To be or not to be: (be/not be) `;
    assertEquals(actual, expected);
  }

  prompt.defaultTo = "be";

  {
    const actual = prompt.hint;
    const expected = ["(", "be", "/", "not be", ") "].map(
      (v) => v === "be" ? brightWhite(v) : dim(v),
    ).join("");
    assertEquals(actual, expected);
  }

  try {
    const actual = prompt.validate("be");
    const expected = "be";
    assertEquals(actual, expected);
  } catch (err) {
    fail(err);
  }

  try {
    const actual = prompt.validate("not be");
    const expected = "not be";
    assertEquals(actual, expected);
  } catch (err) {
    fail(err);
  }

  assertThrowsAsync(async () => {
    prompt.validate("junk");
  }, TypeError);
});

Deno.test("Prompt.prototype.concat", () => {
  const m1 = "Prompt 1";
  const s1 = (s: string) => s + " world";
  const f1 = (s: string) => `${s.toUpperCase()}!`;
  const p1 = Prompt.of({ message: m1, sanitizers: [s1], formatters: [f1] });

  {
    const input = "hello";
    const actual = p1.validate(input);
    const expected = f1(s1(input));
    assertEquals(actual, expected, p1.toString());
  }

  const m2 = "Prompt 2";
  const s2 = (s: string) => (s + " ").repeat(3).trim();
  const f2 = (s: string) => s + " ...";
  const p2 = Prompt.of({ message: m2, sanitizers: [s2], formatters: [f2] });

  {
    const input = "HELLO WORLD!";
    const actual = p2.validate(input);
    const expected = f2(s2(input));
    assertEquals(actual, expected);
  }

  const p3 = p1.concat(p2);

  {
    const input = "hello";
    const actual = p3.validate(input);
    const expected = f2(f1(s2(s1(input))));
    assertEquals(actual, expected, p1.toString());
  }
});

Deno.test("Prompt.prototype.defaultTo", () => {
  const p1 = Prompt.of({
    message: "I have a default value",
    defaultTo: "default 1",
  });

  {
    const actual = p1.validate("");
    const expected = "default 1";
    assertEquals(actual, expected);
  }

  const p2 = p1.concat({ defaultTo: "default 2" });

  {
    const actual = p2.validate("");
    const expected = "default 2";
    assertEquals(actual, expected);
  }

  const p3 = p2.concat({ validators: [() => false] });

  {
    const actual = p3.validate("");
    const expected = "default 2";
    assertEquals(actual, expected);
  }

  {
    const actual = p3.validate("default 2");
    const expected = "default 2";
    assertEquals(actual, expected);
  }
});
