// to switch between the various networks according to the chain-id

interface NetworkConfigg {
    [networkId: number]: {
        name: string;
        ethUsdPriceFeed: string;
    };
}

const networkConfig: NetworkConfigg = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
};

export { networkConfig };
