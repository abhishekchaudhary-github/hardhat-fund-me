const { network } = require("hardhat");

const DECIMALS = "8";
const INITIAL_PRICE = "200000000000"; // 2000
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    //chainID == 31337
    //developmentChains.includes(network.name)
    // chainId =="31337"            ^
    log("local network detected, deploying...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("Mock deployed!");
    log("....Abhishek Chaudhary.....");
  }
};

module.exports.tags = ["all", "mocks"];
