# mithril-render

[![Build Status](https://travis-ci.org/tlaziuk/mithril-render.svg?branch=master)](https://travis-ci.org/tlaziuk/mithril-render)
[![dependencies Status](https://david-dm.org/tlaziuk/mithril-render/status.svg)](https://david-dm.org/tlaziuk/mithril-render)
[![devDependencies Status](https://david-dm.org/tlaziuk/mithril-render/dev-status.svg)](https://david-dm.org/tlaziuk/mithril-render?type=dev)
[![peerDependencies Status](https://david-dm.org/tlaziuk/mithril-render/peer-status.svg)](https://david-dm.org/tlaziuk/mithril-render?type=peer)

this is a `TypeScript` fork  of Stephan Hoyer's [mithril-node-render](https://github.com/StephanHoyer/mithril-node-render/)

## Installation

``` sh
npm install mithril-render
```

## Usage

``` typescript
import * as browserMock from "mithril/test-utils/browserMock";

import render from "mithril-render";

import * as m from "mithril";

// use a mock DOM so we can run mithril on the server
browserMock(global);

render(m('span', 'huhu')).then(function (html) {
    console.log(html);
});
```

## See also

* [mithril-node-render](https://github.com/StephanHoyer/mithril-node-render/)
* [mithril-express-middleware](https://github.com/tlaziuk/mithril-express-middleware/)
