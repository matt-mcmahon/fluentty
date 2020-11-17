/**
 * ```
 * toVariadic :: (as => b) => ...as => b
 * ```
 * -----------------------------------------------------------------------------
 *
 * Takes a _Unary_ function that accepts an array as its only argument, and
 * returns a function that accepts any number of arguments instead.
 *
 */
export const toVariadic = <AS extends unknown[], B>(u: (as: AS) => B) =>
  (...as: AS): B => u(as);
