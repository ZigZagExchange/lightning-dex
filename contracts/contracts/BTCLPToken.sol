//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZapBTCLPToken is ERC20, Ownable {
    event LiquidityRemoved(uint amount, string withdrawalAddress);

    constructor() ERC20("Zap BTC LP Token", "ZBLP") {}

    function mint(address to, uint amountProvided) public onlyOwner {
        _mint(to, amountProvided);
    }

    function removeLiquidity(
        uint amount,
        string memory withdrawalAddress
    ) public {
        _burn(msg.sender, amount);
        emit LiquidityRemoved(amount, withdrawalAddress);
    }
}
