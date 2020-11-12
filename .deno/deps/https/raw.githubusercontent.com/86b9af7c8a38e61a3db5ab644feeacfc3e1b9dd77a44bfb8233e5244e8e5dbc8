/**
 * ```
 * sort :: ((a, a) => n) => as => as
 * ```
 * -----------------------------------------------------------------------------
 *
 * Sorts a list by applying the given sorting function.
 *
 */
export const sort = <A>(compare: ((a1: A, a2: A) => number) | undefined) =>
  (as: ArrayLike<A> | Iterable<A>): A[] => Array.from(as).sort(compare);
