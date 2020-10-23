import { bold, green } from "./remote/colors.ts";
import { exists } from "./remote/fs.ts";

export type Prompt = {
  message: string;
  accept: string[];
  defaultTo?: string;
  retry?: boolean;
  validate?: (input: string, options: Prompt) => boolean;
  sanitize?: (input: string, options: Prompt) => string;
};

export function stdout(message: string) {
  return Deno.stdout.write(new TextEncoder().encode(message));
}

export async function stdin(accept = 1024) {
  const max = 1024;
  const buf = new Uint8Array(accept > max ? accept : max);
  const got = <number> await Deno.stdin.read(buf);
  return new TextDecoder()
    .decode(buf.subarray(0, accept < got ? accept : got))
    .trim();
}

const set = <K extends keyof Prompt>(key: K) =>
  (value: Prompt[K]) =>
    async (options: Prompt): Promise<Prompt> => ({ ...options, [key]: value });

export const ask = async (message: string): Promise<Prompt> => ({
  message,
  accept: [],
});

export const retry = (value = true) =>
  async (options: Prompt) => set("retry")(value)(options);

const orRetry = (options: Prompt) =>
  (...reason: unknown[]) => {
    console.error(...reason);
    return options.retry ? prompt(options) : Promise.reject(reason);
  };

export const accept = (...accept: string[]) =>
  async (options: Prompt) => {
    const { accept: current = [], ...rest } = options;
    const set = new Set([...current, ...accept]);
    return { ...rest, accept: [...set] };
  };

const orAccept = ({ accept, defaultTo }: Prompt) =>
  async (input: string) =>
    accept.length === 0
      ? input
      : accept.includes(input) || input === defaultTo
      ? input
      : Promise.reject(
        new TypeError(
          `input ${input} is not default, ${defaultTo}, or in accept list [${
            accept.map((s) => `"${s}"`).join(", ")
          }]`,
        ),
      );

export const defaultTo = set("defaultTo");

const orDefault = (options: Prompt) =>
  async (input: string) => {
    return input === "" && options.defaultTo != null
      ? options.defaultTo
      : input === "" && options.defaultTo == null
      ? Promise.reject(new TypeError(`no input, no default value`))
      : input;
  };

export const sanitize = set("sanitize");

const orSanitize = (options: Prompt) =>
  async (input: string) =>
    typeof options.sanitize === "function"
      ? options.sanitize(input, options)
      : input;

export const validate = set("validate");

const orValidate = (options: Prompt) =>
  async (input: string) => {
    if (typeof options.validate === "function") {
      return options.validate(input, options) ? input : Promise.reject(
        new TypeError(`input ${input} failed to validate`),
      );
    }
    return input;
  };

export const verifyWriteTextFile = (filename: string) =>
  async (data: string) =>
    exists(filename) && ask(`File ${filename} exists, overwrite`)
      .then(accept("y", "n"))
      .then(defaultTo("n"))
      .then(prompt)
      .then(async (input) => {
        if (input === "y") {
          return Deno.writeTextFile(filename, data);
        }
      });

export const forceWriteTextFile = async (filename: string, data: string) => {
  return Deno.writeTextFile(filename, data);
};

const getHint = ({ accept, defaultTo }: Prompt) => {
  const set = new Set(accept);
  if (defaultTo) set.add(defaultTo);
  const as = Array.from(set).map((s) => s === defaultTo ? green(bold(s)) : s);

  const hint = as.length > 2
    ? `(${as.join(", ")}) `
    : as.length > 0
    ? `(${as.join("/")}) `
    : "";

  return hint;
};

export const prompt = async (
  options: Prompt,
): Promise<string> => {
  const hint = getHint(options);

  await stdout(`${options.message}: ${hint}`);

  return stdin()
    .then(orDefault(options))
    .then(orAccept(options))
    .then(orValidate(options))
    .then(orSanitize(options))
    .catch(orRetry(options));
};
