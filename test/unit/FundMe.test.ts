import { deployments, ethers, getNamedAccounts } from "hardhat"

describe("FundMe", () => {
    let fundMe
    beforeEach(async function () {
        const { deployer } = await getNamedAccounts()
        await deployments.fixture(["all"])
        const deployerSigner = await ethers.getSigner(deployer)

        // ethers.getSigners() function returns an array of signers, of which private keys we have specified in the hardhat.config.ts file.

        fundMe = await ethers.getContractAt("FundMe", (await deployments.get("FundMe")).address, deployerSigner)
    })
})