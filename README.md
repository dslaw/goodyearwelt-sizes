# goodyearwelt-sizes

[![Build Status](https://travis-ci.org/dslaw/goodyearwelt-sizes.svg?branch=master)](https://travis-ci.org/dslaw/goodyearwelt-sizes)
[![Website](https://img.shields.io/website-up-down-green-red/https/dslaw.github.io/goodyearwelt-sizes/sizes.html.svg)](https://dslaw.github.io/goodyearwelt-sizes/sizes.html)


A static site generator to build and display sizing information from
[r/goodyearwelt](https://reddit.com/r/goodyearwelt).

See the latest version of the site
[here](https://dslaw.github.io/goodyearwelt-sizes/sizes.html).


## Motivation

Determining shoe size can be difficult as the tagged size varies by
manufacturer, as well as by the last used. To combat this, the
[r/goodyearwelt](https://reddit.com/r/goodyearwelt) subreddit hosts a recurring
"Manufacturer Last Sizing" thread where users submit their Brannock size and the
tagged size of shoes they own, so that others have additional data points to use
when determining fit for a shoe from an unfamiliar manufacturer and/or last.

`goodyearwelt-sizes` simply extracts the sizing information supplied in the
"Manufacturer Last Sizing" threads and compiles it into a single dataset, which
can be browsed via a generated website.


## Development

To get started, create a new `node` 11+ environment, then use `yarn` to install
project dependencies:

```
$ yarn install
```

Linting and testing can be done via scripts:

```
$ yarn lint
$ yarn test
```

The site can be generated locally by running `build.ts` and manually copying
static assets to the build directory. The build directory, and all other
configuration, is specified in [`build.ts`](build.ts) by the `config` variable.
If the build directory is set to `build`, then:

```
$ yarn ts-node build.ts > build.log
$ cp -r static build/
```

Note that the script will write intermediate data files to the subdirectory
specified by `config.dataDir`.

Travis CI will automatically build and deploy the site when a new commit lands
on the `master` branch.
