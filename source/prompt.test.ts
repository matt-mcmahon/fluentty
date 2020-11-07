import { assertEquals, assertThrowsAsync, fail } from "../remote/asserts.ts";
import { brightWhite, dim, stripColor } from "../remote/colors.ts";
import { Prompt } from "./prompt.ts";

Deno.test({
  name: "prompts",
  ignore: false,
  async fn() {
    const message = "To be or not to be";
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
      fail("should throw before this point");
    }, TypeError);
  },
});
