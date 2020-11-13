import { exists } from "../remote/fs.ts";
import { identity, ifElse } from "../remote/functional.ts";
import { askYesNo } from "./question.ts";

const DEFAULT_BUFFER_SIZE = 5120;

interface Process<T> {
  IO: () => Promise<T> | T;
}

/** Consumes any input and returns `Promise<void>` */
export async function noop() {}

/**
 * Does the given IO operations in order, and returns an array of results.
 * @param processes any object with an **IO** method
 */
export async function IO<T>(...processes: Process<T>[]) {
  const results: T[] = [];
  for await (const process of processes) {
    const input = await process.IO();
    results.push(input);
  }
  return results;
}

/** Overwrites `filename` even if it exists, without prompting the user. */
export function forceWriteTextFile(filename: string, data: string) {
  return Deno.writeTextFile(filename, data);
}

const on = <A>(predicate: (a: A) => boolean) =>
  (...actions: Array<<B>() => Promise<B | void>>) =>
    (input: A) =>
      predicate(input)
        ? Promise.allSettled(actions.map((f) => f()))
        : Promise.reject(`predicate(${Deno.inspect(input)}) failed`);

/** Returns true iff `input === "yes"` */
export function isYes(input: unknown): input is "yes" {
  return input === "yes";
}

/** Returns true iff `input === "no"` */
export function isNo(input: unknown): input is "no" {
  return input === "no";
}

/** Returns true iff `input === true` */
export function isTrue(input: unknown): input is true {
  return input === true;
}

/** Returns true iff `input === false` */
export function isFalse(input: unknown): input is false {
  return input === false;
}

export const decodeText = (source: Deno.Reader) =>
  async (accept = DEFAULT_BUFFER_SIZE) => {
    const buf = new Uint8Array(accept);
    const got = <number> await source.read(buf);
    return new TextDecoder()
      .decode(buf.subarray(0, accept < got ? accept : got))
      .trim();
  };

export const encodeText = (source: Deno.Writer) =>
  async (message: string) => {
    const buf = new TextEncoder().encode(message);
    await source.write(buf);
  };

/**
 * Print message to stdout
 *
 * @returns number of bytes written
 */
export const stdout = encodeText(Deno.stdout);

/**
 * Accept input from stdin.
 */
export const stdin = (accept?: number) => () => decodeText(Deno.stdin)(accept);

/**
 * If the `filename` exists, prompts the user before overwriting.
 */
export function verifyWriteTextFile(filename: string) {
  return async (data: string) => {
    const justCreate = () => Deno.writeTextFile(filename, data);

    const askOverwrite = async () =>
      askYesNo(`File ${filename} exists, overwrite?`)
        .IO()
        .then(ifElse(isYes, justCreate, noop));

    await exists(filename)
      .then(ifElse(isTrue, askOverwrite, justCreate));
  };
}

/**
 * _Write_ message input to the given `Deno.run()` process **handle**.
 * Automatically appends a new-line character to the message.
 */
export function sendInput(handle: Deno.Writer & Deno.Closer) {
  return (message = "") =>
    handle.write(new TextEncoder().encode(message + "\n"));
}

/** _Read_ output from the given `Deno.run()` process **handle**. */
export function getOutput(handle: Deno.Reader & Deno.Closer) {
  return (accept = DEFAULT_BUFFER_SIZE) =>
    async () => {
      const max = DEFAULT_BUFFER_SIZE;
      const buf = new Uint8Array(accept > max ? accept : max);
      const got = <number> await handle.read(buf);
      return new TextDecoder()
        .decode(buf.subarray(0, accept < got ? accept : got))
        .trim();
    };
}
