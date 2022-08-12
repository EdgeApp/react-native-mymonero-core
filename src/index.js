const { NativeModules } = require('react-native')
const CppBridge = require('./CppBridge.js')

const { MyMoneroCore } = NativeModules

// Put the methods back together:
const methods = {}
for (const name of MyMoneroCore.methodNames) {
  methods[name] = function (...args) {
    return MyMoneroCore.callMyMonero(name, args).then(out => {
      // We have to cast some return values:
      return name === 'compareMnemonics' ||
        name === 'isIntegratedAddress' ||
        name === 'isSubaddress'
        ? Boolean(out)
        : out
    })
  }
}

module.exports = new CppBridge(methods)
