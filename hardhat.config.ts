import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-waffle"
// require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("@nomicfoundation/hardhat-verify")
require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const MNEMNONIC = process.env.MNEMNONIC
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKET_CAP_API_KEY = process.env.COINMARKET_CAP_API_KEY

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [process.env.METAMASK_PRIVATE_KEY as string],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-reporter.txt",
    noColors: true,
    coinmarketcap: COINMARKET_CAP_API_KEY
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    users: {
      default: 1
    }
  },
  solidity: {
    compilers: [
      { version: "0.6.12" },
      { version: "0.8.28" },
      // { version: "0.6.0" },
      // we can add more compiler versions like above
      // NOTE: never use '^' or '~' in version specification. write the exact version.
    ]
  },
};

export default config;
