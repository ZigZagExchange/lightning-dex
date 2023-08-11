//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ZKSyncBridge {
    address public beneficiary;

    event Deposit(
        address initiator,
        address token,
        uint amount,
        string out_chain,
        string out_address
    );

    constructor(address _beneficiary) {
        beneficiary = _beneficiary;
    }

    function depositETH(
        string memory out_chain,
        string memory out_address
    ) public payable {
        emit Deposit(msg.sender, address(0), msg.value, out_chain, out_address);
    }

    function withdraw() public {
        (bool success, ) = payable(beneficiary).call{
            value: address(this).balance
        }(new bytes(0));
        require(success, "Withdraw failed");
    }
}
