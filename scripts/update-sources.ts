// Run this script as `node -r sucrase/register ./scripts/update-sources.ts`
//
// It will:
// - Download third-party source code.
// - Set up the Android build system:
//    - Determine which C++ headers are actually necessary.
//    - Copy the necessary sources into `android/src/main/cpp`.
//    - Assemble `CMakeLists.txt`.
// - Assemble an iOS universal static library.
// - Generate Flow types from the TypeScript definitions.
//
// This library only uses about 1500 of the 13000 boost headers files,
// so we ask the C compiler which headers are actually useful.

import { execSync } from 'child_process'
import { existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { makeNodeDisklet } from 'disklet'

const disklet = makeNodeDisklet(join(__dirname, '../'))
const tmp = join(__dirname, '../tmp')

async function main(): Promise<void> {
  if (!existsSync(tmp)) mkdirSync(tmp)
  await downloadSources()
  await generateAndroidBuild()
  await generateIosLibrary()
  await makeFlowTypes()
}

async function downloadSources(): Promise<void> {
  getZip(
    // The Emscripten SDK includes 1.75, but this older version still works:
    'boost_1_63_0.zip',
    'https://dl.bintray.com/boostorg/release/1.63.0/source/boost_1_63_0.zip'
  )
  getRepo(
    'monero-core-custom',
    'https://github.com/mymonero/monero-core-custom.git',
    '936afd97467375511032d6a4eef6e76c982148dd'
  )
  getRepo(
    // Use the webassembly-cleanup branch:
    'mymonero-core-cpp',
    'https://github.com/mymonero/mymonero-core-cpp.git',
    '005fcf096ef429ddc157f489d69b1d3ca7d16244'
  )
  getRepo(
    'mymonero-utils',
    'https://github.com/mymonero/mymonero-utils.git',
    'a6df682f9b730804963538e8d826d91ae59dba40'
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
  'BOOST_SYSTEM_NO_DEPRECATED'
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

// Phones and simulators we need to support:
const iosPlatforms: Array<{ sdk: string; arch: string }> = [
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
  await disklet.delete(src + 'mymonero-wrapper')

  // Figure out which files we need:
  const headers = inferHeaders()
  const extraFiles: string[] = [
    // Preserve licenses:
    'boost_1_63_0/LICENSE_1_0.txt',
    'mymonero-core-cpp/LICENSE.txt',

    // Platform-specific files our header inference might not catch:
    'boost_1_63_0/boost/atomic/detail/ops_extending_cas_based.hpp',
    'boost_1_63_0/boost/config/platform/linux.hpp',
    'boost_1_63_0/boost/detail/fenv.hpp',
    'boost_1_63_0/boost/uuid/detail/uuid_generic.hpp'
  ]
  for (const extra of extraFiles) {
    if (headers.indexOf(extra) >= 0) {
      console.log(`Warning: ${extra} isn't needed in extraFiles`)
    }
  }
  await copyFiles('tmp/', src, [...sources, ...headers, ...extraFiles])

  // Assemble our CMakeLists.txt:
  const sourceList = ['jni.cpp', ...sources].join(' ')
  const cmakeLines = [
    '# Auto-generated by the update-sources script',
    'cmake_minimum_required(VERSION 3.4.1)',
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
function inferHeaders(): string[] {
  const cflags = [
    ...defines.map(name => `-D${name}`),
    ...includePaths.map(path => `-I${join(tmp, path)}`)
  ]
  const cxxflags = [...cflags, '-std=c++11']

  const out: { [path: string]: true } = {}
  for (const source of sources) {
    console.log(`Finding headers in ${source}...`)

    const useCxx = /\.cpp$|\.cc$/.test(source)
    const report = quietExec([
      'clang',
      '-M',
      ...(useCxx ? cxxflags : cflags),
      join(tmp, source)
    ])

    // Skip the first 2 lines & trim trailing back-slashes:
    const headers = report
      .split('\n')
      .slice(2)
      .map(line => line.replace(/ |\\$/g, ''))

    // We only care about headers located in our tmp/ location:
    for (const header of headers) {
      if (header.indexOf(tmp) === 0) {
        out[header.slice(tmp.length + 1)] = true
      }
    }
  }

  return Object.keys(out)
}

/**
 * Compiles the sources into an iOS static library.
 */
async function generateIosLibrary(): Promise<void> {
  const cflags = [
    ...defines.map(name => `-D${name}`),
    ...includePaths.map(path => `-I${join(tmp, path)}`),
    '-miphoneos-version-min=9.0',
    '-O2',
    '-Werror=partial-availability'
  ]
  const cxxflags = [...cflags, '-std=c++11']

  // Generate a library for each platform:
  const libraries: string[] = []
  for (const { sdk, arch } of iosPlatforms) {
    const working = join(tmp, `${sdk}-${arch}`)
    if (!existsSync(working)) mkdirSync(working)

    // Find platform tools:
    const xcrun = ['xcrun', '--sdk', sdk]
    const ar = quietExec([...xcrun, '--find', 'ar'])
    const cc = quietExec([...xcrun, '--find', 'clang'])
    const cxx = quietExec([...xcrun, '--find', 'clang++'])
    const sdkFlags = [
      '-arch',
      arch,
      '-target',
      iosSdkTriples[sdk].replace('%arch%', arch),
      '-isysroot',
      quietExec([...xcrun, '--show-sdk-path'])
    ]

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
      quietExec([
        useCxx ? cxx : cc,
        '-c',
        ...(useCxx ? cxxflags : cflags),
        ...sdkFlags,
        `-o ${object}`,
        join(tmp, source)
      ])
    }

    // Generate a static library:
    console.log(`Building static library for ${sdk}-${arch}...`)
    const library = join(working, `libmymonero-core.a`)
    if (existsSync(library)) unlinkSync(library)
    libraries.push(library)
    quietExec([ar, 'rcs', library, ...objects])
  }

  // Merge the platforms into a fat library:
  const merged: string[] = []
  const sdks = new Set(iosPlatforms.map(row => row.sdk))
  for (const sdk of sdks) {
    console.log(`Merging libraries for ${sdk}...`)
    const working = join(tmp, `${sdk}-lipo`)
    if (!existsSync(working)) mkdirSync(working)
    const output = join(working, 'libmymonero-core.a')
    merged.push('-library', output)
    quietExec([
      'lipo',
      '-create',
      '-output',
      output,
      ...libraries.filter((_, i) => iosPlatforms[i].sdk === sdk)
    ])
  }

  // Bundle those into an XCFramework:
  console.log('Creating XCFramework...')
  await disklet.delete('ios/MyMoneroCore.xcframework')
  quietExec([
    'xcodebuild',
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

/**
 * Clones a git repo and checks our a hash.
 */
function getRepo(name: string, uri: string, hash: string): void {
  const path = join(tmp, name)

  // Clone (if needed):
  if (!existsSync(path)) {
    console.log(`Cloning ${name}...`)
    loudExec(['git', 'clone', uri, name])
  }

  // Checkout:
  console.log(`Checking out ${name}...`)
  execSync(`git checkout -f ${hash}`, {
    cwd: path,
    stdio: 'inherit',
    encoding: 'utf8'
  })
}

/**
 * Downloads & unpacks a zip file.
 */
function getZip(name: string, uri: string): void {
  const path = join(tmp, name)

  if (!existsSync(path)) {
    console.log(`Getting ${name}...`)
    loudExec(['curl', '-L', '-o', path, uri])
  }

  // Unzip:
  loudExec(['unzip', '-u', path])
}

/**
 * Copies just the files we need from one folder to another.
 */
async function copyFiles(
  from: string,
  to: string,
  files: string[]
): Promise<void> {
  for (const file of files) {
    await disklet.setText(to + file, await disklet.getText(from + file))
  }
}

/**
 * Runs a command and returns its results.
 */
function quietExec(argv: string[]): string {
  return execSync(argv.join(' '), {
    cwd: tmp,
    encoding: 'utf8'
  }).replace(/\n$/, '')
}

/**
 * Runs a command and displays its results.
 */
function loudExec(argv: string[]): void {
  execSync(argv.join(' '), {
    cwd: tmp,
    stdio: 'inherit',
    encoding: 'utf8'
  })
}

main().catch(error => console.log(error))
