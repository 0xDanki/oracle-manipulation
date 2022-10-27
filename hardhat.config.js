require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
    {
      version: "0.8.9",
    },
    {
      version: "0.5.16",
    },
  ],
},
  defaultNetwork: "localhost",
  networks: {
    localhost: {},
    forkingMainnet: {
      url: 'http://127.0.0.1:8545',
      forking: {
        url: process.env.ALCHEMY_API,
        blockNumber: 15227236
      }
    }
  }
};
