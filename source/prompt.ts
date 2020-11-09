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
    if (this.defaultTo != null && input === "" || input === this.defaultTo) {
      // Empty input? use defaultTo if defined
      return this.defaultTo;
    }

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

  /**
   * Merges two prompts, field by field, and returns a new prompt that is a
   * concatenation of both prompts fields. Validating a concatenation of two
   * prompts will call of all prompt 1's sanitize methods, followed by all of
   * prompt 2's sanitize methods, etc.
   *
   * Concatenation is not composition:
   *
   * ```javascript
   * prompt1.concat(prompt2) != compose(prompt1, prompt2)
   * ```
   *
   * Where compose could be:
   *
   * ```
   * function compose(prompt1, prompt2) {
   *   return prompt1.validate(
   *     prompt2.validate(input)
   *   )
   * }
   * ```
   *
   */
  concat(prompt: Partial<Prompt>): Prompt {
    return Prompt.of({
      // overwrite these:
      message: prompt.message ?? this.message,
      defaultTo: prompt.defaultTo ?? this.defaultTo,
      retry: prompt.retry ?? this.retry,
      // merge these:
      formatters: [...this.formatters, ...prompt.formatters ?? []],
      sanitizers: [...this.sanitizers, ...prompt.sanitizers ?? []],
      suggestions: [...this.suggestions, ...prompt.suggestions ?? []],
      validators: [...this.validators, ...prompt.validators ?? []],
    });
  }

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
