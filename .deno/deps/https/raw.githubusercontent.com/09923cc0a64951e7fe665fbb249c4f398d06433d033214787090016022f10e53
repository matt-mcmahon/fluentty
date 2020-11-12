/**
 * ```
 * toUnary :: (...as => b) => as => b
 * ```
 * -----------------------------------------------------------------------------
 *
 * Takes a _Variadic_ function and returns a _Unary_ version of the function
 * that accepts a single array as its argument instead.
 *
 */
export function toUnary<AS extends unknown[], B>(
  v: (...as: AS) => B,
): (as: AS) => B {
  return (as: AS) => v(...as);
}
