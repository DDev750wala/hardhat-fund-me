import { run } from "hardhat";
 
export async function verify(contractAddress, args: any[]) {
    try {
        await run("verify: verify", {
            address: contractAddress,
            constructorArguments: args
        })
    } catch (error) {
        if (error.message.includes("already") || error.message.includes("verified")) {
            console.log("Contract source code already verified")
        } else {
            console.log(error)
        }
    }
}

