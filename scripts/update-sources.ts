// Run this script as `node -r sucrase/register ./scripts/update-sources.ts`
//
// It will:
// - Download third-party source code.
// - Set up the Android build system:
//    - Determine which C++ headers are actually necessary.
//    - Copy the necessary sources into `android/src/main/cpp`.
//    - Assemble `CMakeLists.txt`.
// - Assemble an iOS universal static xcframework.
// - Generate Flow types from the TypeScript definitions.
//
// This library only uses about 1500 of the 13000 boost headers files,
// so we ask the C compiler which headers are actually useful.

import { makeNodeDisklet } from 'disklet'
import { mkdir, rm } from 'fs/promises'
import { join } from 'path'

import {
  copyFiles,
  getRepo,
  getZip,
  loudExec,
  quietExec,
  tmpPath
} from './utils/common'
import { getObjcopyPath } from './utils/ios-tools'

const disklet = makeNodeDisklet(join(__dirname, '../'))

async function main(): Promise<void> {
  await mkdir(tmpPath, { recursive: true })
  await downloadSources()
  await makeFlowTypes()
  await generateAndroidBuild()

  // iOS:
  for (const platform of iosPlatforms) {
    await buildIos(platform)
  }
  await packageIos()
}

async function downloadSources(): Promise<void> {
  await getZip(
    // The Emscripten SDK includes 1.75, but this older version still works:
    'boost_1_63_0.zip',
    'https://dl.bintray.com/boostorg/release/1.63.0/source/boost_1_63_0.zip'
  )
  await getRepo(
    'monero-core-custom',
    'https://github.com/mymonero/monero-core-custom.git',
    'd0d4ec2c99a1db96518a98ff47773d76cf729d84'
  )
  await getRepo(
    // Use the webassembly-cleanup branch:
    'mymonero-core-cpp',
    'https://github.com/mymonero/mymonero-core-cpp.git',
    '6fc88e94a36086f9380416ceb0f2c2509a44f3f0'
  )
  await getRepo(
    'mymonero-utils',
    'https://github.com/mymonero/mymonero-utils.git',
    '8b2fb278e4a5aa84e577c9985fbca332fca4f1b0' // v2.1.23
  )
  await disklet.setText(
    // Upstream mymonero-utils wrongly includes this file, so make a dummy:
    'tmp/monero-core-custom/emscripten.h',
    ''
  )
  await copyFiles('src/', 'tmp/', [
    'mymonero-wrapper/mymonero-methods.cpp',
    'mymonero-wrapper/mymonero-methods.hpp'
  ])
}

// Preprocessor definitions:
const defines: string[] = [
  'BOOST_ERROR_CODE_HEADER_ONLY',
  'BOOST_SYSTEM_NO_DEPRECATED',
  'MYMONERO_CORE_CUSTOM'
]

// Compiler options derived loosely from mymonero-core-cpp/CMakeLists.txt:
const includePaths: string[] = [
  'boost_1_63_0/',
  'monero-core-custom/',
  'monero-core-custom/contrib/libsodium/include/',
  'monero-core-custom/contrib/libsodium/include/sodium/',
  'monero-core-custom/crypto/',
  'monero-core-custom/cryptonote_basic/',
  'monero-core-custom/cryptonote_core/',
  'monero-core-custom/epee/include/',
  'monero-core-custom/mnemonics/',
  'monero-core-custom/vtlogger/',
  'monero-core-custom/wallet/',
  'mymonero-core-cpp/src/'
]

