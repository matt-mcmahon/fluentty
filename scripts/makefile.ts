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
