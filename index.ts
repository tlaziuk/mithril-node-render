import {
    Attributes,
    Children,
    ClassComponent,
    Component,
    ComponentTypes,
    CVnode,
    FactoryComponent,
    Lifecycle,
    Vnode,
} from "mithril";

export interface IOptions {
    strict: boolean;
    hooks: Array<() => any>;
    attrs: Attributes;
}

const VOID_TAGS = [
    "!doctype",
    "area",
    "base",
    "br",
    "col",
    "command",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
];

export function isComponent(
    component: any,
): component is Component<Attributes, Lifecycle<Attributes, {}>> {
    return typeof component === "object" && component !== null && typeof component.view === "function";
}

export function isClassComponent(
    component: any,
): component is { new(vnode: CVnode<Attributes>): ClassComponent<Attributes> } {
    return typeof component === "function" && isComponent(component.prototype);
}

export function isFactoryComponent(
    component: any,
): component is FactoryComponent<Attributes> {
    return typeof component === "function" && !isComponent(component.prototype);
}

export function isComponentType(
    component: any,
): component is ComponentTypes<Attributes, Lifecycle<Attributes, {}>> {
    return isComponent(component) || isClassComponent(component) || isFactoryComponent(component);
}

// tslint:disable:no-bitwise
export enum Escape {
    NoQuotes = 0,
    QuotesSingle = 1,
    QuotesDouble = QuotesSingle << 1,
    Quotes = QuotesSingle | QuotesDouble,
}

const escapeHtml = (
    str: string,
    flag: Escape = Escape.Quotes,
    map: { [_: string]: string | void | false } = {
        "\"": flag & Escape.QuotesDouble ? `&quot;` : false,
        "\&": `&amp;`,
        "\'": flag & Escape.QuotesSingle ? `&#39;` : false,
        "\<": `&lt;`,
        "\>": `&gt;`,
    },
): string => str.replace(
    new RegExp(
        `[${Object.keys(map).map(
            // use only 1-char keys and escape them
            (key) => key.length === 1 && map[key] !== false ? `\\${key}` : undefined,
        ).join("")}]`,
        `gi`,
    ),
    (key) => typeof map[key] === "string" ? map[key] as string : `&#${key.charCodeAt(0)};`,
);
// tslint:enable:no-bitwise

const getLifecycle = (
    {
        attrs = {},
        state = {},
    }: Vnode<Attributes, Lifecycle<Attributes, {}>>,
): Lifecycle<Attributes, {}> => {
    return {
        onbeforeremove: attrs.onbeforeremove || state.onbeforeremove,
        onbeforeupdate: attrs.onbeforeupdate || state.onbeforeupdate,
        oncreate: attrs.oncreate || state.oncreate,
        oninit: attrs.oninit || state.oninit,
        onremove: attrs.onremove || state.onremove,
        onupdate: attrs.onupdate || state.onupdate,
    };
};

const camelToDash = (str: string) => str.replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1-$2");

const removeEmpties = (n: any) => n !== "" && typeof n !== "undefined" && n !== null;

function createAttrString(view: Vnode<Attributes, Lifecycle<Attributes, {}>>) {
    const attrs = view.attrs;

    if (!attrs || !Object.keys(attrs).length) {
        return "";
    }

    return Object.keys(attrs).map((name) => {
        const value = attrs[name];
        if (typeof value === "undefined" || value === null || typeof value === "function") {
            return undefined;
        }
        if (typeof value === "boolean") {
            return value ? `${name}` : undefined;
        }
        if (name === "style") {
            if (!value) {
                return undefined;
            }
            let styles = attrs.style;
            if (typeof styles === "object") {
                styles = Object.keys(styles).map((property) => styles[property] !== "" ?
                    [camelToDash(property).toLowerCase(), styles[property]].join(":") :
                    "",
                ).filter(removeEmpties).join(";");
            }
            return styles !== "" ? `style="${escapeHtml(styles)}"` : undefined;
        }

        // Handle SVG <use> tags specially
        if (name === "href" && view.tag === "use") {
            return `xlink:href="${escapeHtml(value)}"`;
        }

        return `${(name === "className" ? "class" : name)}="${escapeHtml(value)}"`;
    }).join(" ").trim();
}

const parseHooks = async (
    vnode: Vnode<Attributes, Lifecycle<Attributes, {}>>,
    hooks: Array<() => any>,
): Promise<void> => {
    const {
        oninit,
        onremove,
    } = getLifecycle(vnode);

    if (typeof oninit === "function") {
        await oninit.call(vnode.state, vnode);
    }

    if (typeof onremove === "function") {
        hooks.push(async () => await onremove.call(vnode.state, vnode));
    }
};

export async function render(
    view: Children | ComponentTypes<any, any>,
    {
        attrs = {},
        hooks = [],
        strict = false,
    }: Partial<IOptions> = {},
): Promise<string> {
    const callSelf = (v: Children, opts: Partial<IOptions> = {}) => render(v, {
        // attributes used by the root component
        attrs,
        strict,
        ...opts,
    });

    if (Array.isArray(view)) {
        return (await Promise.all(view.map((child) => callSelf(child)))).join("");
    }

    if (typeof view === "string" || typeof view === "number" || typeof view === "boolean") {
        return escapeHtml(`${view}`, Escape.NoQuotes);
    }

    if (!view) {
        return "";
    }

    if (isComponentType(view)) {
        view = {
            attrs,
            state: {},
            tag: view,
        } as Vnode<any, any>;
    }

    // view must be a Vnode

    let result: string = "";

    if (typeof view.tag === "string") {
        await parseHooks(view, hooks);
        if (view.tag === "[") {
            // fragment
            result = await callSelf(view.children);
        } else if (view.tag === "<") {
            // trusted html
            result = `${Array.isArray(view.children) ? view.children.join("") : view.children}`;
        } else if (view.tag === "#") {
            // text
            result = escapeHtml(
                `${view.text ? view.text : Array.isArray(view.children) ? view.children.join("") : view.children}`,
            );
        } else {
            // tag
            const childs = await callSelf(view.text ? view.text : view.children);
            const attributes = createAttrString(view);
            if (!childs.length && (VOID_TAGS.indexOf(view.tag.toLowerCase()) >= 0 || strict)) {
                result = `<${view.tag}${attributes.length > 0 ? ` ${attributes}` : ""}${strict ? "/" : ""}>`;
            } else {
                result = [
                    `<${view.tag}${attributes.length > 0 ? ` ${attributes}` : ""}>`,
                    childs,
                    `</${view.tag}>`,
                ].join("");
            }
        }
    } else if (isComponentType(view.tag)) {
        const tag = view.tag as ComponentTypes<any, any>;
        if (isComponent(tag)) {
            view.state = tag;
        } else if (isClassComponent(tag)) {
            view.state = new tag(view);
            Object.assign(view.state, tag.prototype, view.state);
        } else if (isFactoryComponent(tag)) {
            view.state = tag(view);
        } else {
            throw new Error(`unknown component type: '${tag}'`);
        }
        await parseHooks(view, hooks);
        if (isComponent(view.state)) {
            // just to be sure...
            result = await callSelf(view.state.view.call(view.state, view));
        }
    } else {
        throw new Error(`unknown component: '${view}'`);
    }

    // tslint:disable-next-line:prefer-const
    for (let hook of hooks) {
        await hook();
    }

    return result;
}

export default render;
