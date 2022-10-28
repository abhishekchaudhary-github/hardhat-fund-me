//modecules.export.default = fn
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  //
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  //*

  const FundMe = await deploy("FundMe", {
    from: deployer,
    //^
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmation: network.config.blockChainConfirmations || 1,
  });
  log("-------------");
  // if (!developmentChains.includes(network.name))
  //   await verify(FundMe.address, [ethUsdPriceFeedAddress]);
};
module.exports.tags = ["all", "fundme"];
