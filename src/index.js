const { NativeModules } = require('react-native')

const { MyMoneroCore } = NativeModules

exports.callMyMonero = function callMyMonero(method, jsonArguments) {
  return MyMoneroCore.callMyMonero(method, jsonArguments)
}
