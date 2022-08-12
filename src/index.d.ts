/**
 * The shape of the native C++ module exposed to React Native.
 *
 * You do not normally need this, but it is accessible as
 * `require('react-native').NativeModules.MyMoneroCore`
 */
export interface NativeMyMoneroCore {
  readonly callMyMonero: (
    name: string,
    jsonArguments: string[]
  ) => Promise<string>;

  readonly methodNames: string[];
}

/**
 * Data returned by the `/get_random_outs` LWS route.
 */
export type RandomOuts = {
  amount_outs: Array<{
    amount: string;
    outputs: Array<{
      global_index: string;
      public_key: string;
      rct: string;
    }>;
  }>;
};

/**
 * Data returned by the `/get_unspent_outs` LWS route.
 */
export type UnpsentOuts = {
  amount: string;
  outputs: Array<{
    amount: string;
    global_index: number;
    height: number;
    index: number;
    public_key: string;
    rct?: string;
    spend_key_images: string[];
    timestamp: string;
    ts_prefix_hash: string;
    tx_hash: string;
    tx_id: string;
    tx_pub_key: string;
  }>;
  per_byte_fee: number;
  fee_mask: number;
  fork_version: number;
};

export type Nettype = 'MAINNET' | 'STAGENET' | 'TESTNET' | 'FAKECHAIN';
export type Priority = 1 | 2 | 3 | 4;
export type RandomOutsCallback = (numberOfOuts: number) => Promise<RandomOuts>;

export type AddressAndKeys = {
  address: string;
  privateSpendKey: string;
  privateViewKey: string;
  publicSpendKey: string;
  publicViewKey: string;
};

export type CreateTransactionOptions = {
  // Source wallet:
  address: string;
  nettype: Nettype;
  priority: Priority;
  privateSpendKey: string;
  privateViewKey: string;
  publicSpendKey: string;

  // Destination:
  destinations: Array<{
    to_address: string;
    send_amount: string;
  }>;
  shouldSweep: boolean;

  // Chain state:
  unspentOuts: UnpsentOuts;
  randomOutsCb: RandomOutsCallback;
};

export type CreatedTransaction = {
  // Transaction:
  serialized_signed_tx: string;
  tx_hash: string;
  tx_key: string;
  tx_pub_key: string;

  // Amounts:
  total_sent: string;
  final_total_wo_fee: string;
  used_fee: string;

  // Other stuff:
  isXMRAddressIntegrated: string; // '0' or '1'
  mixin: string; // integer string
  target_address: string; // Broken
};

export type DecodedAddress = {
  isSubaddress: boolean;
  paymentId?: string;
  publicSpendKey: string;
  publicViewKey: string;
};

export type GeneratedWallet = {
  address: string;
  mnemonic: string;
  mnemonicLanguage: string;
  privateSpendKey: string;
  privateViewKey: string;
  publicSpendKey: string;
  publicViewKey: string;
  seed: string;
};

export type SeedAndKeys = {
  address: string;
  mnemonicLanguage: string;
  privateSpendKey: string;
  privateViewKey: string;
  publicSpendKey: string;
  publicViewKey: string;
  seed: string;
};

/**
 * The high-level API to the native C++ module.
 */
export interface CppBridge {
  addressAndKeysFromSeed(
    seed: string,
    nettype: Nettype
  ): Promise<AddressAndKeys>;

  compareMnemonics(a: string, b: string): Promise<boolean>;

  createTransaction(
    options: CreateTransactionOptions
  ): Promise<CreatedTransaction>;

  decodeAddress(address: string, nettype: Nettype): Promise<DecodedAddress>;

  estimateTxFee(
    priority: Priority,
    feePerb: number,
    forkVersion?: number
  ): Promise<number>;

  generateKeyImage(
    txPublicKey: string,
    privateViewKey: string,
    publicSpendKey: string,
    privateSpendKey: string,
    outputIndex: number
  ): Promise<string>;

  generatePaymentId(): Promise<string>;

  generateWallet(
    localeLanguageCode: string,
    nettype: Nettype
  ): Promise<GeneratedWallet>;

  isIntegratedAddress(address: string, nettype: Nettype): Promise<boolean>;

  isSubaddress(address: string, nettype: Nettype): Promise<boolean>;

  isValidKeys(
    address: string,
    privateViewKey: string,
    privateSpendKey: string,
    seed: string,
    nettype: Nettype
  ): Promise<{
    isValid: boolean;
    isViewOnly: boolean;
    publicSpendKey: string;
    publicViewKey: string;
  }>;

  mnemonicFromSeed(seed: string, wordsetName: string): Promise<string>;

  newIntegratedAddress(
    address: string,
    paymentId: string,
    nettype: Nettype
  ): Promise<string>;

  seedAndKeysFromMnemonic(
    mnemonic: string,
    nettype: Nettype
  ): Promise<SeedAndKeys>;
}

declare var bridge: CppBridge;
export default bridge;
