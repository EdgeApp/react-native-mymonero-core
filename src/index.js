const { NativeModules } = require('react-native')
const MyMoneroCoreBridge = require('./MyMoneroCoreBridge.js')

const { MyMoneroCore } = NativeModules

exports.callMyMonero = function callMyMonero(method, jsonArguments) {
  return MyMoneroCore.callMyMonero(method, jsonArguments)
}

exports.monero_utils = new MyMoneroCoreBridge(MyMoneroCore)
