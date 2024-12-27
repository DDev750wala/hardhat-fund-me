import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe } from "../../typechain-types/contracts/FundMe"
import { developmentChain } from "../../helper-hardhat-config";
import { assert } from "chai"
import { log } from "console";


developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe: FundMe;
        let deployer: string;
        const sendValue = ethers.parseEther("0.001")

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContractAt("FundMe", ((await deployments.get("FundMe")).address, deployer)) as unknown as FundMe
        })

        it("allows people to fund and withdraw", async function () {
            const startingBalance = await ethers.provider.getBalance((await deployments.get("FundMe")).address)
            console.log("Starting balance: ", startingBalance.toString())
            console.log("The contract address is: ", (await deployments.get("FundMe")).address)
            
            const fundTxResponse = await fundMe.fund({ value: sendValue })
            await fundTxResponse.wait(1)
            const withdrawTxResponse = await fundMe.cheaperWithdraw()
            await withdrawTxResponse.wait(1)

            const endingBalance = await ethers.provider.getBalance((await deployments.get("FundMe")).address)

            console.log("The ending balance is: ", endingBalance.toString());
            
            assert(endingBalance.toString() === "0", "Contract balance is not zero")
        })
    })