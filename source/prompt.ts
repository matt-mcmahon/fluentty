import { brightWhite, dim } from "../remote/colors.ts";

export interface Validator {
  (input: string, prompt: Prompt): string | false;
}

export interface Sanitizer {
  (input: string, prompt: Prompt): string;
}

export interface Formatter {
  (input: string, prompt: Prompt): string;
}

type PromptOptions = {
  defaultTo?: Readonly<string | null>;
  formatters?: readonly Formatter[];
  message: Readonly<string>;
  retry?: boolean;
  sanitizers?: readonly Sanitizer[];
  suggestions?: readonly string[];
  validators?: readonly Validator[];
};

export class Prompt {
  constructor({
    defaultTo = null,
    formatters = [],
    message,
    retry = false,
    sanitizers = [],
    suggestions = [],
    validators = [],
  }: PromptOptions) {
    this.defaultTo = defaultTo;
    this.formatters = formatters;
    this.message = message;
    this.retry = retry;
    this.sanitizers = sanitizers;
    this.suggestions = suggestions;
    this.validators = validators;
  }

  defaultTo: Readonly<string | null>;
  formatters: readonly Formatter[];
  message: Readonly<string>;
  retry: Readonly<boolean>;
  sanitizers: readonly Sanitizer[];
  suggestions: readonly string[];
  validators: readonly Validator[];

  toString() {
    return `${this.message} ${this.hint}`;
  }

  get hint() {
    const { suggestions = [], defaultTo } = this;
    if (suggestions.length > 0) {
      const brighten = (s: string) => s === defaultTo ? brightWhite(s) : dim(s);
      const as = suggestions.map(brighten);
      const list = as.length > 2 ? as.join(dim(", ")) : as.join(dim("/"));
      return dim("(") + list + dim(") ");
    }
    return "";
  }

  #invokeFormatters = (input: string) =>
    this.formatters.reduce((input, f) => f(input, this), input);

  #invokeSanitizers = (input: string) =>
    this.sanitizers.reduce((input, f) => f(input, this), input);

  #invokeValidators = (input: string) => {
    if (this.validators.length === 0) {
      // No validators? Accept any input.
      return input;
    }

    for (const f of this.validators) {
      // accept the first input that validates
      const match = f(input, this);
      if (match !== false) return match;
    }

    throw new TypeError(`"${input}" failed to validate`);
  };

  validate = (input: string) => {
    const sanitized = this.#invokeSanitizers(input);
    const validated = this.#invokeValidators(sanitized);
    return this.#invokeFormatters(validated);
  };

  static from(message: string) {
    return new Prompt({ message });
  }

  static of(prompt: PromptOptions) {
    return new Prompt({ ...prompt });
  }
}
