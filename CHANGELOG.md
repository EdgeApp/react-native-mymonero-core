# react-native-mymonero-core

## v0.2.3 (2022-08-26)

- changed: Upgrade native code to @mymonero/mymonero-monero-client v2.1.19.

## v0.2.2 (2022-08-13)

- changed: Update for the v15 hardfork.

## v0.2.1 (2022-08-11)

- fixed: Correctly detect boost headers on M1 build machines.

## v0.2.0 (2022-08-11)

- changed: Switch the API to match @mymonero/mymonero-monero-client instead of the old mymonero-core-js.

## v0.1.3 (2022-07-14)

- fixed: Update incorrect comments in the `update-sources` script.
- fixed: Silence the iOS `requiresMainQueueSetup` warning.

## v0.1.2 (2022-03-03)

- added: Export a `monero_utils` object of type `MyMoneroCoreBridge`, which provides a higher-level API to these methods.

## v0.1.1 (2022-02-08)

- changed: Package iOS as an XCFramework instead of a static library. This allows the library to work natively on M1 Mac simulators.

## v0.1.0 (2020-11-20)

- Initial release