// Source list derived loosely from mymonero-core-cpp/CMakeLists.txt:
const sources: string[] = [
  'boost_1_63_0/libs/thread/src/pthread/once.cpp',
  'boost_1_63_0/libs/thread/src/pthread/thread.cpp',
  'monero-core-custom/common/aligned.c',
  'monero-core-custom/common/base58.cpp',
  'monero-core-custom/common/threadpool.cpp',
  'monero-core-custom/common/util.cpp',
  'monero-core-custom/contrib/libsodium/src/crypto_verify/verify.c',
  'monero-core-custom/crypto/aesb.c',
  'monero-core-custom/crypto/blake256.c',
  'monero-core-custom/crypto/chacha.c',
  'monero-core-custom/crypto/crypto-ops-data.c',
  'monero-core-custom/crypto/crypto-ops.c',
  'monero-core-custom/crypto/crypto.cpp',
  'monero-core-custom/crypto/groestl.c',
  'monero-core-custom/crypto/hash-extra-blake.c',
  'monero-core-custom/crypto/hash-extra-groestl.c',
  'monero-core-custom/crypto/hash-extra-jh.c',
  'monero-core-custom/crypto/hash-extra-skein.c',
  'monero-core-custom/crypto/hash.c',
  'monero-core-custom/crypto/jh.c',
  'monero-core-custom/crypto/keccak.c',
  'monero-core-custom/crypto/oaes_lib.c',
  'monero-core-custom/crypto/random.c',
  'monero-core-custom/crypto/skein.c',
  'monero-core-custom/crypto/slow-hash-dummied.cpp',
  'monero-core-custom/crypto/tree-hash.c',
  'monero-core-custom/cryptonote_basic/account.cpp',
  'monero-core-custom/cryptonote_basic/cryptonote_basic_impl.cpp',
  'monero-core-custom/cryptonote_basic/cryptonote_format_utils_basic.cpp',
  'monero-core-custom/cryptonote_basic/cryptonote_format_utils.cpp',
  'monero-core-custom/cryptonote_core/cryptonote_tx_utils.cpp',
  'monero-core-custom/device/device_default.cpp',
  'monero-core-custom/device/device.cpp',
  'monero-core-custom/epee/src/hex.cpp',
  'monero-core-custom/epee/src/memwipe.c',
  'monero-core-custom/epee/src/mlocker.cpp',
  'monero-core-custom/epee/src/string_tools.cpp',
  'monero-core-custom/epee/src/wipeable_string.cpp',
  'monero-core-custom/mnemonics/electrum-words.cpp',
  'monero-core-custom/ringct/bulletproofs_plus.cc',
  'monero-core-custom/ringct/bulletproofs.cc',
  'monero-core-custom/ringct/multiexp.cc',
  'monero-core-custom/ringct/rctCryptoOps.c',
  'monero-core-custom/ringct/rctOps.cpp',
  'monero-core-custom/ringct/rctSigs.cpp',
  'monero-core-custom/ringct/rctTypes.cpp',
  'monero-core-custom/vtlogger/logger.cpp',
  'mymonero-core-cpp/src/monero_address_utils.cpp',
  'mymonero-core-cpp/src/monero_fee_utils.cpp',
  'mymonero-core-cpp/src/monero_fork_rules.cpp',
  'mymonero-core-cpp/src/monero_key_image_utils.cpp',
  'mymonero-core-cpp/src/monero_paymentID_utils.cpp',
  'mymonero-core-cpp/src/monero_send_routine.cpp',
  'mymonero-core-cpp/src/monero_transfer_utils.cpp',
  'mymonero-core-cpp/src/monero_wallet_utils.cpp',
  'mymonero-core-cpp/src/serial_bridge_index.cpp',
  'mymonero-core-cpp/src/serial_bridge_utils.cpp',
  'mymonero-core-cpp/src/tools__ret_vals.cpp',
  'mymonero-utils/packages/mymonero-monero-client/src/emscr_SendFunds_bridge.cpp',
  'mymonero-utils/packages/mymonero-monero-client/src/SendFundsFormSubmissionController.cpp',
  'mymonero-wrapper/mymonero-methods.cpp'
]

interface IosPlatform {
  sdk: 'iphoneos' | 'iphonesimulator'
  arch: string
}

// Phones and simulators we need to support:
const iosPlatforms: IosPlatform[] = [
  { sdk: 'iphoneos', arch: 'arm64' },
  { sdk: 'iphoneos', arch: 'armv7' },
  { sdk: 'iphoneos', arch: 'armv7s' },
  { sdk: 'iphonesimulator', arch: 'arm64' },
  { sdk: 'iphonesimulator', arch: 'x86_64' }
]
const iosSdkTriples: { [sdk: string]: string } = {
  iphoneos: '%arch%-apple-ios9.0',
  iphonesimulator: '%arch%-apple-ios9.0-simulator'
}

