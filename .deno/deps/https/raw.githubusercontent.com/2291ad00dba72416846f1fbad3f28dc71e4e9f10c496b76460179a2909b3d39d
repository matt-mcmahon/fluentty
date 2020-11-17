// deno-lint-ignore-file no-explicit-any no-unused-vars

// From: https://dev.to/kjleitz/comment/gb5d
// Keegan Leitz (https://dev.to/kjleitz)

/**
 * Gets the length of an array / tuple type. For example:
 *
 * ```
 * type FooLength = GetLength<[string, number, boolean]>;
 * //=> 3
 * ```
 */
export type GetLength<T extends unknown[]> = T extends { length: infer L } ? L
  : never;

/**
 * HEAD
 *
 * Earlier, we learnt that a "classic curried" function takes one argument at a
 * time. And we also saw that we can extract the parameter types in the form of
 * a tuple type, very convenient.
 *
 * So `Head` takes a tuple type `T` and returns the first type that it contains.
 * This way, we'll be able to know what argument type has to be taken at a time.
 *
 */
export type Head<AS extends unknown[]> = AS extends [infer A, ...unknown[]] ? A
  : never;

declare function fn00(name: string, age: number, single: boolean): true;

// prettier-ignore
/**
 * TAIL
 *
 * A "classic curried" function consumes arguments one by one. This means that
 * when we consumed the `Head<Parameters<F>>`, we somehow need to move on to the
 * next parameter that hasn't been consumed yet. This is the purpose of `Tail`,
 * it conveniently removes the first entry that a tuple might contain.
 *
 */
export type Tail<T extends unknown[]> = T extends [unknown, ...infer TT] ? TT
  : never;

/**
 * HAS-TAIL
 *
 * A curried function will return a function until all of it's parameters have
 * been consumed. This condition is reached when we called `Tail` enough times
 * that there is no tail left, nothing's left to consume:
 */
export type HasTail<T extends unknown[]> = T extends [] | [unknown] ? false
  : true;

type params = [1, 2, string];

/**
 * Extract a property's type from an object
 */
type ObjectInfer<O> = O extends { a: infer A } ? A : never;

/**
 * Extract inner types from function types
 */
type FunctionInfer<F> = F extends (...args: infer A) => infer R ? [A, R]
  : never;

/**
 * Extract generic types from a class or an interface
 */
type ClassInfer<I> = I extends Promise<infer G> ? G : never;

/**
 * Extract types from an array
 */
type ArrayInfer<T> = T extends (infer U)[] ? U : never;

// prettier-ignore
/**
 * Extract types from a tuple
 *
 * We tried to infer the type of the rest of the tuple into a type `B` but it
 * did not work as expected. It is because TypeScript lacks of a feature that
 * would allow us to deconstruct a tuple into another one. There is an active
 * proposal that tackles these issues and you can expect improved manipulation
 * for tuples in the future. This is why `Tail` is constructed the way it is.
 *
 */
type TupleInfer<T> = T extends [infer A, ...infer B] ? [A, B] : never;

/**
 * LAST
 *
 * Take your time to try to understand this complex yet very short type. This
 * example takes a tuple as a parameter and it extracts its last entry out:
 */
type Last<T extends unknown[]> = T extends [...infer _, infer A] ? A : never;

/**
 * LENGTH
 *
 * To do the analysis mentioned above, we will need to iterate over tuples. As
 * of TypeScript 3.4.x, there is no such iteration protocol that could allow us
 * to iterate freely (like a `for`). Mapped types can map from a type to
 * another, but they are too limiting for what we want to do. So, ideally, we
 * would like to be able to manipulate some sort of counter:
 */
export type Length<T extends unknown[]> = T["length"];

// prettier-ignore
/**
 * PREPEND
 *
 * It adds a type `E` at the top of a tuple `T` by using our first TS trick:
 */
export type Prepend<A, BS extends unknown[]> = [A, ...BS] extends [...infer U]
  ? U
  : BS;

/**
 * DROP
 *
 * It takes a tuple `T` and drops the first `N` entries. To do so we are going
 * to use the same techniques we used in `Last` and our brand new counter type:
 */
