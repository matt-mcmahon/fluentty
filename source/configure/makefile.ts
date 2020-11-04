import {
  askYesNo,
  defaultTo,
  done,
  ifYes,
  prompt,
  verifyWriteTextFile,
} from "../prompt.ts";

type Pairs = [filePath: string, fileData: string][];

const writeFiles = (pairs: Pairs) =>
  async () => {
    for (const pair of pairs) {
      const [filePath, fileData] = pair;
      await verifyWriteTextFile(filePath)(fileData);
    }
  };

export async function configMakefiles(pairs: Pairs): Promise<void> {
  return askYesNo("Create Makefiles")
    .then(defaultTo("yes"))
    .then(prompt)
    .then(ifYes(writeFiles(pairs)))
    .then(done);
}
