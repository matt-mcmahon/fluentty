// deno-fmt-ignore-file
// deno-lint-ignore-file
// @ts-nocheck
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      const e = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(e)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
      return v;
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://deno.land/std@0.75.0/fmt/colors", [], function (exports_1, context_1) {
    "use strict";
    var noColor, enabled, ANSI_PATTERN;
    var __moduleName = context_1 && context_1.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_1("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_1("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_1("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_1("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_1("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_1("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_1("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_1("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_1("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_1("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_1("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_1("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_1("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_1("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_1("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_1("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_1("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_1("white", white);
    function gray(str) {
        return brightBlack(str);
    }
    exports_1("gray", gray);
    function brightBlack(str) {
        return run(str, code([90], 39));
    }
    exports_1("brightBlack", brightBlack);
    function brightRed(str) {
        return run(str, code([91], 39));
    }
    exports_1("brightRed", brightRed);
    function brightGreen(str) {
        return run(str, code([92], 39));
    }
    exports_1("brightGreen", brightGreen);
    function brightYellow(str) {
        return run(str, code([93], 39));
    }
    exports_1("brightYellow", brightYellow);
    function brightBlue(str) {
        return run(str, code([94], 39));
    }
    exports_1("brightBlue", brightBlue);
    function brightMagenta(str) {
        return run(str, code([95], 39));
    }
    exports_1("brightMagenta", brightMagenta);
    function brightCyan(str) {
        return run(str, code([96], 39));
    }
    exports_1("brightCyan", brightCyan);
    function brightWhite(str) {
        return run(str, code([97], 39));
    }
    exports_1("brightWhite", brightWhite);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_1("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_1("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_1("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_1("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_1("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_1("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_1("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_1("bgWhite", bgWhite);
    function bgBrightBlack(str) {
        return run(str, code([100], 49));
    }
    exports_1("bgBrightBlack", bgBrightBlack);
    function bgBrightRed(str) {
        return run(str, code([101], 49));
    }
    exports_1("bgBrightRed", bgBrightRed);
    function bgBrightGreen(str) {
        return run(str, code([102], 49));
    }
    exports_1("bgBrightGreen", bgBrightGreen);
    function bgBrightYellow(str) {
        return run(str, code([103], 49));
    }
    exports_1("bgBrightYellow", bgBrightYellow);
    function bgBrightBlue(str) {
        return run(str, code([104], 49));
    }
    exports_1("bgBrightBlue", bgBrightBlue);
    function bgBrightMagenta(str) {
        return run(str, code([105], 49));
    }
    exports_1("bgBrightMagenta", bgBrightMagenta);
    function bgBrightCyan(str) {
        return run(str, code([106], 49));
    }
    exports_1("bgBrightCyan", bgBrightCyan);
    function bgBrightWhite(str) {
        return run(str, code([107], 49));
    }
    exports_1("bgBrightWhite", bgBrightWhite);
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_1("rgb8", rgb8);
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_1("bgRgb8", bgRgb8);
    function rgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([38, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 39));
        }
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_1("rgb24", rgb24);
    function bgRgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([48, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 49));
        }
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_1("bgRgb24", bgRgb24);
    function stripColor(string) {
        return string.replace(ANSI_PATTERN, "");
    }
    exports_1("stripColor", stripColor);
    return {
        setters: [],
        execute: function () {
            noColor = globalThis.Deno?.noColor ?? true;
            enabled = !noColor;
            ANSI_PATTERN = new RegExp([
                "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
                "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
            ].join("|"), "g");
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/remote/colors", ["https://deno.land/std@0.75.0/fmt/colors"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_2(exports);
    }
    return {
        setters: [
            function (colors_ts_1_1) {
                exportStar_1(colors_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/_constants", [], function (exports_3, context_3) {
    "use strict";
    var CHAR_UPPERCASE_A, CHAR_LOWERCASE_A, CHAR_UPPERCASE_Z, CHAR_LOWERCASE_Z, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_BACKWARD_SLASH, CHAR_VERTICAL_LINE, CHAR_COLON, CHAR_QUESTION_MARK, CHAR_UNDERSCORE, CHAR_LINE_FEED, CHAR_CARRIAGE_RETURN, CHAR_TAB, CHAR_FORM_FEED, CHAR_EXCLAMATION_MARK, CHAR_HASH, CHAR_SPACE, CHAR_NO_BREAK_SPACE, CHAR_ZERO_WIDTH_NOBREAK_SPACE, CHAR_LEFT_SQUARE_BRACKET, CHAR_RIGHT_SQUARE_BRACKET, CHAR_LEFT_ANGLE_BRACKET, CHAR_RIGHT_ANGLE_BRACKET, CHAR_LEFT_CURLY_BRACKET, CHAR_RIGHT_CURLY_BRACKET, CHAR_HYPHEN_MINUS, CHAR_PLUS, CHAR_DOUBLE_QUOTE, CHAR_SINGLE_QUOTE, CHAR_PERCENT, CHAR_SEMICOLON, CHAR_CIRCUMFLEX_ACCENT, CHAR_GRAVE_ACCENT, CHAR_AT, CHAR_AMPERSAND, CHAR_EQUAL, CHAR_0, CHAR_9, NATIVE_OS, navigator, isWindows;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            exports_3("CHAR_UPPERCASE_A", CHAR_UPPERCASE_A = 65);
            exports_3("CHAR_LOWERCASE_A", CHAR_LOWERCASE_A = 97);
            exports_3("CHAR_UPPERCASE_Z", CHAR_UPPERCASE_Z = 90);
            exports_3("CHAR_LOWERCASE_Z", CHAR_LOWERCASE_Z = 122);
            exports_3("CHAR_DOT", CHAR_DOT = 46);
            exports_3("CHAR_FORWARD_SLASH", CHAR_FORWARD_SLASH = 47);
            exports_3("CHAR_BACKWARD_SLASH", CHAR_BACKWARD_SLASH = 92);
            exports_3("CHAR_VERTICAL_LINE", CHAR_VERTICAL_LINE = 124);
            exports_3("CHAR_COLON", CHAR_COLON = 58);
            exports_3("CHAR_QUESTION_MARK", CHAR_QUESTION_MARK = 63);
            exports_3("CHAR_UNDERSCORE", CHAR_UNDERSCORE = 95);
            exports_3("CHAR_LINE_FEED", CHAR_LINE_FEED = 10);
            exports_3("CHAR_CARRIAGE_RETURN", CHAR_CARRIAGE_RETURN = 13);
            exports_3("CHAR_TAB", CHAR_TAB = 9);
            exports_3("CHAR_FORM_FEED", CHAR_FORM_FEED = 12);
            exports_3("CHAR_EXCLAMATION_MARK", CHAR_EXCLAMATION_MARK = 33);
            exports_3("CHAR_HASH", CHAR_HASH = 35);
            exports_3("CHAR_SPACE", CHAR_SPACE = 32);
            exports_3("CHAR_NO_BREAK_SPACE", CHAR_NO_BREAK_SPACE = 160);
            exports_3("CHAR_ZERO_WIDTH_NOBREAK_SPACE", CHAR_ZERO_WIDTH_NOBREAK_SPACE = 65279);
            exports_3("CHAR_LEFT_SQUARE_BRACKET", CHAR_LEFT_SQUARE_BRACKET = 91);
            exports_3("CHAR_RIGHT_SQUARE_BRACKET", CHAR_RIGHT_SQUARE_BRACKET = 93);
            exports_3("CHAR_LEFT_ANGLE_BRACKET", CHAR_LEFT_ANGLE_BRACKET = 60);
            exports_3("CHAR_RIGHT_ANGLE_BRACKET", CHAR_RIGHT_ANGLE_BRACKET = 62);
            exports_3("CHAR_LEFT_CURLY_BRACKET", CHAR_LEFT_CURLY_BRACKET = 123);
            exports_3("CHAR_RIGHT_CURLY_BRACKET", CHAR_RIGHT_CURLY_BRACKET = 125);
            exports_3("CHAR_HYPHEN_MINUS", CHAR_HYPHEN_MINUS = 45);
            exports_3("CHAR_PLUS", CHAR_PLUS = 43);
            exports_3("CHAR_DOUBLE_QUOTE", CHAR_DOUBLE_QUOTE = 34);
            exports_3("CHAR_SINGLE_QUOTE", CHAR_SINGLE_QUOTE = 39);
            exports_3("CHAR_PERCENT", CHAR_PERCENT = 37);
            exports_3("CHAR_SEMICOLON", CHAR_SEMICOLON = 59);
            exports_3("CHAR_CIRCUMFLEX_ACCENT", CHAR_CIRCUMFLEX_ACCENT = 94);
            exports_3("CHAR_GRAVE_ACCENT", CHAR_GRAVE_ACCENT = 96);
            exports_3("CHAR_AT", CHAR_AT = 64);
            exports_3("CHAR_AMPERSAND", CHAR_AMPERSAND = 38);
            exports_3("CHAR_EQUAL", CHAR_EQUAL = 61);
            exports_3("CHAR_0", CHAR_0 = 48);
            exports_3("CHAR_9", CHAR_9 = 57);
            NATIVE_OS = "linux";
            exports_3("NATIVE_OS", NATIVE_OS);
            navigator = globalThis.navigator;
            if (globalThis.Deno != null) {
                exports_3("NATIVE_OS", NATIVE_OS = Deno.build.os);
            }
            else if (navigator?.appVersion?.includes?.("Win") ?? false) {
                exports_3("NATIVE_OS", NATIVE_OS = "windows");
            }
            exports_3("isWindows", isWindows = NATIVE_OS == "windows");
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/_interface", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/_util", ["https://deno.land/std@0.75.0/path/_constants"], function (exports_5, context_5) {
    "use strict";
    var _constants_ts_1;
    var __moduleName = context_5 && context_5.id;
    function assertPath(path) {
        if (typeof path !== "string") {
            throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
        }
    }
    exports_5("assertPath", assertPath);
    function isPosixPathSeparator(code) {
        return code === _constants_ts_1.CHAR_FORWARD_SLASH;
    }
    exports_5("isPosixPathSeparator", isPosixPathSeparator);
    function isPathSeparator(code) {
        return isPosixPathSeparator(code) || code === _constants_ts_1.CHAR_BACKWARD_SLASH;
    }
    exports_5("isPathSeparator", isPathSeparator);
    function isWindowsDeviceRoot(code) {
        return ((code >= _constants_ts_1.CHAR_LOWERCASE_A && code <= _constants_ts_1.CHAR_LOWERCASE_Z) ||
            (code >= _constants_ts_1.CHAR_UPPERCASE_A && code <= _constants_ts_1.CHAR_UPPERCASE_Z));
    }
    exports_5("isWindowsDeviceRoot", isWindowsDeviceRoot);
    function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
        let res = "";
        let lastSegmentLength = 0;
        let lastSlash = -1;
        let dots = 0;
        let code;
        for (let i = 0, len = path.length; i <= len; ++i) {
            if (i < len)
                code = path.charCodeAt(i);
            else if (isPathSeparator(code))
                break;
            else
                code = _constants_ts_1.CHAR_FORWARD_SLASH;
            if (isPathSeparator(code)) {
                if (lastSlash === i - 1 || dots === 1) {
                }
                else if (lastSlash !== i - 1 && dots === 2) {
                    if (res.length < 2 ||
                        lastSegmentLength !== 2 ||
                        res.charCodeAt(res.length - 1) !== _constants_ts_1.CHAR_DOT ||
                        res.charCodeAt(res.length - 2) !== _constants_ts_1.CHAR_DOT) {
                        if (res.length > 2) {
                            const lastSlashIndex = res.lastIndexOf(separator);
                            if (lastSlashIndex === -1) {
                                res = "";
                                lastSegmentLength = 0;
                            }
                            else {
                                res = res.slice(0, lastSlashIndex);
                                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                            }
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                        else if (res.length === 2 || res.length === 1) {
                            res = "";
                            lastSegmentLength = 0;
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    if (allowAboveRoot) {
                        if (res.length > 0)
                            res += `${separator}..`;
                        else
                            res = "..";
                        lastSegmentLength = 2;
                    }
                }
                else {
                    if (res.length > 0)
                        res += separator + path.slice(lastSlash + 1, i);
                    else
                        res = path.slice(lastSlash + 1, i);
                    lastSegmentLength = i - lastSlash - 1;
                }
                lastSlash = i;
                dots = 0;
            }
            else if (code === _constants_ts_1.CHAR_DOT && dots !== -1) {
                ++dots;
            }
            else {
                dots = -1;
            }
        }
        return res;
    }
    exports_5("normalizeString", normalizeString);
    function _format(sep, pathObject) {
        const dir = pathObject.dir || pathObject.root;
        const base = pathObject.base ||
            (pathObject.name || "") + (pathObject.ext || "");
        if (!dir)
            return base;
        if (dir === pathObject.root)
            return dir + base;
        return dir + sep + base;
    }
    exports_5("_format", _format);
    return {
        setters: [
            function (_constants_ts_1_1) {
                _constants_ts_1 = _constants_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/_util/assert", [], function (exports_6, context_6) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_6 && context_6.id;
    function assert(expr, msg = "") {
        if (!expr) {
            throw new DenoStdInternalError(msg);
        }
    }
    exports_6("assert", assert);
    return {
        setters: [],
        execute: function () {
            DenoStdInternalError = class DenoStdInternalError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "DenoStdInternalError";
                }
            };
            exports_6("DenoStdInternalError", DenoStdInternalError);
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/win32", ["https://deno.land/std@0.75.0/path/_constants", "https://deno.land/std@0.75.0/path/_util", "https://deno.land/std@0.75.0/_util/assert"], function (exports_7, context_7) {
    "use strict";
    var _constants_ts_2, _util_ts_1, assert_ts_1, sep, delimiter;
    var __moduleName = context_7 && context_7.id;
    function resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
            let path;
            if (i >= 0) {
                path = pathSegments[i];
            }
            else if (!resolvedDevice) {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a drive-letter-less path without a CWD.");
                }
                path = Deno.cwd();
            }
            else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
                if (path === undefined ||
                    path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                    path = `${resolvedDevice}\\`;
                }
            }
            _util_ts_1.assertPath(path);
            const len = path.length;
            if (len === 0)
                continue;
            let rootEnd = 0;
            let device = "";
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            if (len > 1) {
                if (_util_ts_1.isPathSeparator(code)) {
                    isAbsolute = true;
                    if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                        let j = 2;
                        let last = j;
                        for (; j < len; ++j) {
                            if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            const firstPart = path.slice(last, j);
                            last = j;
                            for (; j < len; ++j) {
                                if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j < len && j !== last) {
                                last = j;
                                for (; j < len; ++j) {
                                    if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                        break;
                                }
                                if (j === len) {
                                    device = `\\\\${firstPart}\\${path.slice(last)}`;
                                    rootEnd = j;
                                }
                                else if (j !== last) {
                                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                    rootEnd = j;
                                }
                            }
                        }
                    }
                    else {
                        rootEnd = 1;
                    }
                }
                else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                    if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                        device = path.slice(0, 2);
                        rootEnd = 2;
                        if (len > 2) {
                            if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                                isAbsolute = true;
                                rootEnd = 3;
                            }
                        }
                    }
                }
            }
            else if (_util_ts_1.isPathSeparator(code)) {
                rootEnd = 1;
                isAbsolute = true;
            }
            if (device.length > 0 &&
                resolvedDevice.length > 0 &&
                device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
            }
            if (resolvedDevice.length === 0 && device.length > 0) {
                resolvedDevice = device;
            }
            if (!resolvedAbsolute) {
                resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                resolvedAbsolute = isAbsolute;
            }
            if (resolvedAbsolute && resolvedDevice.length > 0)
                break;
        }
        resolvedTail = _util_ts_1.normalizeString(resolvedTail, !resolvedAbsolute, "\\", _util_ts_1.isPathSeparator);
        return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
    }
    exports_7("resolve", resolve);
    function normalize(path) {
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0)
            return ".";
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (_util_ts_1.isPathSeparator(code)) {
                isAbsolute = true;
                if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for (; j < len; ++j) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                            break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for (; j < len; ++j) {
                            if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for (; j < len; ++j) {
                                if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j === len) {
                                return `\\\\${firstPart}\\${path.slice(last)}\\`;
                            }
                            else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                }
                else {
                    rootEnd = 1;
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        }
        else if (_util_ts_1.isPathSeparator(code)) {
            return "\\";
        }
        let tail;
        if (rootEnd < len) {
            tail = _util_ts_1.normalizeString(path.slice(rootEnd), !isAbsolute, "\\", _util_ts_1.isPathSeparator);
        }
        else {
            tail = "";
        }
        if (tail.length === 0 && !isAbsolute)
            tail = ".";
        if (tail.length > 0 && _util_ts_1.isPathSeparator(path.charCodeAt(len - 1))) {
            tail += "\\";
        }
        if (device === undefined) {
            if (isAbsolute) {
                if (tail.length > 0)
                    return `\\${tail}`;
                else
                    return "\\";
            }
            else if (tail.length > 0) {
                return tail;
            }
            else {
                return "";
            }
        }
        else if (isAbsolute) {
            if (tail.length > 0)
                return `${device}\\${tail}`;
            else
                return `${device}\\`;
        }
        else if (tail.length > 0) {
            return device + tail;
        }
        else {
            return device;
        }
    }
    exports_7("normalize", normalize);
    function isAbsolute(path) {
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0)
            return false;
        const code = path.charCodeAt(0);
        if (_util_ts_1.isPathSeparator(code)) {
            return true;
        }
        else if (_util_ts_1.isWindowsDeviceRoot(code)) {
            if (len > 2 && path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                if (_util_ts_1.isPathSeparator(path.charCodeAt(2)))
                    return true;
            }
        }
        return false;
    }
    exports_7("isAbsolute", isAbsolute);
    function join(...paths) {
        const pathsCount = paths.length;
        if (pathsCount === 0)
            return ".";
        let joined;
        let firstPart = null;
        for (let i = 0; i < pathsCount; ++i) {
            const path = paths[i];
            _util_ts_1.assertPath(path);
            if (path.length > 0) {
                if (joined === undefined)
                    joined = firstPart = path;
                else
                    joined += `\\${path}`;
            }
        }
        if (joined === undefined)
            return ".";
        let needsReplace = true;
        let slashCount = 0;
        assert_ts_1.assert(firstPart != null);
        if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(0))) {
            ++slashCount;
            const firstLen = firstPart.length;
            if (firstLen > 1) {
                if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(1))) {
                    ++slashCount;
                    if (firstLen > 2) {
                        if (_util_ts_1.isPathSeparator(firstPart.charCodeAt(2)))
                            ++slashCount;
                        else {
                            needsReplace = false;
                        }
                    }
                }
            }
        }
        if (needsReplace) {
            for (; slashCount < joined.length; ++slashCount) {
                if (!_util_ts_1.isPathSeparator(joined.charCodeAt(slashCount)))
                    break;
            }
            if (slashCount >= 2)
                joined = `\\${joined.slice(slashCount)}`;
        }
        return normalize(joined);
    }
    exports_7("join", join);
    function relative(from, to) {
        _util_ts_1.assertPath(from);
        _util_ts_1.assertPath(to);
        if (from === to)
            return "";
        const fromOrig = resolve(from);
        const toOrig = resolve(to);
        if (fromOrig === toOrig)
            return "";
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to)
            return "";
        let fromStart = 0;
        let fromEnd = from.length;
        for (; fromStart < fromEnd; ++fromStart) {
            if (from.charCodeAt(fromStart) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        for (; fromEnd - 1 > fromStart; --fromEnd) {
            if (from.charCodeAt(fromEnd - 1) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        let toEnd = to.length;
        for (; toStart < toEnd; ++toStart) {
            if (to.charCodeAt(toStart) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        for (; toEnd - 1 > toStart; --toEnd) {
            if (to.charCodeAt(toEnd - 1) !== _constants_ts_2.CHAR_BACKWARD_SLASH)
                break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                        return toOrig.slice(toStart + i + 1);
                    }
                    else if (i === 2) {
                        return toOrig.slice(toStart + i);
                    }
                }
                if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                        lastCommonSep = i;
                    }
                    else if (i === 2) {
                        lastCommonSep = 3;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === _constants_ts_2.CHAR_BACKWARD_SLASH)
                lastCommonSep = i;
        }
        if (i !== length && lastCommonSep === -1) {
            return toOrig;
        }
        let out = "";
        if (lastCommonSep === -1)
            lastCommonSep = 0;
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                if (out.length === 0)
                    out += "..";
                else
                    out += "\\..";
            }
        }
        if (out.length > 0) {
            return out + toOrig.slice(toStart + lastCommonSep, toEnd);
        }
        else {
            toStart += lastCommonSep;
            if (toOrig.charCodeAt(toStart) === _constants_ts_2.CHAR_BACKWARD_SLASH)
                ++toStart;
            return toOrig.slice(toStart, toEnd);
        }
    }
    exports_7("relative", relative);
    function toNamespacedPath(path) {
        if (typeof path !== "string")
            return path;
        if (path.length === 0)
            return "";
        const resolvedPath = resolve(path);
        if (resolvedPath.length >= 3) {
            if (resolvedPath.charCodeAt(0) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                if (resolvedPath.charCodeAt(1) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                    const code = resolvedPath.charCodeAt(2);
                    if (code !== _constants_ts_2.CHAR_QUESTION_MARK && code !== _constants_ts_2.CHAR_DOT) {
                        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                    }
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
                if (resolvedPath.charCodeAt(1) === _constants_ts_2.CHAR_COLON &&
                    resolvedPath.charCodeAt(2) === _constants_ts_2.CHAR_BACKWARD_SLASH) {
                    return `\\\\?\\${resolvedPath}`;
                }
            }
        }
        return path;
    }
    exports_7("toNamespacedPath", toNamespacedPath);
    function dirname(path) {
        _util_ts_1.assertPath(path);
        const len = path.length;
        if (len === 0)
            return ".";
        let rootEnd = -1;
        let end = -1;
        let matchedSlash = true;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (_util_ts_1.isPathSeparator(code)) {
                rootEnd = offset = 1;
                if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for (; j < len; ++j) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                            break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for (; j < len; ++j) {
                            if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for (; j < len; ++j) {
                                if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j === len) {
                                return path;
                            }
                            if (j !== last) {
                                rootEnd = offset = j + 1;
                            }
                        }
                    }
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                    rootEnd = offset = 2;
                    if (len > 2) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(2)))
                            rootEnd = offset = 3;
                    }
                }
            }
        }
        else if (_util_ts_1.isPathSeparator(code)) {
            return path;
        }
        for (let i = len - 1; i >= offset; --i) {
            if (_util_ts_1.isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            }
            else {
                matchedSlash = false;
            }
        }
        if (end === -1) {
            if (rootEnd === -1)
                return ".";
            else
                end = rootEnd;
        }
        return path.slice(0, end);
    }
    exports_7("dirname", dirname);
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        _util_ts_1.assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path.length >= 2) {
            const drive = path.charCodeAt(0);
            if (_util_ts_1.isWindowsDeviceRoot(drive)) {
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON)
                    start = 2;
            }
        }
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path)
                return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= start; --i) {
                const code = path.charCodeAt(i);
                if (_util_ts_1.isPathSeparator(code)) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                end = i;
                            }
                        }
                        else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end)
                end = firstNonSlashEnd;
            else if (end === -1)
                end = path.length;
            return path.slice(start, end);
        }
        else {
            for (i = path.length - 1; i >= start; --i) {
                if (_util_ts_1.isPathSeparator(path.charCodeAt(i))) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1)
                return "";
            return path.slice(start, end);
        }
    }
    exports_7("basename", basename);
    function extname(path) {
        _util_ts_1.assertPath(path);
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path.length >= 2 &&
            path.charCodeAt(1) === _constants_ts_2.CHAR_COLON &&
            _util_ts_1.isWindowsDeviceRoot(path.charCodeAt(0))) {
            start = startPart = 2;
        }
        for (let i = path.length - 1; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (_util_ts_1.isPathSeparator(code)) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_2.CHAR_DOT) {
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            preDotState === 0 ||
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            return "";
        }
        return path.slice(startDot, end);
    }
    exports_7("extname", extname);
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _util_ts_1._format("\\", pathObject);
    }
    exports_7("format", format);
    function parse(path) {
        _util_ts_1.assertPath(path);
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        const len = path.length;
        if (len === 0)
            return ret;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len > 1) {
            if (_util_ts_1.isPathSeparator(code)) {
                rootEnd = 1;
                if (_util_ts_1.isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for (; j < len; ++j) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                            break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for (; j < len; ++j) {
                            if (!_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for (; j < len; ++j) {
                                if (_util_ts_1.isPathSeparator(path.charCodeAt(j)))
                                    break;
                            }
                            if (j === len) {
                                rootEnd = j;
                            }
                            else if (j !== last) {
                                rootEnd = j + 1;
                            }
                        }
                    }
                }
            }
            else if (_util_ts_1.isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === _constants_ts_2.CHAR_COLON) {
                    rootEnd = 2;
                    if (len > 2) {
                        if (_util_ts_1.isPathSeparator(path.charCodeAt(2))) {
                            if (len === 3) {
                                ret.root = ret.dir = path;
                                return ret;
                            }
                            rootEnd = 3;
                        }
                    }
                    else {
                        ret.root = ret.dir = path;
                        return ret;
                    }
                }
            }
        }
        else if (_util_ts_1.isPathSeparator(code)) {
            ret.root = ret.dir = path;
            return ret;
        }
        if (rootEnd > 0)
            ret.root = path.slice(0, rootEnd);
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for (; i >= rootEnd; --i) {
            code = path.charCodeAt(i);
            if (_util_ts_1.isPathSeparator(code)) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_2.CHAR_DOT) {
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            preDotState === 0 ||
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            if (end !== -1) {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
        else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0 && startPart !== rootEnd) {
            ret.dir = path.slice(0, startPart - 1);
        }
        else
            ret.dir = ret.root;
        return ret;
    }
    exports_7("parse", parse);
    function fromFileUrl(url) {
        url = url instanceof URL ? url : new URL(url);
        if (url.protocol != "file:") {
            throw new TypeError("Must be a file URL.");
        }
        let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
        if (url.hostname != "") {
            path = `\\\\${url.hostname}${path}`;
        }
        return path;
    }
    exports_7("fromFileUrl", fromFileUrl);
    function toFileUrl(path) {
        if (!isAbsolute(path)) {
            throw new TypeError("Must be an absolute path.");
        }
        const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\][^/\\]))?(.*)/);
        const url = new URL("file:///");
        url.pathname = pathname.replace(/%/g, "%25");
        if (hostname != null) {
            url.hostname = hostname;
            if (!url.hostname) {
                throw new TypeError("Invalid hostname.");
            }
        }
        return url;
    }
    exports_7("toFileUrl", toFileUrl);
    return {
        setters: [
            function (_constants_ts_2_1) {
                _constants_ts_2 = _constants_ts_2_1;
            },
            function (_util_ts_1_1) {
                _util_ts_1 = _util_ts_1_1;
            },
            function (assert_ts_1_1) {
                assert_ts_1 = assert_ts_1_1;
            }
        ],
        execute: function () {
            exports_7("sep", sep = "\\");
            exports_7("delimiter", delimiter = ";");
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/posix", ["https://deno.land/std@0.75.0/path/_constants", "https://deno.land/std@0.75.0/path/_util"], function (exports_8, context_8) {
    "use strict";
    var _constants_ts_3, _util_ts_2, sep, delimiter;
    var __moduleName = context_8 && context_8.id;
    function resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            let path;
            if (i >= 0)
                path = pathSegments[i];
            else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.cwd();
            }
            _util_ts_2.assertPath(path);
            if (path.length === 0) {
                continue;
            }
            resolvedPath = `${path}/${resolvedPath}`;
            resolvedAbsolute = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        }
        resolvedPath = _util_ts_2.normalizeString(resolvedPath, !resolvedAbsolute, "/", _util_ts_2.isPosixPathSeparator);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0)
                return `/${resolvedPath}`;
            else
                return "/";
        }
        else if (resolvedPath.length > 0)
            return resolvedPath;
        else
            return ".";
    }
    exports_8("resolve", resolve);
    function normalize(path) {
        _util_ts_2.assertPath(path);
        if (path.length === 0)
            return ".";
        const isAbsolute = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        const trailingSeparator = path.charCodeAt(path.length - 1) === _constants_ts_3.CHAR_FORWARD_SLASH;
        path = _util_ts_2.normalizeString(path, !isAbsolute, "/", _util_ts_2.isPosixPathSeparator);
        if (path.length === 0 && !isAbsolute)
            path = ".";
        if (path.length > 0 && trailingSeparator)
            path += "/";
        if (isAbsolute)
            return `/${path}`;
        return path;
    }
    exports_8("normalize", normalize);
    function isAbsolute(path) {
        _util_ts_2.assertPath(path);
        return path.length > 0 && path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
    }
    exports_8("isAbsolute", isAbsolute);
    function join(...paths) {
        if (paths.length === 0)
            return ".";
        let joined;
        for (let i = 0, len = paths.length; i < len; ++i) {
            const path = paths[i];
            _util_ts_2.assertPath(path);
            if (path.length > 0) {
                if (!joined)
                    joined = path;
                else
                    joined += `/${path}`;
            }
        }
        if (!joined)
            return ".";
        return normalize(joined);
    }
    exports_8("join", join);
    function relative(from, to) {
        _util_ts_2.assertPath(from);
        _util_ts_2.assertPath(to);
        if (from === to)
            return "";
        from = resolve(from);
        to = resolve(to);
        if (from === to)
            return "";
        let fromStart = 1;
        const fromEnd = from.length;
        for (; fromStart < fromEnd; ++fromStart) {
            if (from.charCodeAt(fromStart) !== _constants_ts_3.CHAR_FORWARD_SLASH)
                break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 1;
        const toEnd = to.length;
        for (; toStart < toEnd; ++toStart) {
            if (to.charCodeAt(toStart) !== _constants_ts_3.CHAR_FORWARD_SLASH)
                break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                        return to.slice(toStart + i + 1);
                    }
                    else if (i === 0) {
                        return to.slice(toStart + i);
                    }
                }
                else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                        lastCommonSep = i;
                    }
                    else if (i === 0) {
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === _constants_ts_3.CHAR_FORWARD_SLASH)
                lastCommonSep = i;
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                if (out.length === 0)
                    out += "..";
                else
                    out += "/..";
            }
        }
        if (out.length > 0)
            return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === _constants_ts_3.CHAR_FORWARD_SLASH)
                ++toStart;
            return to.slice(toStart);
        }
    }
    exports_8("relative", relative);
    function toNamespacedPath(path) {
        return path;
    }
    exports_8("toNamespacedPath", toNamespacedPath);
    function dirname(path) {
        _util_ts_2.assertPath(path);
        if (path.length === 0)
            return ".";
        const hasRoot = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        let end = -1;
        let matchedSlash = true;
        for (let i = path.length - 1; i >= 1; --i) {
            if (path.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            }
            else {
                matchedSlash = false;
            }
        }
        if (end === -1)
            return hasRoot ? "/" : ".";
        if (hasRoot && end === 1)
            return "//";
        return path.slice(0, end);
    }
    exports_8("dirname", dirname);
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        _util_ts_2.assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path)
                return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= 0; --i) {
                const code = path.charCodeAt(i);
                if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                end = i;
                            }
                        }
                        else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end)
                end = firstNonSlashEnd;
            else if (end === -1)
                end = path.length;
            return path.slice(start, end);
        }
        else {
            for (i = path.length - 1; i >= 0; --i) {
                if (path.charCodeAt(i) === _constants_ts_3.CHAR_FORWARD_SLASH) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1)
                return "";
            return path.slice(start, end);
        }
    }
    exports_8("basename", basename);
    function extname(path) {
        _util_ts_2.assertPath(path);
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for (let i = path.length - 1; i >= 0; --i) {
            const code = path.charCodeAt(i);
            if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_3.CHAR_DOT) {
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            preDotState === 0 ||
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            return "";
        }
        return path.slice(startDot, end);
    }
    exports_8("extname", extname);
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _util_ts_2._format("/", pathObject);
    }
    exports_8("format", format);
    function parse(path) {
        _util_ts_2.assertPath(path);
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path.length === 0)
            return ret;
        const isAbsolute = path.charCodeAt(0) === _constants_ts_3.CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute) {
            ret.root = "/";
            start = 1;
        }
        else {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for (; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (code === _constants_ts_3.CHAR_FORWARD_SLASH) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === _constants_ts_3.CHAR_DOT) {
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            preDotState === 0 ||
            (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute) {
                    ret.base = ret.name = path.slice(1, end);
                }
                else {
                    ret.base = ret.name = path.slice(startPart, end);
                }
            }
        }
        else {
            if (startPart === 0 && isAbsolute) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            }
            else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0)
            ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute)
            ret.dir = "/";
        return ret;
    }
    exports_8("parse", parse);
    function fromFileUrl(url) {
        url = url instanceof URL ? url : new URL(url);
        if (url.protocol != "file:") {
            throw new TypeError("Must be a file URL.");
        }
        return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
    }
    exports_8("fromFileUrl", fromFileUrl);
    function toFileUrl(path) {
        if (!isAbsolute(path)) {
            throw new TypeError("Must be an absolute path.");
        }
        const url = new URL("file:///");
        url.pathname = path.replace(/%/g, "%25").replace(/\\/g, "%5C");
        return url;
    }
    exports_8("toFileUrl", toFileUrl);
    return {
        setters: [
            function (_constants_ts_3_1) {
                _constants_ts_3 = _constants_ts_3_1;
            },
            function (_util_ts_2_1) {
                _util_ts_2 = _util_ts_2_1;
            }
        ],
        execute: function () {
            exports_8("sep", sep = "/");
            exports_8("delimiter", delimiter = ":");
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/separator", ["https://deno.land/std@0.75.0/path/_constants"], function (exports_9, context_9) {
    "use strict";
    var _constants_ts_4, SEP, SEP_PATTERN;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (_constants_ts_4_1) {
                _constants_ts_4 = _constants_ts_4_1;
            }
        ],
        execute: function () {
            exports_9("SEP", SEP = _constants_ts_4.isWindows ? "\\" : "/");
            exports_9("SEP_PATTERN", SEP_PATTERN = _constants_ts_4.isWindows ? /[\\/]+/ : /\/+/);
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/common", ["https://deno.land/std@0.75.0/path/separator"], function (exports_10, context_10) {
    "use strict";
    var separator_ts_1;
    var __moduleName = context_10 && context_10.id;
    function common(paths, sep = separator_ts_1.SEP) {
        const [first = "", ...remaining] = paths;
        if (first === "" || remaining.length === 0) {
            return first.substring(0, first.lastIndexOf(sep) + 1);
        }
        const parts = first.split(sep);
        let endOfPrefix = parts.length;
        for (const path of remaining) {
            const compare = path.split(sep);
            for (let i = 0; i < endOfPrefix; i++) {
                if (compare[i] !== parts[i]) {
                    endOfPrefix = i;
                }
            }
            if (endOfPrefix === 0) {
                return "";
            }
        }
        const prefix = parts.slice(0, endOfPrefix).join(sep);
        return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
    }
    exports_10("common", common);
    return {
        setters: [
            function (separator_ts_1_1) {
                separator_ts_1 = separator_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/glob", ["https://deno.land/std@0.75.0/path/_constants", "https://deno.land/std@0.75.0/path/mod", "https://deno.land/std@0.75.0/path/separator"], function (exports_11, context_11) {
    "use strict";
    var _constants_ts_5, mod_ts_1, separator_ts_2, regExpEscapeChars, rangeEscapeChars;
    var __moduleName = context_11 && context_11.id;
    function globToRegExp(glob, { extended = true, globstar: globstarOption = true, os = _constants_ts_5.NATIVE_OS } = {}) {
        if (glob == "") {
            return /(?!)/;
        }
        const sep = os == "windows" ? "(?:\\\\|/)+" : "/+";
        const sepMaybe = os == "windows" ? "(?:\\\\|/)*" : "/*";
        const seps = os == "windows" ? ["\\", "/"] : ["/"];
        const globstar = os == "windows"
            ? "(?:[^\\\\/]*(?:\\\\|/|$)+)*"
            : "(?:[^/]*(?:/|$)+)*";
        const wildcard = os == "windows" ? "[^\\\\/]*" : "[^/]*";
        const escapePrefix = os == "windows" ? "`" : "\\";
        let newLength = glob.length;
        for (; newLength > 1 && seps.includes(glob[newLength - 1]); newLength--)
            ;
        glob = glob.slice(0, newLength);
        let regExpString = "";
        for (let j = 0; j < glob.length;) {
            let segment = "";
            const groupStack = [];
            let inRange = false;
            let inEscape = false;
            let endsWithSep = false;
            let i = j;
            for (; i < glob.length && !seps.includes(glob[i]); i++) {
                if (inEscape) {
                    inEscape = false;
                    const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
                    segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
                    continue;
                }
                if (glob[i] == escapePrefix) {
                    inEscape = true;
                    continue;
                }
                if (glob[i] == "[") {
                    if (!inRange) {
                        inRange = true;
                        segment += "[";
                        if (glob[i + 1] == "!") {
                            i++;
                            segment += "^";
                        }
                        else if (glob[i + 1] == "^") {
                            i++;
                            segment += "\\^";
                        }
                        continue;
                    }
                    else if (glob[i + 1] == ":") {
                        let k = i + 1;
                        let value = "";
                        while (glob[k + 1] != null && glob[k + 1] != ":") {
                            value += glob[k + 1];
                            k++;
                        }
                        if (glob[k + 1] == ":" && glob[k + 2] == "]") {
                            i = k + 2;
                            if (value == "alnum")
                                segment += "\\dA-Za-z";
                            else if (value == "alpha")
                                segment += "A-Za-z";
                            else if (value == "ascii")
                                segment += "\x00-\x7F";
                            else if (value == "blank")
                                segment += "\t ";
                            else if (value == "cntrl")
                                segment += "\x00-\x1F\x7F";
                            else if (value == "digit")
                                segment += "\\d";
                            else if (value == "graph")
                                segment += "\x21-\x7E";
                            else if (value == "lower")
                                segment += "a-z";
                            else if (value == "print")
                                segment += "\x20-\x7E";
                            else if (value == "punct") {
                                segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
                            }
                            else if (value == "space")
                                segment += "\\s\v";
                            else if (value == "upper")
                                segment += "A-Z";
                            else if (value == "word")
                                segment += "\\w";
                            else if (value == "xdigit")
                                segment += "\\dA-Fa-f";
                            continue;
                        }
                    }
                }
                if (glob[i] == "]" && inRange) {
                    inRange = false;
                    segment += "]";
                    continue;
                }
                if (inRange) {
                    if (glob[i] == "\\") {
                        segment += `\\\\`;
                    }
                    else {
                        segment += glob[i];
                    }
                    continue;
                }
                if (glob[i] == ")" && groupStack.length > 0 &&
                    groupStack[groupStack.length - 1] != "BRACE") {
                    segment += ")";
                    const type = groupStack.pop();
                    if (type == "!") {
                        segment += wildcard;
                    }
                    else if (type != "@") {
                        segment += type;
                    }
                    continue;
                }
                if (glob[i] == "|" && groupStack.length > 0 &&
                    groupStack[groupStack.length - 1] != "BRACE") {
                    segment += "|";
                    continue;
                }
                if (glob[i] == "+" && extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("+");
                    segment += "(?:";
                    continue;
                }
                if (glob[i] == "@" && extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("@");
                    segment += "(?:";
                    continue;
                }
                if (glob[i] == "?") {
                    if (extended && glob[i + 1] == "(") {
                        i++;
                        groupStack.push("?");
                        segment += "(?:";
                    }
                    else {
                        segment += ".";
                    }
                    continue;
                }
                if (glob[i] == "!" && extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("!");
                    segment += "(?!";
                    continue;
                }
                if (glob[i] == "{") {
                    groupStack.push("BRACE");
                    segment += "(?:";
                    continue;
                }
                if (glob[i] == "}" && groupStack[groupStack.length - 1] == "BRACE") {
                    groupStack.pop();
                    segment += ")";
                    continue;
                }
                if (glob[i] == "," && groupStack[groupStack.length - 1] == "BRACE") {
                    segment += "|";
                    continue;
                }
                if (glob[i] == "*") {
                    if (extended && glob[i + 1] == "(") {
                        i++;
                        groupStack.push("*");
                        segment += "(?:";
                    }
                    else {
                        const prevChar = glob[i - 1];
                        let numStars = 1;
                        while (glob[i + 1] == "*") {
                            i++;
                            numStars++;
                        }
                        const nextChar = glob[i + 1];
                        if (globstarOption && numStars == 2 &&
                            [...seps, undefined].includes(prevChar) &&
                            [...seps, undefined].includes(nextChar)) {
                            segment += globstar;
                            endsWithSep = true;
                        }
                        else {
                            segment += wildcard;
                        }
                    }
                    continue;
                }
                segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
            }
            if (groupStack.length > 0 || inRange || inEscape) {
                segment = "";
                for (const c of glob.slice(j, i)) {
                    segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
                    endsWithSep = false;
                }
            }
            regExpString += segment;
            if (!endsWithSep) {
                regExpString += i < glob.length ? sep : sepMaybe;
                endsWithSep = true;
            }
            while (seps.includes(glob[i]))
                i++;
            if (!(i > j)) {
                throw new Error("Assertion failure: i > j (potential infinite loop)");
            }
            j = i;
        }
        regExpString = `^${regExpString}$`;
        return new RegExp(regExpString);
    }
    exports_11("globToRegExp", globToRegExp);
    function isGlob(str) {
        const chars = { "{": "}", "(": ")", "[": "]" };
        const regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
        if (str === "") {
            return false;
        }
        let match;
        while ((match = regex.exec(str))) {
            if (match[2])
                return true;
            let idx = match.index + match[0].length;
            const open = match[1];
            const close = open ? chars[open] : null;
            if (open && close) {
                const n = str.indexOf(close, idx);
                if (n !== -1) {
                    idx = n + 1;
                }
            }
            str = str.slice(idx);
        }
        return false;
    }
    exports_11("isGlob", isGlob);
    function normalizeGlob(glob, { globstar = false } = {}) {
        if (glob.match(/\0/g)) {
            throw new Error(`Glob contains invalid characters: "${glob}"`);
        }
        if (!globstar) {
            return mod_ts_1.normalize(glob);
        }
        const s = separator_ts_2.SEP_PATTERN.source;
        const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
        return mod_ts_1.normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
    }
    exports_11("normalizeGlob", normalizeGlob);
    function joinGlobs(globs, { extended = false, globstar = false } = {}) {
        if (!globstar || globs.length == 0) {
            return mod_ts_1.join(...globs);
        }
        if (globs.length === 0)
            return ".";
        let joined;
        for (const glob of globs) {
            const path = glob;
            if (path.length > 0) {
                if (!joined)
                    joined = path;
                else
                    joined += `${separator_ts_2.SEP}${path}`;
            }
        }
        if (!joined)
            return ".";
        return normalizeGlob(joined, { extended, globstar });
    }
    exports_11("joinGlobs", joinGlobs);
    return {
        setters: [
            function (_constants_ts_5_1) {
                _constants_ts_5 = _constants_ts_5_1;
            },
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            },
            function (separator_ts_2_1) {
                separator_ts_2 = separator_ts_2_1;
            }
        ],
        execute: function () {
            regExpEscapeChars = ["!", "$", "(", ")", "*", "+", ".", "=", "?", "[", "\\", "^", "{", "|"];
            rangeEscapeChars = ["-", "\\", "]"];
        }
    };
});
System.register("https://deno.land/std@0.75.0/path/mod", ["https://deno.land/std@0.75.0/path/_constants", "https://deno.land/std@0.75.0/path/win32", "https://deno.land/std@0.75.0/path/posix", "https://deno.land/std@0.75.0/path/common", "https://deno.land/std@0.75.0/path/separator", "https://deno.land/std@0.75.0/path/_interface", "https://deno.land/std@0.75.0/path/glob"], function (exports_12, context_12) {
    "use strict";
    var _constants_ts_6, _win32, _posix, path, win32, posix, basename, delimiter, dirname, extname, format, fromFileUrl, isAbsolute, join, normalize, parse, relative, resolve, sep, toFileUrl, toNamespacedPath;
    var __moduleName = context_12 && context_12.id;
    var exportedNames_1 = {
        "win32": true,
        "posix": true,
        "basename": true,
        "delimiter": true,
        "dirname": true,
        "extname": true,
        "format": true,
        "fromFileUrl": true,
        "isAbsolute": true,
        "join": true,
        "normalize": true,
        "parse": true,
        "relative": true,
        "resolve": true,
        "sep": true,
        "toFileUrl": true,
        "toNamespacedPath": true,
        "SEP": true,
        "SEP_PATTERN": true
    };
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_12(exports);
    }
    return {
        setters: [
            function (_constants_ts_6_1) {
                _constants_ts_6 = _constants_ts_6_1;
            },
            function (_win32_1) {
                _win32 = _win32_1;
            },
            function (_posix_1) {
                _posix = _posix_1;
            },
            function (common_ts_1_1) {
                exportStar_2(common_ts_1_1);
            },
            function (separator_ts_3_1) {
                exports_12({
                    "SEP": separator_ts_3_1["SEP"],
                    "SEP_PATTERN": separator_ts_3_1["SEP_PATTERN"]
                });
            },
            function (_interface_ts_1_1) {
                exportStar_2(_interface_ts_1_1);
            },
            function (glob_ts_1_1) {
                exportStar_2(glob_ts_1_1);
            }
        ],
        execute: function () {
            path = _constants_ts_6.isWindows ? _win32 : _posix;
            exports_12("win32", win32 = _win32);
            exports_12("posix", posix = _posix);
            exports_12("basename", basename = path.basename), exports_12("delimiter", delimiter = path.delimiter), exports_12("dirname", dirname = path.dirname), exports_12("extname", extname = path.extname), exports_12("format", format = path.format), exports_12("fromFileUrl", fromFileUrl = path.fromFileUrl), exports_12("isAbsolute", isAbsolute = path.isAbsolute), exports_12("join", join = path.join), exports_12("normalize", normalize = path.normalize), exports_12("parse", parse = path.parse), exports_12("relative", relative = path.relative), exports_12("resolve", resolve = path.resolve), exports_12("sep", sep = path.sep), exports_12("toFileUrl", toFileUrl = path.toFileUrl), exports_12("toNamespacedPath", toNamespacedPath = path.toNamespacedPath);
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/empty_dir", ["https://deno.land/std@0.75.0/path/mod"], function (exports_13, context_13) {
    "use strict";
    var mod_ts_2;
    var __moduleName = context_13 && context_13.id;
    async function emptyDir(dir) {
        try {
            const items = [];
            for await (const dirEntry of Deno.readDir(dir)) {
                items.push(dirEntry);
            }
            while (items.length) {
                const item = items.shift();
                if (item && item.name) {
                    const filepath = mod_ts_2.join(dir, item.name);
                    await Deno.remove(filepath, { recursive: true });
                }
            }
        }
        catch (err) {
            if (!(err instanceof Deno.errors.NotFound)) {
                throw err;
            }
            await Deno.mkdir(dir, { recursive: true });
        }
    }
    exports_13("emptyDir", emptyDir);
    function emptyDirSync(dir) {
        try {
            const items = [...Deno.readDirSync(dir)];
            while (items.length) {
                const item = items.shift();
                if (item && item.name) {
                    const filepath = mod_ts_2.join(dir, item.name);
                    Deno.removeSync(filepath, { recursive: true });
                }
            }
        }
        catch (err) {
            if (!(err instanceof Deno.errors.NotFound)) {
                throw err;
            }
            Deno.mkdirSync(dir, { recursive: true });
            return;
        }
    }
    exports_13("emptyDirSync", emptyDirSync);
    return {
        setters: [
            function (mod_ts_2_1) {
                mod_ts_2 = mod_ts_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/_util", ["https://deno.land/std@0.75.0/path/mod"], function (exports_14, context_14) {
    "use strict";
    var path;
    var __moduleName = context_14 && context_14.id;
    function isSubdir(src, dest, sep = path.sep) {
        if (src === dest) {
            return false;
        }
        const srcArray = src.split(sep);
        const destArray = dest.split(sep);
        return srcArray.every((current, i) => destArray[i] === current);
    }
    exports_14("isSubdir", isSubdir);
    function getFileInfoType(fileInfo) {
        return fileInfo.isFile
            ? "file"
            : fileInfo.isDirectory
                ? "dir"
                : fileInfo.isSymlink
                    ? "symlink"
                    : undefined;
    }
    exports_14("getFileInfoType", getFileInfoType);
    return {
        setters: [
            function (path_1) {
                path = path_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/ensure_dir", ["https://deno.land/std@0.75.0/fs/_util"], function (exports_15, context_15) {
    "use strict";
    var _util_ts_3;
    var __moduleName = context_15 && context_15.id;
    async function ensureDir(dir) {
        try {
            const fileInfo = await Deno.lstat(dir);
            if (!fileInfo.isDirectory) {
                throw new Error(`Ensure path exists, expected 'dir', got '${_util_ts_3.getFileInfoType(fileInfo)}'`);
            }
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                await Deno.mkdir(dir, { recursive: true });
                return;
            }
            throw err;
        }
    }
    exports_15("ensureDir", ensureDir);
    function ensureDirSync(dir) {
        try {
            const fileInfo = Deno.lstatSync(dir);
            if (!fileInfo.isDirectory) {
                throw new Error(`Ensure path exists, expected 'dir', got '${_util_ts_3.getFileInfoType(fileInfo)}'`);
            }
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                Deno.mkdirSync(dir, { recursive: true });
                return;
            }
            throw err;
        }
    }
    exports_15("ensureDirSync", ensureDirSync);
    return {
        setters: [
            function (_util_ts_3_1) {
                _util_ts_3 = _util_ts_3_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/ensure_file", ["https://deno.land/std@0.75.0/path/mod", "https://deno.land/std@0.75.0/fs/ensure_dir", "https://deno.land/std@0.75.0/fs/_util"], function (exports_16, context_16) {
    "use strict";
    var path, ensure_dir_ts_1, _util_ts_4;
    var __moduleName = context_16 && context_16.id;
    async function ensureFile(filePath) {
        try {
            const stat = await Deno.lstat(filePath);
            if (!stat.isFile) {
                throw new Error(`Ensure path exists, expected 'file', got '${_util_ts_4.getFileInfoType(stat)}'`);
            }
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                await ensure_dir_ts_1.ensureDir(path.dirname(filePath));
                await Deno.writeFile(filePath, new Uint8Array());
                return;
            }
            throw err;
        }
    }
    exports_16("ensureFile", ensureFile);
    function ensureFileSync(filePath) {
        try {
            const stat = Deno.lstatSync(filePath);
            if (!stat.isFile) {
                throw new Error(`Ensure path exists, expected 'file', got '${_util_ts_4.getFileInfoType(stat)}'`);
            }
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                ensure_dir_ts_1.ensureDirSync(path.dirname(filePath));
                Deno.writeFileSync(filePath, new Uint8Array());
                return;
            }
            throw err;
        }
    }
    exports_16("ensureFileSync", ensureFileSync);
    return {
        setters: [
            function (path_2) {
                path = path_2;
            },
            function (ensure_dir_ts_1_1) {
                ensure_dir_ts_1 = ensure_dir_ts_1_1;
            },
            function (_util_ts_4_1) {
                _util_ts_4 = _util_ts_4_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/exists", [], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    async function exists(filePath) {
        try {
            await Deno.lstat(filePath);
            return true;
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return false;
            }
            throw err;
        }
    }
    exports_17("exists", exists);
    function existsSync(filePath) {
        try {
            Deno.lstatSync(filePath);
            return true;
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return false;
            }
            throw err;
        }
    }
    exports_17("existsSync", existsSync);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/ensure_link", ["https://deno.land/std@0.75.0/path/mod", "https://deno.land/std@0.75.0/fs/ensure_dir", "https://deno.land/std@0.75.0/fs/exists", "https://deno.land/std@0.75.0/fs/_util"], function (exports_18, context_18) {
    "use strict";
    var path, ensure_dir_ts_2, exists_ts_1, _util_ts_5;
    var __moduleName = context_18 && context_18.id;
    async function ensureLink(src, dest) {
        if (await exists_ts_1.exists(dest)) {
            const destStatInfo = await Deno.lstat(dest);
            const destFilePathType = _util_ts_5.getFileInfoType(destStatInfo);
            if (destFilePathType !== "file") {
                throw new Error(`Ensure path exists, expected 'file', got '${destFilePathType}'`);
            }
            return;
        }
        await ensure_dir_ts_2.ensureDir(path.dirname(dest));
        await Deno.link(src, dest);
    }
    exports_18("ensureLink", ensureLink);
    function ensureLinkSync(src, dest) {
        if (exists_ts_1.existsSync(dest)) {
            const destStatInfo = Deno.lstatSync(dest);
            const destFilePathType = _util_ts_5.getFileInfoType(destStatInfo);
            if (destFilePathType !== "file") {
                throw new Error(`Ensure path exists, expected 'file', got '${destFilePathType}'`);
            }
            return;
        }
        ensure_dir_ts_2.ensureDirSync(path.dirname(dest));
        Deno.linkSync(src, dest);
    }
    exports_18("ensureLinkSync", ensureLinkSync);
    return {
        setters: [
            function (path_3) {
                path = path_3;
            },
            function (ensure_dir_ts_2_1) {
                ensure_dir_ts_2 = ensure_dir_ts_2_1;
            },
            function (exists_ts_1_1) {
                exists_ts_1 = exists_ts_1_1;
            },
            function (_util_ts_5_1) {
                _util_ts_5 = _util_ts_5_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/ensure_symlink", ["https://deno.land/std@0.75.0/path/mod", "https://deno.land/std@0.75.0/fs/ensure_dir", "https://deno.land/std@0.75.0/fs/exists", "https://deno.land/std@0.75.0/fs/_util"], function (exports_19, context_19) {
    "use strict";
    var path, ensure_dir_ts_3, exists_ts_2, _util_ts_6;
    var __moduleName = context_19 && context_19.id;
    async function ensureSymlink(src, dest) {
        const srcStatInfo = await Deno.lstat(src);
        const srcFilePathType = _util_ts_6.getFileInfoType(srcStatInfo);
        if (await exists_ts_2.exists(dest)) {
            const destStatInfo = await Deno.lstat(dest);
            const destFilePathType = _util_ts_6.getFileInfoType(destStatInfo);
            if (destFilePathType !== "symlink") {
                throw new Error(`Ensure path exists, expected 'symlink', got '${destFilePathType}'`);
            }
            return;
        }
        await ensure_dir_ts_3.ensureDir(path.dirname(dest));
        if (Deno.build.os === "windows") {
            await Deno.symlink(src, dest, {
                type: srcFilePathType === "dir" ? "dir" : "file",
            });
        }
        else {
            await Deno.symlink(src, dest);
        }
    }
    exports_19("ensureSymlink", ensureSymlink);
    function ensureSymlinkSync(src, dest) {
        const srcStatInfo = Deno.lstatSync(src);
        const srcFilePathType = _util_ts_6.getFileInfoType(srcStatInfo);
        if (exists_ts_2.existsSync(dest)) {
            const destStatInfo = Deno.lstatSync(dest);
            const destFilePathType = _util_ts_6.getFileInfoType(destStatInfo);
            if (destFilePathType !== "symlink") {
                throw new Error(`Ensure path exists, expected 'symlink', got '${destFilePathType}'`);
            }
            return;
        }
        ensure_dir_ts_3.ensureDirSync(path.dirname(dest));
        if (Deno.build.os === "windows") {
            Deno.symlinkSync(src, dest, {
                type: srcFilePathType === "dir" ? "dir" : "file",
            });
        }
        else {
            Deno.symlinkSync(src, dest);
        }
    }
    exports_19("ensureSymlinkSync", ensureSymlinkSync);
    return {
        setters: [
            function (path_4) {
                path = path_4;
            },
            function (ensure_dir_ts_3_1) {
                ensure_dir_ts_3 = ensure_dir_ts_3_1;
            },
            function (exists_ts_2_1) {
                exists_ts_2 = exists_ts_2_1;
            },
            function (_util_ts_6_1) {
                _util_ts_6 = _util_ts_6_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/walk", ["https://deno.land/std@0.75.0/_util/assert", "https://deno.land/std@0.75.0/path/mod"], function (exports_20, context_20) {
    "use strict";
    var assert_ts_2, mod_ts_3;
    var __moduleName = context_20 && context_20.id;
    function _createWalkEntrySync(path) {
        path = mod_ts_3.normalize(path);
        const name = mod_ts_3.basename(path);
        const info = Deno.statSync(path);
        return {
            path,
            name,
            isFile: info.isFile,
            isDirectory: info.isDirectory,
            isSymlink: info.isSymlink,
        };
    }
    exports_20("_createWalkEntrySync", _createWalkEntrySync);
    async function _createWalkEntry(path) {
        path = mod_ts_3.normalize(path);
        const name = mod_ts_3.basename(path);
        const info = await Deno.stat(path);
        return {
            path,
            name,
            isFile: info.isFile,
            isDirectory: info.isDirectory,
            isSymlink: info.isSymlink,
        };
    }
    exports_20("_createWalkEntry", _createWalkEntry);
    function include(path, exts, match, skip) {
        if (exts && !exts.some((ext) => path.endsWith(ext))) {
            return false;
        }
        if (match && !match.some((pattern) => !!path.match(pattern))) {
            return false;
        }
        if (skip && skip.some((pattern) => !!path.match(pattern))) {
            return false;
        }
        return true;
    }
    async function* walk(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, followSymlinks = false, exts = undefined, match = undefined, skip = undefined, } = {}) {
        if (maxDepth < 0) {
            return;
        }
        if (includeDirs && include(root, exts, match, skip)) {
            yield await _createWalkEntry(root);
        }
        if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
            return;
        }
        for await (const entry of Deno.readDir(root)) {
            if (entry.isSymlink) {
                if (followSymlinks) {
                    throw new Error("unimplemented");
                }
                else {
                    continue;
                }
            }
            assert_ts_2.assert(entry.name != null);
            const path = mod_ts_3.join(root, entry.name);
            if (entry.isFile) {
                if (includeFiles && include(path, exts, match, skip)) {
                    yield { path, ...entry };
                }
            }
            else {
                yield* walk(path, {
                    maxDepth: maxDepth - 1,
                    includeFiles,
                    includeDirs,
                    followSymlinks,
                    exts,
                    match,
                    skip,
                });
            }
        }
    }
    exports_20("walk", walk);
    function* walkSync(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, followSymlinks = false, exts = undefined, match = undefined, skip = undefined, } = {}) {
        if (maxDepth < 0) {
            return;
        }
        if (includeDirs && include(root, exts, match, skip)) {
            yield _createWalkEntrySync(root);
        }
        if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
            return;
        }
        for (const entry of Deno.readDirSync(root)) {
            if (entry.isSymlink) {
                if (followSymlinks) {
                    throw new Error("unimplemented");
                }
                else {
                    continue;
                }
            }
            assert_ts_2.assert(entry.name != null);
            const path = mod_ts_3.join(root, entry.name);
            if (entry.isFile) {
                if (includeFiles && include(path, exts, match, skip)) {
                    yield { path, ...entry };
                }
            }
            else {
                yield* walkSync(path, {
                    maxDepth: maxDepth - 1,
                    includeFiles,
                    includeDirs,
                    followSymlinks,
                    exts,
                    match,
                    skip,
                });
            }
        }
    }
    exports_20("walkSync", walkSync);
    return {
        setters: [
            function (assert_ts_2_1) {
                assert_ts_2 = assert_ts_2_1;
            },
            function (mod_ts_3_1) {
                mod_ts_3 = mod_ts_3_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/expand_glob", ["https://deno.land/std@0.75.0/path/mod", "https://deno.land/std@0.75.0/fs/walk", "https://deno.land/std@0.75.0/_util/assert"], function (exports_21, context_21) {
    "use strict";
    var mod_ts_4, walk_ts_1, assert_ts_3, isWindows;
    var __moduleName = context_21 && context_21.id;
    function split(path) {
        const s = mod_ts_4.SEP_PATTERN.source;
        const segments = path
            .replace(new RegExp(`^${s}|${s}$`, "g"), "")
            .split(mod_ts_4.SEP_PATTERN);
        const isAbsolute_ = mod_ts_4.isAbsolute(path);
        return {
            segments,
            isAbsolute: isAbsolute_,
            hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
            winRoot: isWindows && isAbsolute_ ? segments.shift() : undefined,
        };
    }
    function throwUnlessNotFound(error) {
        if (!(error instanceof Deno.errors.NotFound)) {
            throw error;
        }
    }
    function comparePath(a, b) {
        if (a.path < b.path)
            return -1;
        if (a.path > b.path)
            return 1;
        return 0;
    }
    async function* expandGlob(glob, { root = Deno.cwd(), exclude = [], includeDirs = true, extended = false, globstar = false, } = {}) {
        const globOptions = { extended, globstar };
        const absRoot = mod_ts_4.isAbsolute(root)
            ? mod_ts_4.normalize(root)
            : mod_ts_4.joinGlobs([Deno.cwd(), root], globOptions);
        const resolveFromRoot = (path) => mod_ts_4.isAbsolute(path)
            ? mod_ts_4.normalize(path)
            : mod_ts_4.joinGlobs([absRoot, path], globOptions);
        const excludePatterns = exclude
            .map(resolveFromRoot)
            .map((s) => mod_ts_4.globToRegExp(s, globOptions));
        const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
        const { segments, hasTrailingSep, winRoot } = split(resolveFromRoot(glob));
        let fixedRoot = winRoot != undefined ? winRoot : "/";
        while (segments.length > 0 && !mod_ts_4.isGlob(segments[0])) {
            const seg = segments.shift();
            assert_ts_3.assert(seg != null);
            fixedRoot = mod_ts_4.joinGlobs([fixedRoot, seg], globOptions);
        }
        let fixedRootInfo;
        try {
            fixedRootInfo = await walk_ts_1._createWalkEntry(fixedRoot);
        }
        catch (error) {
            return throwUnlessNotFound(error);
        }
        async function* advanceMatch(walkInfo, globSegment) {
            if (!walkInfo.isDirectory) {
                return;
            }
            else if (globSegment == "..") {
                const parentPath = mod_ts_4.joinGlobs([walkInfo.path, ".."], globOptions);
                try {
                    if (shouldInclude(parentPath)) {
                        return yield await walk_ts_1._createWalkEntry(parentPath);
                    }
                }
                catch (error) {
                    throwUnlessNotFound(error);
                }
                return;
            }
            else if (globSegment == "**") {
                return yield* walk_ts_1.walk(walkInfo.path, {
                    includeFiles: false,
                    skip: excludePatterns,
                });
            }
            yield* walk_ts_1.walk(walkInfo.path, {
                maxDepth: 1,
                match: [
                    mod_ts_4.globToRegExp(mod_ts_4.joinGlobs([walkInfo.path, globSegment], globOptions), globOptions),
                ],
                skip: excludePatterns,
            });
        }
        let currentMatches = [fixedRootInfo];
        for (const segment of segments) {
            const nextMatchMap = new Map();
            for (const currentMatch of currentMatches) {
                for await (const nextMatch of advanceMatch(currentMatch, segment)) {
                    nextMatchMap.set(nextMatch.path, nextMatch);
                }
            }
            currentMatches = [...nextMatchMap.values()].sort(comparePath);
        }
        if (hasTrailingSep) {
            currentMatches = currentMatches.filter((entry) => entry.isDirectory);
        }
        if (!includeDirs) {
            currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
        }
        yield* currentMatches;
    }
    exports_21("expandGlob", expandGlob);
    function* expandGlobSync(glob, { root = Deno.cwd(), exclude = [], includeDirs = true, extended = false, globstar = false, } = {}) {
        const globOptions = { extended, globstar };
        const absRoot = mod_ts_4.isAbsolute(root)
            ? mod_ts_4.normalize(root)
            : mod_ts_4.joinGlobs([Deno.cwd(), root], globOptions);
        const resolveFromRoot = (path) => mod_ts_4.isAbsolute(path)
            ? mod_ts_4.normalize(path)
            : mod_ts_4.joinGlobs([absRoot, path], globOptions);
        const excludePatterns = exclude
            .map(resolveFromRoot)
            .map((s) => mod_ts_4.globToRegExp(s, globOptions));
        const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
        const { segments, hasTrailingSep, winRoot } = split(resolveFromRoot(glob));
        let fixedRoot = winRoot != undefined ? winRoot : "/";
        while (segments.length > 0 && !mod_ts_4.isGlob(segments[0])) {
            const seg = segments.shift();
            assert_ts_3.assert(seg != null);
            fixedRoot = mod_ts_4.joinGlobs([fixedRoot, seg], globOptions);
        }
        let fixedRootInfo;
        try {
            fixedRootInfo = walk_ts_1._createWalkEntrySync(fixedRoot);
        }
        catch (error) {
            return throwUnlessNotFound(error);
        }
        function* advanceMatch(walkInfo, globSegment) {
            if (!walkInfo.isDirectory) {
                return;
            }
            else if (globSegment == "..") {
                const parentPath = mod_ts_4.joinGlobs([walkInfo.path, ".."], globOptions);
                try {
                    if (shouldInclude(parentPath)) {
                        return yield walk_ts_1._createWalkEntrySync(parentPath);
                    }
                }
                catch (error) {
                    throwUnlessNotFound(error);
                }
                return;
            }
            else if (globSegment == "**") {
                return yield* walk_ts_1.walkSync(walkInfo.path, {
                    includeFiles: false,
                    skip: excludePatterns,
                });
            }
            yield* walk_ts_1.walkSync(walkInfo.path, {
                maxDepth: 1,
                match: [
                    mod_ts_4.globToRegExp(mod_ts_4.joinGlobs([walkInfo.path, globSegment], globOptions), globOptions),
                ],
                skip: excludePatterns,
            });
        }
        let currentMatches = [fixedRootInfo];
        for (const segment of segments) {
            const nextMatchMap = new Map();
            for (const currentMatch of currentMatches) {
                for (const nextMatch of advanceMatch(currentMatch, segment)) {
                    nextMatchMap.set(nextMatch.path, nextMatch);
                }
            }
            currentMatches = [...nextMatchMap.values()].sort(comparePath);
        }
        if (hasTrailingSep) {
            currentMatches = currentMatches.filter((entry) => entry.isDirectory);
        }
        if (!includeDirs) {
            currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
        }
        yield* currentMatches;
    }
    exports_21("expandGlobSync", expandGlobSync);
    return {
        setters: [
            function (mod_ts_4_1) {
                mod_ts_4 = mod_ts_4_1;
            },
            function (walk_ts_1_1) {
                walk_ts_1 = walk_ts_1_1;
            },
            function (assert_ts_3_1) {
                assert_ts_3 = assert_ts_3_1;
            }
        ],
        execute: function () {
            isWindows = Deno.build.os == "windows";
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/move", ["https://deno.land/std@0.75.0/fs/exists", "https://deno.land/std@0.75.0/fs/_util"], function (exports_22, context_22) {
    "use strict";
    var exists_ts_3, _util_ts_7;
    var __moduleName = context_22 && context_22.id;
    async function move(src, dest, { overwrite = false } = {}) {
        const srcStat = await Deno.stat(src);
        if (srcStat.isDirectory && _util_ts_7.isSubdir(src, dest)) {
            throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`);
        }
        if (overwrite) {
            if (await exists_ts_3.exists(dest)) {
                await Deno.remove(dest, { recursive: true });
            }
            await Deno.rename(src, dest);
        }
        else {
            if (await exists_ts_3.exists(dest)) {
                throw new Error("dest already exists.");
            }
            await Deno.rename(src, dest);
        }
        return;
    }
    exports_22("move", move);
    function moveSync(src, dest, { overwrite = false } = {}) {
        const srcStat = Deno.statSync(src);
        if (srcStat.isDirectory && _util_ts_7.isSubdir(src, dest)) {
            throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`);
        }
        if (overwrite) {
            if (exists_ts_3.existsSync(dest)) {
                Deno.removeSync(dest, { recursive: true });
            }
            Deno.renameSync(src, dest);
        }
        else {
            if (exists_ts_3.existsSync(dest)) {
                throw new Error("dest already exists.");
            }
            Deno.renameSync(src, dest);
        }
    }
    exports_22("moveSync", moveSync);
    return {
        setters: [
            function (exists_ts_3_1) {
                exists_ts_3 = exists_ts_3_1;
            },
            function (_util_ts_7_1) {
                _util_ts_7 = _util_ts_7_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/copy", ["https://deno.land/std@0.75.0/path/mod", "https://deno.land/std@0.75.0/fs/ensure_dir", "https://deno.land/std@0.75.0/fs/_util", "https://deno.land/std@0.75.0/_util/assert"], function (exports_23, context_23) {
    "use strict";
    var path, ensure_dir_ts_4, _util_ts_8, assert_ts_4, isWindows;
    var __moduleName = context_23 && context_23.id;
    async function ensureValidCopy(src, dest, options, isCopyFolder = false) {
        let destStat;
        try {
            destStat = await Deno.lstat(dest);
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return;
            }
            throw err;
        }
        if (isCopyFolder && !destStat.isDirectory) {
            throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
        }
        if (!options.overwrite) {
            throw new Error(`'${dest}' already exists.`);
        }
        return destStat;
    }
    function ensureValidCopySync(src, dest, options, isCopyFolder = false) {
        let destStat;
        try {
            destStat = Deno.lstatSync(dest);
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return;
            }
            throw err;
        }
        if (isCopyFolder && !destStat.isDirectory) {
            throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
        }
        if (!options.overwrite) {
            throw new Error(`'${dest}' already exists.`);
        }
        return destStat;
    }
    async function copyFile(src, dest, options) {
        await ensureValidCopy(src, dest, options);
        await Deno.copyFile(src, dest);
        if (options.preserveTimestamps) {
            const statInfo = await Deno.stat(src);
            assert_ts_4.assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
            assert_ts_4.assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
            await Deno.utime(dest, statInfo.atime, statInfo.mtime);
        }
    }
    function copyFileSync(src, dest, options) {
        ensureValidCopySync(src, dest, options);
        Deno.copyFileSync(src, dest);
        if (options.preserveTimestamps) {
            const statInfo = Deno.statSync(src);
            assert_ts_4.assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
            assert_ts_4.assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
            Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
        }
    }
    async function copySymLink(src, dest, options) {
        await ensureValidCopy(src, dest, options);
        const originSrcFilePath = await Deno.readLink(src);
        const type = _util_ts_8.getFileInfoType(await Deno.lstat(src));
        if (isWindows) {
            await Deno.symlink(originSrcFilePath, dest, {
                type: type === "dir" ? "dir" : "file",
            });
        }
        else {
            await Deno.symlink(originSrcFilePath, dest);
        }
        if (options.preserveTimestamps) {
            const statInfo = await Deno.lstat(src);
            assert_ts_4.assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
            assert_ts_4.assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
            await Deno.utime(dest, statInfo.atime, statInfo.mtime);
        }
    }
    function copySymlinkSync(src, dest, options) {
        ensureValidCopySync(src, dest, options);
        const originSrcFilePath = Deno.readLinkSync(src);
        const type = _util_ts_8.getFileInfoType(Deno.lstatSync(src));
        if (isWindows) {
            Deno.symlinkSync(originSrcFilePath, dest, {
                type: type === "dir" ? "dir" : "file",
            });
        }
        else {
            Deno.symlinkSync(originSrcFilePath, dest);
        }
        if (options.preserveTimestamps) {
            const statInfo = Deno.lstatSync(src);
            assert_ts_4.assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
            assert_ts_4.assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
            Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
        }
    }
    async function copyDir(src, dest, options) {
        const destStat = await ensureValidCopy(src, dest, options, true);
        if (!destStat) {
            await ensure_dir_ts_4.ensureDir(dest);
        }
        if (options.preserveTimestamps) {
            const srcStatInfo = await Deno.stat(src);
            assert_ts_4.assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
            assert_ts_4.assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
            await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
        }
        for await (const entry of Deno.readDir(src)) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, path.basename(srcPath));
            if (entry.isSymlink) {
                await copySymLink(srcPath, destPath, options);
            }
            else if (entry.isDirectory) {
                await copyDir(srcPath, destPath, options);
            }
            else if (entry.isFile) {
                await copyFile(srcPath, destPath, options);
            }
        }
    }
    function copyDirSync(src, dest, options) {
        const destStat = ensureValidCopySync(src, dest, options, true);
        if (!destStat) {
            ensure_dir_ts_4.ensureDirSync(dest);
        }
        if (options.preserveTimestamps) {
            const srcStatInfo = Deno.statSync(src);
            assert_ts_4.assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
            assert_ts_4.assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
            Deno.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
        }
        for (const entry of Deno.readDirSync(src)) {
            assert_ts_4.assert(entry.name != null, "file.name must be set");
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, path.basename(srcPath));
            if (entry.isSymlink) {
                copySymlinkSync(srcPath, destPath, options);
            }
            else if (entry.isDirectory) {
                copyDirSync(srcPath, destPath, options);
            }
            else if (entry.isFile) {
                copyFileSync(srcPath, destPath, options);
            }
        }
    }
    async function copy(src, dest, options = {}) {
        src = path.resolve(src);
        dest = path.resolve(dest);
        if (src === dest) {
            throw new Error("Source and destination cannot be the same.");
        }
        const srcStat = await Deno.lstat(src);
        if (srcStat.isDirectory && _util_ts_8.isSubdir(src, dest)) {
            throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
        }
        if (srcStat.isSymlink) {
            await copySymLink(src, dest, options);
        }
        else if (srcStat.isDirectory) {
            await copyDir(src, dest, options);
        }
        else if (srcStat.isFile) {
            await copyFile(src, dest, options);
        }
    }
    exports_23("copy", copy);
    function copySync(src, dest, options = {}) {
        src = path.resolve(src);
        dest = path.resolve(dest);
        if (src === dest) {
            throw new Error("Source and destination cannot be the same.");
        }
        const srcStat = Deno.lstatSync(src);
        if (srcStat.isDirectory && _util_ts_8.isSubdir(src, dest)) {
            throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
        }
        if (srcStat.isSymlink) {
            copySymlinkSync(src, dest, options);
        }
        else if (srcStat.isDirectory) {
            copyDirSync(src, dest, options);
        }
        else if (srcStat.isFile) {
            copyFileSync(src, dest, options);
        }
    }
    exports_23("copySync", copySync);
    return {
        setters: [
            function (path_5) {
                path = path_5;
            },
            function (ensure_dir_ts_4_1) {
                ensure_dir_ts_4 = ensure_dir_ts_4_1;
            },
            function (_util_ts_8_1) {
                _util_ts_8 = _util_ts_8_1;
            },
            function (assert_ts_4_1) {
                assert_ts_4 = assert_ts_4_1;
            }
        ],
        execute: function () {
            isWindows = Deno.build.os === "windows";
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/eol", [], function (exports_24, context_24) {
    "use strict";
    var EOL, regDetect;
    var __moduleName = context_24 && context_24.id;
    function detect(content) {
        const d = content.match(regDetect);
        if (!d || d.length === 0) {
            return null;
        }
        const crlf = d.filter((x) => x === EOL.CRLF);
        if (crlf.length > 0) {
            return EOL.CRLF;
        }
        else {
            return EOL.LF;
        }
    }
    exports_24("detect", detect);
    function format(content, eol) {
        return content.replace(regDetect, eol);
    }
    exports_24("format", format);
    return {
        setters: [],
        execute: function () {
            (function (EOL) {
                EOL["LF"] = "\n";
                EOL["CRLF"] = "\r\n";
            })(EOL || (EOL = {}));
            exports_24("EOL", EOL);
            regDetect = /(?:\r?\n)/g;
        }
    };
});
System.register("https://deno.land/std@0.75.0/fs/mod", ["https://deno.land/std@0.75.0/fs/empty_dir", "https://deno.land/std@0.75.0/fs/ensure_dir", "https://deno.land/std@0.75.0/fs/ensure_file", "https://deno.land/std@0.75.0/fs/ensure_link", "https://deno.land/std@0.75.0/fs/ensure_symlink", "https://deno.land/std@0.75.0/fs/exists", "https://deno.land/std@0.75.0/fs/expand_glob", "https://deno.land/std@0.75.0/fs/move", "https://deno.land/std@0.75.0/fs/copy", "https://deno.land/std@0.75.0/fs/walk", "https://deno.land/std@0.75.0/fs/eol"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    function exportStar_3(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_25(exports);
    }
    return {
        setters: [
            function (empty_dir_ts_1_1) {
                exportStar_3(empty_dir_ts_1_1);
            },
            function (ensure_dir_ts_5_1) {
                exportStar_3(ensure_dir_ts_5_1);
            },
            function (ensure_file_ts_1_1) {
                exportStar_3(ensure_file_ts_1_1);
            },
            function (ensure_link_ts_1_1) {
                exportStar_3(ensure_link_ts_1_1);
            },
            function (ensure_symlink_ts_1_1) {
                exportStar_3(ensure_symlink_ts_1_1);
            },
            function (exists_ts_4_1) {
                exportStar_3(exists_ts_4_1);
            },
            function (expand_glob_ts_1_1) {
                exportStar_3(expand_glob_ts_1_1);
            },
            function (move_ts_1_1) {
                exportStar_3(move_ts_1_1);
            },
            function (copy_ts_1_1) {
                exportStar_3(copy_ts_1_1);
            },
            function (walk_ts_2_1) {
                exportStar_3(walk_ts_2_1);
            },
            function (eol_ts_1_1) {
                exportStar_3(eol_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/remote/fs", ["https://deno.land/std@0.75.0/fs/mod"], function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    function exportStar_4(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_26(exports);
    }
    return {
        setters: [
            function (mod_ts_5_1) {
                exportStar_4(mod_ts_5_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/prompt", ["file:///home/matt/@mwm/create-deno-first/remote/colors", "file:///home/matt/@mwm/create-deno-first/remote/fs"], function (exports_27, context_27) {
    "use strict";
    var colors_ts_2, fs_ts_1, defaultTo, format, sanitize, validate;
    var __moduleName = context_27 && context_27.id;
    function accept(...accept) {
        return async (options) => {
            const { accept: current = [], ...rest } = options;
            const set = new Set([...current, ...accept]);
            return { ...rest, accept: [...set] };
        };
    }
    exports_27("accept", accept);
    function acceptPartial(...accepts) {
        return (options) => accept(...accepts)(options).then(sanitize((input, options) => {
            if (input.length === 0)
                return input;
            if (input === options.defaultTo)
                return input;
            const maybe = options.accept.reduce((maybe, accepts) => accepts.startsWith(input) ? [...maybe, accepts] : maybe, []);
            return maybe.length === 1 ? maybe[0] : input;
        }));
    }
    exports_27("acceptPartial", acceptPartial);
    function ask(message) {
        return Promise.resolve({
            message,
            accept: [],
        });
    }
    exports_27("ask", ask);
    function askYesNo(message) {
        return ask(message)
            .then(acceptPartial("yes", "no"))
            .then(retry());
    }
    exports_27("askYesNo", askYesNo);
    async function done() { }
    exports_27("done", done);
    function forceWriteTextFile(filename, data) {
        return Deno.writeTextFile(filename, data);
    }
    exports_27("forceWriteTextFile", forceWriteTextFile);
    function ifYes(action) {
        return async (input) => {
            if (input === "yes" || input === true)
                await action();
            return input;
        };
    }
    exports_27("ifYes", ifYes);
    function ifNo(action) {
        return async (input) => {
            if (input === "no" || input === false)
                await action();
            return input;
        };
    }
    exports_27("ifNo", ifNo);
    async function prompt(options) {
        return stdout(`${options.message}: ${getHint(options)}`)
            .then(stdin)
            .then(orDefault(options))
            .then(orSanitize(options))
            .then(orAccept(options))
            .then(orValidate(options))
            .then(orFormat(options))
            .catch(orRetry(options));
    }
    exports_27("prompt", prompt);
    function retry(value = true) {
        return async (options) => set("retry")(value)(options);
    }
    exports_27("retry", retry);
    function stdout(message) {
        return Deno.stdout.write(new TextEncoder().encode(message));
    }
    exports_27("stdout", stdout);
    async function stdin(accept = 1024) {
        const max = 1024;
        const buf = new Uint8Array(accept > max ? accept : max);
        const got = await Deno.stdin.read(buf);
        return new TextDecoder()
            .decode(buf.subarray(0, accept < got ? accept : got))
            .trim();
    }
    exports_27("stdin", stdin);
    function verifyWriteTextFile(filename) {
        return async (data) => {
            const justCreate = () => Deno.writeTextFile(filename, data);
            const askOverwrite = async () => ask(`File ${filename} exists, overwrite`)
                .then(acceptPartial("yes", "no"))
                .then(defaultTo("no"))
                .then(prompt)
                .then(ifYes(justCreate))
                .then(done);
            await fs_ts_1.exists(filename)
                .then(ifNo(justCreate))
                .then(ifYes(askOverwrite));
        };
    }
    exports_27("verifyWriteTextFile", verifyWriteTextFile);
    function orRetry(options) {
        return (...reason) => {
            console.error(...reason);
            return options.retry ? prompt(options) : Promise.reject(reason);
        };
    }
    function orAccept({ accept, defaultTo }) {
        return async (input) => accept.length === 0
            ? input
            : accept.includes(input) || input === defaultTo
                ? input
                : Promise.reject(new TypeError(`input ${input} is not default, ${defaultTo}, or in accept list [${accept.map((s) => `"${s}"`).join(", ")}]`));
    }
    function orDefault(options) {
        return async (input) => input === "" && options.defaultTo != null
            ? options.defaultTo
            : input === "" && options.defaultTo == null
                ? Promise.reject(new TypeError(`no input, no default value`))
                : input;
    }
    function orFormat(options) {
        return async (input) => typeof options.format === "function"
            ? options.format(input, options)
            : input;
    }
    function orSanitize(options) {
        return async (input) => typeof options.sanitize === "function"
            ? options.sanitize(input, options)
            : input;
    }
    function orValidate(options) {
        return async (input) => {
            if (typeof options.validate === "function") {
                return options.validate(input, options) ? input : Promise.reject(new TypeError(`input ${input} failed to validate`));
            }
            return input;
        };
    }
    function set(key) {
        return (value) => async (options) => ({ ...options, [key]: value });
    }
    function getHint({ accept, defaultTo }) {
        const set = new Set(accept);
        if (defaultTo)
            set.add(defaultTo);
        const as = Array.from(set).map((s) => s === defaultTo ? colors_ts_2.brightWhite(s) : colors_ts_2.dim(s));
        const hint = as.length > 2
            ? colors_ts_2.dim("(") + as.join(colors_ts_2.dim(", ")) + colors_ts_2.dim(") ")
            : as.length > 0
                ? colors_ts_2.dim("(") + as.join(colors_ts_2.dim("/")) + colors_ts_2.dim(") ")
                : "";
        return hint;
    }
    function sendInput(handle) {
        return (message = "") => handle.write(new TextEncoder().encode(message + "\n"));
    }
    exports_27("sendInput", sendInput);
    function getOutput(handle) {
        return (accept = 1024) => async () => {
            const max = 1024;
            const buf = new Uint8Array(accept > max ? accept : max);
            const got = await handle.read(buf);
            return new TextDecoder()
                .decode(buf.subarray(0, accept < got ? accept : got))
                .trim();
        };
    }
    exports_27("getOutput", getOutput);
    return {
        setters: [
            function (colors_ts_2_1) {
                colors_ts_2 = colors_ts_2_1;
                exports_27({
                    "stripColor": colors_ts_2_1["stripColor"]
                });
            },
            function (fs_ts_1_1) {
                fs_ts_1 = fs_ts_1_1;
            }
        ],
        execute: function () {
            exports_27("defaultTo", defaultTo = set("defaultTo"));
            exports_27("format", format = set("format"));
            exports_27("sanitize", sanitize = set("sanitize"));
            exports_27("validate", validate = set("validate"));
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/configure/cache", ["file:///home/matt/@mwm/create-deno-first/scripts/prompt"], function (exports_28, context_28) {
    "use strict";
    var prompt_ts_1;
    var __moduleName = context_28 && context_28.id;
    async function acceptDenoDir(set) {
        await prompt_ts_1.ask("Local Deno cache directory")
            .then(prompt_ts_1.defaultTo(".deno"))
            .then(prompt_ts_1.prompt)
            .then(set("DENO_DIR"))
            .then(() => prompt_ts_1.ask("Lock-File Name"))
            .then(prompt_ts_1.defaultTo("lock_file.json"))
            .then(prompt_ts_1.prompt)
            .then(set("LOCK_FILE"));
    }
    async function configCache(set) {
        await prompt_ts_1.askYesNo("Enable local Deno cache")
            .then(prompt_ts_1.defaultTo("yes"))
            .then(prompt_ts_1.prompt)
            .then(prompt_ts_1.ifYes(() => acceptDenoDir(set)));
    }
    exports_28("configCache", configCache);
    return {
        setters: [
            function (prompt_ts_1_1) {
                prompt_ts_1 = prompt_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/configure/import_map", ["file:///home/matt/@mwm/create-deno-first/scripts/prompt"], function (exports_29, context_29) {
    "use strict";
    var prompt_ts_2;
    var __moduleName = context_29 && context_29.id;
    function createEmptyImportMap(filename) {
        return prompt_ts_2.verifyWriteTextFile(filename)(JSON.stringify({ imports: {} }, null, "\t"));
    }
    async function noImportMap(set) {
        await set("IMPORT_MAP")("");
    }
    async function useImportMap(set) {
        await prompt_ts_2.ask("Import-map filename")
            .then(prompt_ts_2.defaultTo("import_map.json"))
            .then(prompt_ts_2.prompt)
            .then(set("IMPORT_MAP"))
            .then(createEmptyImportMap);
    }
    async function configImportMap(set) {
        await prompt_ts_2.askYesNo("Use an import-map")
            .then(prompt_ts_2.defaultTo("no"))
            .then(prompt_ts_2.prompt)
            .then(prompt_ts_2.ifNo(() => noImportMap(set)))
            .then(prompt_ts_2.ifYes(() => useImportMap(set)));
    }
    exports_29("configImportMap", configImportMap);
    return {
        setters: [
            function (prompt_ts_2_1) {
                prompt_ts_2 = prompt_ts_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/configure/makefile", ["file:///home/matt/@mwm/create-deno-first/scripts/prompt"], function (exports_30, context_30) {
    "use strict";
    var prompt_ts_3, writeFiles;
    var __moduleName = context_30 && context_30.id;
    async function configMakefiles(pairs) {
        return prompt_ts_3.askYesNo("Create Makefiles")
            .then(prompt_ts_3.defaultTo("yes"))
            .then(prompt_ts_3.prompt)
            .then(prompt_ts_3.ifYes(writeFiles(pairs)))
            .then(prompt_ts_3.done);
    }
    exports_30("configMakefiles", configMakefiles);
    return {
        setters: [
            function (prompt_ts_3_1) {
                prompt_ts_3 = prompt_ts_3_1;
            }
        ],
        execute: function () {
            writeFiles = (pairs) => async () => {
                for (const pair of pairs) {
                    const [filePath, fileData] = pair;
                    await prompt_ts_3.verifyWriteTextFile(filePath)(fileData);
                }
            };
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/configure/npm", ["file:///home/matt/@mwm/create-deno-first/scripts/prompt"], function (exports_31, context_31) {
    "use strict";
    var prompt_ts_4, configNPM;
    var __moduleName = context_31 && context_31.id;
    return {
        setters: [
            function (prompt_ts_4_1) {
                prompt_ts_4 = prompt_ts_4_1;
            }
        ],
        execute: function () {
            exports_31("configNPM", configNPM = (set) => prompt_ts_4.ask("NPM executable")
                .then(prompt_ts_4.accept("npm", "pnpm", "yarn"))
                .then(prompt_ts_4.defaultTo("npm"))
                .then(prompt_ts_4.retry())
                .then(prompt_ts_4.prompt)
                .then(set("NPM")));
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/remote/path", ["https://deno.land/std@0.75.0/path/mod"], function (exports_32, context_32) {
    "use strict";
    var __moduleName = context_32 && context_32.id;
    function exportStar_5(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_32(exports);
    }
    return {
        setters: [
            function (mod_ts_6_1) {
                exportStar_5(mod_ts_6_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.75.0/testing/_diff", [], function (exports_33, context_33) {
    "use strict";
    var DiffType, REMOVED, COMMON, ADDED;
    var __moduleName = context_33 && context_33.id;
    function createCommon(A, B, reverse) {
        const common = [];
        if (A.length === 0 || B.length === 0)
            return [];
        for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
            if (A[reverse ? A.length - i - 1 : i] === B[reverse ? B.length - i - 1 : i]) {
                common.push(A[reverse ? A.length - i - 1 : i]);
            }
            else {
                return common;
            }
        }
        return common;
    }
    function diff(A, B) {
        const prefixCommon = createCommon(A, B);
        const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
        A = suffixCommon.length
            ? A.slice(prefixCommon.length, -suffixCommon.length)
            : A.slice(prefixCommon.length);
        B = suffixCommon.length
            ? B.slice(prefixCommon.length, -suffixCommon.length)
            : B.slice(prefixCommon.length);
        const swapped = B.length > A.length;
        [A, B] = swapped ? [B, A] : [A, B];
        const M = A.length;
        const N = B.length;
        if (!M && !N && !suffixCommon.length && !prefixCommon.length)
            return [];
        if (!N) {
            return [
                ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
                ...A.map((a) => ({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a,
                })),
                ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ];
        }
        const offset = N;
        const delta = M - N;
        const size = M + N + 1;
        const fp = new Array(size).fill({ y: -1 });
        const routes = new Uint32Array((M * N + size + 1) * 2);
        const diffTypesPtrOffset = routes.length / 2;
        let ptr = 0;
        let p = -1;
        function backTrace(A, B, current, swapped) {
            const M = A.length;
            const N = B.length;
            const result = [];
            let a = M - 1;
            let b = N - 1;
            let j = routes[current.id];
            let type = routes[current.id + diffTypesPtrOffset];
            while (true) {
                if (!j && !type)
                    break;
                const prev = j;
                if (type === REMOVED) {
                    result.unshift({
                        type: swapped ? DiffType.removed : DiffType.added,
                        value: B[b],
                    });
                    b -= 1;
                }
                else if (type === ADDED) {
                    result.unshift({
                        type: swapped ? DiffType.added : DiffType.removed,
                        value: A[a],
                    });
                    a -= 1;
                }
                else {
                    result.unshift({ type: DiffType.common, value: A[a] });
                    a -= 1;
                    b -= 1;
                }
                j = routes[prev];
                type = routes[prev + diffTypesPtrOffset];
            }
            return result;
        }
        function createFP(slide, down, k, M) {
            if (slide && slide.y === -1 && down && down.y === -1) {
                return { y: 0, id: 0 };
            }
            if ((down && down.y === -1) ||
                k === M ||
                (slide && slide.y) > (down && down.y) + 1) {
                const prev = slide.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = ADDED;
                return { y: slide.y, id: ptr };
            }
            else {
                const prev = down.id;
                ptr++;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = REMOVED;
                return { y: down.y + 1, id: ptr };
            }
        }
        function snake(k, slide, down, _offset, A, B) {
            const M = A.length;
            const N = B.length;
            if (k < -N || M < k)
                return { y: -1, id: -1 };
            const fp = createFP(slide, down, k, M);
            while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
                const prev = fp.id;
                ptr++;
                fp.id = ptr;
                fp.y += 1;
                routes[ptr] = prev;
                routes[ptr + diffTypesPtrOffset] = COMMON;
            }
            return fp;
        }
        while (fp[delta + offset].y < N) {
            p = p + 1;
            for (let k = -p; k < delta; ++k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            for (let k = delta + p; k > delta; --k) {
                fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
            }
            fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
        }
        return [
            ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
            ...backTrace(A, B, fp[delta + offset], swapped),
            ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
        ];
    }
    exports_33("diff", diff);
    return {
        setters: [],
        execute: function () {
            (function (DiffType) {
                DiffType["removed"] = "removed";
                DiffType["common"] = "common";
                DiffType["added"] = "added";
            })(DiffType || (DiffType = {}));
            exports_33("DiffType", DiffType);
            REMOVED = 1;
            COMMON = 2;
            ADDED = 3;
        }
    };
});
System.register("https://deno.land/std@0.75.0/testing/asserts", ["https://deno.land/std@0.75.0/fmt/colors", "https://deno.land/std@0.75.0/testing/_diff"], function (exports_34, context_34) {
    "use strict";
    var colors_ts_3, _diff_ts_1, CAN_NOT_DISPLAY, AssertionError;
    var __moduleName = context_34 && context_34.id;
    function _format(v) {
        return globalThis.Deno
            ? Deno.inspect(v, {
                depth: Infinity,
                sorted: true,
                trailingComma: true,
                compact: false,
                iterableLimit: Infinity,
            })
            : `"${String(v).replace(/(?=["\\])/g, "\\")}"`;
    }
    exports_34("_format", _format);
    function createColor(diffType) {
        switch (diffType) {
            case _diff_ts_1.DiffType.added:
                return (s) => colors_ts_3.green(colors_ts_3.bold(s));
            case _diff_ts_1.DiffType.removed:
                return (s) => colors_ts_3.red(colors_ts_3.bold(s));
            default:
                return colors_ts_3.white;
        }
    }
    function createSign(diffType) {
        switch (diffType) {
            case _diff_ts_1.DiffType.added:
                return "+   ";
            case _diff_ts_1.DiffType.removed:
                return "-   ";
            default:
                return "    ";
        }
    }
    function buildMessage(diffResult) {
        const messages = [];
        messages.push("");
        messages.push("");
        messages.push(`    ${colors_ts_3.gray(colors_ts_3.bold("[Diff]"))} ${colors_ts_3.red(colors_ts_3.bold("Actual"))} / ${colors_ts_3.green(colors_ts_3.bold("Expected"))}`);
        messages.push("");
        messages.push("");
        diffResult.forEach((result) => {
            const c = createColor(result.type);
            messages.push(c(`${createSign(result.type)}${result.value}`));
        });
        messages.push("");
        return messages;
    }
    function isKeyedCollection(x) {
        return [Symbol.iterator, "size"].every((k) => k in x);
    }
    function equal(c, d) {
        const seen = new Map();
        return (function compare(a, b) {
            if (a &&
                b &&
                ((a instanceof RegExp && b instanceof RegExp) ||
                    (a instanceof URL && b instanceof URL))) {
                return String(a) === String(b);
            }
            if (a instanceof Date && b instanceof Date) {
                const aTime = a.getTime();
                const bTime = b.getTime();
                if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
                    return true;
                }
                return a.getTime() === b.getTime();
            }
            if (Object.is(a, b)) {
                return true;
            }
            if (a && typeof a === "object" && b && typeof b === "object") {
                if (seen.get(a) === b) {
                    return true;
                }
                if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                    return false;
                }
                if (isKeyedCollection(a) && isKeyedCollection(b)) {
                    if (a.size !== b.size) {
                        return false;
                    }
                    let unmatchedEntries = a.size;
                    for (const [aKey, aValue] of a.entries()) {
                        for (const [bKey, bValue] of b.entries()) {
                            if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                                (compare(aKey, bKey) && compare(aValue, bValue))) {
                                unmatchedEntries--;
                            }
                        }
                    }
                    return unmatchedEntries === 0;
                }
                const merged = { ...a, ...b };
                for (const key in merged) {
                    if (!compare(a && a[key], b && b[key])) {
                        return false;
                    }
                }
                seen.set(a, b);
                return true;
            }
            return false;
        })(c, d);
    }
    exports_34("equal", equal);
    function assert(expr, msg = "") {
        if (!expr) {
            throw new AssertionError(msg);
        }
    }
    exports_34("assert", assert);
    function assertEquals(actual, expected, msg) {
        if (equal(actual, expected)) {
            return;
        }
        let message = "";
        const actualString = _format(actual);
        const expectedString = _format(expected);
        try {
            const diffResult = _diff_ts_1.diff(actualString.split("\n"), expectedString.split("\n"));
            const diffMsg = buildMessage(diffResult).join("\n");
            message = `Values are not equal:\n${diffMsg}`;
        }
        catch (e) {
            message = `\n${colors_ts_3.red(CAN_NOT_DISPLAY)} + \n\n`;
        }
        if (msg) {
            message = msg;
        }
        throw new AssertionError(message);
    }
    exports_34("assertEquals", assertEquals);
    function assertNotEquals(actual, expected, msg) {
        if (!equal(actual, expected)) {
            return;
        }
        let actualString;
        let expectedString;
        try {
            actualString = String(actual);
        }
        catch (e) {
            actualString = "[Cannot display]";
        }
        try {
            expectedString = String(expected);
        }
        catch (e) {
            expectedString = "[Cannot display]";
        }
        if (!msg) {
            msg = `actual: ${actualString} expected: ${expectedString}`;
        }
        throw new AssertionError(msg);
    }
    exports_34("assertNotEquals", assertNotEquals);
    function assertStrictEquals(actual, expected, msg) {
        if (actual === expected) {
            return;
        }
        let message;
        if (msg) {
            message = msg;
        }
        else {
            const actualString = _format(actual);
            const expectedString = _format(expected);
            if (actualString === expectedString) {
                const withOffset = actualString
                    .split("\n")
                    .map((l) => `    ${l}`)
                    .join("\n");
                message =
                    `Values have the same structure but are not reference-equal:\n\n${colors_ts_3.red(withOffset)}\n`;
            }
            else {
                try {
                    const diffResult = _diff_ts_1.diff(actualString.split("\n"), expectedString.split("\n"));
                    const diffMsg = buildMessage(diffResult).join("\n");
                    message = `Values are not strictly equal:\n${diffMsg}`;
                }
                catch (e) {
                    message = `\n${colors_ts_3.red(CAN_NOT_DISPLAY)} + \n\n`;
                }
            }
        }
        throw new AssertionError(message);
    }
    exports_34("assertStrictEquals", assertStrictEquals);
    function assertNotStrictEquals(actual, expected, msg) {
        if (actual !== expected) {
            return;
        }
        throw new AssertionError(msg ?? `Expected "actual" to be strictly unequal to: ${_format(actual)}\n`);
    }
    exports_34("assertNotStrictEquals", assertNotStrictEquals);
    function assertExists(actual, msg) {
        if (actual === undefined || actual === null) {
            if (!msg) {
                msg =
                    `actual: "${actual}" expected to match anything but null or undefined`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_34("assertExists", assertExists);
    function assertStringIncludes(actual, expected, msg) {
        if (!actual.includes(expected)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to contain: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_34("assertStringIncludes", assertStringIncludes);
    function assertArrayIncludes(actual, expected, msg) {
        const missing = [];
        for (let i = 0; i < expected.length; i++) {
            let found = false;
            for (let j = 0; j < actual.length; j++) {
                if (equal(expected[i], actual[j])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missing.push(expected[i]);
            }
        }
        if (missing.length === 0) {
            return;
        }
        if (!msg) {
            msg = `actual: "${_format(actual)}" expected to include: "${_format(expected)}"\nmissing: ${_format(missing)}`;
        }
        throw new AssertionError(msg);
    }
    exports_34("assertArrayIncludes", assertArrayIncludes);
    function assertMatch(actual, expected, msg) {
        if (!expected.test(actual)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to match: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_34("assertMatch", assertMatch);
    function assertNotMatch(actual, expected, msg) {
        if (expected.test(actual)) {
            if (!msg) {
                msg = `actual: "${actual}" expected to not match: "${expected}"`;
            }
            throw new AssertionError(msg);
        }
    }
    exports_34("assertNotMatch", assertNotMatch);
    function assertObjectMatch(actual, expected) {
        const seen = new WeakMap();
        return assertEquals((function filter(a, b) {
            if ((seen.has(a)) && (seen.get(a) === b)) {
                return a;
            }
            seen.set(a, b);
            const filtered = {};
            const entries = [
                ...Object.getOwnPropertyNames(a),
                ...Object.getOwnPropertySymbols(a),
            ]
                .filter((key) => key in b)
                .map((key) => [key, a[key]]);
            for (const [key, value] of entries) {
                if (typeof value === "object") {
                    const subset = b[key];
                    if ((typeof subset === "object") && (subset)) {
                        filtered[key] = filter(value, subset);
                        continue;
                    }
                }
                filtered[key] = value;
            }
            return filtered;
        })(actual, expected), expected);
    }
    exports_34("assertObjectMatch", assertObjectMatch);
    function fail(msg) {
        assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
    }
    exports_34("fail", fail);
    function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            fn();
        }
        catch (e) {
            if (e instanceof Error === false) {
                throw new AssertionError("A non-Error object was thrown.");
            }
            if (ErrorClass && !(e instanceof ErrorClass)) {
                msg =
                    `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes &&
                !colors_ts_3.stripColor(e.message).includes(colors_ts_3.stripColor(msgIncludes))) {
                msg =
                    `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_34("assertThrows", assertThrows);
    async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
        let doesThrow = false;
        let error = null;
        try {
            await fn();
        }
        catch (e) {
            if (e instanceof Error === false) {
                throw new AssertionError("A non-Error object was thrown or rejected.");
            }
            if (ErrorClass && !(e instanceof ErrorClass)) {
                msg =
                    `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            if (msgIncludes &&
                !colors_ts_3.stripColor(e.message).includes(colors_ts_3.stripColor(msgIncludes))) {
                msg =
                    `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
                throw new AssertionError(msg);
            }
            doesThrow = true;
            error = e;
        }
        if (!doesThrow) {
            msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        return error;
    }
    exports_34("assertThrowsAsync", assertThrowsAsync);
    function unimplemented(msg) {
        throw new AssertionError(msg || "unimplemented");
    }
    exports_34("unimplemented", unimplemented);
    function unreachable() {
        throw new AssertionError("unreachable");
    }
    exports_34("unreachable", unreachable);
    return {
        setters: [
            function (colors_ts_3_1) {
                colors_ts_3 = colors_ts_3_1;
            },
            function (_diff_ts_1_1) {
                _diff_ts_1 = _diff_ts_1_1;
            }
        ],
        execute: function () {
            CAN_NOT_DISPLAY = "[Cannot display]";
            AssertionError = class AssertionError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "AssertionError";
                }
            };
            exports_34("AssertionError", AssertionError);
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/remote/asserts", ["https://deno.land/std@0.75.0/testing/asserts"], function (exports_35, context_35) {
    "use strict";
    var __moduleName = context_35 && context_35.id;
    function exportStar_6(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_35(exports);
    }
    return {
        setters: [
            function (asserts_ts_1_1) {
                exportStar_6(asserts_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/utils", ["file:///home/matt/@mwm/create-deno-first/remote/colors", "file:///home/matt/@mwm/create-deno-first/scripts/prompt"], function (exports_36, context_36) {
    "use strict";
    var colors_ts_4, prompt_ts_5;
    var __moduleName = context_36 && context_36.id;
    async function readFile(filePath) {
        return Deno.readTextFile(filePath);
    }
    exports_36("readFile", readFile);
    async function stringifyJSON(data) {
        return JSON.stringify(data, null, "\t");
    }
    exports_36("stringifyJSON", stringifyJSON);
    async function parseJSON(data) {
        return JSON.parse(data);
    }
    exports_36("parseJSON", parseJSON);
    function strip(string) {
        return colors_ts_4.stripColor(string).trim();
    }
    exports_36("strip", strip);
    async function checkForErrors(tp) {
        let err;
        do {
            err = strip(await tp.readError());
            const isOkay = err.startsWith("Check")
                ? "okay"
                : err.startsWith("Download")
                    ? "okay"
                    : err === ""
                        ? "okay"
                        : "not okay";
            if (isOkay === "not okay") {
                break;
            }
        } while (err !== "");
        return err;
    }
    exports_36("checkForErrors", checkForErrors);
    function configureTestProcess(script) {
        return async ({ preTest, postTest } = {}) => {
            const tempDir = await Deno.makeTempDir({ prefix: "test-" });
            const process = Deno.run({
                cmd: ["deno", "run", "--unstable", "--allow-all", script, tempDir],
                stderr: "piped",
                stdin: "piped",
                stdout: "piped",
            });
            const end = async () => {
                await Promise.allSettled([
                    process.stderr.close(),
                    process.stdin.close(),
                    process.stdout.close(),
                    process.close(),
                    Deno.remove(tempDir, { recursive: true }),
                ]);
                postTest && await postTest(tp);
            };
            const tp = {
                process,
                tempDir,
                write: prompt_ts_5.sendInput(process.stdin),
                read: prompt_ts_5.getOutput(process.stdout)(),
                readError: prompt_ts_5.getOutput(process.stderr)(),
                end,
            };
            if (preTest != null)
                await preTest(tp);
            return tp;
        };
    }
    exports_36("configureTestProcess", configureTestProcess);
    function makeSetter() {
        const actual = {};
        const set = (key) => async (value) => {
            actual[key] = await value;
            return value;
        };
        const get = () => actual;
        return [get, set];
    }
    exports_36("makeSetter", makeSetter);
    function makeExpects(tp, assertEquals) {
        async function expectQuestion(expected) {
            const actual = strip(await tp.read());
            assertEquals(actual, expected);
        }
        async function answer(answer = "") {
            await tp.write(answer);
        }
        async function expectJSON(expected) {
            const jsonString = strip(await tp.read());
            const jsonData = JSON.parse(jsonString);
            assertEquals(jsonData, expected);
        }
        async function expectNoErrors() {
            const actual = await checkForErrors(tp);
            const expected = "";
            assertEquals(actual, expected);
        }
        return { answer, expectJSON, expectNoErrors, expectQuestion };
    }
    exports_36("makeExpects", makeExpects);
    return {
        setters: [
            function (colors_ts_4_1) {
                colors_ts_4 = colors_ts_4_1;
            },
            function (prompt_ts_5_1) {
                prompt_ts_5 = prompt_ts_5_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/configure/package", ["file:///home/matt/@mwm/create-deno-first/scripts/prompt", "file:///home/matt/@mwm/create-deno-first/remote/fs", "file:///home/matt/@mwm/create-deno-first/remote/path", "file:///home/matt/@mwm/create-deno-first/remote/asserts"], function (exports_37, context_37) {
    "use strict";
    var prompt_ts_6, fs_ts_2, path_ts_1, asserts_ts_2, commonJSON, readFile, parseJSON, initNPM, setRepositoryDirectory, verifyPrivate, verifyName, verifyVersion, overwriteTargetFile;
    var __moduleName = context_37 && context_37.id;
    async function configPackageJSON(set, { sourceDir = ".", targetDir = "platform/node" } = {}) {
        const configure = await prompt_ts_6.askYesNo("Automatically Configure package.json Files")
            .then(prompt_ts_6.defaultTo("yes"))
            .then(prompt_ts_6.prompt)
            .then((yes) => yes === "yes");
        if (!configure)
            return;
        const sourceFile = sourceDir + "/package.json";
        const targetFile = targetDir + "/package.json";
        asserts_ts_2.assert(fs_ts_2.exists(sourceDir), `ERROR: source dir, ${sourceDir}, does not exist`);
        asserts_ts_2.assert(fs_ts_2.exists(targetDir), `ERROR: target dir, ${sourceDir}, does not exist`);
        const overwrite = await overwriteTargetFile(targetFile);
        if (overwrite === "cancel")
            return;
        const existingJSON = overwrite === "merge"
            ? await Deno.readTextFile(targetFile)
                .then(parseJSON).catch(() => ({}))
            : {};
        const newJSON = await initNPM(sourceDir)
            .then(readFile)
            .then(parseJSON)
            .then(setRepositoryDirectory(sourceDir));
        const denoVersion = await Deno.readTextFile("version.json")
            .then(parseJSON)
            .catch(() => null);
        const name = existingJSON.name ?? newJSON.name;
        const version = denoVersion ?? existingJSON.version ?? newJSON.version;
        const json = Object.assign({}, commonJSON, newJSON, existingJSON, { name, version });
        return verifyName(json)
            .then(verifyVersion)
            .then(verifyPrivate)
            .then((json) => {
            prompt_ts_6.forceWriteTextFile(targetFile, JSON.stringify(json));
            return json.name;
        })
            .then(set("NPM_PACKAGE_NAME"))
            .then(prompt_ts_6.done)
            .finally(() => Deno.remove(sourceFile));
    }
    exports_37("configPackageJSON", configPackageJSON);
    return {
        setters: [
            function (prompt_ts_6_1) {
                prompt_ts_6 = prompt_ts_6_1;
            },
            function (fs_ts_2_1) {
                fs_ts_2 = fs_ts_2_1;
            },
            function (path_ts_1_1) {
                path_ts_1 = path_ts_1_1;
            },
            function (asserts_ts_2_1) {
                asserts_ts_2 = asserts_ts_2_1;
            }
        ],
        execute: function () {
            commonJSON = {
                type: "commonjs",
                main: "./build/index.js",
                types: "./build/index.d.ts",
                scripts: {
                    build: "tsc",
                    "build-development": "tsc",
                    "build-production": "tsc -p tsconfig.production.json",
                    prepack: "cat .gitignore .npmignore-additions > .npmignore",
                    test: "tap ./test-build/**/*.test.js",
                },
                devDependencies: {
                    "@types/node": "^14.11.4",
                    typescript: "^4.0.3",
                },
            };
            readFile = (filePath) => Deno.readTextFile(filePath);
            parseJSON = async (data) => JSON.parse(data);
            initNPM = async (cwd) => {
                const p = Deno.run({ cmd: ["npm", "init", "-y"], cwd, stdout: "null" });
                await p.status();
                p.close();
                return path_ts_1.join(cwd, "package.json");
            };
            setRepositoryDirectory = (directory) => (json) => {
                if (json.repository)
                    json.repository.directory = directory;
                return json;
            };
            verifyPrivate = (json) => prompt_ts_6.askYesNo("Is this a private repository")
                .then(prompt_ts_6.defaultTo(json.private ? "yes" : "no"))
                .then(prompt_ts_6.prompt)
                .then((isPrivate) => ({ ...json, ...{ private: isPrivate === "yes" } }));
            verifyName = (json) => prompt_ts_6.ask("Repository name")
                .then(prompt_ts_6.defaultTo(json.name))
                .then(prompt_ts_6.prompt)
                .then((name) => ({ ...json, ...{ name } }));
            verifyVersion = (json) => prompt_ts_6.ask("Repository version")
                .then(prompt_ts_6.defaultTo(json.version))
                .then(prompt_ts_6.prompt)
                .then((version) => ({ ...json, ...{ version } }));
            overwriteTargetFile = (targetFile) => fs_ts_2.exists(targetFile)
                .then((exists) => exists
                ? prompt_ts_6.ask(`${targetFile} file exists`)
                    .then(prompt_ts_6.acceptPartial("overwrite", "merge", "cancel"))
                    .then(prompt_ts_6.defaultTo("merge"))
                    .then(prompt_ts_6.retry())
                    .then(prompt_ts_6.prompt)
                : "overwrite");
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/makefiles/deno", [], function (exports_38, context_38) {
    "use strict";
    var __moduleName = context_38 && context_38.id;
    return {
        setters: [],
        execute: function () {
            exports_38("default", "# Include, then immediately export, environment variables in .env file.\n# These variables will be available to the Deno CLI.\ninclude .env\nexport\n\n# These settings can be safely disabled by setting the VARIABLE_NAME to nothing\n# in your deployment's .env file. For example, setting the following would\n# disable the local Deno cache in favor of Deno's global cache:\n#\n# DENO_DIR=\n#\nDENO_DIR               ?= .deno\nDENO_MAIN              ?= mod.ts\nIMPORT_MAP             ?=\nLOCK_FILE              ?= lock_file.json\nRUN_PERMISSIONS        ?=\nTEST_PERMISSIONS       ?= --allow-read=./source,. --allow-run\nUSE_CACHE              ?= --cached-only\nUSE_UNSTABLE           ?=\n\n# The default values for these settings are meant to be easily overwritten by\n# your project's .env file.\n#\n# Do NOT set these values to nothing.\n#\nDENO_BUNDLE_FILE       ?= mod.js\nDENO_DEPENDENCIES_FILE ?= dependencies.ts\nDENO_SOURCE_DIR        ?= source\nDENO_APP_DIR           ?= $(DENO_SOURCE_DIR)/app\nDENO_LIB_DIR           ?= $(DENO_SOURCE_DIR)/lib\n\nDENO_ABS               := $(PWD)/$(DENO_DIR)\n\nGEN_DIR                ?= /dev/null\n\nNPM                    ?= npm\nNPM_INSTALL            ?= $(NPM) install\nNPM_RUN                ?= $(NPM) run\nNPM_LINK               ?= $(NPM) link\nNPM_UNLINK             ?= $(NPM) unlink\n\nSOURCE_FILES           := $(shell find \"$(DENO_SOURCE_DIR)\" -type f -name \"*.ts\")\nLINT_FILES             := $(shell find \"$(DENO_SOURCE_DIR)\" -type f -name \"*.ts\" -not -name \"*.test.ts\")\nREMOTE_DIRS            := $(shell find $(shell ls .) -type d -name \"remote\")\nREMOTE_DEPENDENCIES    := $(shell find \"$(REMOTE_DIRS)\" -type f -name \"*.ts\")\n\nPLATFORMS              := $(shell find ./platform/         -maxdepth 1 -mindepth 1 -type d)\nINTEGRATIONS           := $(shell find ./integration-test/ -maxdepth 1 -mindepth 1 -type d)\n\nifneq ($(IMPORT_MAP),)\nIMPORT_MAP_OPTIONS     := --importmap $(IMPORT_MAP)\nUSE_UNSTABLE           := --unstable\nendif\n\nifneq ($(LOCK_FILE),)\nLOCK_OPTIONS           := --lock $(LOCK_FILE)\nLOCK_OPTIONS_WRITE     := --lock $(LOCK_FILE) --lock-write\nendif\n\ndefine NEWLINE\n\nendef\n\ndefine print_header\n\t@echo\n\t@echo $1\n\t@echo\nendef\n\nall: install lint build test-all\n\nifneq ($(PLATFORMS),)\n$(PLATFORMS):\n\t$(MAKE) DENO_DIR=$(DENO_ABS) -C $@ $(TARGET)\nendif\n\nifneq ($(INTEGRATIONS),)\n$(INTEGRATIONS):\n\t$(MAKE) DENO_DIR=$(DENO_ABS) -C $@ $(TARGET)\nendif\n\nifneq ($(LOCK_FILE),)\n$(LOCK_FILE): $(REMOTE_DEPENDENCIES) $(DENO_DEPENDENCIES_FILE)\n\t@read -p \\\n\t\t\"Dependencies have changed. Press [Enter] to update the cache and $(LOCK_FILE), or [Ctrl]+[C] to cancel:\" \\\n\t\tcancel\nifneq ($(RELOAD),)\n\t@echo \"Deleting $(DENO_DIR)...\"\n\trm -rf $(DENO_DIR)\nendif\n\tdeno cache --unstable \\\n\t\t$(RELOAD) \\\n\t\t$(RUN_PERMISSIONS) \\\n\t\t$(LOCK_OPTIONS_WRITE) \\\n\t\t$(IMPORT_MAP_OPTIONS) \\\n\t\t$(DENO_DEPENDENCIES_FILE)\nendif\n\nifneq ($(DENO_BUNDLE_FILE),)\n$(DENO_BUNDLE_FILE): $(LINT_FILES) scripts/makefiles\n\t@echo \"// deno-fmt-ignore-file\"   > $(DENO_BUNDLE_FILE)\n\t@echo \"// deno-lint-ignore-file\" >> $(DENO_BUNDLE_FILE)\n\t@echo \"// @ts-nocheck\"           >> $(DENO_BUNDLE_FILE)\n\tdeno bundle \\\n\t\t$(IMPORT_MAP_OPTIONS) \\\n\t\t$(USE_UNSTABLE) \\\n\t\t$(DENO_MAIN) \\\n\t\t>> $(DENO_BUNDLE_FILE)\nendif\n\nifneq ($(GEN_DIR),)\n$(GEN_DIR): $(SOURCE_FILES)\n\tmkdir -p $@\n\trsync -am --include=\"*.ts\" --delete-during \\\n\t\t$(DENO_APP_DIR)/ \\\n\t\t$@/\n\tfind $@ -type f -name \"*.ts\" -exec \\\n\t\tsed -i -E \"s/(from \\\"\\..+)(\\.d.ts)|(\\.ts)(\\\";?)/\\1\\4/g\" {} +\nendif\n\nifneq ($(DENO_DEPENDENCIES_FILE),)\n$(DENO_DEPENDENCIES_FILE): $(REMOTE_DEPENDENCIES)\n\t$(file > $(DENO_DEPENDENCIES_FILE),$(patsubst %,import \"./%\";,$(REMOTE_DEPENDENCIES)))\n\tdeno fmt $(DENO_DEPENDENCIES_FILE)\nendif\n\nbuild: .header(build) $(DENO_BUNDLE_FILE)\n\t$(MAKE) TARGET=$@ do-platform-action\n\t$(MAKE) TARGET=$@ do-integration-action\n\nclean: .header(clean)\n\t$(MAKE) DENO_DIR=$(DENO_ABS) -C scripts/makefiles clean\n\t$(MAKE) TARGET=$@ do-platform-action\n\t$(MAKE) TARGET=$@ do-integration-action\n\nconfigure: scripts/makefiles\n\t./configure\n\ndo-platform-action: $(PLATFORMS)\n\ndo-integration-action: $(INTEGRATIONS)\n\nfmt: format\n\nformat:\n\tdeno fmt $(DENO_SOURCE_DIR) $(DENO_LIB_DIR)\n\n.header(build):\n\t$(call print_header, Building...)\n\n.header(clean):\n\t$(call print_header, Cleaning...)\n\n.header(install):\n\t$(call print_header, Installing...)\n\n.header(test):\n\t$(call print_header, Testing...)\n\ninstall: .header(install) $(LOCK_FILE)\n\t$(MAKE) TARGET=$@ do-platform-action\n\t$(MAKE) TARGET=$@ do-integration-action\n\nlint:\n\tdeno fmt --check $(RUN_PERMISSIONS) $(DENO_SOURCE_DIR)\n\t-deno lint --unstable $(RUN_PERMISSIONS) $(LINT_FILES)\n\nlint-quiet:\n\tdeno fmt --quiet --check $(RUN_PERMISSIONS) $(DENO_SOURCE_DIR)\n\t-deno lint --quiet --unstable $(RUN_PERMISSIONS) $(LINT_FILES)\n\nrun:\n\tdeno run $(RUN_PERMISSIONS) $(DENO_MAIN)\n\nscripts/makefiles:\n\t$(MAKE) DENO_DIR=$(DENO_ABS) -C $@\n\ntest: .header(test) $(LOCK_FILE)\n\tdeno test --unstable --coverage \\\n\t\t$(TEST_PERMISSIONS) \\\n\t\t$(LOCK_OPTIONS) \\\n\t\t$(USE_CACHE) \\\n\t\t$(IMPORT_MAP_OPTIONS) \\\n\t\t$(DENO_SOURCE_DIR)\n\ntest-scripts: .header(test) $(LOCK_FILE)\n\tdeno test \\\n\t\t--unstable --coverage --allow-write --allow-read --allow-run \\\n\t\t$(LOCK_OPTIONS) \\\n\t\t$(USE_CACHE) \\\n\t\t$(IMPORT_MAP_OPTIONS) \\\n\t\tscripts\n\ntest-all: .header(test) test test-scripts\n\t$(MAKE) TARGET=test do-platform-action\n\t$(MAKE) TARGET=test do-integration-action\n\ntest-quiet: .header(test) $(LOCK_FILE)\n\tdeno test --unstable --failfast --quiet \\\n\t\t$(TEST_PERMISSIONS) \\\n\t\t$(LOCK_OPTIONS) \\\n\t\t$(USE_CACHE) \\\n\t\t$(IMPORT_MAP_OPTIONS) \\\n\t\t$(DENO_SOURCE_DIR)\n\ntest-watch: .header(test)\n\twhile inotifywait -e close_write $(DENO_APP_DIR); do make test; done\n\nupgrade:\n\t$(MAKE) --always-make RELOAD=--reload $(LOCK_FILE)\n\n.PHONY: \\\n\tall \\\n\tbuild \\\n\tclean configure \\\n\tdeno \\\n\tdo-platform-action do-integration-action \\\n\tfmt format \\\n\t.header(build) .header(clean) .header(install) .header(test) \\\n\tinstall \\\n\tlint lint-quiet \\\n\trun \\\n\tscripts/makefiles \\\n\ttest test-quiet test-scripts test-watch \\\n\t$(PLATFORMS) $(INTEGRATIONS)\n");
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/makefiles/node", [], function (exports_39, context_39) {
    "use strict";
    var __moduleName = context_39 && context_39.id;
    return {
        setters: [],
        execute: function () {
            exports_39("default", "DEVELOPMENT_FILES := $(shell find \"$(PWD)/$(DENO_SOURCE_DIR)\" -type f -name \"*.ts\")\nGEN_DIR           := $(CURDIR)/source/gen\n\nall: install test build\n\n$(GEN_DIR): $(DEVELOPMENT_FILES)\n\t$(MAKE) GEN_DIR=$(GEN_DIR) -C $(PWD) $(GEN_DIR)\n\nbuild: $(GEN_DIR)\n\trm -rf build\n\t$(NPM_RUN) build-production\n\t$(NPM_LINK)\n\nclean:\n\t-$(NPM_UNLINK)\n\trm -rf .npmignore .nyc_output build node_modules $(GEN_DIR) test-build\n\ninstall:\n\t$(NPM_INSTALL)\n\ntest: test-build\n\t$(NPM_RUN) test\n\ntest-build: $(GEN_DIR)\n\trm -rf test-build\n\t$(NPM_RUN) build-development\n\n.PHONY: all clean install test\n");
        }
    };
});
System.register("file:///home/matt/@mwm/create-deno-first/scripts/configure", ["file:///home/matt/@mwm/create-deno-first/scripts/configure/cache", "file:///home/matt/@mwm/create-deno-first/scripts/configure/import_map", "file:///home/matt/@mwm/create-deno-first/scripts/configure/makefile", "file:///home/matt/@mwm/create-deno-first/scripts/configure/npm", "file:///home/matt/@mwm/create-deno-first/scripts/configure/package", "file:///home/matt/@mwm/create-deno-first/scripts/prompt", "file:///home/matt/@mwm/create-deno-first/scripts/makefiles/deno", "file:///home/matt/@mwm/create-deno-first/scripts/makefiles/node"], function (exports_40, context_40) {
    "use strict";
    var cache_ts_1, import_map_ts_1, makefile_ts_1, npm_ts_1, package_ts_1, prompt_ts_7, deno_ts_1, node_ts_1, envToString, env, set;
    var __moduleName = context_40 && context_40.id;
    return {
        setters: [
            function (cache_ts_1_1) {
                cache_ts_1 = cache_ts_1_1;
            },
            function (import_map_ts_1_1) {
                import_map_ts_1 = import_map_ts_1_1;
            },
            function (makefile_ts_1_1) {
                makefile_ts_1 = makefile_ts_1_1;
            },
            function (npm_ts_1_1) {
                npm_ts_1 = npm_ts_1_1;
            },
            function (package_ts_1_1) {
                package_ts_1 = package_ts_1_1;
            },
            function (prompt_ts_7_1) {
                prompt_ts_7 = prompt_ts_7_1;
            },
            function (deno_ts_1_1) {
                deno_ts_1 = deno_ts_1_1;
            },
            function (node_ts_1_1) {
                node_ts_1 = node_ts_1_1;
            }
        ],
        execute: async function () {
            envToString = async (env) => [...env.entries()].map((e) => e.join("=")).join("\n");
            env = new Map();
            set = (key) => async (value) => {
                env.set(key, await Promise.resolve(value));
                return value;
            };
            await import_map_ts_1.configImportMap(set);
            await npm_ts_1.configNPM(set);
            await cache_ts_1.configCache(set);
            await package_ts_1.configPackageJSON(set);
            await envToString(env)
                .then(prompt_ts_7.verifyWriteTextFile(".env"))
                .then();
            await makefile_ts_1.configMakefiles([
                ["Makefile", deno_ts_1.default],
                ["platform/node/Makefile", node_ts_1.default],
            ]);
        }
    };
});

await __instantiate("file:///home/matt/@mwm/create-deno-first/scripts/configure", true);