export type Drop<
  N extends number,
  T extends unknown[],
  I extends unknown[] = [],
> = {
  MORE: Drop<N, Tail<T>, Prepend<unknown, I>>;
  DONE: T;
}[Length<I> extends N ? "DONE" : "MORE"];

/**
 * CAST
 *
 * It requires TS to re-check a type `X` against a type `Y`, and type `Y` will
 * only be enforced if it fails. This way, we're able to stop TS's complaints:
 *
 * type test41 = Cast<[string], unknown>; // [string]
 * type test42 = Cast<[string], number>; // number
 */
export type Cast<X, Y> = X extends Y ? X : Y;

/**
 * POS (Position)
 *
 * Use it to query the position of an iterator:
 */
export type Pos<I extends unknown[]> = Length<I>;

/**
 * NEXT (+1)
 *
 * It brings the position of an iterator up:
 */
export type Next<I extends unknown[]> = Prepend<unknown, I>;

/**
 * PREV (-1)
 *
 * It brings the position of an iterator down:
 */
export type Prev<I extends unknown[]> = Tail<I>;

/**
 * Iterator
 *
 * It creates an iterator (our counter type) at a position defined by `Index`
 * and is able to start off from another iterator's position by using `From`:
 *
 * type test53 = Iterator<2>; // [unknown, unknown]
 * type test54 = Iterator<3, test53>; // [unknown, unknown, unknown, unknown, unknown]
 * type test55 = Pos<test53>; // 2
 * type test56 = Pos<test54>; // 5
 */
export type Iterator<
  Index extends number = 0,
  From extends unknown[] = [],
  I extends unknown[] = [],
> = {
  MORE: Iterator<Index, Next<From>, Next<I>>;
  DONE: From;
}[Pos<I> extends Index ? "DONE" : "MORE"];

/**
 * REVERSE
 *
 * Believe it or not, we still lack a few basic tools. `Reverse` is going to
 * give us the freedom that we needed. It takes a tuple `T` and turns it the
 * other way around into a tuple `R`, thanks to our brand new iteration types:
 */
export type Reverse<
  T extends unknown[],
  R extends unknown[] = [],
  I extends unknown[] = [],
> = {
  MORE: Reverse<T, Prepend<T[Pos<I>], R>, Next<I>>;
  DONE: R;
}[Pos<I> extends Length<T> ? "DONE" : "MORE"];

/**
 * CONCAT
 *
 * And from `Reverse`, `Concat` was born. It simply takes a tuple `T1` and
 * merges it with another tuple `T2`. It's kind of what we did in `test59`:
 */
export type Concat<T1 extends unknown[], T2 extends unknown[]> = Reverse<
  Reverse<T1> extends infer R ? Cast<R, unknown[]> : never,
  T2
>;

/**
 * APPEND
 *
 * Enabled by `Concat`, `Append` can add a type `E` at the end of a tuple `T`:
 */
export type Append<E, T extends unknown[]> = Concat<T, [E]>;

/**
 * CURRY V0
 *
 * Our first curry type must take a tuple of parameters `P` and a return type
 * `R`. It is a recursive function type that varies with the length of `P`:
 *
 * If `HasTail` reports `false`, it means that all the parameters were consumed
 * and that it is time to return the return type `R` from the original function.
 * Otherwise, there's parameters left to consume, and we recurse within our
 * type.  Recurse? Yes, `CurryV0` describes a function that has a return type of
 * `CurryV0` as long as there is a `Tail` (`HasTail<P> extends true`).
 *
 * A "classic curry" takes only a single argument at a time
 *
 */
type CurryV0<P extends unknown[], R> = (
  arg0: Head<P>,
) => HasTail<P> extends true ? CurryV0<Tail<P>, R> : R;

/**
 * CURRY V1
 *
 * Nice, but we forgot to handle the scenario where we pass a rest parameter:
 *
 * We tried to use a rest parameter but it won't work because we actually
 * expected a single parameter/argument that we earlier called `arg0`. So we
 * want to take at least one argument `arg0` and we want to receive unknown extra
 * (optional) arguments inside a rest parameter called `rest`. Let's enable
 * taking rest parameters by upgrading it with `Tail` & `Partial`:
 *
 * But we made a horrible mistake: the arguments are consumed very badly.
 * According to what we wrote, this will not produce a single TS error:
 */
