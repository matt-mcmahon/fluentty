import { configImportMap } from "./import_map.ts";
import { makeSetter } from "../utils.ts";

const [get, set] = makeSetter();

await configImportMap(set);

console.log(JSON.stringify(get()));
