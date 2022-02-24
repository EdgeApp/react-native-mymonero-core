# react-native-mymonero-core

This library packages the [mymonero-core-cpp](https://github.com/mymonero/mymonero-core-cpp) library for use on React Native.

## Usage

This library exposes a similar `MyMoneroCoreBridge` object to the [mymonero-core-js](https://github.com/mymonero/mymonero-core-js) library it is based on, but with all methods changed to be `async`:

```js
const { monero_utils } = require('react-native-mymonero-core')

const addressInfo = await monero_utils.decode_address('...', MAINNET)
```

In addition, this library exposes a `callMyMonero` function, which directly calls the low-level C++ module:

```js
const { callMyMonero } = require('react-native-mymonero-core')

const args = {
  address: '...',
  nettype_string: 'MAINNET'
}
const jsonResult = await callMyMonero('decode_address', JSON.stringify(args))
const result = JSON.parse(jsonResult)
```

This `callMyMonero` function is deprecated, however.

## Developing

This library relies on a large amount of native C++ code from other repos. To integrate this code, you must run the following script before publishing this library to NPM:

```sh
npm run update-sources
```

This script does the following tasks:

- Download third-party source code.
- Set up the Android build system:
  - Determine which C++ headers are actually necessary.
  - Copy the necessary sources into `android/src/main/cpp`.
  - Assemble `CMakeLists.txt`.
- Compile an iOS universal static library.
- Generate Flow types from the TypeScript definitions.

The `update-sources` script is also the place to make edits when upgrading any of the third-party dependencies. The react-native-mymonero-core repo doesn't include these third-party C++ sources, since they are enormous.
