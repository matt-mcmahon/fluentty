// deno-lint-ignore-file ban-types

const applyArgument = <F extends Function, A>(currentStep: F, a: A) =>
  currentStep(a);

/**
 * ```
 * uncurry :: n => (a¹ => a² => ... => aⁿ => b) => (a¹, a², ..., aⁿ) => b
 * ```
 * -----------------------------------------------------------------------------
 *
 * Takes a length, _n_, a _curried_ function with _n_ productions, and returns a
 * function that accepts _n_ arguments.
 *
 * ```
 * uncurry(3, a => b => c => a + b + c) <=> (a, b, c) => a + b + c
 * ```
 * @todo add support for Variadic Tuples in TypeScript 4
 */
export const uncurry = (length: number) =>
  <A extends unknown, AS extends unknown[], B>(curried: (a: A) => B) =>
    (...allArguments: AS) => {
      const expectedArguments = allArguments.slice(0, length);
      return expectedArguments.reduce(applyArgument, curried);
    };
