# Fluentty

**Fluentty** is a a fluent prompt builder for terminal programs. It works like so:

```javascript
import { bgBrightYellow, bold, red, stripColor } from "https://deno.land/std@0.76.0/fmt/colors.ts";
import { Q, question } from "https://raw.githubusercontent.com/matt-mcmahon/fluentty/v0.2.0/module.ts";

const done = await Q(
  question("What is your name"),
  question("What is your quest")
    .retry()
    .validate((input) => input.length > 4)
    .format((input) => bold(bgBrightYellow(red(`"${input}!"`)))),
  question("What is your favorite color")
    .accept("red", "green")
    .accept("blue")
    .defaultTo("..."),
);

console.log(JSON.stringify(done.map(stripColor).sort()));
```
