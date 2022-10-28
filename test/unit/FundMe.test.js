//import "hardhat/console.sol";
const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("FundMe", async function () {
  //in beforeEach we deploy the thing
  let deployer;
  let FundMe;
  let MockV3Aggregator;
  let sendvalue = ethers.utils.parseEther("1");
  beforeEach(async function () {
    //accounts = await ethers.getSigners()
    //const ac1 = accounts[0]
    //^this to get accounts from HCJ and 10 fake accounts in case of local hardhat
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    //we are deploying the contract
    FundMe = await ethers.getContract("FundMe", deployer);
    MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  //for testing constructor
  describe("constructor", async function () {
    it("sets the aggregate addresses correctly", async function () {
      const response = await FundMe.priceFeed();
      assert.equal(response, MockV3Aggregator.address);
      //^pass pricefeed address to mockv3address
    });
  });

  describe("fund", () => {
    it("fails is enough ether not sent", async () => {
      await expect(FundMe.fund()).to.be.revertedWith("Not enough funds");
    });
    // \^ code to check if we sending the amount is what they get
    it("updated amount funded data structure", async () => {
      await FundMe.fund({ value: sendvalue });
      const response = await FundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendvalue.toString());
    });
    it("Adds funder to the array of funders", async () => {
      await FundMe.fund({ value: sendvalue });
      const sender = await FundMe.funders(0);
      assert.equal(sender, deployer);
    });
  });
  it("Withdraw ETH from single user", async () => {
    //Arrange
    const sFB = await FundMe.provide.getBalance(FundMe.address);
    const sDB = await FundMe.provide.getBalance(deployer);
    //Act
    const x = FundMe.withdraw();
    const receipt = x.wait(1);
    //console.log(receipt);
    const { gasUsed, effectiveGasPrice } = receipt;
    const fFB = await FundMe.provide.getBalance(FundMe.address);
    const fDB = await FundMe.provide.getBalance(deployer);
    //Assert
    assert.equal(fFB, 0);
    assert.equal(
      sFB.add(sDB).toString(),
      fDB.add(gasUsed.mol(effectiveGasPrice)).toString()
    );

    it("multi accounts ETH WITHDRAW", async () => {
      const accounts = await ethers.getSigners();

      for (let i = 1; i < 6; i++) {
        const FundMeConnectedContract = await FundMe.connect(accounts[i]);
        await FundMeConnectedContract.fund({ value: sendvalue });
      }
      //Arrange
      const sFB = await FundMe.provide.getBalance(FundMe.address);
      const sDB = await FundMe.provide.getBalance(deployer);

      //Act
      const x = FundMe.withdraw();
      const receipt = x.wait(1);
      //console.log(receipt);
      const { gasUsed, effectiveGasPrice } = receipt;
      const fFB = await FundMe.provide.getBalance(FundMe.address);
      const fDB = await FundMe.provide.getBalance(deployer);
      //Assert
      assert.equal(fFB, 0);
      assert.equal(
        sFB.add(sDB).toString(),
        fDB.add(gasUsed.mol(effectiveGasPrice)).toString()
      );
      //now reset funders
      //we want account 0 to revert
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await expect(FundMe.addressToAmountFunded(accounts[i].address)),
          0
        );
      }
    });
    it("only owner", async () => {
      const accounts = ethers.getSigners();
      let attacker = accounts[1];
      const attackConnectedContract = await FundMe.connect(attacker.address);
      await expect(attackConnectedContract.withdraw()).to.be.revertedWith(
        "FundMe__NotOwner"
      );
    });
  });
});
