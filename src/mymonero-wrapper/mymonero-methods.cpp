#include "mymonero-methods.hpp"
#include "../mymonero-core-cpp/src/serial_bridge_index.hpp"

const MyMoneroMethod myMoneroMethods[] = {
    { "address_and_keys_from_seed", serial_bridge::address_and_keys_from_seed },
    { "are_equal_mnemonics", serial_bridge::are_equal_mnemonics },
    { "decode_address", serial_bridge::decode_address },
    { "decodeRct", serial_bridge::decodeRct },
    { "derive_public_key", serial_bridge::derive_public_key },
    { "derive_subaddress_public_key", serial_bridge::derive_subaddress_public_key },
    { "estimated_tx_network_fee", serial_bridge::estimated_tx_network_fee },
    { "generate_key_derivation", serial_bridge::generate_key_derivation },
    { "generate_key_image", serial_bridge::generate_key_image },
    { "is_integrated_address", serial_bridge::is_integrated_address },
    { "is_subaddress", serial_bridge::is_subaddress },
    { "mnemonic_from_seed", serial_bridge::mnemonic_from_seed },
    { "new_integrated_address", serial_bridge::new_integrated_address },
    { "new_payment_id", serial_bridge::new_payment_id },
    { "newly_created_wallet", serial_bridge::newly_created_wallet },
    { "seed_and_keys_from_mnemonic", serial_bridge::seed_and_keys_from_mnemonic },
    { "send_step1__prepare_params_for_get_decoys", serial_bridge::send_step1__prepare_params_for_get_decoys },
    { "send_step2__try_create_transaction", serial_bridge::send_step2__try_create_transaction },
    { "validate_components_for_login", serial_bridge::validate_components_for_login }
};

const unsigned myMoneroMethodCount = std::end(myMoneroMethods) - std::begin(myMoneroMethods);
