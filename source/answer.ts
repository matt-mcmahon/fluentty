// deno-lint-ignore-file
export type Action<A, B> = {
  (a: A): Promise<B>;
};

interface Predicate<A> {
  (input: A): boolean;
}

interface Done<A, B> {
  (input: A): Promise<B[]>;
}

interface Exec<A, B> {
  exec(...actions: Action<A, B>[]): DoneUnlessIf<A, B>;
}

interface DoneUnlessIf<A, B> {
  if(predicate: Predicate<A>): Exec<A, B>;
  done(): (input: A) => Promise<B[]>;
}

interface IfOnly<A, B> {
  if(predicate: Predicate<A>): Exec<A, B>;
}

interface AddIf<A, B> {
  (previous?: Done<A, B>): IfOnly<A, B>;
}

const addIf: AddIf<string, number> = (previous) => {
  return {
    if: (predicate) => {
      return {
        exec(...actions) {
          const done = () =>
            (input: string) =>
              predicate(input)
                ? Promise.all(actions.map((f) => f(input)))
                : previous
                ? previous(input)
                : Promise.resolve([]);
          return { done, ...addIf(done()) };
        },
      };
    },
  };
};

export const doIO = addIf();

export function isYes(input: string | boolean): input is "yes" | true {
  return input === "yes" || input === true;
}

export function isNo(input: string | boolean): input is "no" | false {
  return input === "no" || input === false;
}
