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
  constructor({ message, ...options }: PromptOptions) {
    Object.assign(this, options);
    this.message = message;
  }

  message: Readonly<string>;
  retry: Readonly<boolean> = false;
  defaultTo: Readonly<string | null> = null;
  sanitizers: readonly MapGivenInputPrompt<string>[] = [];
  suggestions: readonly string[] = [];
  validators: readonly MapGivenInputPrompt<string | false>[] = [];
  formatters: readonly MapGivenInputPrompt<string>[] = [];

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
      if (f(input, this) !== false) return input;
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
}
