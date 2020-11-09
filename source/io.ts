import { exists } from "../remote/fs.ts";
import { ifElse } from "../remote/functional.ts";
import { askYesNo } from "./question.ts";

export const DEFAULT_BUFFER_SIZE = 5120;

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

/** Overwrites `filename` even if it exists, without prompting the user. */
export function forceWriteTextFile(filename: string, data: string) {
  return Deno.writeTextFile(filename, data);
}

/** If input is "yes" return true */
export function isYes(input: string | boolean) {
  return input === "yes" || input === true;
}

/** If input is "no" return true */
export function isNo(input: string | boolean) {
  return input === "no" || input === false;
}

/** Consumes any input and returns `Promise<void>` */
export async function noop() {}

/** If a file at **path** exists, prompt the user before overwriting. */
export function verifyWriteTextFile(path: string) {
  return async (data: string) => {
    const justCreate = () => Deno.writeTextFile(path, data);

    const askOverwrite = async () =>
      askYesNo(`File ${path} exists, overwrite?`)
        .IO()
        .then(ifElse(isYes, justCreate, noop));

    await exists(path)
      .then(ifElse(isYes, askOverwrite, justCreate));
  };
}

/** _Read_ output from the given __buffer__. */
export function readFrom(buffer: Deno.Reader) {
  return async (accept = DEFAULT_BUFFER_SIZE) => {
    const max = DEFAULT_BUFFER_SIZE;
    const buf = new Uint8Array(accept > max ? accept : max);
    const got = <number> await buffer.read(buf);
    return new TextDecoder()
      .decode(buf.subarray(0, accept < got ? accept : got))
      .trim();
  };
}

/** _Write_ message to the given __buffer__. */
export function writeTo(source: Deno.Writer) {
  return async (message: string) => {
    const buf = new TextEncoder().encode(message);
    await source.write(buf);
  };
}

/** _Write_ `${message}\n` to given __buffer__. */
export function writeln(buffer: Deno.Writer) {
  return (message = "") => writeTo(buffer)(message + "\n");
}

/** Accept up to DEFAULT_BUFFER_SIZE input from stdin. */
export function stdin() {
  return readFrom(Deno.stdin)();
}

/** Print message to stdout */
export const stdout = writeTo(Deno.stdout);

/** Print message to stdout */
export const stderr = writeTo(Deno.stderr);
