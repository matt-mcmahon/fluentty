import { brightWhite, dim } from "../remote/colors.ts";
export { stripColor } from "../remote/colors.ts";

export interface MapGivenInputPrompt<T> {
  (input: string, prompt: Prompt): T;
}

type PromptOptions = {
  message: Readonly<string>;
  retry?: boolean;
  defaultTo?: Readonly<string>;
  sanitizers?: readonly MapGivenInputPrompt<string>[];
  suggestions?: readonly string[];
  validators?: readonly MapGivenInputPrompt<string | false>[];
  formatters?: readonly MapGivenInputPrompt<string>[];
};

export class Prompt {
  message: Readonly<string>;
  retry?: Readonly<boolean>;
  defaultTo?: Readonly<string>;
  sanitizers: readonly MapGivenInputPrompt<string>[];
  suggestions: readonly string[];
  validators: readonly MapGivenInputPrompt<string | false>[];
  formatters: readonly MapGivenInputPrompt<string>[];

  toString() {
    return `${this.message}: ${this.hint}`;
  }

  constructor({
    message,
    retry = false,
    defaultTo,
    sanitizers = [],
    suggestions = [],
    validators = [],
    formatters = [],
  }: PromptOptions) {
    this.message = message;
    this.retry = retry;
    this.suggestions = suggestions;
    this.defaultTo = defaultTo;
    this.sanitizers = sanitizers;
    this.validators = validators;
    this.formatters = formatters;
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

  invokeFormatters = (input: string) =>
    this.formatters.reduce((input, f) => f(input, this), input);

  invokeSanitizers = (input: string) =>
    this.sanitizers.reduce((input, f) => f(input, this), input);

  invokeValidators = (input: string) => {
    if (this.validators.length === 0) {
      // No validators? Accept any input.
      return input;
    }

    for (const f of this.validators) {
      if (f(input, this) !== false) return input;
    }
    throw new TypeError(`"${input}" failed to validate`);
  };

  validate = (input: string) =>
    this.invokeFormatters(this.invokeValidators(this.invokeSanitizers(input)));

  static from(message: string) {
    return new Prompt({ message });
  }
}
