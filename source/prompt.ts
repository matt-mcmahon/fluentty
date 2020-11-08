import { brightWhite, dim } from "../remote/colors.ts";

export interface MapGivenInputPrompt<T> {
  (input: string, prompt: Prompt): T;
}

type PromptOptions = {
  defaultTo?: Readonly<string | null>;
  formatters?: readonly MapGivenInputPrompt<string>[];
  message: Readonly<string>;
  retry?: boolean;
  sanitizers?: readonly MapGivenInputPrompt<string>[];
  suggestions?: readonly string[];
  validators?: readonly MapGivenInputPrompt<string | false>[];
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
  formatters: readonly MapGivenInputPrompt<string>[];
  message: Readonly<string>;
  retry: Readonly<boolean>;
  sanitizers: readonly MapGivenInputPrompt<string>[];
  suggestions: readonly string[];
  validators: readonly MapGivenInputPrompt<string | false>[];

  toString() {
    return `${this.message}: ${this.hint}`;
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

  validate = (input: string) =>
    this.#invokeFormatters(
      this.#invokeValidators(
        this.#invokeSanitizers(
          input,
        ),
      ),
    );

  static from(message: string) {
    return new Prompt({ message });
  }

  static of(p1: PromptOptions, ...prompts: Partial<PromptOptions>[]) {
    return new Prompt({
      ...p1,
      ...prompts.reduce((a, b) => ({ ...a, ...b })),
    });
  }
}
