# dropbox.js and CoffeeScript FAQ

dropbox.js is written in [CoffeeScript](http://coffeescript.org/), which
compiles into very readable JavaScript. This document addresses the concerns
that are commonly raised by JavaScript developers that do not use or wish to
learn CoffeeScript.


## Do I need to learn CoffeeScript to use the library?

**No.**

The examples in the [getting started guide](./getting_started.md) are all
written in JavaScript. The
[dropbox.js API reference](http://coffeedoc.info/github/dropbox/dropbox-js/master/class_index.html)
covers the entire library, so you should not need to read the library source
code to understand how to use it.

_Please open an issue if the documentation is unclear!_

The [sample apps](../samples/), are written in CoffeeScript. Please use the
`Try CoffeeScript` button on the [CoffeeScript](http://coffeescript.org/) home
page to quickly compile the sample CoffeeScript into very readable JavaScript.


## How do I serve dropbox.js to browsers?

The easiest method is to use the `<script>` tag in the
[getting started guide](./getting_started.md), which loads dropbox.js from a
CDN.

If you wish to server dropbox.js from your own server, the easiest solution is
to download the
[cdnjs copy of dropbox.js](http://cdnjs.com/libraries/dropbox.js/).

If you want to keep up with new dropbox.js releases, a reasonably convenient
method is to install the `dropbox` package via [npm](https://npmjs.org/), and
serve `node_modules/dropbox/lib/dropbox.js.min`. Updating the npm package will
keep you up to date.


## Do I need to learn CoffeeScript to know how dropbox.js works?

**No.**

You can follow the [development guide](./development.md) to build the
un-minified JavaScript library in `lib/dropbox.js` and then use your editor's
find feature to get to the source code for the methods that you are interested
in.

The building instructions in the development guide do not require familiarity
with CoffeeScript.


## Do I need to learn CoffeeScript to modify dropbox.js?

**Yes, but you might not need to modify the library.**

You do need to learn CoffeeScript to change the `dropbox.js` source code. At
the same time, you can take advantage of the library hooks and the dynamic
nature of the JavaScript language to change the behavior of `dropbox.js`
without touching the source code.

* You can implement your OAuth strategy.
* You can add methods to the prototype classes such as `Dropbox.Client` to
implement custom operations. _Please open an issue if you think your addition
is generally useful!_
* You can replace internal classes such as `Dropbox.Util.Xhr` (or selectively
replace methods) with wrappers that tweak the original behavior


## Can I contribute to dropbox.js without learning CoffeeScript?

**Yes.**

Most of the development time is spent on API design, developing tests,
documentation and sample code. Contributing a good testing strategy with a bug
report can save us 90% of the development time. A feature request that also
includes a well thought-out API change proposal and testing strategy can also
save us 90-95% of the implementation time.

At the same time, _please open issues for bugs and feature requests even if you
don't have time to include any of the above_. Knowing of a problem is the first
step towards fixing it.

Last, please share your constructive suggestions on how to make `dropbox.js`
easier to use for JavaScript developers that don't speak CoffeeScript.


## Can I complain to get dropbox.js to switch away from CoffeeScript?

**No.**
