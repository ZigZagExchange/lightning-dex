//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZapBTCLPToken is ERC721, Ownable {
    struct Deposit {
        uint timestamp;
        uint amount;
    }

    uint public currentTokenId = 0;
    mapping(uint => Deposit) public deposits;

    event LiquidityRemoved(
        uint tokenId,
        uint amount,
        uint depostedTimestamp,
        string withdrawalAddress
    );

    constructor() ERC721("Zap BTC LP Token", "ZBLP") {}

    function mint(address to, uint amountProvided) public onlyOwner {
        _safeMint(to, currentTokenId);
        deposits[currentTokenId] = Deposit(block.timestamp, amountProvided);
        currentTokenId++;
    }

    function removeLiquidity(
        uint tokenId,
        string memory withdrawalAddress
    ) public {
        _burn(tokenId);
        Deposit memory deposit = deposits[tokenId];
        emit LiquidityRemoved(
            tokenId,
            deposit.amount,
            deposit.timestamp,
            withdrawalAddress
        );
    }
}
