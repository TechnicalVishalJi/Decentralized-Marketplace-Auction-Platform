require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    ganache: {
      url: "http://localhost:7545",
      accounts: [process.env.GANACHE_PRIVATE_KEY],
      chainId: 5777,
    },
    tenderly: {
      url: process.env.TENDERLY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532
    }
  },
};
