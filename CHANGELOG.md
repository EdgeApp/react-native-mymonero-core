# react-native-mymonero-core

## v0.3.0 (2023-04-28)

- changed: Do not allow multiple parallel calls to createTransaction. Instead, wait for the previous call to complete before starting the next one.
- changed: Simplify and document the relationship between the React Native bridge and the CppBridge object.

## v0.2.7 (2023-01-10)

- fixed: Re-publish to include missing files.

## v0.2.6 (2023-01-10)

- fixed: For sweep transactions, validate `send_amount` as a string rather than a number

## v0.2.5 (2022-09-09)

- changed: Upgrade native code to @mymonero/mymonero-monero-client v2.1.23 (https://github.com/mymonero/mymonero-utils/compare/v2.1.20..v2.1.23).

## v0.2.4 (2022-09-02)

- changed: Upgrade native code to @mymonero/mymonero-monero-client v2.1.20.

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
