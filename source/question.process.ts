import { blue, green, red } from "../remote/colors.ts";
import { askYesNo, IO, question } from "./question.ts";

const questions = [
  askYesNo("Do you approach the bridge of death"),
  question("What is your name"),
  question("What is your quest")
    .retry()
    .validate((input) => /grail/i.test(input) ? input : false)
    .format((input) => input.replace(/[\!\.\?]?$/, "!")),
  question("What is your favorite color")
    .matchExactly("red", "green")
    .matchExactly("blue")
    .format((color) =>
      color === "red"
        ? red("%s")
        : color === "green"
        ? green(color)
        : color === "blue"
        ? blue(color)
        : color
    ),
  question("African or European")
    .matchLoosely("African", "European")
    .sanitize((input) =>
      input.substr(0, 1).toLocaleUpperCase() +
      input.substr(1).toLocaleLowerCase()
    )
    .retry(),
  question("Accept partial, full match")
    .suggestLoose(
      "Sir Lancelot the Brave",
      "Sir Robin the Not-Quite-So-Brave-as-Sir-Lancelot",
      "Sir Bedevere the Wise",
      "Sir Galahad the Pure",
      "Sir Bors",
      "Sir not Appearing in this Film",
    )
    .retry(),
];

const answers = await IO(...questions);

console.log(JSON.stringify(answers, null, "\t"));
