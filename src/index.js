const { NativeModules } = require('react-native')
const CppBridge = require('./CppBridge.js')

module.exports = new CppBridge(NativeModules.MyMoneroCore)
