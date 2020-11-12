/**
 * ```
 * join:: a => bs => a
 * ```
 * -----------------------------------------------------------------------------
 *
 * __join__ takes an optional separator string, __a__, an array, __bs__ of any
 * type and returns a new string by concatenating all of the elements in the
 * array, converting them to strings if necessary, and separating each element
 * by either a comma, `","`, or __a__.
 *
 * If the array has only one item, then that item will be returned without using
 * the separator.
 *
 * ```
 * [1, 2, 3].join("---") <=> join("---")([1, 2, 3]) <=> "1---2---3"
 * [1, 2, 3].join()      <=> join()([1, 2, 3])      <=> "1,2,3"
 * ```
 */
export const join = (a: string | undefined) =>
  <A>(bs: A[]): string => bs.join(a);
