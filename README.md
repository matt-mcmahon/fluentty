# Deno First

**Deno-First** scaffolds a new [Deno][deno] [TypeScript][ts] project in a way that allows you to easily port your project to other platforms, like Node.
It uses [make][make] to manage your source code, and is configured with the following `make <targets>`:

| Target                 | Alias | Description                                                                                                                                                                                               |
| ---------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `all`                  |       | Runs the `install`, `build` and `test-all` targets.                                                                                                                                                       |
| `build`                |       | Creates a Deno `bundle`, and then copies and transforms the source-code for other `platform/*` platforms.                                                                                                 |
| `bundle.js`            |       | Creates a Deno-only, single-file bundle of the project appropriate for the cloud. You can rename `bundle.js` by setting `DENO_BUNDLE_NAME` in `.env`, or set it to nothing to disable bundling.           |
| `clean`                |       | Safely deletes build artifacts and common un-tracked files. Run before `build` to start with a clean slate.                                                                                               |
| `configure`            |       | Runs the `./configure` shell script. This script creates a `.env` file for you, and sets other configuration options.                                                                                     |
| `do-build-targets`     |       | Run `make` on all `platform/<platform>` folders. See: <https://github.com/matt-mcmahon/describe/issues/4>                                                                                                 |
| `do-integration-tests` |       | Run `make` on all `integration-tests/<test>` folders.                                                                                                                                                     |
| `format`               | `fmt` | Formats the project source code using `deno fmt`.                                                                                                                                                         |
| `install`              |       | Creates `lock_file.json` if one doesn't already exist or updates it, if necessary, and then runs install target on every **integration-test** and **platform**.                                           |
| `integration-tests/*`  |       | Run an integration-test.                                                                                                                                                                                  |
| `lint`                 |       | Checks the project format using `deno fmt --check`, then runs Deno's experimental linter, `deno lint`. We don't lint test files, `*.test.ts`. We assume any lint errors in your Test code are deliberate. |
| `lint-quiet`           |       | Like `lint`, but less verbose.                                                                                                                                                                            |
| `lock_file.json`       |       | Create `lock_file.json` for the project. You can rename `lock_file.json` by setting `LOCK_FILE` in `.env`.                                                                                                |  |
| `platform/*`           |       | Clean, build, and test a platform.                                                                                                                                                                        |
| `run`                  |       | Executes the project on the command line using `deno run`.                                                                                                                                                |
| `test`                 |       | Runs tests for Deno version of the project only, using `deno test`.                                                                                                                                       |
| `test-all`             |       | Runs all tests for the project, including `integration-tests/*` and `platform/*` tests.                                                                                                                   |
| `test-quiet`           |       | Like `test`, but less verbose.                                                                                                                                                                            |
| `test-watch`           |       | Watches the `./source` folder for file-changes and runs `make test` after each. [`inotify`][inotify] must be installed.                                                                                   |
| `upgrade`              |       | Forces make to reload your project's dependency cache, and update your `lock_file.json`, even if make isn't detecting changes to your dependencies.                                                       |

## Conventions

Our app code lives in `./source/app`, and contains platform-independent project code, with Deno-style [explicit][explicit] import-specifiers.
Platforms can request a copy of this source code, translated into spec-compliant TypeScript, with the following command:

```makefile
$(MAKE) GEN_DIR=$(GEN_DIR) -C ../../ $(GEN_DIR)
```

Where `GEN_DIR` is a filesystem path to where you want the generated source code to go.
That path should either be absolute or relative to the grandparent Makefile &mdash; not the current Makefile, and defaults to `./platform/[name]/source/gen/`.

All platform-dependent code is located in `lib` or, occasionally, `test` sibling folders.
The `./source/lib` folder has Deno-dependent source code in it.
Each platform we support needs its own `lib` folder written specifically for that platform in `platform/[name]/source/lib`.

## It's not a bundle

`deno bundle` was my first thought at a proof-of-concept demonstration, but it's not a good fit for this use.
The `bundle` command generates code for **Deno**, not other run-times.
It's not a generic _export_ command, and there's no guarantee that bundling code won't introduce a dependency on some Deno-specific platform feature

Next I looked at Deno's [node standard library][node-compat]. That module allows us to run node-on-deno; we're going in the other direction.

Finally, Deno supports building and bundling pragmatically through the `Deno.bundle` and `Deno.build` runtime functions. **These functions are probably the best long-term solution for Deno-first projects, but are more than I wanted to tackle for a simple demonstration project.**

Given the above, the simplest path to compatibility ended up being a [very small shell script][shell].

Turns out, [`find`][find] and [`sed`][sed] work really well together when we need to rewrite predictable strings like import specifiers.
Once rewritten, we can let the TypeScript Compiler do it's thing.
This solution isn't robust &mdash; but it is _sufficient_.
If Deno-first proves to be a productive way to write cross-platform TypeScript, then the efficiency and dependency gains for using the `Deno.bundle` and `Deno.build` will be well worth exploring.

## Project Structure

Here are the highlights for our project's structure. Important files and folders are listed.

### `./` root

The project's root folder contains:

- `./lock_file.json` &mdash; lets Deno warn us if the dependencies we've downloaded don't match the ones we originally used.
  Pulling in code from the internet requires trust, and by using a lockfile, Deno can tell us when that trust may have been violated.
- `./Makefile` &mdash; there's no equivalent to NPM `package.json` scripts in Deno.
  I don't know of any source-code management program that's more ubiquitous, more powerful, easier to use, and easier to understand than `make`.
- `./README.md` &mdash; the file you're reading now.
- `./configure` &mdash; a shell script that walks you through setting up a _Deno-First_ project on your local machine.
  It creates basic `.env`, and other files for your version of the project.

Like most \*nix software, you can bootstrap the application using:

```bash
> git clone git@github.com:matt-mcmahon/deno-first.git <folder>
> cd <folder>
> ./configure
> make
```

### `./.deno/`

Our local `DENO_DIR`. Maintaining a local cache lets us check-in our dependencies and improve security.
When cloning your project repository, you should be able to use the project without running `make upgrade`.
Requires the, `DENO_DIR` environment variable, which `make` automatically exports (if set in your `.env` file) for every task.

### `./.vscode/`

Microsoft Visual-Studio Code IDE settings, all configured for use with Deno.
Note that the Deno extension for VSCode doesn't support custom `DENO_DIR` environment variable at the moment.
If VSCode complains about missing imports, run `make cache` and it will safely add your project's dependencies to the global Deno folder.

### `./source/`

Our project's source code. Contains three sub folders:

### `./source/app/`

Platform-independent source code.
Imports platform-dependent code from the `lib` sibling folder.
We need to use explicit import specifiers in this folder, but otherwise should avoid any platform-specific code.

### `./source/lib/`

Each platform we support will have it's own version of the `lib/` folder, `platform/[platform]/source/lib/`, that exports to a common interface.
`lib/` contains library code that was written to run on _Deno_, and isn't copied, compiled, or transformed when generating source code for other platforms.
It's assumed that every platform needs its own platform-specific library code.

### `./source/test/`

Like `./source/lib/`, `test/` contains platform-specific unit tests.
General tests should be co-located with your source code in `app/` so that they can be run on every platform you support.
Tests located here won't be copied or translated for other platforms by `make build`.

### `./platform/<name>`

Contains platform-specific files for our various **platform**s; e.g. a folder for _Node_, the _Web_, etc.

### `./platform/node/`

The Node-compatible build for our project. It can be published to NPM, `npm link`ed as a local dependency in other Node modules, etc.

- `source/` &mdash; generated and platform specific source code for NodeJS.
  - `gen/` &mdash; Node compatible TypeScript code, generated from `./source/app`. See [Why not `bundle`](#why-not-bundle), above, for more information. **Do not edit these files.**
  - `lib/` &mdash; project dependencies and Node-specific code is found here. Modules in _lib_ export a platform-agnostic public interface but may use platform-dependent code internally. These files are not automatically generated and need to be created manually.
  - `test/` &mdash; if you need to write Node- or NPM-specific tests, add them here. Like `lib/`, this folder isn't overwritten by `make node`.
  - `index.ts` &mdash; becomes the module entry-point for `package.json::main`, after compilation.
  - `types.d.ts` &mdash; becomes the type definitions for `package.json::types`, after compilation.
- `dist/` &mdash; Node CommonJS _source_ files compiled by `tsc`.
  - `index.js` &mdash; entry-point for `package.json::main`.
  - `types.d.ts` &mdash; type definitions for `package.json::types`.
- `README.md` &mdash; NPM-specific documentation for the project.
- `tsconfig.json` &mdash; TypeScript configuration. We're targeting CommonJS as the module format until the situation with Node & ESM settles down.
- `tsconfig.production.json` &mdash; TypeScript production configuration.
- `package.json`, etc. The _Node_ module is independent of the Deno parent module, so we can use different linting rules, testing conventions, etc., if desired.

## Try it yourself

I've setup [create-deno-first] as a [template project][template] on [GitHub].
Simple click the `Use this template` button on the repository page to get started.
In the future, we may also enable `npm init @mwm/deno-first` as a deliciously ironic way to bootstrap a Deno-First project.

Once you have a bare-copy of the project, you can run `./configure` and `make` (or `make configure all`) to setup your local environment.
You can then customize the bare-minimum source code included in the template, or begin writing your own application.

If you find this project useful, please let me know!

[template]: https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template
[github]: https://github.com/
[create-deno-first]: https://github.com/matt-mcmahon/create-deno-first
[deno]: https://deno.land/
[explicit]: https://deno.land/manual/getting_started/typescript#using-typescript
[find]: https://www.gnu.org/software/findutils/
[inotify]: https://man7.org/linux/man-pages/man7/inotify.7.html
[make]: https://www.gnu.org/software/make/
[node-compat]: https://deno.land/std/node/README.md
[sed]: https://www.gnu.org/software/sed/manual/sed.html
[shell]: https://www.urbandictionary.com/define.php?term=go%20away%20or%20I%20will%20replace%20you%20with%20a%20simple%20shell%20script
[ts]: https://www.typescriptlang.org/
