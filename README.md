# 𝓕𝓵𝓾𝓮𝓷 🆃 🆃 🆈

*Fluentty* is a [fluent] command-line interface builder that runs on [Deno].
Here's an example:

```javascript
import { blue, green, red }
  from "https://deno.land/std@0.76.0/fmt/colors.ts";
import { askYesNo, IO, ifYes, question }
  from "https://raw.githubusercontent.com/matt-mcmahon/fluentty/v0.3.0/module.ts";

const name = await question("Choose your Knight:")
  .accept(
    "Arthur, King of the Britains",
    "Sir Lancelot the Brave",
    "Sir Robin the Not-Quite-So-Brave-as-Sir-Lancelot",
    "Sir Bedevere the Wise",
    "Sir Galahad the Pure",
    "Sir Bors",
    "Sir not Appearing in this Film",
  )
  .ignoreCase()
  .matchPartial()
  .retry()
  .IO();

const approach = await askYesNo(`${name}, do you approach the bridge of death?`)
  .IO()
  .then(ifYes(answerTheQuestions));

async function answerTheQuestions() {
  const questions = [
    question("What is your name?")
      .validate((input) => {
        const re = new RegExp(input, "i");
        return re.test(name) ? name : false;
      }),
    question("What is your quest?")
      .retry()
      .validate((input) => /grail/i.test(input) ? input : false)
      .format((input) => input.replace(/[\!\.\?]?$/, "!")),
    question("What is your favorite color?")
      .suggest("red", "green").ignoreCase().matchFull()
      .accept("blue").ignoreCase().matchFull()
      .format((color) =>
        color === "red"
          ? red("%s")
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
}
```

Which produces the following program:

```text
bash : matt@matt-desktop:~/@mwm/fluentty
     : [working ≡]
     > deno run --unstable source/question.process.ts ↵

Choose your Knight: sir
Choose your Knight: sir b
Choose your Knight: lance
Choose your Knight: sir l
Sir Lancelot the Brave, do you approach the bridge of death?: (yes/no) y
What is your name: lance
What is your quest: I seek a shrubbery!
What is your quest: I seek the Holy Grail?
What is your favorite color: (red/green) blue
African or European: eu
```

And, finally, our user's answers.

```js
[
  "Sir Lancelot the Brave",
  "I seek the Holy Grail!",
  "\u001b[34mblue\u001b[39m",
  "European"
]
```

In this example we're using the `question` and `IO` exports from *Fluentty* to
ask the user a series of questions. Specifically:

1. "Choose your Knight" allows you to choose which knight will approach the
   bridge. Input is loosely matched, so you can type any part of the name. As
   long as your input matches exactly one suggestion, it will be accepted. We
   want to use the answer to this questions so we ask it in a separate async
   expression.
2. "Approach the bridge of death" asks a simple Yes/No question. By default, it
   matches input to the beginning of each option, ignores case, and will
   automatically retry if the user gives invalid input. If the user answers "no"
   the script will return.
3. "What is your name" checks your answer from #1 above, and validates as long
   the input can be found anywhere in the Knight's name.
4. "What is your quest" has a custom validator that will only accept an answer
   if it includes the word "grail". Unlike the man form scene 24, we allow the
   knight to try again if he gets this wrong. Finally, we use a custom formatter
   to make the answer an exclamation, replacing other punctuation if necessary.
5. "What is your favorite color", will accept "red", "green", and "blue", but
   will only suggest "red" and "green". Fluentty will **not** automatically
   retry on invalid input. (Users who enter an invalid answers will presumably
   be cast into the *Gorge of Eternal Peril*.) Valid input will be formatted so
   it shows in that color when output on the terminal.
6. Our bonus question, "African or European?", is a case-sensitive question.
   Even though "eu" should fail a case-sensitive match, we're sanitizing our
   input before matching it, which changes our input string to "Eu", instead.
   "Eu" which matches the initial two characters of "European", and so our input
   validates.

[fluent]: https://dev.to/shoupn/what-is-a-fluent-api-2m4f
[deno]: https://deno.land/
