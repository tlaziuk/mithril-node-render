# mithril-render

[![Build Status](https://travis-ci.org/tlaziuk/mithril-render.svg?branch=master)](https://travis-ci.org/tlaziuk/mithril-render)
[![Coverage Status](https://coveralls.io/repos/github/tlaziuk/mithril-render/badge.svg?branch=master)](https://coveralls.io/github/tlaziuk/mithril-render?branch=master)
[![dependencies Status](https://david-dm.org/tlaziuk/mithril-render/status.svg)](https://david-dm.org/tlaziuk/mithril-render)
[![devDependencies Status](https://david-dm.org/tlaziuk/mithril-render/dev-status.svg)](https://david-dm.org/tlaziuk/mithril-render?type=dev)
[![peerDependencies Status](https://david-dm.org/tlaziuk/mithril-render/peer-status.svg)](https://david-dm.org/tlaziuk/mithril-render?type=peer)
[![npm version](https://badge.fury.io/js/mithril-render.svg)](https://badge.fury.io/js/mithril-render)
[![downloads](https://img.shields.io/npm/dm/mithril-render.svg)](https://www.npmjs.com/package/mithril-render)

this is a `TypeScript` fork  of Stephan Hoyer's [mithril-node-render](https://github.com/StephanHoyer/mithril-node-render/)

## Installation

``` sh
npm install mithril-render
```

## Usage

``` typescript
import * as browserMock from "mithril/test-utils/browserMock";

// use a mock DOM so we can run mithril on the server
browserMock(global);

import render from "mithril-render";

import * as m from "mithril";

render(m('span', 'huhu')).then((html) => {
    console.log(html);
});
```

## See also

* [mithril-node-render](https://github.com/StephanHoyer/mithril-node-render/)
* [mithril-express-middleware](https://github.com/tlaziuk/mithril-express-middleware/)
