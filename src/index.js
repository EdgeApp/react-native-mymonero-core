import { NativeModules } from 'react-native'

const native = NativeModules.MyMoneroCore

export function callMyMonero(method, jsonArguments) {
  return native.callMyMonero(method, jsonArguments)
}
