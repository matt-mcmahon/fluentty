/**
 * ```
 * iife :: (...as => b, ...as) => b
 * ```
 * -----------------------------------------------------------------------------
 * Immediately Invokes a function, passing in the supplied parameters and
 * returning the result, if any.
 *
 */
export const iife = <AS extends unknown[], B>(
  f: (...as: AS) => B,
  ...as: AS
): B => f(...as);
