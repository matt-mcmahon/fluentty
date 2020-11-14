import { describe } from "../remote/describe.ts";
import { doIO, isNo, isYes } from "./answer.ts";

describe("answers.ts: count [1, 2, 3] if yes", async ({ assert }) => {
  const countUpIfYes = doIO
    .if(isYes).exec(async () => 1, async () => 2, async () => 3)
    .if(isNo).exec(async () => 3, async () => 2, async () => 1)
    .done();

  {
    const actual = await countUpIfYes("yes");
    const expected = [1, 2, 3];
    assert({ actual, expected });
  }

  {
    const actual = await countUpIfYes("no");
    const expected = [3, 2, 1];
    assert({ actual, expected });
  }
});

describe("answers.ts: count [1, 2, 3] if no", async ({ assert }) => {
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
    assert({ actual, expected });
  }

  {
    const actual = await countDownIfNo("no");
    const expected = [3, 2, 1];
    assert({ actual, expected });
  }

  {
    const actual = await countDownIfNo("n");
    const expected: [] = [];
    assert({ actual, expected });
  }

  {
    const actual = await countDownIfNo("nope");
    const expected: [] = [];
    assert({ actual, expected });
  }
});
