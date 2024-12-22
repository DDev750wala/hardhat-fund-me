// wo do this sometimes. not always. pre-deployment scripts
// USAGE: to write the script for mock priceFeed script. not for deploying to the 
// remote network. this is only for local network to create a mock priceFeed

import { network } from "hardhat"
import "hardhat-deploy"
import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId


}