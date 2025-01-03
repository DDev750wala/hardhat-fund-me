// wo do this sometimes. not always. pre-deployment scripts
// USAGE: to write the script for mock priceFeed script. not for deploying to the 
// remote network. this is only for local network to create a mock priceFeed

import { network } from "hardhat"
import "hardhat-deploy"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChain, DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config"
import { DeploymentsExtension } from "hardhat-deploy/dist/types"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log }: DeploymentsExtension = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mock");
        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
            contract: "MockV3Aggregator",
        })
        log("Mock deployed!")
        log("------------------------------------------")
    }
}

module.exports.tags = [
    "all",
    "mocks"
]