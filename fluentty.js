// deno-fmt-ignore-file
// deno-lint-ignore-file
// @ts-nocheck
class Match {
    #prompt;
    #options;
    constructor(prompt1, ...options){
        this.#options = options;
        this.#prompt = prompt1;
    }
    matchCase = ()=>this.#configureMatch("")
    ;
    ignoreCase = ()=>this.#configureMatch("i")
    ;
    #configureMatch=(flags)=>{
        return {
            matchFull: ()=>this.#done(flags, "full")
            ,
            matchInitial: ()=>this.#done(flags, "init")
            ,
            matchAnywhere: ()=>this.#done(flags, "part")
        };
    };
    #done=(flags, match)=>{
        const options1 = this.#options;
        const prompt1 = this.#prompt;
        const validator = (input)=>{
            const maybes = [];
            const full = new RegExp(`^${input}$`, flags);
            const init = new RegExp(`^${input}`, flags);
            const part = new RegExp(`${input}`, flags);
            for (const option of options1){
                if (full.test(option)) return option;
                else if (input === "") return false;
                else if (match === "init" && init.test(option)) maybes.push(option);
                else if (match === "part" && part.test(option)) maybes.push(option);
            }
            return maybes.length === 1 ? maybes[0] : false;
        };
        return Question.from(prompt1.concat({
            validators: [
                ...prompt1.validators,
                validator, 
            ]
        }));
    };
}
class Question {
    #prompt;
    constructor(value){
        this.#prompt = value;
    }
    static from(prompt) {
        return new Question(prompt);
    }
    map = (fn)=>Question.from(fn(this.#prompt))
    ;
    accept = (...options1)=>{
        return new Match(this.#prompt, ...options1);
    };
    suggest = (...suggestions)=>{
        const prompt2 = this.#prompt.concat({
            suggestions
        });
        return new Match(prompt2, ...suggestions);
    };
    defaultTo = (defaultTo)=>{
        return {
            andSuggest: ()=>this.map((prompt2)=>prompt2.concat({
                        defaultTo,
                        suggestions: [
                            defaultTo
                        ]
                    })
                )
            ,
            justAccept: ()=>this.map((prompt2)=>prompt2.concat({
                        defaultTo
                    })
                )
        };
    };
    format = (...formatters)=>this.map((prompt2)=>prompt2.concat({
                formatters
            })
        )
    ;
    retry = (retry = true)=>this.map((prompt2)=>prompt2.concat({
                retry
            })
        )
    ;
    sanitize = (...sanitizers)=>this.map((prompt2)=>prompt2.concat({
                sanitizers
            })
        )
    ;
    validate = (...validators)=>this.map((prompt2)=>prompt2.concat({
                validators
            })
        )
    ;
    IO = ()=>stdout(`${this.#prompt}`).then(stdin).then(this.#prompt.validate).catch((reason)=>this.#prompt.retry ? this.IO() : Promise.reject(reason)
        )
    ;
    test = (input)=>this.#prompt.validate(input)
    ;
}
function question(message) {
    return Question.from(Prompt.from(message));
}
function askYesNo(message) {
    return question(message).suggest("yes", "no").ignoreCase().matchInitial().retry();
}
let NATIVE_OS = "linux";
const navigator = globalThis.navigator;
if (globalThis.Deno != null) {
    NATIVE_OS = Deno.build.os;
} else if (navigator?.appVersion?.includes?.("Win") ?? false) {
    NATIVE_OS = "windows";
}
const isWindows = NATIVE_OS == "windows";
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const _win32 = function() {
    const sep = "\\";
    const delimiter = ";";
    function resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for(let i = pathSegments.length - 1; i >= -1; i--){
            let path;
            if (i >= 0) {
                path = pathSegments[i];
            } else if (!resolvedDevice) {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a drive-letter-less path without a CWD.");
                }
                path = Deno.cwd();
            } else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
                if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                    path = `${resolvedDevice}\\`;
                }
            }
            assertPath(path);
            const len = path.length;
            if (len === 0) continue;
            let rootEnd = 0;
            let device = "";
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            if (len > 1) {
                if (isPathSeparator(code)) {
                    isAbsolute = true;
                    if (isPathSeparator(path.charCodeAt(1))) {
                        let j = 2;
                        let last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            const firstPart = path.slice(last, j);
                            last = j;
                            for(; j < len; ++j){
                                if (!isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j < len && j !== last) {
                                last = j;
                                for(; j < len; ++j){
                                    if (isPathSeparator(path.charCodeAt(j))) break;
                                }
                                if (j === len) {
                                    device = `\\\\${firstPart}\\${path.slice(last)}`;
                                    rootEnd = j;
                                } else if (j !== last) {
                                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                    rootEnd = j;
                                }
                            }
                        }
                    } else {
                        rootEnd = 1;
                    }
                } else if (isWindowsDeviceRoot(code)) {
                    if (path.charCodeAt(1) === 58) {
                        device = path.slice(0, 2);
                        rootEnd = 2;
                        if (len > 2) {
                            if (isPathSeparator(path.charCodeAt(2))) {
                                isAbsolute = true;
                                rootEnd = 3;
                            }
                        }
                    }
                }
            } else if (isPathSeparator(code)) {
                rootEnd = 1;
                isAbsolute = true;
            }
            if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
            }
            if (resolvedDevice.length === 0 && device.length > 0) {
                resolvedDevice = device;
            }
            if (!resolvedAbsolute) {
                resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                resolvedAbsolute = isAbsolute;
            }
            if (resolvedAbsolute && resolvedDevice.length > 0) break;
        }
        resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
        return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
    }
    function normalize(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return ".";
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                return `\\\\${firstPart}\\${path.slice(last)}\\`;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            return "\\";
        }
        let tail;
        if (rootEnd < len) {
            tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
        } else {
            tail = "";
        }
        if (tail.length === 0 && !isAbsolute) tail = ".";
        if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
            tail += "\\";
        }
        if (device === undefined) {
            if (isAbsolute) {
                if (tail.length > 0) return `\\${tail}`;
                else return "\\";
            } else if (tail.length > 0) {
                return tail;
            } else {
                return "";
            }
        } else if (isAbsolute) {
            if (tail.length > 0) return `${device}\\${tail}`;
            else return `${device}\\`;
        } else if (tail.length > 0) {
            return device + tail;
        } else {
            return device;
        }
    }
    function isAbsolute(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return false;
        const code = path.charCodeAt(0);
        if (isPathSeparator(code)) {
            return true;
        } else if (isWindowsDeviceRoot(code)) {
            if (len > 2 && path.charCodeAt(1) === 58) {
                if (isPathSeparator(path.charCodeAt(2))) return true;
            }
        }
        return false;
    }
    function join(...paths) {
        const pathsCount = paths.length;
        if (pathsCount === 0) return ".";
        let joined;
        let firstPart = null;
        for(let i = 0; i < pathsCount; ++i){
            const path = paths[i];
            assertPath(path);
            if (path.length > 0) {
                if (joined === undefined) joined = firstPart = path;
                else joined += `\\${path}`;
            }
        }
        if (joined === undefined) return ".";
        let needsReplace = true;
        let slashCount = 0;
        assert(firstPart != null);
        if (isPathSeparator(firstPart.charCodeAt(0))) {
            ++slashCount;
            const firstLen = firstPart.length;
            if (firstLen > 1) {
                if (isPathSeparator(firstPart.charCodeAt(1))) {
                    ++slashCount;
                    if (firstLen > 2) {
                        if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                        else {
                            needsReplace = false;
                        }
                    }
                }
            }
        }
        if (needsReplace) {
            for(; slashCount < joined.length; ++slashCount){
                if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
            }
            if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
        }
        return normalize(joined);
    }
    function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        const fromOrig = resolve(from);
        const toOrig = resolve(to);
        if (fromOrig === toOrig) return "";
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) return "";
        let fromStart = 0;
        let fromEnd = from.length;
        for(; fromStart < fromEnd; ++fromStart){
            if (from.charCodeAt(fromStart) !== 92) break;
        }
        for(; fromEnd - 1 > fromStart; --fromEnd){
            if (from.charCodeAt(fromEnd - 1) !== 92) break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        let toEnd = to.length;
        for(; toStart < toEnd; ++toStart){
            if (to.charCodeAt(toStart) !== 92) break;
        }
        for(; toEnd - 1 > toStart; --toEnd){
            if (to.charCodeAt(toEnd - 1) !== 92) break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for(; i <= length; ++i){
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 92) {
                        return toOrig.slice(toStart + i + 1);
                    } else if (i === 2) {
                        return toOrig.slice(toStart + i);
                    }
                }
                if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 92) {
                        lastCommonSep = i;
                    } else if (i === 2) {
                        lastCommonSep = 3;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode) break;
            else if (fromCode === 92) lastCommonSep = i;
        }
        if (i !== length && lastCommonSep === -1) {
            return toOrig;
        }
        let out = "";
        if (lastCommonSep === -1) lastCommonSep = 0;
        for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
            if (i === fromEnd || from.charCodeAt(i) === 92) {
                if (out.length === 0) out += "..";
                else out += "\\..";
            }
        }
        if (out.length > 0) {
            return out + toOrig.slice(toStart + lastCommonSep, toEnd);
        } else {
            toStart += lastCommonSep;
            if (toOrig.charCodeAt(toStart) === 92) ++toStart;
            return toOrig.slice(toStart, toEnd);
        }
    }
    function toNamespacedPath(path) {
        if (typeof path !== "string") return path;
        if (path.length === 0) return "";
        const resolvedPath = resolve(path);
        if (resolvedPath.length >= 3) {
            if (resolvedPath.charCodeAt(0) === 92) {
                if (resolvedPath.charCodeAt(1) === 92) {
                    const code = resolvedPath.charCodeAt(2);
                    if (code !== 63 && code !== 46) {
                        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                    }
                }
            } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
                if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                    return `\\\\?\\${resolvedPath}`;
                }
            }
        }
        return path;
    }
    function dirname(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return ".";
        let rootEnd = -1;
        let end = -1;
        let matchedSlash = true;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                rootEnd = offset = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
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
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    rootEnd = offset = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            return path;
        }
        for(let i = len - 1; i >= offset; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            } else {
                matchedSlash = false;
            }
        }
        if (end === -1) {
            if (rootEnd === -1) return ".";
            else end = rootEnd;
        }
        return path.slice(0, end);
    }
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('\"ext\" argument must be a string');
        }
        assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path.length >= 2) {
            const drive = path.charCodeAt(0);
            if (isWindowsDeviceRoot(drive)) {
                if (path.charCodeAt(1) === 58) start = 2;
            }
        }
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for(i = path.length - 1; i >= start; --i){
                const code = path.charCodeAt(i);
                if (isPathSeparator(code)) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if ((--extIdx) === -1) {
                                end = i;
                            }
                        } else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) end = firstNonSlashEnd;
            else if (end === -1) end = path.length;
            return path.slice(start, end);
        } else {
            for(i = path.length - 1; i >= start; --i){
                if (isPathSeparator(path.charCodeAt(i))) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) return "";
            return path.slice(start, end);
        }
    }
    function extname(path) {
        assertPath(path);
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
            start = startPart = 2;
        }
        for(let i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
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
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return "";
        }
        return path.slice(startDot, end);
    }
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _format("\\", pathObject);
    }
    function parse(path) {
        assertPath(path);
        const ret = {
            root: "",
            dir: "",
            base: "",
            ext: "",
            name: ""
        };
        const len = path.length;
        if (len === 0) return ret;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                rootEnd = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                rootEnd = j;
                            } else if (j !== last) {
                                rootEnd = j + 1;
                            }
                        }
                    }
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            if (len === 3) {
                                ret.root = ret.dir = path;
                                return ret;
                            }
                            rootEnd = 3;
                        }
                    } else {
                        ret.root = ret.dir = path;
                        return ret;
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            ret.root = ret.dir = path;
            return ret;
        }
        if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for(; i >= rootEnd; --i){
            code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
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
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                ret.base = ret.name = path.slice(startPart, end);
            }
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0 && startPart !== rootEnd) {
            ret.dir = path.slice(0, startPart - 1);
        } else ret.dir = ret.root;
        return ret;
    }
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
    return {
        sep,
        delimiter,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        toNamespacedPath,
        dirname,
        basename,
        extname,
        format,
        parse,
        fromFileUrl,
        toFileUrl
    };
}();
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator1(code)) break;
        else code = 47;
        if (isPathSeparator1(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const _posix = function() {
    const sep = "/";
    const delimiter = ":";
    function resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
            let path;
            if (i >= 0) path = pathSegments[i];
            else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.cwd();
            }
            assertPath(path);
            if (path.length === 0) {
                continue;
            }
            resolvedPath = `${path}/${resolvedPath}`;
            resolvedAbsolute = path.charCodeAt(0) === 47;
        }
        resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0) return `/${resolvedPath}`;
            else return "/";
        } else if (resolvedPath.length > 0) return resolvedPath;
        else return ".";
    }
    function normalize(path) {
        assertPath(path);
        if (path.length === 0) return ".";
        const isAbsolute = path.charCodeAt(0) === 47;
        const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
        path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
        if (path.length === 0 && !isAbsolute) path = ".";
        if (path.length > 0 && trailingSeparator) path += "/";
        if (isAbsolute) return `/${path}`;
        return path;
    }
    function isAbsolute(path) {
        assertPath(path);
        return path.length > 0 && path.charCodeAt(0) === 47;
    }
    function join(...paths) {
        if (paths.length === 0) return ".";
        let joined;
        for(let i = 0, len = paths.length; i < len; ++i){
            const path = paths[i];
            assertPath(path);
            if (path.length > 0) {
                if (!joined) joined = path;
                else joined += `/${path}`;
            }
        }
        if (!joined) return ".";
        return normalize(joined);
    }
    function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        from = resolve(from);
        to = resolve(to);
        if (from === to) return "";
        let fromStart = 1;
        const fromEnd = from.length;
        for(; fromStart < fromEnd; ++fromStart){
            if (from.charCodeAt(fromStart) !== 47) break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 1;
        const toEnd = to.length;
        for(; toStart < toEnd; ++toStart){
            if (to.charCodeAt(toStart) !== 47) break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for(; i <= length; ++i){
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 47) {
                        return to.slice(toStart + i + 1);
                    } else if (i === 0) {
                        return to.slice(toStart + i);
                    }
                } else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 47) {
                        lastCommonSep = i;
                    } else if (i === 0) {
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode) break;
            else if (fromCode === 47) lastCommonSep = i;
        }
        let out = "";
        for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
            if (i === fromEnd || from.charCodeAt(i) === 47) {
                if (out.length === 0) out += "..";
                else out += "/..";
            }
        }
        if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === 47) ++toStart;
            return to.slice(toStart);
        }
    }
    function toNamespacedPath(path) {
        return path;
    }
    function dirname(path) {
        assertPath(path);
        if (path.length === 0) return ".";
        const hasRoot = path.charCodeAt(0) === 47;
        let end = -1;
        let matchedSlash = true;
        for(let i = path.length - 1; i >= 1; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            } else {
                matchedSlash = false;
            }
        }
        if (end === -1) return hasRoot ? "/" : ".";
        if (hasRoot && end === 1) return "//";
        return path.slice(0, end);
    }
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('\"ext\" argument must be a string');
        }
        assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for(i = path.length - 1; i >= 0; --i){
                const code = path.charCodeAt(i);
                if (code === 47) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if ((--extIdx) === -1) {
                                end = i;
                            }
                        } else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) end = firstNonSlashEnd;
            else if (end === -1) end = path.length;
            return path.slice(start, end);
        } else {
            for(i = path.length - 1; i >= 0; --i){
                if (path.charCodeAt(i) === 47) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) return "";
            return path.slice(start, end);
        }
    }
    function extname(path) {
        assertPath(path);
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for(let i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
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
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return "";
        }
        return path.slice(startDot, end);
    }
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _format("/", pathObject);
    }
    function parse(path) {
        assertPath(path);
        const ret = {
            root: "",
            dir: "",
            base: "",
            ext: "",
            name: ""
        };
        if (path.length === 0) return ret;
        const isAbsolute1 = path.charCodeAt(0) === 47;
        let start;
        if (isAbsolute1) {
            ret.root = "/";
            start = 1;
        } else {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for(; i >= start; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
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
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute1) {
                    ret.base = ret.name = path.slice(1, end);
                } else {
                    ret.base = ret.name = path.slice(startPart, end);
                }
            }
        } else {
            if (startPart === 0 && isAbsolute1) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            } else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute1) ret.dir = "/";
        return ret;
    }
    function fromFileUrl(url) {
        url = url instanceof URL ? url : new URL(url);
        if (url.protocol != "file:") {
            throw new TypeError("Must be a file URL.");
        }
        return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
    }
    function toFileUrl(path) {
        if (!isAbsolute(path)) {
            throw new TypeError("Must be an absolute path.");
        }
        const url = new URL("file:///");
        url.pathname = path.replace(/%/g, "%25").replace(/\\/g, "%5C");
        return url;
    }
    return {
        sep,
        delimiter,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        toNamespacedPath,
        dirname,
        basename,
        extname,
        format,
        parse,
        fromFileUrl,
        toFileUrl
    };
}();
const path = isWindows ? _win32 : _posix;
const { basename , delimiter , dirname , extname , format , fromFileUrl , isAbsolute , join , normalize , parse , relative , resolve , sep , toFileUrl , toNamespacedPath ,  } = path;
const SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
function isSubdir(src, dest, sep1 = sep) {
    if (src === dest) {
        return false;
    }
    const srcArray = src.split(sep1);
    const destArray = dest.split(sep1);
    return srcArray.every((current, i)=>destArray[i] === current
    );
}
function getFileInfoType(fileInfo) {
    return fileInfo.isFile ? "file" : fileInfo.isDirectory ? "dir" : fileInfo.isSymlink ? "symlink" : undefined;
}
async function ensureDir(dir) {
    try {
        const fileInfo = await Deno.lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            await Deno.mkdir(dir, {
                recursive: true
            });
            return;
        }
        throw err;
    }
}
function ensureDirSync(dir) {
    try {
        const fileInfo = Deno.lstatSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            Deno.mkdirSync(dir, {
                recursive: true
            });
            return;
        }
        throw err;
    }
}
async function exists1(filePath) {
    try {
        await Deno.lstat(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
function existsSync(filePath) {
    try {
        Deno.lstatSync(filePath);
        return true;
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
function _createWalkEntrySync(path1) {
    path1 = normalize(path1);
    const name = basename(path1);
    const info = Deno.statSync(path1);
    return {
        path: path1,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
async function _createWalkEntry(path1) {
    path1 = normalize(path1);
    const name = basename(path1);
    const info = await Deno.stat(path1);
    return {
        path: path1,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink
    };
}
function include(path1, exts, match, skip) {
    if (exts && !exts.some((ext)=>path1.endsWith(ext)
    )) {
        return false;
    }
    if (match && !match.some((pattern)=>!!path1.match(pattern)
    )) {
        return false;
    }
    if (skip && skip.some((pattern)=>!!path1.match(pattern)
    )) {
        return false;
    }
    return true;
}
async function* walk(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {
}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield await _createWalkEntry(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    for await (const entry of Deno.readDir(root)){
        if (entry.isSymlink) {
            if (followSymlinks) {
                throw new Error("unimplemented");
            } else {
                continue;
            }
        }
        assert(entry.name != null);
        const path1 = join(root, entry.name);
        if (entry.isFile) {
            if (includeFiles && include(path1, exts, match, skip)) {
                yield {
                    path: path1,
                    ...entry
                };
            }
        } else {
            yield* walk(path1, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip
            });
        }
    }
}
function* walkSync(root, { maxDepth =Infinity , includeFiles =true , includeDirs =true , followSymlinks =false , exts =undefined , match =undefined , skip =undefined  } = {
}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield _createWalkEntrySync(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    for (const entry of Deno.readDirSync(root)){
        if (entry.isSymlink) {
            if (followSymlinks) {
                throw new Error("unimplemented");
            } else {
                continue;
            }
        }
        assert(entry.name != null);
        const path1 = join(root, entry.name);
        if (entry.isFile) {
            if (includeFiles && include(path1, exts, match, skip)) {
                yield {
                    path: path1,
                    ...entry
                };
            }
        } else {
            yield* walkSync(path1, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip
            });
        }
    }
}
const isWindows1 = Deno.build.os == "windows";
function split(path1) {
    const s = SEP_PATTERN.source;
    const segments = path1.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(SEP_PATTERN);
    const isAbsolute_ = isAbsolute(path1);
    return {
        segments,
        isAbsolute: isAbsolute_,
        hasTrailingSep: !!path1.match(new RegExp(`${s}$`)),
        winRoot: isWindows1 && isAbsolute_ ? segments.shift() : undefined
    };
}
function throwUnlessNotFound(error) {
    if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
    }
}
function comparePath(a, b) {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
}
const isWindows2 = Deno.build.os === "windows";
async function ensureValidCopy(src, dest, options1, isCopyFolder = false) {
    let destStat;
    try {
        destStat = await Deno.lstat(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (isCopyFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options1.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
function ensureValidCopySync(src, dest, options1, isCopyFolder = false) {
    let destStat;
    try {
        destStat = Deno.lstatSync(dest);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (isCopyFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options1.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
async function copyFile(src, dest, options1) {
    await ensureValidCopy(src, dest, options1);
    await Deno.copyFile(src, dest);
    if (options1.preserveTimestamps) {
        const statInfo = await Deno.stat(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
function copyFileSync(src, dest, options1) {
    ensureValidCopySync(src, dest, options1);
    Deno.copyFileSync(src, dest);
    if (options1.preserveTimestamps) {
        const statInfo = Deno.statSync(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copySymLink(src, dest, options1) {
    await ensureValidCopy(src, dest, options1);
    const originSrcFilePath = await Deno.readLink(src);
    const type = getFileInfoType(await Deno.lstat(src));
    if (isWindows2) {
        await Deno.symlink(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file"
        });
    } else {
        await Deno.symlink(originSrcFilePath, dest);
    }
    if (options1.preserveTimestamps) {
        const statInfo = await Deno.lstat(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
function copySymlinkSync(src, dest, options1) {
    ensureValidCopySync(src, dest, options1);
    const originSrcFilePath = Deno.readLinkSync(src);
    const type = getFileInfoType(Deno.lstatSync(src));
    if (isWindows2) {
        Deno.symlinkSync(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file"
        });
    } else {
        Deno.symlinkSync(originSrcFilePath, dest);
    }
    if (options1.preserveTimestamps) {
        const statInfo = Deno.lstatSync(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
async function copyDir(src, dest, options1) {
    const destStat = await ensureValidCopy(src, dest, options1, true);
    if (!destStat) {
        await ensureDir(dest);
    }
    if (options1.preserveTimestamps) {
        const srcStatInfo = await Deno.stat(src);
        assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for await (const entry of Deno.readDir(src)){
        const srcPath = join(src, entry.name);
        const destPath = join(dest, basename(srcPath));
        if (entry.isSymlink) {
            await copySymLink(srcPath, destPath, options1);
        } else if (entry.isDirectory) {
            await copyDir(srcPath, destPath, options1);
        } else if (entry.isFile) {
            await copyFile(srcPath, destPath, options1);
        }
    }
}
function copyDirSync(src, dest, options1) {
    const destStat = ensureValidCopySync(src, dest, options1, true);
    if (!destStat) {
        ensureDirSync(dest);
    }
    if (options1.preserveTimestamps) {
        const srcStatInfo = Deno.statSync(src);
        assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for (const entry of Deno.readDirSync(src)){
        assert(entry.name != null, "file.name must be set");
        const srcPath = join(src, entry.name);
        const destPath = join(dest, basename(srcPath));
        if (entry.isSymlink) {
            copySymlinkSync(srcPath, destPath, options1);
        } else if (entry.isDirectory) {
            copyDirSync(srcPath, destPath, options1);
        } else if (entry.isFile) {
            copyFileSync(srcPath, destPath, options1);
        }
    }
}
var EOL;
(function(EOL1) {
    EOL1["LF"] = "\n";
    EOL1["CRLF"] = "\r\n";
})(EOL || (EOL = {
}));
export const DEFAULT_BUFFER_SIZE = 5120;
export async function IO(...processes) {
    const results = [];
    for await (const process of processes){
        const input = await process.IO();
        results.push(input);
    }
    return results;
}
export function forceWriteTextFile(filename, data) {
    return Deno.writeTextFile(filename, data);
}
export function isYes(input) {
    return input === "yes" || input === true;
}
export function isNo(input) {
    return input === "no" || input === false;
}
export async function noop() {
}
export function verifyWriteTextFile(path1) {
    return async (data)=>{
        const justCreate = ()=>Deno.writeTextFile(path1, data)
        ;
        const askOverwrite = async ()=>askYesNo(`File ${path1} exists, overwrite?`).IO().then(ifElse(isYes, justCreate, noop))
        ;
        await exists(path1).then(ifElse(isYes, askOverwrite, justCreate));
    };
}
export function readFrom(buffer) {
    return async (accept = 5120)=>{
        const max = 5120;
        const buf = new Uint8Array(accept > 5120 ? accept : 5120);
        const got = await buffer.read(buf);
        return new TextDecoder().decode(buf.subarray(0, accept < got ? accept : got)).trim();
    };
}
export function writeTo(source) {
    return async (message)=>{
        const buf = new TextEncoder().encode(message);
        await source.write(buf);
    };
}
export function writeln(buffer) {
    return (message = "")=>writeTo(buffer)(message + "\n")
    ;
}
export function stdin() {
    return readFrom(Deno.stdin)();
}
export const stdout = writeTo(Deno.stdout);
export const stderr = writeTo(Deno.stderr);
const noColor = globalThis.Deno?.noColor ?? true;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code1) {
    return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
}
function dim(str) {
    return run(str, code([
        2
    ], 22));
}
function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
function brightWhite(str) {
    return run(str, code([
        97
    ], 39));
}
function clampAndTruncate(n, max = 255, min = 0) {
    return Math.trunc(Math.max(Math.min(n, max), min));
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
export class Prompt {
    constructor({ defaultTo =null , formatters =[] , message: message1 , retry =false , sanitizers =[] , suggestions =[] , validators =[]  }){
        this.defaultTo = defaultTo;
        this.formatters = formatters;
        this.message = message1;
        this.retry = retry;
        this.sanitizers = sanitizers;
        this.suggestions = suggestions;
        this.validators = validators;
    }
    toString() {
        return `${this.message} ${this.hint}`;
    }
    get hint() {
        const { suggestions: suggestions1 = [] , defaultTo: defaultTo1  } = this;
        if (suggestions1.length > 0) {
            const brighten = (s)=>s === defaultTo1 ? brightWhite(s) : dim(s)
            ;
            const as = suggestions1.map(brighten);
            const list = as.length > 2 ? as.join(dim(", ")) : as.join(dim("/"));
            return dim("(") + list + dim(") ");
        }
        return "";
    }
    #invokeFormatters=(input)=>this.formatters.reduce((input1, f)=>f(input1, this)
        , input)
    ;
    #invokeSanitizers=(input)=>this.sanitizers.reduce((input1, f)=>f(input1, this)
        , input)
    ;
    #invokeValidators=(input)=>{
        if (this.defaultTo != null && input === "" || input === this.defaultTo) {
            return this.defaultTo;
        }
        if (this.validators.length === 0) {
            return input;
        }
        for (const f of this.validators){
            const match = f(input, this);
            if (match !== false) return match;
        }
        throw new TypeError(`"${input}" failed to validate`);
    };
    concat(prompt) {
        const [a, b] = [
            this,
            prompt
        ];
        return Prompt.of({
            message: b.message ?? a.message,
            defaultTo: b.defaultTo ?? a.defaultTo,
            retry: b.retry ?? a.retry,
            formatters: [
                ...a.formatters ?? [],
                ...b.formatters ?? [], 
            ],
            sanitizers: [
                ...a.sanitizers ?? [],
                ...b.sanitizers ?? [], 
            ],
            suggestions: [
                ...new Set([
                    ...a.suggestions ?? [],
                    ...b.suggestions ?? [], 
                ]), 
            ],
            validators: [
                ...a.validators ?? [],
                ...b.validators ?? [], 
            ]
        });
    }
    validate = (input)=>{
        const sanitized = this.#invokeSanitizers(input);
        const validated = this.#invokeValidators(sanitized);
        return this.#invokeFormatters(validated);
    };
    static from(message) {
        return new Prompt({
            message
        });
    }
    static of(prompt) {
        return new Prompt({
            ...prompt
        });
    }
}
const always = (a)=>(..._bs)=>a
;
function cloneObject(a, map) {
    if (map.has(a)) {
        return map.get(a);
    } else {
        const clone = {
        };
        map.set(a, clone);
        Object.entries(a).reduce((clone1, [key, value1])=>{
            return Object.assign(clone1, {
                [key]: cloneUnknown(value1, map)
            });
        }, clone);
        return clone;
    }
}
function cloneDate(a) {
    return new Date(a.valueOf());
}
function cloneArray(a, map) {
    if (map.has(a)) {
        return map.get(a);
    } else {
        const clone = [];
        map.set(a, clone);
        return a.reduce((clone1, v)=>{
            clone1.push(cloneUnknown(v, map));
            return clone1;
        }, clone);
    }
}
function cloneUnknown(a, map) {
    const t = isDefined(a) ? isDate(a) ? cloneDate(a) : isArray(a) ? cloneArray(a, map) : isObject(a) ? cloneObject(a, map) : a : a;
    return t;
}
const after = (next, f)=>{
    function call(c) {
        return next(f(c));
    }
    const p = Object.assign(call.bind(null), {
        from: (f1)=>{
            return after(p, f1);
        },
        call
    });
    return p;
};
const gather = (n, f, previous = [])=>{
    const curried = (...as)=>{
        const args = [
            ...previous,
            ...as
        ];
        const remaining = n - args.length;
        return remaining > 0 ? gather(n, f, args) : f(...args.slice(0, n));
    };
    Object.defineProperties(curried, {
        length: {
            value: n - previous.length
        },
        name: {
            value: `${f.name}${previous.length}`
        }
    });
    return curried;
};
const ifElse = (predicate, whenTrue, whenFalse)=>(x)=>predicate(x) ? whenTrue(x) : whenFalse(x)
;
const isArray = Array.isArray;
const isDate = (a)=>a instanceof Date
;
const isDefined = (a)=>a != null
;
const isObject = (a)=>typeof a === "object"
;
const next = (prev, f)=>{
    function invoke(a) {
        return f(prev(a));
    }
    const p = Object.assign(invoke.bind(null), {
        then: (f1)=>{
            return next(p, f1);
        },
        invoke
    });
    return p;
};
const applyArgument = (currentStep, a)=>currentStep(a)
;
const decode = (value1)=>new TextDecoder().decode(value1)
;
const getUnconsumedOutput = async (tp)=>{
    return tp.process.output().then(decode).then((output)=>{
        return output.length > 0 && Promise.reject(`Error: unconsumed output\n\n${output}\n\n`);
    });
};
const getUnconsumedError = async (tp)=>{
    return tp.process.stderrOutput().then(decode).then((output)=>{
        return output.length > 0 && Promise.reject(`Error: unconsumed Error output\n\n${output}\n\n`);
    });
};
const closeAll = (process)=>()=>{
        try {
            process.stderr?.close();
        } catch  {
        }
        try {
            process.stdin?.close();
        } catch  {
        }
        try {
            process.stdout?.close();
        } catch  {
        }
        try {
            process?.close();
        } catch  {
        }
    }
;
const getEnvThen = (envVar, map = (s)=>[
        s
    ]
)=>{
    const value1 = Deno.env.get(envVar);
    return value1 ? map(value1) : [];
};
export function configureTestProcess(scriptPath, ...args) {
    return async ({ pretest , posttest  } = {
    })=>{
        const useUnstable = getEnvThen("USE_UNSTABLE");
        const importMap = getEnvThen("IMPORT_MAP", (importMap1)=>[
                `--import-map`,
                importMap1
            ]
        );
        const lockOptions = getEnvThen("LOCK_FILE", (lockFile)=>[
                "--lock",
                lockFile,
                "--cached-only"
            ]
        );
        const testPermissions = getEnvThen("TEST_PERMISSIONS", (s)=>s.split(" ")
        );
        const cmd = [
            "deno",
            "run",
            ...useUnstable,
            ...testPermissions,
            ...importMap,
            ...lockOptions,
            scriptPath,
            ...args, 
        ];
        const process = Deno.run({
            cmd,
            stderr: "piped",
            stdin: "piped",
            stdout: "piped"
        });
        const end = ()=>tp.process.status().then(()=>Promise.all([
                    getUnconsumedOutput(tp),
                    getUnconsumedError(tp), 
                ]).then(always(tp)).then(posttest).then(noop).finally(closeAll(tp.process))
            )
        ;
        const tp = {
            process,
            write: writeln(process.stdin),
            read: readFrom(process.stdout),
            readError: readFrom(process.stderr),
            end
        };
        return pretest ? pretest(tp) : tp;
    };
}

