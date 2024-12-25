import { assert, expect } from "chai";
import { Contract, TransactionReceipt, TransactionResponse } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { FundMe } from "../../typechain-types/contracts/FundMe"
import { developmentChain } from "../../helper-hardhat-config";

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
        let fundMe: FundMe, MockV3Aggregator: Contract, deployer: string;
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
            ) as unknown as FundMe;
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

        describe("fund", async function () {
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
            beforeEach(async function () {
                await fundMe.fund({ value: sendValue })
            })

            it("withdraw ETH from the single founder", async function () {
                // Arrange

                // in wei
                const startingContractBalance = await ethers.provider.getBalance(fundMe.getAddress())

                const startingDeployerBalance = await ethers.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.cheaperWithdraw() as TransactionResponse
                const transactionReceipt = await transactionResponse.wait(1) as TransactionReceipt
                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = BigInt(gasUsed) * BigInt(gasPrice)

                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)

                // Assert
                assert.equal(
                    endingFundMeBalance,
                    0n,
                    "FundMe balance is incorrect"
                )
                assert.equal(
                    (startingContractBalance + startingDeployerBalance).toString(),
                    (endingDeployerBalance + gasCost).toString(),
                    "Deployer balance is incorrect"
                )
            });

            it("withdraw ETH from multiple funders", async function () {
                const accounts = await ethers.getSigners()

                for (let account of accounts) {
                    // connect contract to the account
                    const response = await fundMe.connect(account).fund({ value: sendValue })
                }

                // in wei
                const startingContractBalance = await ethers.provider.getBalance(fundMe.getAddress())
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.cheaperWithdraw() as TransactionResponse
                const transactionReceipt = await transactionResponse.wait(1) as TransactionReceipt

                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = BigInt(gasUsed) * BigInt(gasPrice)

                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)

                // Assert
                assert.equal(
                    endingFundMeBalance,
                    0n,
                    "FundMe balance is incorrect"
                )
                assert.equal(
                    (startingContractBalance + startingDeployerBalance).toString(),
                    (endingDeployerBalance + gasCost).toString(),
                    "Deployer balance is incorrect"
                )

                // funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted;

                for (let account of accounts) {
                    assert.equal(
                        await fundMe.getAddressToAmountFunded(account.address),
                        0n,
                        "Funder balance is incorrect"
                    )
                }
            })

            it("only owner is able to withdraw the funds", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]

                // connect() method connects the contract to the account, so we don't have to pass the address. only thing we have to pass as argument is the account.
                const attackerConnectedContract = fundMe.connect(attacker);
                await expect(attackerConnectedContract.cheaperWithdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")

                // const deployerSigner = await ethers.getSigner(deployer)
                // const deplyerConnectedContract = fundMe.connect(deployerSigner)
                // await expect(deplyerConnectedContract.withdraw()).to.not.be.reverted
            })
        })
    })