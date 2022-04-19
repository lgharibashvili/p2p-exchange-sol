//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProCash is ERC20 {
    constructor(uint256 initialSupply) ERC20("ProCash", "PRC") {
        _mint(msg.sender, initialSupply);
    }
}