//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BTCBridge {
  address public beneficiary;

  event Deposit(address indexed initiator, address token, uint amount);

  constructor(address _beneficiary) {
    beneficiary = _beneficiary;
  }

  function depositETH() public payable {
    payable(beneficiary).transfer(msg.value);
    emit Deposit(msg.sender, address(0), msg.value);
  }

  function depositERC20(address token, uint amount) public {
    IERC20(token).transferFrom(msg.sender, beneficiary, amount);
    emit Deposit(msg.sender, token, amount);
  }
}
