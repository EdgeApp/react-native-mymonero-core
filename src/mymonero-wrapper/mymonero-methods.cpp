#include "mymonero-methods.hpp"
#include "../mymonero-core-cpp/src/serial_bridge_index.hpp"
#include "../mymonero-utils/packages/mymonero-monero-client/src/emscr_SendFunds_bridge.hpp"

std::string addressAndKeysFromSeed(const std::vector<const std::string> &args) {
  return serial_bridge::address_and_keys_from_seed(args[0], args[1]);
}

std::string compareMnemonics(const std::vector<const std::string> &args) {
  return serial_bridge::are_equal_mnemonics(args[0], args[1]) ? "t" : "";
}

std::string createAndSignTx(const std::vector<const std::string> &args) {
  return emscr_SendFunds_bridge::send_funds(args[0]);
}

std::string decodeAddress(const std::vector<const std::string> &args) {
  return serial_bridge::decode_address(args[0], args[1]);
}

std::string estimateTxFee(const std::vector<const std::string> &args) {
  return serial_bridge::estimated_tx_network_fee(args[0], args[1], args[2]);
}

std::string generateKeyImage(const std::vector<const std::string> &args) {
  return serial_bridge::generate_key_image(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4]
  );
}

std::string generatePaymentId(const std::vector<const std::string> &args) {
  return serial_bridge::new_payment_id();
}

std::string generateWallet(const std::vector<const std::string> &args) {
  return serial_bridge::newly_created_wallet(args[0], args[1]);
}

std::string isIntegratedAddress(const std::vector<const std::string> &args) {
  return serial_bridge::is_integrated_address(args[0], args[1]) ? "t" : "";
}

std::string isSubaddress(const std::vector<const std::string> &args) {
  return serial_bridge::is_subaddress(args[0], args[1]) ? "t" : "";
}

std::string isValidKeys(const std::vector<const std::string> &args) {
  return serial_bridge::validate_components_for_login(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4]
  );
}

std::string mnemonicFromSeed(const std::vector<const std::string> &args) {
  return serial_bridge::mnemonic_from_seed(args[0], args[1]);
}

std::string newIntegratedAddress(const std::vector<const std::string> &args) {
  return serial_bridge::new_integrated_address(args[0], args[1], args[2]);
}

std::string prepareTx(const std::vector<const std::string> &args) {
  return emscr_SendFunds_bridge::prepare_send(args[0]);
}

std::string seedAndKeysFromMnemonic(const std::vector<const std::string> &args) {
  return serial_bridge::seed_and_keys_from_mnemonic(args[0], args[1]);
}

const MyMoneroMethod myMoneroMethods[] = {
  { "addressAndKeysFromSeed", 2, addressAndKeysFromSeed },
  { "compareMnemonics", 2, compareMnemonics },
  { "createAndSignTx", 1, createAndSignTx },
  { "decodeAddress", 2, decodeAddress },
  { "estimateTxFee", 3, estimateTxFee },
  { "generateKeyImage", 5, generateKeyImage },
  { "generatePaymentId", 0, generatePaymentId },
  { "generateWallet", 2, generateWallet },
  { "isIntegratedAddress", 2, isIntegratedAddress },
  { "isSubaddress", 2, isSubaddress },
  { "isValidKeys", 5, isValidKeys },
  { "mnemonicFromSeed", 2, mnemonicFromSeed },
  { "newIntegratedAddress", 3, newIntegratedAddress },
  { "prepareTx", 1, prepareTx },
  { "seedAndKeysFromMnemonic", 2, seedAndKeysFromMnemonic }
};

const unsigned myMoneroMethodCount = std::end(myMoneroMethods) - std::begin(myMoneroMethods);
