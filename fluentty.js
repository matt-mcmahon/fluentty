// deno-fmt-ignore-file
// deno-lint-ignore-file
// @ts-nocheck
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
function stripColor2(string) {
    return string.replace(ANSI_PATTERN, "");
}
const stripColor1 = stripColor2;
export { stripColor1 as stripColor };
export class Prompt {
    constructor(options){
        const { accept =[] , defaultTo , format , message: message1 , retry , sanitize , validate ,  } = options;
        this.accept = accept;
        this.defaultTo = defaultTo;
        this.format = format;
        this.message = message1;
        this.retry = retry;
        this.sanitize = sanitize;
        this.validate = validate;
        Object.freeze(this);
    }
    static set(key) {
        return (value)=>(options1)=>({
                    ...options1,
                    [key]: value
                })
        ;
    }
    static from(message) {
        return new Prompt({
            message
        });
    }
    static check(prompt) {
        return (input)=>Promise.resolve(input).then(orDefault(prompt)).then(orSanitize(prompt)).then(orAccept(prompt)).then(orValidate(prompt)).then(orFormat(prompt))
        ;
    }
    static getHint(prompt) {
        const { accept: accept1 , defaultTo: defaultTo1  } = prompt;
        const set = new Set(accept1);
        if (defaultTo1) set.add(defaultTo1);
        const as = Array.from(set).map((s)=>s === defaultTo1 ? brightWhite(s) : dim(s)
        );
        const hint = as.length > 2 ? dim("(") + as.join(dim(", ")) + dim(") ") : as.length > 0 ? dim("(") + as.join(dim("/")) + dim(") ") : "";
        return hint;
    }
}
function orAccept({ accept: accept1 = [] , defaultTo: defaultTo1  }) {
    return async (input)=>accept1.length === 0 ? input : accept1.includes(input) || input === defaultTo1 ? input : Promise.reject(new TypeError(`input ${input} is not default, ${defaultTo1}, or in accept list [${accept1.map((s)=>`"${s}"`
        ).join(", ")}]`))
    ;
}
function orDefault(options1) {
    return async (input)=>input === "" && options1.defaultTo != null ? options1.defaultTo : input === "" && options1.defaultTo == null ? Promise.reject(new TypeError(`no input, no default value`)) : input
    ;
}
function orFormat(options1) {
    return async (input)=>typeof options1.format === "function" ? options1.format(input, options1) : input
    ;
}
function orSanitize(options1) {
    return async (input)=>typeof options1.sanitize === "function" ? options1.sanitize(input, options1) : input
    ;
}
function orValidate(options1) {
    return async (input)=>{
        if (typeof options1.validate === "function") {
            return options1.validate(input, options1) ? input : Promise.reject(new TypeError(`input ${input} failed to validate`));
        }
        return input;
    };
}

