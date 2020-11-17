/**
 * ```
 * unless :: (a => boolean) => (a => b) => a => a|b
 * ```
 * -----------------------------------------------------------------------------
 *
 * Return `a => b` __unless__ the `a => boolean` is `true`, in that case return
 * `a`.
 */
export const unless = <X, A extends X>(p: (a: X) => a is A) =>
  <B>(mapXB: (x: X) => B) => (a: X): A | B => (p(a) ? a : mapXB(a));
