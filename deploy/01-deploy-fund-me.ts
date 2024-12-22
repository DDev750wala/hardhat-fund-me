import { network } from "hardhat"
import "hardhat-deploy"
import { HardhatRuntimeEnvironment } from "hardhat/types"

import { networkConfig } from "../helper-hardhat-config";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    
    const address = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    // we want to use the mechanism that we will change the networks as per chain-id.
    // if chainId is Y then feed address will be X, that way.

    const ethUsdPriceFeedAddress = networkConfig[chainId as number]?.ethUsdPriceFeed

    // what happens when to change the chains?
    // when going for localhost or hardhat network we want to use a mock.
    const fundMe = await deploy("FundMe", {
        from: deployer, // the address in this will be consider as the owner of the contract
        args: [], // we have to put pricefeed here, that we added in contructor in that contract.
        log: true
    })

}