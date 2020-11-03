export function textFileToModule(
  sourceFileName: string,
  targetFileName: string,
) {
  return Deno.readTextFile(sourceFileName)
    .catch((err) => {
      console.error(`Couldn't read file ${sourceFileName}`);
      return Promise.reject(err);
    })
    .then(JSON.stringify)
    .then((data) =>
      Deno.writeTextFile(targetFileName, `export default ` + data)
    );
}

if (import.meta.main) {
  const [sourceFileName, targetFileName] = Deno.args;
  textFileToModule(targetFileName, sourceFileName);
}
