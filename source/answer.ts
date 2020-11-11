import { assertEquals } from "../remote/asserts.ts";

type Action<A, B> = {
  (a: A): Promise<B>;
};

function answer(predicate: (input: string) => boolean) {
  return (...actions: Action<string, number>[]) =>
    (input: string) =>
      Promise.allSettled(
        predicate(input) ? actions.map((f) => f(input)) : [],
      ).then((values) =>
        values.map((v) => v.status === "fulfilled" ? v.value : v.reason)
      );
}

function ifYes(input: string) {
  return "yes".toLocaleLowerCase().startsWith(input.toLocaleLowerCase());
}

function ifNo(input: string) {
  return "no".toLocaleLowerCase().startsWith(input.toLocaleLowerCase());
}

Deno.test("answers.ts: count [1, 2, 3] if yes", async () => {
  const count123ifYes = answer(ifYes)(
    async () => 1,
    async () => 2,
    async () => 3,
  );

  {
    const actual = await count123ifYes("yes");
    const expected = [1, 2, 3];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifYes("ye");
    const expected = [1, 2, 3];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifYes("y");
    const expected = [1, 2, 3];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifYes("yessser");
    const expected: [] = [];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifYes("no");
    const expected: [] = [];
    assertEquals(actual, expected);
  }
});

Deno.test("answers.ts: count [1, 2, 3] if no", async () => {
  const count123ifNo = answer(ifNo)(
    async () => 1,
    async () => 2,
    async () => 3,
  );

  {
    const actual = await count123ifNo("yes");
    const expected: [] = [];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifNo("no");
    const expected = [1, 2, 3];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifNo("n");
    const expected = [1, 2, 3];
    assertEquals(actual, expected);
  }

  {
    const actual = await count123ifNo("nope");
    const expected: [] = [];
    assertEquals(actual, expected);
  }
});
