import { brightWhite, dim } from "../remote/colors.ts";
export { stripColor } from "../remote/colors.ts";

interface GivenInputPrompt<T> {
  (input: string, prompt: Prompt): T;
}

export class Prompt {
  message: string;
  accept?: string[];
  defaultTo?: string;
  format?: GivenInputPrompt<string>;
  retry?: boolean;
  sanitize?: GivenInputPrompt<string>;
  validate?: [GivenInputPrompt<boolean>, GivenInputPrompt<string>] | [
    GivenInputPrompt<boolean>,
  ];

  constructor(options: Prompt) {
    const {
      accept = [],
      defaultTo,
      format,
      message,
      retry,
      sanitize,
      validate,
    } = options;

    this.accept = accept;
    this.defaultTo = defaultTo;
    this.format = format;
    this.message = message;
    this.retry = retry;
    this.sanitize = sanitize;
    this.validate = validate;

    Object.freeze(this);
  }

  static set<K extends keyof Prompt>(key: K) {
    return (value: Prompt[K]) =>
      (options: Prompt): Prompt => ({ ...options, [key]: value });
  }

  static from(message: string) {
    return new Prompt({ message });
  }

  static check(prompt: Prompt) {
    return (input: string) =>
      Promise.resolve(input)
        .then(orDefault(prompt))
        .then(orSanitize(prompt))
        .then(orAccept(prompt))
        .then(orValidate(prompt))
        .then(orFormat(prompt));
  }

  static getHint(prompt: Prompt) {
    const { accept, defaultTo } = prompt;
    const set = new Set(accept);

    if (defaultTo) set.add(defaultTo);

    const as = Array.from(set).map((s) =>
      s === defaultTo ? brightWhite(s) : dim(s)
    );

    const hint = as.length > 2
      ? dim("(") + as.join(dim(", ")) + dim(") ")
      : as.length > 0
      ? dim("(") + as.join(dim("/")) + dim(") ")
      : "";

    return hint;
  }
}

function orAccept({ accept = [], defaultTo }: Prompt) {
  return async (input: string) =>
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
}

function orDefault(options: Prompt) {
  return async (input: string) =>
    input === "" && options.defaultTo != null
      ? options.defaultTo
      : input === "" && options.defaultTo == null
      ? Promise.reject(new TypeError(`no input, no default value`))
      : input;
}

function orFormat(options: Prompt) {
  return async (input: string) =>
    typeof options.format === "function"
      ? options.format(input, options)
      : input;
}

function orSanitize(options: Prompt) {
  return async (input: string) =>
    typeof options.sanitize === "function"
      ? options.sanitize(input, options)
      : input;
}

function orValidate(prompt: Prompt) {
  return async (input: string) => {
    if (prompt.validate) {
      const [
        validator,
        orFailMessage = (input: string) => `input ${input} failed to validate`,
      ] = prompt.validate;
      return validator(input, prompt) ? input : Promise.reject(
        new TypeError(orFailMessage(input, prompt)),
      );
    }
    return input;
  };
}