type CurryV1<P extends unknown[], R> = (
  arg0: Head<P>,
  ...rest: Tail<Partial<P>>
) => HasTail<P> extends true ? CurryV1<Tail<P>, R> : R;

/**
 * CURRY V2
 *
 * In fact there is a big design problem because we said that we would force
 * taking a single `arg0`. Somehow, we are going to need to keep track of the
 * arguments that are consumed at a time. So, we will first get rid of `arg0`
 * and start tracking consumed parameters
 *
 * There, we made use of a constrained generic called `T` that is going to track
 * unknown taken arguments. But now, it is completely broken, there is no more type
 * checks because we said that we wanted to track `unknown[]` kind of parameters
 * (the constraint). But not only, `Tail` is completely useless because it only
 * worked well when we took one argument at a time.
 *
 * There is only one solution: some more tools 🔧.
 */
type CurryV2<P extends unknown[], R> = <T extends unknown[]>(
  ...args: T
) => HasTail<P> extends true ? CurryV2<Tail<T>, R> : R;

/**
 * CURRY V3
 *
 * It looks like `Length` and `Drop` are precious tools. So let's revamp our
 * previous version of curry, the one that had a broken `Tail`:
 *
 * What did we do here?
 *
 * First, `Drop<Length<T>, P>` means that we remove consumed parameters out.
 * Then, if the length of `Drop<Length<T>, P>` is not equal to `0`, our curry
 * type has to continue recursing with the dropped parameters until...
 * Finally, when all of the parameters were consumed, the `Length` of the
 * dropped parameters is equal to `0`, and the return type is `R`.
 */
type CurryV3<P extends unknown[], R> = <T extends unknown[]>(
  ...args: T
) => Length<
  Drop<Length<T>, P> extends infer DT ? Cast<DT, unknown[]> : never
> extends 0 ? R
  : CurryV3<
    Drop<Length<T>, P> extends infer DT ? Cast<DT, unknown[]> : never,
    R
  >;

/**
 * CURRY V4
 *
 * But we've got another error above, TS complains that our `Drop` is not of
 * type `unknown[]`. Sometimes, TS will complain that a type is not the one you
 * expected, but you know it is! So let's add another tool to the collection:
 * And this is our previous curry, but without unknown complaint this time:
 * Remember earlier, when we lost the type checks because we started tracking
 * consumed parameters with `T extends unknown[]`? Well it has been fixed by casting
 * `T` to `Partial<P>`. We added a constraint with `Cast<T, Partial<P>>`!
 */
type CurryV4<P extends unknown[], R> = <T extends unknown[]>(
  ...args: Cast<T, Partial<P>>
) => Length<
  Drop<Length<T>, P> extends infer DT ? Cast<DT, unknown[]> : never
> extends 0 ? R
  : CurryV4<
    Drop<Length<T>, P> extends infer DT ? Cast<DT, unknown[]> : never,
    R
  >;

/**
 * CURRY V5
 *
 * Maybe you thought that we were able to take rest parameters, I am very sorry
 * to inform you that we are not there yet. This is the reason why:
 *
 * Because rest parameters can be unlimited, TS's best guess is that the length
 * of our tuple is a `number`, it's kind of clever! So, we cannot make use of
 * `Length` while dealing with rest parameters. Don't be sad, it's not so bad:
 *
 * When all the non-rest parameters are consumed, `Drop<Length<T>, P>` can only
 * match `[...unknown[]]`. Thanks to this, we used `[unknown, ...unknown[]]` as a condition
 * to end the recursion.
 *
 * Everything works like a charm 🌹. You just got yourself a smart, generic,
 * variadic curry type. You will be able play with it very soon... But before
 * you do so, what if I told you that our type can get even more awesome?
 */
type CurryV5<P extends unknown[], R> = <T extends unknown[]>(
  ...args: Cast<T, Partial<P>>
) => Drop<Length<T>, P> extends [unknown, ...unknown[]] ? CurryV5<
  Drop<Length<T>, P> extends infer DT ? Cast<DT, unknown[]> : never,
  R
