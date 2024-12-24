import { assert } from "chai";
import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat"

describe("FundMe", () => {
    let fundMe: Contract, MockV3Aggregator: Contract, deployer: string;
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        const deployerSigner = await ethers.getSigner(deployer)

        // NOTE: ethers.getSigners() function returns an array of signers, of which private keys we have specified in the hardhat.config.ts file .

        fundMe = await ethers.getContractAt(
            "FundMe", 
            (await deployments.get("FundMe")).address, 
            deployerSigner
        );
        MockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator", 
            (await deployments.get("MockV3Aggregator")).address, 
            deployerSigner
        );
    }); 

    describe("constructor", async function () {
        it("It sets aggregator addresses correctly", async function () {
            const priceFeed = await fundMe.s_priceFeed()
            assert.equal(priceFeed, await MockV3Aggregator.getAddress())
        })
    })
})