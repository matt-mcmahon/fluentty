export const reduce = <A, B>(r: (b: B, a: A) => B) =>
  (b: B) => (as: A[]): B => as.reduce(r, b);

export const reduceV = <A, B>(r: (b: B, a: A) => B) =>
  (b: B) => (...as: A[]): B => as.reduce(r, b);
