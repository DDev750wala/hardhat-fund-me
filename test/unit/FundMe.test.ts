import { assert, expect } from "chai";
import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat"

describe("FundMe", () => {
    let fundMe: Contract, MockV3Aggregator: Contract, deployer: string;
    const sendValue = ethers.parseEther("1");
     // 1 ETH
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
            const priceFeed = await fundMe.getPriceFeed()
            assert.equal(priceFeed, await MockV3Aggregator.getAddress())
        })
    })

    describe("fund", async function() {
        it("it fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        })
        
        it("updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString(), "Amount funded is incorrect")
        })

        it("add funders to the funders array", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer, "Funder is incorrect")
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from the single founder", async function () {
            // Arrange

            // in wei
            const contractBalance = await ethers.provider.getBalance(fundMe.getAddress())
            // const fundMeContractBalance = ethers.formatEther(contractBalance)

            const startingDeployerBalance = await ethers.provider.getBalance(deployer)
            
            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.prototype.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = BigInt(gasUsed) * BigInt(gasPrice)
            
            const endingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const endingDeployerBalance = await ethers.provider.getBalance(deployer)
            
            // Assert
            assert.equal(endingFundMeBalance, 0n)
            assert.equal((contractBalance + startingDeployerBalance).toString(), (endingDeployerBalance+gasCost).toString())
        })
    })
})