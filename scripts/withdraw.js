const { getContractAddress } = require("ethers/lib/utils");
const { getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundme = await getContractAddress("FundMe", deployer);
  console.log("funding..");
  const transactionResponse = await fundme.withdraw;
  await transactionResponse.wait(1);
  console.log("got it back");
}
main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
