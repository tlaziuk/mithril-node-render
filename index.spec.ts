// tslint:disable:no-reference max-line-length max-classes-per-file
///<reference path="./types/mithril.d.ts" />

import {
    expect,
} from "chai";

import {
    SinonSpy,
    spy,
} from "sinon";

import {
    Attributes,
    ClassComponent,
    Component,
    CVnode,
    FactoryComponent,
    Lifecycle,
    Vnode,
} from "mithril";

import * as m from "mithril/render/hyperscript";
import * as mTrust from "mithril/render/trust";

import render, {
    Escape as EscapeEnum,
    escapeHtml,
    isClassComponent,
    isComponent,
    isComponentType,
    isFactoryComponent,
} from "./index";

describe(render.name, () => {
    describe(`node`, () => {
        it(`should render tag`, async () => {
            expect(await render(m(`span`, `content`))).to.be.equal(`<span>content</span>`);
        });
        it(`should render classname`, async () => {
            expect(await render(m(`.foo`, `content`))).to.be.equal(`<div class="foo">content</div>`);
        });
        it(`should render id`, async () => {
            expect(await render(m(`#bar`, `content`))).to.be.equal(`<div id="bar">content</div>`);
        });
        it(`should render short nodes when no children`, async () => {
            expect(await render(m(`br`))).to.be.equal(`<br>`);
        });
        it(`should render short nodes when no children and tag name is uppercase`, async () => {
            expect(await render(m(`HR`))).to.be.equal(`<HR>`);
        });
        it(`should render short node doctype`, async () => {
            expect(await render(m(`!doctype`))).to.be.equal(`<!doctype>`);
        });
        it(`should render short node doctype HTML5`, async () => {
            expect(await render(m(`!doctype`, { html: true }))).to.be.equal(`<!doctype html>`);
        });
        it(`should render attributes`, async () => {
            expect(await render(m(`span`, { "data-foo": `bar`, "selected": `selected` }))).to.be.equal(`<span data-foo="bar" selected="selected"></span>`);
        });
        it(`should render string`, async () => {
            expect(await render(m(`ul`, `huhu`))).to.be.equal(`<ul>huhu</ul>`);
        });
        it(`should render arrays`, async () => {
            expect(await render([m(`span`, `foo`), m(`div`, `bar`)])).to.be.equal(`<span>foo</span><div>bar</div>`);
        });
        it(`should render nested arrays`, async () => {
            expect(await render(m(`div`, [[m(`span`, `foo`), m(`div`, `bar`)]]))).to.be.equal(`<div><span>foo</span><div>bar</div></div>`);
        });
        it(`should render children`, async () => {
            expect(await render(m(`span`, m(`div`)))).to.be.equal(`<span><div></div></span>`);
        });
        it(`should not render events`, async () => {
            expect(await render(m(`span`, { onmousemove: () => undefined }))).to.be.equal(`<span></span>`);
        });
        it(`should render children`, async () => {
            expect(await render(m(`span`, { style: { paddingLeft: `10px`, color: `red` } }))).to.be.equal(`<span style="padding-left:10px;color:red"></span>`);
        });
        it(`should render numbers as text nodes`, async () => {
            expect(await render(m(`div`, [1, m(`span`), `2`]))).to.be.equal(`<div>1<span></span>2</div>`);
            expect(await render(m(`div`, 1))).to.be.equal(`<div>1</div>`);
        });
        it(`should render booleans as text nodes`, async () => {
            expect(await render(m(`div`, false))).to.be.equal(`<div></div>`);
        });
        it(`should render boolean attributes`, async () => {
            expect(await render(m(`div`, { a: true }))).to.be.equal(`<div a></div>`);
            expect(await render(m(`div`, { a: false }))).to.be.equal(`<div></div>`);
        });
        it(`should not render empty attributes`, async () => {
            expect(await render(m(`div`, { a: undefined }))).to.be.equal(`<div></div>`);
            expect(await render(m(`div`, { style: null }))).to.be.equal(`<div></div>`);
            expect(await render(m(`div`, { style: `` }))).to.be.equal(`<div></div>`);
            expect(await render(m(`div`, { style: { color: `` } }))).to.be.equal(`<div></div>`);
            expect(await render(m(`div`, { style: { height: `20px`, color: `` } }))).to.be.equal(`<div style="height:20px"></div>`);
            expect(await render(m(`div`, { style: { height: `20px`, color: ``, width: `10px` } }))).to.be.equal(`<div style="height:20px;width:10px"></div>`);
        });
        it(`should render custom attributes`, async () => {
            expect(await render(m(`div`, { a: `foo` }))).to.be.equal(`<div a="foo"></div>`);
        });

        it(`should escape HTML`, async () => {
            expect(await render(m(`div`, mTrust(`<foo></foo>`)))).to.be.equal(`<div><foo></foo></div>`, `trusted html escaped`);
            expect(await render(m(`div`, `<foo></foo>`))).to.be.equal(`<div>&lt;foo&gt;&lt;/foo&gt;</div>`, `non-trusted html not escaped`);
            expect(await render(m(`div`, { style: `"></div><div a="` }))).to.be.equal(`<div style="&quot;&gt;&lt;/div&gt;&lt;div a=&quot;"></div>`, `attribute value not escaped`);
            expect(await render(m(`pre`, `var = ${JSON.stringify({ foo: 1 })}`))).to.be.equal(`<pre>var = {"foo":1}</pre>`, `non-html text escaped`);
        });
        it(`should render svg use elements with href attributes`, async () => {
            expect(await render(m(`svg`, m(`use`, { href: `fooga.com` })))).to.be.equal(`<svg><use xlink:href="fooga.com"></use></svg>`);
        });
        it(`should render closed input-tag`, async () => {
            expect(await render(m(`input`), { strict: true })).to.be.equal(`<input/>`);
        });
        it(`should render closed div-tag`, async () => {
            expect(await render(m(`div`), { strict: true })).to.be.equal(`<div/>`);
        });
    });

    describe(`lifecycle`, () => {
        it(`node`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            await render(m(
                `div`,
                {
                    oninit: oninitSpy,
                    onremove: onremoveSpy,
                } as Attributes,
                [
                    `test`,
                ],
            ));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
        });
        it(`text`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            await render(m(
                `#`,
                {
                    oninit: oninitSpy,
                    onremove: onremoveSpy,
                } as Attributes,
                [
                    `test`,
                ],
            ));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
        });
        it(`fragment`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            await render(m(
                `[`,
                {
                    oninit: oninitSpy,
                    onremove: onremoveSpy,
                } as Attributes,
                [
                    `test`,
                ],
            ));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
        });
        it(`trusted html`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            await render(m(
                `<`,
                {
                    oninit: oninitSpy,
                    onremove: onremoveSpy,
                } as Attributes,
                [
                    `<div>test</div>`,
                ],
            ));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
        });
        it(`Component`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            const viewSpy = spy(({ children }: Vnode<Attributes, any>) => children);
            await render(m(
                {
                    oninit: oninitSpy,
                    onremove: onremoveSpy,
                    view: viewSpy,
                } as Component<any, any>,
                [
                    `test`,
                ],
            ));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
            expect(viewSpy.calledOnce).to.be.equal(true, `view was not called`);
        });

        it(`FactoryComponent`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            const viewSpy = spy();
            // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
            await render(m(function() {
                return {
                    oninit: oninitSpy,
                    onremove: onremoveSpy,
                    view: viewSpy,
                };
            } as FactoryComponent<Attributes>));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
            expect(viewSpy.calledOnce).to.be.equal(true, `view was not called`);
        });

        it(`ClassComponent`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            const viewSpy = spy();
            class Cmp implements ClassComponent<Attributes> {
                public oninit = oninitSpy;
                public onremove = onremoveSpy;
                // important note - view method can not be assigned in constructor,
                // view method is used to detect if function is a class,
                // which means it's forbidden to do following thing:
                // public view = viewSpy;
                public view() {
                    viewSpy();
                };
            }
            await render(m(Cmp));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
            expect(viewSpy.calledOnce).to.be.equal(true, `view was not called`);
        });

        it(`should have proper call order`, async () => {
            const oninitRootSpy = spy();
            const onremoveRootSpy = spy();
            const oninitFragmentSpy = spy();
            const onremoveFragmentSpy = spy();
            const oninitCmp1Spy = spy();
            const onremoveCmp1Spy = spy();
            const oninitCmp2Spy = spy();
            const onremoveCmp2Spy = spy();
            const cmpRoot = {
                oninit: oninitRootSpy,
                onremove: onremoveRootSpy,
                view: () => [
                    `root`,
                    m(
                        `[`,
                        {
                            oninit: oninitFragmentSpy,
                            onremove: onremoveFragmentSpy,
                        },
                        [
                            m(
                                `#`,
                                {
                                    oninit: oninitCmp1Spy,
                                    onremove: onremoveCmp1Spy,
                                },
                                `fragment`,
                            ),
                        ],
                    ),
                    m(
                        `#`,
                        {
                            oninit: oninitCmp2Spy,
                            onremove: onremoveCmp2Spy,
                        },
                        `cmp`,
                    ),
                ],
            } as Component<Attributes, any>;
            expect(await render(m(cmpRoot))).to.be.equal(`root<div><div>fragment</div></div><div>cmp</div>`);

            expect(oninitRootSpy.calledOnce).to.be.equal(true, `oninit root not called`);
            expect(onremoveRootSpy.calledOnce).to.be.equal(true, `onremove root not called`);
            expect(oninitFragmentSpy.calledOnce).to.be.equal(true, `oninit fragment not called once`);
            expect(onremoveFragmentSpy.calledOnce).to.be.equal(true, `onremove fragment not called once`);
            expect(oninitCmp1Spy.calledOnce).to.be.equal(true, `oninit cmp1 not called once`);
            expect(onremoveCmp1Spy.calledOnce).to.be.equal(true, `onremove cmp1 not called once`);
            expect(oninitCmp2Spy.calledOnce).to.be.equal(true, `oninit cmp2 not called once`);
            expect(onremoveCmp2Spy.calledOnce).to.be.equal(true, `onremove cmp2 not called once`);

            expect(oninitFragmentSpy.calledBefore(oninitCmp2Spy)).to.be.equal(true, `oninit fragment not called before oninit cmp2`);
            expect(oninitRootSpy.calledBefore(oninitFragmentSpy)).to.be.equal(true, `oninit root not called before oninit fragment`);
            expect(onremoveCmp1Spy.calledAfter(oninitCmp1Spy)).to.be.equal(true, `onremove not called after oninit`);
            expect(onremoveCmp2Spy.calledAfter(oninitCmp2Spy)).to.be.equal(true, `onremove not called after oninit`);
            expect(onremoveFragmentSpy.calledAfter(oninitFragmentSpy)).to.be.equal(true, `onremove not called after oninit`);
            expect(onremoveFragmentSpy.calledAfter(onremoveCmp2Spy)).to.be.equal(true, `onremove fragment not called after onremove cmp2`);
            expect(onremoveRootSpy.calledAfter(oninitRootSpy)).to.be.equal(true, `onremove not called after oninit`);
            expect(onremoveRootSpy.calledAfter(onremoveFragmentSpy)).to.be.equal(true, `onremove root not called after onremove fragment`);
        });
    });

    describe(`attributes and state`, () => {
        it(`Component`, async () => {
            interface IState {
                text?: string;
            }
            const component = {
                view: ({ attrs, state }) => {
                    return attrs.text || state.text || `test`;
                },
            } as Component<Attributes, IState> & IState;
            expect(await render(m(component))).to.be.equal(`test`);
            expect(await render(m(component, { text: `attr` }))).to.be.equal(`attr`);
            component.text = `state`;
            expect(await render(m(component))).to.be.equal(`state`);
            expect(await render(m(component, { text: `attr` }))).to.be.equal(`attr`);
        });
        it(`ClassComponent`, async () => {
            class Cmp implements ClassComponent<Attributes> {
                public text?: string;
                public view({ attrs, state }: CVnode<Attributes>) {
                    return attrs.text || this.text || `test`;
                }
            }
            expect(await render(m(Cmp))).to.be.equal(`test`);
            expect(await render(m(Cmp, { text: `attr` }))).to.be.equal(`attr`);
            Cmp.prototype.text = `state`;
            expect(await render(m(Cmp))).to.be.equal(`state`);
            expect(await render(m(Cmp, { text: `attr` }))).to.be.equal(`attr`);
        });
        it(`FactoryComponent`, async () => {
            // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
            const component = function() {
                return {
                    view: ({ attrs }) => {
                        return attrs.text || `test`;
                    },
                };
            } as FactoryComponent<Attributes>;
            expect(await render(m(component))).to.be.equal(`test`);
            expect(await render(m(component, { text: `attr` }))).to.be.equal(`attr`);
        });
    });

    describe(`'this' in text`, () => {
        it(`should 'state' be equal 'this'`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            await render(m(`div`, {
                // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                oninit: function({ state }) {
                    oninitSpy();
                    expect(this).to.be.equal(state);
                },
                // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                onremove: function({ state }) {
                    onremoveSpy();
                    expect(this).to.be.equal(state);
                },
            } as Attributes));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
        });
    });

    describe(`'this' in Component`, () => {
        it(`should 'state' be equal 'this'`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            const viewSpy = spy();
            await render(m({
                // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                oninit: function({ state }) {
                    oninitSpy();
                    expect(this).to.be.equal(state);
                },
                // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                onremove: function({ state }) {
                    onremoveSpy();
                    expect(this).to.be.equal(state);
                },
                // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                view: function({ state }) {
                    viewSpy();
                    expect(this).to.be.equal(state);
                    return ``;
                },
            } as Component<any, any>));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
            expect(viewSpy.calledOnce).to.be.equal(true, `view was not called`);
        });
    });

    describe(`'this' in FactoryComponent`, () => {
        it(`should 'state' be equal 'this'`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            const viewSpy = spy();
            // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
            await render(m(function() {
                return {
                    // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                    oninit: function({ state }) {
                        oninitSpy();
                        expect(this).to.be.equal(state);
                    },
                    // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                    onremove: function({ state }) {
                        onremoveSpy();
                        expect(this).to.be.equal(state);
                    },
                    // tslint:disable-next-line:only-arrow-functions object-literal-shorthand
                    view: function({ state }) {
                        viewSpy();
                        expect(this).to.be.equal(state);
                        return ``;
                    },
                };
            } as FactoryComponent<Attributes>));
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
            expect(viewSpy.calledOnce).to.be.equal(true, `view was not called`);
        });
    });

    describe(`'this' in ClassComponent`, () => {
        it(`should 'state' be equal 'this'`, async () => {
            const oninitSpy = spy();
            const onremoveSpy = spy();
            const viewSpy = spy();
            class Cmp implements ClassComponent<Attributes> {
                public oninit({ state }: CVnode<Attributes>) {
                    oninitSpy();
                    expect(this).to.be.equal(state);
                }
                public onremove({ state }: CVnode<Attributes>) {
                    onremoveSpy();
                    expect(this).to.be.equal(state);
                }
                public view({ state }: CVnode<Attributes>) {
                    viewSpy();
                    expect(this).to.be.equal(state);
                    return ``;
                }
            }
            expect(await render(m(Cmp))).to.be.equal(``);
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(onremoveSpy.calledOnce).to.be.equal(true, `onremove was not called`);
            expect(viewSpy.calledOnce).to.be.equal(true, `view was not called`);
        });
    });

    describe(`async`, () => {
        it(`oninit`, async () => {
            interface IState {
                timeout: number;
            }
            const oninitSpy = spy();
            const timeoutSpy = spy();
            const component = {
                oninit: ({ state }: Vnode<Attributes, IState>) => new Promise<any>((resolve, reject) => {
                    oninitSpy();
                    setTimeout(() => {
                        timeoutSpy();
                        state.timeout = 50;
                        resolve();
                    }, 50);
                }),
                timeout: NaN,
                view: ({ state }) => state.timeout,
            } as Component<Attributes, IState> & IState;
            expect(await render(m(component))).to.be.equal(`50`);
            expect(oninitSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(timeoutSpy.calledOnce).to.be.equal(true, `oninit was not called`);
            expect(timeoutSpy.calledAfter(oninitSpy)).to.be.equal(true, `something really weird happend`);
        });
    });

    describe(`root component`, () => {
        const cmp = {
            view: () => m(`#`, `test`),
        } as Component<Attributes, any>;
        // tslint:disable-next-line:only-arrow-functions
        const cmpFactory = function() {
            return cmp;
        } as FactoryComponent<Attributes>;
        // tslint:disable-next-line:class-name
        class cmpClass implements ClassComponent<Attributes> {
            public view() {
                return m(`#`, `test`);
            }
        }
        it(`should not fail`, async () => {
            expect(await render(cmp)).to.be.a(`string`);
            expect(await render(cmp)).to.be.equal(`<div>test</div>`);
            expect(await render(cmpFactory)).to.be.a(`string`);
            expect(await render(cmpFactory)).to.be.equal(`<div>test</div>`);
            expect(await render(cmpClass)).to.be.a(`string`);
            expect(await render(cmpClass)).to.be.equal(`<div>test</div>`);
        });
    });
});

