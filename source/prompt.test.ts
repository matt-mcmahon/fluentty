import {
  assert,
  assertEquals,
  assertNotStrictEquals,
  fail,
} from "../remote/asserts.ts";
import { Prompt } from "./prompt.ts";

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
