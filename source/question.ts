import { stdin, stdout } from "./io.ts";
import { Prompt } from "./prompt.ts";
export { stripColor } from "../remote/colors.ts";

/**
 * Initialize a new prompt, storing the given `message` and returning a Promise.
 * The configuration object can be customized by chaining one or more `then`
 * method calls, passing the following functions `accept`, `acceptPartial`,
 * `defaultTo`, `format`, `retry` `sanitize`, or `validate`.
 *
 * ```js
 * Question("Do you want to continue")
 *   .acceptPartial("yes", "no")
 *   .defaultTo("yes")
 *   .retry()
 *   .prompt()
 * ```
 * ```plaintext
 * > Do you want to continue (yes/no): _
 * ```
 *
 * Not that no IO will occur until you call the `prompt()` method, which should
 * be chained with a `catch(...)` method.
 *
 */
class Question {
  #prompt: Promise<Prompt>;

  constructor(value: Promise<Prompt>) {
    this.#prompt = value;
  }

  static from(prompt: PromiseLike<Prompt> | Prompt) {
    return new Question(Promise.resolve(prompt));
  }

  /**
   * Validate input using a Set of acceptable input strings. This set is checked
   * after the `sanitize` function is run.
   *
   * User input must match exactly. Given, `accept("Acceptable")`, the only
   * valid input will be the string "Acceptable". Entering  "accept",
   * "acceptable", or "a" will be rejected.
   *
   * Multiple calls to accept will add additional acceptable input to the list.
   * Given `question.accept("right").accept("left")` both `"left"` and `"right"`
   * will be acceptable input.
   *
   */
  accept(...input: string[]): Question {
    const prompt = this.#prompt.then((prompt): Prompt => {
      const { accept: current = [] } = prompt;
      const set = new Set([...current, ...input]);
      return Prompt.set("accept")([...set])(prompt);
    });
    return Question.from(prompt);
  }

  /**
   * Sets up a sanitize filter that allows the user to to answer prompts like
   * `accept("Yes", "No")` with "y", "Y", "Ye", "Yes", or "n", "no", "No", etc.
   *
   * @returns the option from the accept list that begins with the users input,
   *    if it matches exactly one accept option. Otherwise returns the input.
   */
  acceptPartial(...input: string[]): Question {
    const quest = this.accept(...input).sanitize(
      (input: string, { defaultTo, accept = [] }: Prompt) => {
        if (input.length === 0) return input;
        if (input === defaultTo) return input;
        const maybe: readonly string[] = accept.reduce(
          (maybe, accepts) =>
            accepts.startsWith(input) ? [...maybe, accepts] : maybe,
          [] as readonly string[],
        );
        return maybe.length === 1 ? maybe[0] : input;
      },
    );
    return quest;
  }

  /**
   * Set a default value for when the user provides no input. Replaces before
   * sanitize, acceptable, and validate functions are run.
   */
  defaultTo(value: string): Question {
    return Question.from(this.#prompt.then(Prompt.set("defaultTo")(value)));
  }

  /**
   * Run after the user's input is found valid.
   */
  format(formatter: (input: string, prompt: Prompt) => string): Question {
    return Question.from(this.#prompt.then(Prompt.set("format")(formatter)));
  }

  /**
   * When true, invalid input results in a re-prompt.
   *
   * @param value retry on invalid input
   */
  retry(value = true): Question {
    const prompt = this.#prompt.then(Prompt.set("retry")(value));
    return Question.from(prompt);
  }

  /**
   * Sanitizes the users input before matching against the accept list, or trying
   * to validate.
   */
  sanitize(sanitizer: (input: string, prompt: Prompt) => string): Question {
    const prompt = this.#prompt.then(Prompt.set("sanitize")(sanitizer));
    return Question.from(prompt);
  }

  /**
   * Use a predicate to validate user input. If the validation function returns
   * `true`, the input is acceptable, if it returns `false` then input is not
   * valid.
   *
   * Validate is checked after the `defaultTo` and `accept` rules have been
   * applied. If you've set a `defaultTo` value, validate will never receive the
   * empty string.
   */
  validate(
    validator: (input: string, prompt: Prompt) => boolean,
    onError?: (input: string, prompt: Prompt) => string,
  ): Question {
    return Question.from(
      this.#prompt.then(
        Prompt.set("validate")(onError ? [validator, onError] : [validator]),
      ),
    );
  }

  prompt() {
    return this.#prompt.then((options) =>
      stdout(`${options.message}: ${Prompt.getHint(options)}`)
        .then(stdin)
        .then(Prompt.check(options))
        .catch((reason): Promise<string> => {
          return options.retry ? this.prompt() : Promise.reject(reason);
        })
    );
  }
}

export function question(message: string) {
  return Question.from(Prompt.from(message));
}

/**
 * Ask the user a Yes/No question with "y", "n", etc.
 */
export function askYesNo(message: string): Question {
  return question(message)
    .acceptPartial("yes", "no")
    .retry();
}

export const Q = async (...questions: Question[]) => {
  const answered: string[] = [];
  for await (const q of questions) {
    answered.push(await q.prompt());
  }
  return answered;
};
