/**
 * The shape of the native C++ module exposed to React Native.
 */
export interface MyMoneroCore {
  readonly callMyMonero: (
    name: string,
    jsonArguments: string
  ) => Promise<string>;

  readonly methodNames: string[];
}

/**
 * Provides direct low-level access to the C++ methods.
 * Deprecated.
 */
export declare function callMyMonero(
  name: string,
  args: string
): Promise<string>;

interface JSBigInt {
  toString(): string;
}

interface SpendableOut {
  amount: JSBigInt;
  public_key: string;
  global_index: number;
  index: number;
  tx_pub_key: string;
  rct?: string;
}

/**
 * The high-level API to the native C++ module.
 * TODO: The return types are still `any`, and need further refinement.
 */
export interface MyMoneroCoreBridge {
  is_subaddress(addr: string, nettype: number): Promise<any>;

  is_integrated_address(addr: string, nettype: number): Promise<any>;

  new_payment_id(): Promise<any>;

  new__int_addr_from_addr_and_short_pid(
    address: string,
    short_pid: string,
    nettype: number
  ): Promise<any>;

  decode_address(address: string, nettype: number): Promise<any>;

  newly_created_wallet(
    locale_language_code: string,
    nettype: number
  ): Promise<any>;

  are_equal_mnemonics(a: string, b: string): Promise<any>;

  mnemonic_from_seed(seed_string: string, wordset_name: string): Promise<any>;

  seed_and_keys_from_mnemonic(
    mnemonic_string: string,
    nettype: number
  ): Promise<any>;

  validate_components_for_login(
    address_string: string,
    sec_viewKey_string: string,
    sec_spendKey_string: string,
    seed_string: string,
    nettype: number
  ): Promise<any>;

  address_and_keys_from_seed(
    seed_string: string,
    nettype: number
  ): Promise<any>;

  generate_key_image(
    tx_pub: string,
    view_sec: string,
    spend_pub: string,
    spend_sec: string,
    output_index: string | number
  ): Promise<any>;

  generate_key_derivation(pub: string, sec: string): Promise<any>;

  derive_public_key(
    derivation: string,
    out_index: string,
    pub: string
  ): Promise<any>;

  derive_subaddress_public_key(
    output_key: string,
    derivation: string,
    out_index: string | number
  ): Promise<any>;

  decodeRct(
    rv: { type: number; ecdhInfo: any[]; outPk: any[] },
    sk: string,
    i: string | number
  ): Promise<any>;

  estimated_tx_network_fee(
    fee_per_kb__string: string,
    priority: string | number,
    optl__fee_per_b_string?: string
  ): Promise<any>;

  send_step1__prepare_params_for_get_decoys(
    is_sweeping: boolean,
    sending_amount: JSBigInt, // this may be 0 if sweeping
    fee_per_b: JSBigInt,
    fee_mask: JSBigInt,
    priority: number,
    unspent_outputs: SpendableOut[],
    optl__payment_id_string?: string, // this may be nil
    optl__passedIn_attemptAt_fee?: string | JSBigInt
  ): Promise<any>;

  send_step2__try_create_transaction(
    from_address_string: string,
    sec_keys: { view: string; spend: string },
    to_address_string: string,
    using_outs: SpendableOut[],
    mix_outs: SpendableOut[] | undefined,
    fake_outputs_count: number,
    final_total_wo_fee: JSBigInt,
    change_amount: JSBigInt,
    fee_amount: JSBigInt,
    payment_id: string | undefined,
    priority: number,
    fee_per_b: JSBigInt, // not kib - if fee_per_kb, /= 1024
    fee_mask: JSBigInt,
    unlock_time: number,
    nettype: number
  ): Promise<any>;
}

export declare var monero_utils: MyMoneroCoreBridge;
