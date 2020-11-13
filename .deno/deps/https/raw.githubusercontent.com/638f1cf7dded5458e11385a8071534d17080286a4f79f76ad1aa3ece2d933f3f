// deno-lint-ignore-file ban-types

/**
 * ```
 * pipeV :: (...as) => ((a⁰ => a¹), (a¹ => a²), ..., (aⁿ=> b)) =>  b
 * ```
 *
 * _PipeV_ is a _Variadic_ _Combinator_, that takes a __value__ and one or more
 * _Unary_ __functions__. It _composes_ the functions in left-to-right order —
 * evaluating the first function and applying it's result to the second, it's
 * result to third, etc. — and returns the result of evaluating the final
 * function. E.g.:
 *
 * ```
 * pipeV(v)(f, g, h) <=> h(g(f(v)))
 * ```
 */
export const pipeV = <A>(...as: A[]) =>
  <F extends Function>(
    f: F,
    ...fs: Function[]
  ) => fs.reduce((a, f) => f(a), f(...as));
