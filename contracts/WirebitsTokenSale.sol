pragma solidity ^0.4.21;

import "./WirebitsToken.sol";

contract WirebitsTokenSale {
    address admin;
    WirebitsToken public tokenContract; //gives us the address we need to set inside our contract
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    function WirebitsTokenSale(WirebitsToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender; //whomever deploys the contract will be the initial admin
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    //This is awesome. DS-Math provides arithmetic functions for the common numerical primitive types of Solidity. You can safely add, subtract, multiply, and divide uint numbers without fear of integer overflow. You can also find the minimum and maximum of two numbers.

    //https://github.com/dapphub/ds-math

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    //This is how users will be able to purchase tokens with Ether
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(this) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    //If the admin ends the sale then any remaining tokens are transfered back into the admin account (account of deployment)
    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

        admin.transfer(address(this).balance);
    }
}
