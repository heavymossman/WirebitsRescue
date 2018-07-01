var WirebitsToken = artifacts.require("./WirebitsToken.sol");
var WirebitsTokenSale = artifacts.require("./WirebitsTokenSale.sol");

//This deploy our contracts and set the initial supply to a million and the token price for the ICO

module.exports = function(deployer) {
  deployer.deploy(WirebitsToken, 10000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 10000000000000000; //Converts to 0.01 ether or $4.54
    return deployer.deploy(WirebitsTokenSale, WirebitsToken.address, tokenPrice);
  });
};
