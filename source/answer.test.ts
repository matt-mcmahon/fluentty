import { assertEquals } from "../remote/asserts.ts";
import { doIO, isNo, isYes } from "./answer.ts";

Deno.test("answers.ts: count [1, 2, 3] if yes", async () => {
  const count = (n: number) => (s: string) => s.repeat(n);
  const countUpIfYes = doIO
    .if(isYes).exec(async () => 1, async () => 2, async () => 3)
    .if(isNo).exec(async () => 3, async () => 2, async () => 1)
    .done();

  {
    const actual = await countUpIfYes("yes");
    const expected = [1, 2, 3];
    assertEquals(actual, expected);
  }

  {
    const actual = await countUpIfYes("no");
    const expected = [3, 2, 1];
    assertEquals(actual, expected);
  }
});

Deno.test("answers.ts: count [1, 2, 3] if no", async () => {
  const countDownIfNo = doIO
    .if(isNo).exec(
      async () => 3,
      async () => 2,
      async () => 1,
    )
    .done();

  {
    const actual = await countDownIfNo("yes");
    const expected: [] = [];
    assertEquals(actual, expected);
  }

  {
    const actual = await countDownIfNo("no");
    const expected = [3, 2, 1];
    assertEquals(actual, expected);
  }

  {
    const actual = await countDownIfNo("n");
    const expected: [] = [];
    assertEquals(actual, expected);
  }

  {
    const actual = await countDownIfNo("nope");
    const expected: [] = [];
    assertEquals(actual, expected);
  }
});
