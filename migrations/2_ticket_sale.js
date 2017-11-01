const TicketSale = artifacts.require("./TicketSale.sol");
const defValues = require('../constants/TicketSale').test;

module.exports = function(deployer) {
  deployer.deploy(TicketSale, defValues.supply, defValues.priceInWei, defValues.name, defValues.enableAfterMarket);
};
