// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
// /** @title this is for crowd funding
//  *  @author Abhishek Chaudhary
//  *  @notice this is a demo contract
//  *  @dev this is a price feed as a library
//  */
error FundMe__NotOwner();  
contract FundMe {
    AggregatorV3Interface public s_priceFeed;
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funder;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    
    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        //require(PriceConverter.getConversionRate(msg.value,s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funder.push(msg.sender);
    }
    
    function getVersion() public view returns (uint256){
        // ETH/USD price feed address of Goerli Network.
        //s_priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return s_priceFeed.version();
    }
    
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funder.length; funderIndex++){
            address funder = s_funder[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funder = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // /^ we use this so not call storage variable s_funder again and again
        address [] memory funderr = s_funder;
        //mappings cant be memory
         for (uint256 funderIndex=0; funderIndex < funderr.length; funderIndex++){
            address funder = funderr[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
         s_funder = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    function getOwner() public view returns(address){
        return i_owner;
    }

    function getFunders(uint256 id) public view returns(address){
        return s_funder[id];
    }

    function getAdressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface){
        return s_priceFeed;
    }
}
