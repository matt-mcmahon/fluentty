export type Action<A, B> = {
  (a: A): Promise<B>;
};

interface Predicate {
  (input: string): boolean;
}

interface DoneUnlessIf {
  if: AddIf;
  done(input: string): Promise<number>[];
}

interface Exec {
  (...actions: Action<string, number>[]): DoneUnlessIf;
}

interface AddIf {
  (previous: Done): {
    if: (predicate: Predicate) => { exec: Exec };
  };
}

interface Done {
  (input: string): Promise<number[]>;
}

function addIf(previous?: Done) {
  return {
    if: (predicate: Predicate) => {
      return {
        exec(...actions: Action<string, number>[]) {
          const done = (): Done =>
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
}

export const doIO = addIf();

export function isYes(input: string | boolean): input is "yes" | true {
  return input === "yes" || input === true;
}

export function isNo(input: string | boolean): input is "no" | false {
  return input === "no" || input === false;
}
