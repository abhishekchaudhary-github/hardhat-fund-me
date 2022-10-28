const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundme = await ethers.getContract("FundMe", deployer);
  console.log("funding contract..");
  const transactionResponse = await fundeMe.fund({
    value: ethers.utils.parseEthers("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Funded");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