>
  : R;

type __ = "PLACEHOLDER";

/**
 * GAPOF
 *
 * It checks for a placeholder in a tuple `T1` at the position described by an
 * iterator `I`. If it is found, the matching type is collected at the same
 * position in `T2` and carried over (saved) for the next step through `TN`:
 */
type GapOf<
  T1 extends unknown[],
  T2 extends unknown[],
  TN extends unknown[],
  I extends unknown[],
> = T1[Pos<I>] extends __ ? Append<T2[Pos<I>], TN> : TN;

/**
 * GAPSOF
 *
 * Don't be impressed by this one, it calls `Gap` over `T1` & `T2` and stores
 * the results in `TN`. And when it's done, it concats the results from `TN` to
 * the parameter types that are left to be taken (for the next function call):
 */
type GapsOf<
  T1 extends unknown[],
  T2 extends unknown[],
  TN extends unknown[] = [],
  I extends unknown[] = [],
> = {
  MORE: GapsOf<
    T1,
    T2,
    GapOf<T1, T2, TN, I> extends infer G ? Cast<G, unknown[]> : never,
    Next<I>
  >;
  DONE: Concat<
    TN,
    Drop<Pos<I>, T2> extends infer D ? Cast<D, unknown[]> : never
  >;
}[Pos<I> extends Length<T1> ? "DONE" : "MORE"];

/**
 * GAPS
 *
 * This last piece of the puzzle is to be applied to the tracked parameters `T`.
 * We will make use of mapped types to explain that is is possible replace unknown
 * argument with a placeholder:
 *
 * A mapped type allows one to iterate and alter properties of another type. In
 * this case, we altered `T` so that each entry can be of the placeholder type.
 * And thanks to `?`, we explained that each entry of `T` is optional. It means
 * that we no longer have the need to use `Partial` on the tracked parameters.
 */
type PartialGaps<T extends unknown[]> = { [K in keyof T]?: T[K] | __ };

/**
 * Ugh, we never said that we could take `undefined`! We just wanted to be able
 * to omit a part of `T`. It is a side effect of using the `?` operator. But it
 * is not that bad, we can fix this by re-mapping with `NonNullable`:
 */
type CleanedGaps<T extends unknown[]> = { [K in keyof T]: NonNullable<T[K]> };

/**
 * So let's put the two together and get what we wanted:
 */
type Gaps<T extends unknown[]> = CleanedGaps<PartialGaps<T>>;

/**
 * CURRY V6
 *
 * We've built the last tools we will ever need for our curry type. It is now
 * time to put the last pieces together. Just to remind you, `Gaps` is our new
 * replacement for `Partial`, and `GapsOf` will replace our previous `Drop`:
 */
type CurryV6<P extends unknown[], R> = <T extends unknown[]>(
  ...args: Cast<T, Gaps<P>>
) => GapsOf<T, P> extends [unknown, ...unknown[]]
  ? CurryV6<GapsOf<T, P> extends infer G ? Cast<G, unknown[]> : never, R>
  : R;

/**
 * CURRY
 *
 * This is very cute, but we have one last problem to solve: parameter hints. I
 * don't know for you, but I use parameter hints a lot. It is very useful to
 * know the names of the parameters that you're dealing with. The version above
 * does not allow for these kind of hints. Here is the fix:
 *
 * I admit, it's completely awful! However, we got hints for Visual Studio Code.
 * What did we do here? We just replaced the parameter types `P` & `R` that used
 * to stand for parameter types and return type, respectively. And instead, we
 * used the function type `F` from which we extracted the equivalent of `P` with
 * `Parameters<F>` and `R` with `ReturnType<F>`. Thus, TypeScript is able to
 * conserve the name of the parameters, even after currying:
 */
export type Curry<F extends (...args: any[]) => any> = <T extends any[]>(
  ...args: Cast<Cast<T, Gaps<Parameters<F>>>, any[]>
) => GapsOf<T, Parameters<F>> extends [any, ...any[]] ? Curry<
  (
    ...args: GapsOf<T, Parameters<F>> extends infer G ? Cast<G, any[]> : never
  ) => ReturnType<F>
>
  : ReturnType<F>;