/**
 * Set up the Android build system.
 */
async function generateAndroidBuild() {
  // Clean existing stuff:
  const src = 'android/src/main/cpp/'
  await disklet.delete(src + 'boost_1_63_0')
  await disklet.delete(src + 'monero-core-custom')
  await disklet.delete(src + 'mymonero-core-cpp')
  await disklet.delete(src + 'mymonero-utils')
  await disklet.delete(src + 'mymonero-wrapper')

  // Figure out which files we need:
  const headers = await inferHeaders()
  const extraFiles: string[] = [
    // Preserve licenses:
    'boost_1_63_0/LICENSE_1_0.txt',
    'mymonero-core-cpp/LICENSE.txt',

    // Platform-specific files our header inference might not catch:
    'boost_1_63_0/boost/atomic/detail/ops_cas_based.hpp',
    'boost_1_63_0/boost/atomic/detail/ops_extending_cas_based.hpp',
    'boost_1_63_0/boost/atomic/detail/ops_gcc_x86_dcas.hpp',
    'boost_1_63_0/boost/config/platform/linux.hpp',
    'boost_1_63_0/boost/detail/fenv.hpp',
    'boost_1_63_0/boost/uuid/detail/uuid_generic.hpp',
    'boost_1_63_0/boost/uuid/detail/uuid_x86.hpp'
  ]
  for (const extra of extraFiles) {
    if (headers.includes(extra)) {
      console.log(`Warning: ${extra} isn't needed in extraFiles`)
    }
  }
  await copyFiles('tmp/', src, [...sources, ...headers, ...extraFiles])

  // Assemble our CMakeLists.txt:
  const sourceList = ['jni.cpp', ...sources].join(' ')
  const cmakeLines = [
    '# Auto-generated by the update-sources script',
    'project("react-native-mymonero-core")',
    'cmake_minimum_required(VERSION 3.4.1)',
    'set(CMAKE_CXX_STANDARD 14)',
    'set(CMAKE_CXX_STANDARD_REQUIRED ON)',
    'add_compile_options(-fvisibility=hidden -w)',
    ...defines.map(name => `add_definitions("-D${name}")`),
    ...includePaths.map(path => `include_directories("${path}")`),
    `add_library(mymonero-jni SHARED ${sourceList})`
  ]
  await disklet.setText(src + 'CMakeLists.txt', cmakeLines.join('\n'))
}

/**
 * Uses the C compiler to figure out exactly which headers we need.
 * Boost includes about 13,000 header files, which is insane.
 * This reduces the number of headers to about 1500, which much better,
 * but still slightly insane.
 */
async function inferHeaders(): Promise<string[]> {
  const cflags = [
    ...defines.map(name => `-D${name}`),
    ...includePaths.map(path => `-I${join(tmpPath, path)}`)
  ]
  const cxxflags = [...cflags, '-std=c++11']

  const out: { [path: string]: true } = {}
  for (const source of sources) {
    console.log(`Finding headers in ${source}...`)

    const useCxx = /\.cpp$|\.cc$/.test(source)
    const report = await quietExec('clang', [
      '-M',
      ...(useCxx ? cxxflags : cflags),
      join(tmpPath, source)
    ])

    // Skip the first 2 lines & trim trailing back-slashes:
    const headers = report
      .split('\n')
      .slice(2)
      .map(line => line.replace(/ |\\$/g, ''))

    // We only care about headers located in our tmp/ location:
    for (const header of headers) {
      if (header.indexOf(tmpPath) === 0) {
        out[header.slice(tmpPath.length + 1)] = true
      }
    }
  }

  return Object.keys(out)
}

/**
 * Compiles the sources into an iOS static library,
 * containing a single giant .o file.
 */