describe(escapeHtml.name, () => {
    it(`should return string`, () => {
        expect(escapeHtml(`abc`)).to.be.a(`string`);
    });
    it(`should escape single char`, () => {
        const str = `<strong attr='T#$T'>testing \`html\` string with many "quotes" #tags, ?weird? !@#chars`;
        expect(escapeHtml(str, undefined, { "\"": "" })).to.be.equal(str.replace(/\"/g, ""), `empty string`);
        expect(escapeHtml(str, undefined, { "'": "" })).to.be.equal(str.replace(/\'/g, ""), `empty string`);
        expect(escapeHtml(str, undefined, { "'": "&#39;" })).to.be.equal(str.replace(/\'/g, "&#39;"), `string`);
        expect(escapeHtml(str, undefined, { "/": "&#47;" })).to.be.equal(str.replace(/\//g, "&#47;"), `string`);
        expect(escapeHtml(str, undefined, { "'": undefined })).to.be.equal(str.replace(/\'/g, "&#39;"), `automatic`);
        expect(escapeHtml(str, undefined, { "/": undefined })).to.be.equal(str.replace(/\//g, "&#47;"), `automatic`);
    });
    it(`should not escape when empty map`, () => {
        const str = `<div>abc</div><pre style="display:none;">var x = JSON.encode("test");</pre>`;
        expect(escapeHtml(str, undefined, {})).to.be.equal(str, `something got changed`);
    });
    it(`should escape flags works`, () => {
        const str = `"'`;
        expect(escapeHtml(str)).to.be.equal(`&quot;&#39;`, `default flags are not escaping quotes`);
        expect(escapeHtml(str, EscapeEnum.NoQuotes)).to.be.equal(str, `quotes are escaped`);
        expect(escapeHtml(str, EscapeEnum.Quotes)).to.be.equal(`&quot;&#39;`, `quotes are not escaped`);
        expect(escapeHtml(str, EscapeEnum.QuotesDouble)).to.be.equal(`&quot;'`, `double quotes are not escaped`);
        expect(escapeHtml(str, EscapeEnum.QuotesSingle)).to.be.equal(`"&#39;`, `single quotes are not escaped`);
    });
});

describe(isComponentType.name, () => {
    const cmp = {
        view: () => undefined,
    } as Component<Attributes, any>;
    // tslint:disable-next-line:only-arrow-functions
    const cmpFactory = function() {
        return cmp;
    } as FactoryComponent<Attributes>;
    // tslint:disable-next-line:class-name
    class cmpClass implements ClassComponent<Attributes> {
        public view() {
            return undefined;
        }
    }
    it(`should return boolean`, () => {
        expect(isComponentType(undefined)).to.be.a(`boolean`);
        expect(isComponentType(true)).to.be.a(`boolean`);
        expect(isComponentType(false)).to.be.a(`boolean`);
        expect(isComponentType(null)).to.be.a(`boolean`);
        expect(isComponentType(NaN)).to.be.a(`boolean`);
        expect(isComponentType(0)).to.be.a(`boolean`);
        expect(isComponentType(Number.POSITIVE_INFINITY)).to.be.a(`boolean`);
        expect(isComponentType(Number.NEGATIVE_INFINITY)).to.be.a(`boolean`);
        expect(isComponentType(isComponentType.toString())).to.be.a(`boolean`);
        expect(isComponentType(``)).to.be.a(`boolean`);
        expect(isComponentType({})).to.be.a(`boolean`);
        expect(isComponentType(() => undefined)).to.be.a(`boolean`);
        expect(isComponentType(Symbol())).to.be.a(`boolean`);
        expect(isComponentType([])).to.be.a(`boolean`);
    });
    it(`should work with any input`, () => {
        expect(isComponentType(undefined)).to.be.equal(false);
        expect(isComponentType(true)).to.be.equal(false);
        expect(isComponentType(false)).to.be.equal(false);
        expect(isComponentType(null)).to.be.equal(false);
        expect(isComponentType(NaN)).to.be.equal(false);
        expect(isComponentType(0)).to.be.equal(false);
        expect(isComponentType(Number.POSITIVE_INFINITY)).to.be.equal(false);
        expect(isComponentType(Number.NEGATIVE_INFINITY)).to.be.equal(false);
        expect(isComponentType(isComponentType.toString())).to.be.equal(false);
        expect(isComponentType(``)).to.be.equal(false);
        expect(isComponentType({})).to.be.equal(false);
        // any function without view function in prototype may be a component?
        expect(isComponentType(() => undefined)).to.be.equal(true);
        expect(isComponentType(Symbol())).to.be.equal(false);
        expect(isComponentType([])).to.be.equal(false);
        expect(isComponentType(cmp)).to.be.equal(true);
        expect(isComponentType(cmpFactory)).to.be.equal(true);
        expect(isComponentType(cmpClass)).to.be.equal(true);
    });
    it(isComponent.name, () => {
        expect(isComponent(cmp)).to.be.equal(true);
        expect(isComponent(cmpFactory)).to.be.equal(false);
        expect(isComponent(cmpClass)).to.be.equal(false);
    });
    it(isClassComponent.name, () => {
        expect(isClassComponent(cmp)).to.be.equal(false);
        expect(isClassComponent(cmpFactory)).to.be.equal(false);
        expect(isClassComponent(cmpClass)).to.be.equal(true);
    });
    it(isFactoryComponent.name, () => {
        expect(isFactoryComponent(cmp)).to.be.equal(false);
        expect(isFactoryComponent(cmpFactory)).to.be.equal(true);
        expect(isFactoryComponent(cmpClass)).to.be.equal(false);
    });
});
