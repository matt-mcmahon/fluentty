import { exists } from "../remote/fs.ts";
import { askYesNo } from "./question.ts";

const DEFAULT_BUFFER_SIZE = 5120;

interface Process<T> {
  IO: () => Promise<T> | T;
}

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

/**
 * Overwrites `filename` even if it exists, without prompting the user.
 */

export function forceWriteTextFile(filename: string, data: string) {
  return Deno.writeTextFile(filename, data);
}

/**
 * Takes an async function, `action`, then a string, `input`.
 * If input is "yes", runs the action.
 * Returns the string.
 */
export function ifYes(action: () => Promise<void>) {
  return async (input: string | boolean) => {
    if (input === "yes" || input === true) await action();
    return input;
  };
}

/**
 * Takes an async function, `action`, then a string, `input`.
 * If input is "no", runs the action.
 * Returns the string.
 */
export function ifNo(action: () => Promise<void>) {
  return async (input: string | boolean) => {
    if (input === "no" || input === false) await action();
    return input;
  };
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
 * Ignores any input and returns Promise<void>
 */
export async function done() {}

/**
 * If the `filename` exists, prompts the user before overwriting.
 */
export function verifyWriteTextFile(filename: string) {
  return async (data: string) => {
    const justCreate = () => Deno.writeTextFile(filename, data);

    const askOverwrite = async () =>
      askYesNo(`File ${filename} exists, overwrite`)
        .IO()
        .then(ifYes(justCreate))
        .then(done);

    await exists(filename)
      .then(ifNo(justCreate))
      .then(ifYes(askOverwrite));
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
