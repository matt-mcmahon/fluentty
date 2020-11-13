/**
 * ```
 * tap :: (a -> *) -> a -> a
 * ```
 * -----------------------------------------------------------------------------
 * Takes a function, a _value_, and applies the value to the function for it's
 * _sideEffect_. Ignores any value returned by the side effect function, and
 * returns the _value_ instead.
 */
export const tap = <A>(f: (a: A) => void) =>
  (a: A): A => {
    f(a);
    return a;
  };
