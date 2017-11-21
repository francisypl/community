const TicketSale = artifacts.require('TicketSale');
const defValues = require('../constants/TicketSale').test;

contract('TicketSale', function(accounts) {
  it('should be deployable', () => {
    return TicketSale.deployed().then(instance => {
      return instance.ping.call({ gas: 200000 });
    })
    .then(returnVal => {
      assert.equal(returnVal, 'pong');
    });
  });

  it('should initialize to the right values', () => {
    let meta;

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

  it('should buy a ticket from the issuer', () => {
    let meta, getBalance, contractAddr, purchaseEvent;
    const owner = accounts[0];
    const buyer = accounts[1];

    return TicketSale.deployed().then(instance => {
      meta = instance;
      getBalance = meta.contract._eth.getBalance; 
      purchaseEvent = meta.contract.Purchase();
      contractAddr = meta.contract.address;
      return meta.owner();
    })
    // the owner is set to the default account 0
    .then(addr => {
      assert.equal(addr, owner);
      return meta.numberOfTickets.call({ from: buyer });
    })
    // assert the buyer have 0 tickets
    .then(numTickets => {
      assert.equal(numTickets, 0);
      return meta.numberOfTickets.call({ from: owner });
    })
    // assert the owner have all the tickets avaliable
    .then((numTickets) => {
      assert.equal(numTickets, defValues.supply);
      return getBalance(contractAddr);
    })
    // assert the contract have a no ether
    .then(balance => {
      assert.equal(balance, 0);
      // buyer buys the ticket
      return meta.buyTicketFromIssuer({ from: buyer, value: defValues.priceInWei });
    })
    .then(() => {
      return getBalance(contractAddr);
    })
    // assert the contract balance is equal to the ticket price
    .then(balance => {
      assert.equal(balance, defValues.priceInWei);
      return meta.numberOfTickets.call({ from: owner }); 
    })
    // assert the owner have one less ticket
    .then(numTickets => {
      assert.equal(numTickets, defValues.supply - 1); 
      return meta.numberOfTickets.call({ from: buyer });
    })
    // assert the buy have exactly one ticket
    .then(numTickets => {
      assert.equal(numTickets, 1);
      return purchaseEvent.get();
    })
    // assert a purchase event is logged
    .then(events => {
      assert.equal(events.length, 1);
      const { _seller, _buyer } = events[0].args;
      assert.equal(_seller, owner);
      assert.equal(_buyer, buyer);
    });
  });

  it('should not buy a ticket from the issuer if owner have no more tickets', () => {
    let meta;
    const owner = accounts[0];
    const buyer = accounts[1];
    TicketSale.new([0, 1000, 'test', true]).then(instance => {
      meta = instance;
      return instance.owner.call();;
    })
    // assert the owner is the zero account
    .then(ownerAddress => {
      assert.equal(ownerAddress, owner);
      return meta.numberOfTickets.call({ from: owner });
    })
    // assert that the owner have no tickets
    .then(numTickets => {
      assert.equal(numTickets, 0);
      return meta.buyTicketFromIssuer({ from: buyer, value: defValues.priceInWei });
    })
    // should not reach here because owner have no tickets
    .then(() => {
      assert.fail();
    })
    // an error should be thrown
    .catch(err => {
      assert.equal(true, true);
    });
  });

  it('should not buy a ticket from the issuer if ether attached is less than the ticket price', () => {
    let meta;
    const owner = accounts[0];
    const buyer = accounts[1];
    return TicketSale.deployed().then(instance => {
      meta = instance;
      return meta.buyTicketFromIssuer({ from: buyer, value: defValues.priceInWei - 10000 });
    })
    // should not reach bc ether sent is less than ticket price
    .then(() => {
      assert.fail();
    })
    // an error should be thrown
    .catch(err => {
      assert(true, true);
    });
  });

  it('should buy a ticket from the issuer', () => {
    var meta;

    return TicketSale.deployed().then(instance => {
      meta = instance;
    });
  });
});