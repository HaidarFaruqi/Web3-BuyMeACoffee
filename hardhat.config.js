require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // untuk pakai .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`, // atau pakai Alchemy URL
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
