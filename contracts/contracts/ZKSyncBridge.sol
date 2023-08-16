//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ZKSyncBridge is Ownable {
    event Deposit(
        address initiator,
        address token,
        uint amount,
        string out_chain,
        string out_address
    );

    function depositETH(
        string memory out_chain,
        string memory out_address
    ) public payable {
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "deposit failed");
        emit Deposit(msg.sender, address(0), msg.value, out_chain, out_address);
    }

    function depositERC20(
        address token,
        uint amount,
        string memory out_chain,
        string memory out_address
    ) public {
        IERC20(token).transferFrom(msg.sender, owner(), amount);
        emit Deposit(msg.sender, token, amount, out_chain, out_address);
    }
}
