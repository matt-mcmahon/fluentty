/* global console */
/**
 * ```
 * log :: s -> a -> a
 * ```
 * -----------------------------------------------------------------------------
 * Takes a string, a _value_, logs the string and the value, and then returns
 * the _value_.
 */
export const log = (s: string) =>
  <A>(a: A): A => {
    console.groupCollapsed(s);
    console.log(a);
    console.groupEnd();
    return a;
  };