async function buildIos(platform: IosPlatform): Promise<void> {
  const { sdk, arch } = platform
  const working = join(tmpPath, `${sdk}-${arch}`)
  await mkdir(working, { recursive: true })

  // Find platform tools:
  const ar = await quietExec('xcrun', ['--sdk', sdk, '--find', 'ar'])
  const cc = await quietExec('xcrun', ['--sdk', sdk, '--find', 'clang'])
  const cxx = await quietExec('xcrun', ['--sdk', sdk, '--find', 'clang++'])
  const ld = await quietExec('xcrun', ['--sdk', sdk, '--find', 'ld'])
  const objcopy = await getObjcopyPath()
  const sdkFlags = [
    '-arch',
    arch,
    '-target',
    iosSdkTriples[sdk].replace('%arch%', arch),
    '-isysroot',
    await quietExec('xcrun', ['--sdk', sdk, '--show-sdk-path'])
  ]
  const cflags = [
    ...defines.map(name => `-D${name}`),
    ...includePaths.map(path => `-I${join(tmpPath, path)}`),
    '-miphoneos-version-min=9.0',
    '-O2',
    '-Werror=partial-availability'
  ]
  const cxxflags = [...cflags, '-std=c++11']

  // Compile sources:
  const objects: string[] = []
  for (const source of sources) {
    console.log(`Compiling ${source} for ${sdk}-${arch}...`)

    // Figure out the object file name:
    const object = join(
      working,
      source.replace(/^.*\//, '').replace(/\.c$|\.cc$|\.cpp$/, '.o')
    )
    objects.push(object)

    const useCxx = /\.cpp$|\.cc$/.test(source)
    await loudExec(useCxx ? cxx : cc, [
      '-c',
      ...(useCxx ? cxxflags : cflags),
      ...sdkFlags,
      `-o${object}`,
      join(tmpPath, source)
    ])
  }

  // Link everything together into a single giant .o file:
  console.log(`Linking mymonero-core.o for ${sdk} ${arch}`)
  const objectPath = join(working, 'mymonero-core.o')
  await loudExec(ld, ['-r', '-o', objectPath, ...objects])

  // Localize all symbols except the ones we really want,
  // hiding them from future linking steps:
  await loudExec(objcopy, [
    objectPath,
    '-w',
    '-L*',
    '-L!_myMoneroMethods',
    '-L!_myMoneroMethodCount'
  ])

  // Generate a static library:
  console.log(`Building static library for ${sdk}-${arch}...`)
  const library = join(working, `libmymonero-core.a`)
  await rm(library, { force: true })
  await loudExec(ar, ['rcs', library, objectPath])
}

/**
 * Creates a unified xcframework file out of the per-platform
 * static libraries that `buildIos` creates.
 */
async function packageIos(): Promise<void> {
  const sdks = new Set(iosPlatforms.map(row => row.sdk))

  // Merge the platforms into a fat library:
  const merged: string[] = []
  for (const sdk of sdks) {
    console.log(`Merging libraries for ${sdk}...`)
    const outPath = join(tmpPath, `${sdk}-lipo`)
    await mkdir(outPath, { recursive: true })
    const output = join(outPath, 'libmymonero-core.a')

    await loudExec('lipo', [
      '-create',
      '-output',
      output,
      ...iosPlatforms
        .filter(platform => platform.sdk === sdk)
        .map(({ sdk, arch }) =>
          join(tmpPath, `${sdk}-${arch}`, `libmymonero-core.a`)
        )
    ])
    merged.push('-library', output)
  }

  // Bundle those into an XCFramework:
  console.log('Creating XCFramework...')
  await rm('ios/MyMoneroCore.xcframework', { recursive: true, force: true })
  await loudExec('xcodebuild', [
    '-create-xcframework',
    ...merged,
    '-output',
    join(__dirname, '../ios/MyMoneroCore.xcframework')
  ])
}

/**
 * Turns the TypeScript types into Flow types.
 */
async function makeFlowTypes(): Promise<void> {
  const ts = await disklet.getText('src/index.d.ts')
  await disklet.setText(
    'src/index.js.flow',
    '// @flow\n' + ts.replace(/readonly /g, '+')
  )
}

main().catch(error => console.log(error))
