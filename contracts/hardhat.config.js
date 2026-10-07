
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../backend/.env' });

const networks = {
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  }
};

if (process.env.RPC_URL && process.env.ETH_PRIVATE_KEY) {
  networks.sepolia = {
    url: process.env.RPC_URL,
    accounts: [process.env.ETH_PRIVATE_KEY],
    chainId: 11155111
  };
}

module.exports = {
  solidity: "0.8.19",
  networks
};