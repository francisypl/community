const TicketSale = artifacts.require('TicketSale');
const defValues = require('../constants/TicketSale').test;

contract('TicketSale', function(accounts) {
  it('should be deployable', () => {
    return TicketSale.deployed().then(instance => {
      return instance.ping.call();
    })
    .then(returnVal => {
      assert.equal(returnVal, 'pong');
    });
  });

  it('should initialize to the right values', () => {
    var meta;

    return TicketSale.deployed().then(instance => {
      meta = instance;
      return meta.owner();
    })
    .then(ownerAddress => {
      assert.equal(ownerAddress, accounts[0], 'owner not set');
      return meta.priceInWei();
    })
    .then(price => {
      assert.equal(price, defValues.priceInWei, 'price not set');
      return meta.name();
    })
    .then(name => {
      assert.equal(name, defValues.name, 'name not set');
      return meta.afterMarketIsClosed();
    })
    .then(afterMaketIsClosed => {
      assert.equal(afterMaketIsClosed, !defValues.enableAfterMarket, 'market not set');
    });
  });

  it.only('shuold buy a ticket from the issuer', () => {
    var meta, getBalance, contractAddr;
    const owner = accounts[0];
    const buyer = accounts[1];

    return TicketSale.deployed().then(instance => {
      meta = instance;
      getBalance = meta.contract._eth.getBalance; 
      contractAddr = meta.contract.address;
      return meta.owner();
    })
    .then(addr => {
      assert.equal(addr, owner);
      return meta.numberOfTickets.call({ from: buyer });
    })
    .then(numTickets => {
      assert.equal(numTickets, 0);
      return meta.numberOfTickets.call({ from: owner });
    })
    .then((numTickets) => {
      assert.equal(numTickets, defValues.supply);
      return getBalance(contractAddr);
    })
    .then(balance => {
      assert.equal(balance, 0);
      return meta.buyTicketFromIssuer({ from: buyer, value: defValues.priceInWei });
    })
    .then(() => {
      return getBalance(contractAddr);
    })
    .then(balance => {
      assert.equal(balance, defValues.priceInWei);
      return meta.numberOfTickets.call({ from: owner }); 
    })
    .then(numTickets => {
      assert.equal(numTickets, defValues.supply - 1); 
      return meta.numberOfTickets.call({ from: buyer });
    })
    .then(numTickets => {
      assert.equal(numTickets, 1);
    });
  });

  it('shuold buy a ticket from the issuer', () => {
    var meta;

    return TicketSale.deployed().then(instance => {
      meta = instance;
    });
  });
});