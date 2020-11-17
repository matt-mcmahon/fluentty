import type { Last } from "../types.d.ts";

export type Pipe<A, B> = {
  (a: A): B;
  then: <C>(f: (b: B) => C) => Pipe<A, C>;
  invoke(a: A): B;
};

const fluent = <A, B>(f: (a: A) => B): Pipe<A, B> => {
  function invoke(a: A) {
    return f(a);
  }
  const p: Pipe<A, B> = Object.assign(invoke.bind(null), {
    then: <C>(f: (b: B) => C): Pipe<A, C> => {
      return next<A, B, C>(p, f);
    },
    invoke,
  });
  return p;
};

const next = <A, B, C>(prev: Pipe<A, B>, f: (b: B) => C): Pipe<A, C> => {
  function invoke(a: A) {
    return f(prev(a));
  }
  const p: Pipe<A, C> = Object.assign(invoke.bind(null), {
    then: <D>(f: (c: C) => D): Pipe<A, D> => {
      return next<A, C, D>(p, f);
    },
    invoke,
  });
  return p;
};

/**
 * ```
 * pipe :: (a⁰ => a¹, ..., aⁿ⁻¹ -> aⁿ) => a⁰ => aⁿ
 * ```
 *
 * Takes any number, _n_, unary Functions of the form `aˣ => aˣ⁺¹`, and composes
 * them in a left-to-right order, passing the value, _a⁰_, to the left-most
 * function, the return value, _a¹_ to the next-left-most function, etc.,
 * finally returning _aⁿ_. For example:
 *
 * ```
 * pipe(f, g, h)(a) <=> h(g(f(a)))
 * ```
 *
 * ## Warning
 *
 * While _pipe(...)_ can correctly detect the types of _a⁰_ and _aⁿ_, it cannot
 * detect if the return type for an inner function fails to satisfy the type
 * requirements for the next function. In the above example, the TypeScript
 * Compiler will not consider it an error if _f_ returns a `number`, but _g_
 * accepts only a `string`.
 *
 * To guarantee type safety, use the _fluent_ API:
 *
 * ```
 * pipe.fluent(f).then(g).then(h).invoke(a) <=> h(g(f(a)))
 * ```
 *
 * The fluent algorithm guarantees that the return type of _f_ will match the
 * argument type of _g_, that _g_ will match _h_, etc. Note that the final
 * `invoke` method is equivalent to:
 *
 * ```
 * pipe.fluent(f).then(g).then(h)(a)
 * ```
 * and if you assign a fluent chain to a variable you may treat it as a normal
 * function. For example:
 * ```
 * const fgh = pipe.fluent(f).then(g).then(h)
 * fgh(a) <=> fgh.invoke(a)
 * ```
 */
export const pipe = Object.assign(// deno-lint-ignore no-explicit-any
<FS extends ((x: any) => any)[]>(...fs: FS) => {
  type A = Parameters<FS[0]>[0];
  type B = ReturnType<Last<FS>>;

  return (a: A): B => fs.reduce((v, f) => f(v), a) as B;
}, { fluent });
