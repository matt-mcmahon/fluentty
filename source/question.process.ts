import { blue, green, red } from "../remote/colors.ts";
import { ifElse } from "../remote/functional.ts";
import { IO, isYes, noop, stdout } from "./io.ts";
import { askYesNo, question } from "./question.ts";

const name = await question("Choose your Knight:")
  .accept(
    "Arthur, King of the Britains",
    "Sir Lancelot the Brave",
    "Sir Robin the Not-Quite-So-Brave-as-Sir-Lancelot",
    "Sir Bedevere the Wise",
    "Sir Galahad the Pure",
    "Sir Bors",
    "Sir not Appearing in this Film",
  ).ignoreCase().matchAnywhere()
  .defaultTo("Sir Lancelot the Brave").justAccept()
  .retry()
  .IO();

await askYesNo(`${name}, do you approach the bridge of death?`)
  .defaultTo("yes").andSuggest()
  .IO()
  .then(ifElse(isYes, answerTheQuestions, noop));

async function answerTheQuestions() {
  const questions = [
    question("What is your name?")
      .accept(name).ignoreCase().matchAnywhere(),
    question("What is your quest?")
      .retry()
      .validate((input) => /grail/i.test(input) ? input : false)
      .format((input) => input.replace(/[\!\.\?]?$/, "!")),
    question("What is your favorite color?")
      .suggest("red", "green").ignoreCase().matchFull()
      .accept("blue").ignoreCase().matchFull()
      .format((color) =>
        color === "red"
          ? red(color)
          : color === "green"
          ? green(color)
          : color === "blue"
          ? blue(color)
          : color
      ),
    question("African or European?")
      .accept("African", "European").matchCase().matchInitial()
      .sanitize((input) =>
        input.substr(0, 1).toLocaleUpperCase() +
        input.substr(1).toLocaleLowerCase()
      )
      .retry(),
  ];

  const answers = await IO(...questions);

  stdout(JSON.stringify(answers, null, "\t"));
}
