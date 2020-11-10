import { Prompt } from "./prompt.ts";
import { Question } from "./question.ts";

export class Match {
  #prompt: Prompt;
  #options: string[];

  constructor(prompt: Prompt, ...options: string[]) {
    this.#options = options;
    this.#prompt = prompt;
  }

  matchCase = () => this.#configureMatch("");
  ignoreCase = () => this.#configureMatch("i");

  #configureMatch = (flags: string) => {
    return {
      matchFull: () => this.#done(flags, "full"),
      matchInitial: () => this.#done(flags, "init"),
      matchAnywhere: () => this.#done(flags, "part"),
    };
  };

  #done = (flags: string, match: "full" | "init" | "part") => {
    const options = this.#options;
    const prompt = this.#prompt;

    const validator = (input: string) => {
      const maybes: string[] = [];
      const full = new RegExp(`^${input}$`, flags);
      const init = new RegExp(`^${input}`, flags);
      const part = new RegExp(`${input}`, flags);
      for (const option of options) {
        // always test full
        if (full.test(option)) return option;
        // empty input is only matching when full
        else if (input === "") return false;
        // only match if unique
        else if (match === "init" && init.test(option)) maybes.push(option);
        else if (match === "part" && part.test(option)) maybes.push(option);
      }
      return maybes.length === 1 ? maybes[0] : false;
    };

    return Question.from(prompt.concat({
      validators: [
        ...prompt.validators,
        validator,
      ],
    }));
  };
}
