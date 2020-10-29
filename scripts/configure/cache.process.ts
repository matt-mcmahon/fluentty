import { configCache } from "./cache.ts";
import { makeSetter } from "../utils.ts";

const [get, set] = makeSetter();

await configCache(set);

console.log(JSON.stringify(get()));
