pragma solidity ^0.4.14;

import './SafeMath.sol';

contract TicketSale {
    
    using SafeMath for uint256;
    
    event Purchase(address indexed _seller, address indexed _buyer);
    event AfterMarketPurchase(address indexed _seller, address indexed _buyer);
    
    address public owner;
    uint256 public priceInWei;
    string public name;
    address[] sellers;
    bool public afterMarketIsClosed;
    mapping(address => uint256) tickets;
    mapping(address => uint256) forSale;
    
    function TicketSale(uint256 _supply, uint256 _priceInWei, string _name, bool _enableAfterMarket) public {
        owner = msg.sender;
        tickets[owner] = _supply;
        priceInWei = _priceInWei;
        name = _name;
        afterMarketIsClosed = !_enableAfterMarket;
        // TODO: implement time of the event
    }
    
    function buyTicketFromIssuer() public payable returns (bool) {
        require(tickets[owner] >= 1 && msg.value >= priceInWei);
        
        msg.sender.transfer(msg.value.sub(priceInWei));
        
        tickets[owner] = tickets[owner].sub(1);
        tickets[msg.sender] = tickets[msg.sender].add(1);
        
        Purchase(owner, msg.sender);
        
        return true;
    }
    
    function sellTicket() public returns (bool) {
        require(tickets[msg.sender] >= 1 && afterMarketIsClosed == false);
        
        if (forSale[msg.sender] == 0) {
            sellers.push(msg.sender);
        }
        
        tickets[msg.sender] = tickets[msg.sender].sub(1);
        forSale[msg.sender] = forSale[msg.sender].add(1);
        
        return true;
    }
    
    function buyTicketFromSeller(address buyFrom) public payable returns (bool) {
        require(
            forSale[buyFrom] >= 1 &&
            msg.value >= priceInWei &&
            afterMarketIsClosed == false
        );
        
        msg.sender.transfer(msg.value.sub(priceInWei));
        buyFrom.transfer(priceInWei);
        
        forSale[buyFrom] = forSale[buyFrom].sub(1);
        tickets[msg.sender] = tickets[msg.sender].add(1);
        
        AfterMarketPurchase(buyFrom, msg.sender);
        
        return true;
    }
    
    function buyTicketFromAnySeller() public payable returns (bool) {
        require(afterMarketIsClosed == false);
        
        bool isSucessful = false;
        for (uint index = 0; index < sellers.length; index++) {
            address seller = sellers[index];
            if (forSale[seller] >= 1) {
                buyTicketFromSeller(seller);
                isSucessful = true;
                break;
            }
        }
        
        return isSucessful;
    }
    
    function closeAfterMarket() public returns (bool) {
        require(msg.sender == owner);
        
        if (!afterMarketIsClosed) {
            afterMarketIsClosed = true;
            for (uint index = 0; index < sellers.length; index++) {
                address seller = sellers[index];
                if (forSale[seller] >= 1) {
                    tickets[seller] = tickets[seller].add(forSale[seller]);
                }
            }
        }
        
        return true;
    }
    
    function useTicket() public returns (bool) {
        // TODO: can only use ticket at the after the start of the event
        require(tickets[msg.sender] >= 1);
        tickets[msg.sender] = tickets[msg.sender].sub(1);
        
        return true;
    }
    
    function numberOfTickets() public constant returns (uint256) {
        return tickets[msg.sender];
    }
    
    function haveTicket() public constant returns (bool) {
        return tickets[msg.sender] >= 1;
    }
    
    // TODO: implement a refund all feature
    
    function cashOut() public returns (bool) {
        // TODO: owner can only cash out after 30 days of event
        require(msg.sender == owner);
        owner.transfer(this.balance);
        return true;
    }
    
    function kill() public returns (bool) {
        require(msg.sender == owner);
        selfdestruct(owner);
        return true;
    }

    function ping() public constant returns (string) {
        return "pong";
    }
}
