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
    var meta;
    const buyer = accounts[1];

    return TicketSale.deployed().then(instance => {
      meta = instance;
      return meta.numberOfTickets.call(buyer, { from: buyer });
    })
    .then(numTickets => {
      console.log('number of tickets =>', numTickets);
      assert.equal(numTickets, 0);
      // return meta.buyTicketFromIssuer.call(buyer);
    })
    // .then(() => {
    //   return meta.numberOfTickets.call(buyer);
    // })
    // .then(numTickets => {
    //   assert.equal(numTickets, 1);
    // });
  });

  it('shuold buy a ticket from the issuer', () => {
    var meta;

    return TicketSale.deployed().then(instance => {
      meta = instance;
    });
  });
});