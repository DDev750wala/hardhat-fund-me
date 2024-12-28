import { deployments, ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types/contracts/FundMe";
import { TransactionResponse } from "ethers";

async function main() {
    const deployer = await getNamedAccounts()
    const deployerSigner= await ethers.getSigner(deployer.deployer)

    const fundMe: FundMe = await ethers.getContractAt(
        "FundMe", 
        (await deployments.get("FundMe")).address,
        deployerSigner
        ) as unknown as FundMe;

    console.log("Funding contract...");

    const transactionResponse: TransactionResponse = await fundMe.cheaperWithdraw();
    await transactionResponse.wait(1);
    console.log("Got the money back!");
    
    
}