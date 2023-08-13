//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

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
}
