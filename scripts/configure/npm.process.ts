import { configNPM } from "./npm.ts";
import { makeSetter } from "../utils.ts";

const [get, set] = makeSetter();

await configNPM(set);

console.log(JSON.stringify(get()));
