import { accept, ask, defaultTo, prompt, retry } from "./prompt.ts";
import { exists } from "./remote/fs.ts";

export const link = async (
  oldpath: string,
  newpath: string,
  type: "file" | "dir" = "file",
) => {
  if (await exists(newpath)) {
    await Deno.remove(newpath);
  }
  await Deno.symlink(oldpath, newpath, { type });
};

export const configMakefiles = () =>
  ask(
    "Use symlinks for Makefiles in project-root and platform/[name]/* folders",
  )
    .then(accept("y", "n"))
    .then(defaultTo("y"))
    .then(retry())
    .then(prompt)
    .then((y) => {
      if (y === "y") {
        return Promise.all([
          link("scripts/makefiles/deno.mk", "Makefile"),
          link("../../scripts/makefiles/node.mk", "platform/node/Makefile"),
        ]);
      }
    });
