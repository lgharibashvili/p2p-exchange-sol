//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/*
BUY 10 EXACT FOR 8 PRO; RATE=125
BUY 8 PRO FOR 11 EXACT; RATE=73
*/

struct Order {
    address sender;
    address buyToken;
    address sellToken;
    uint buyAmount;
    uint sellAmount;
}

enum Side { BUY, SELL }

contract PeerExchange {
    event Trade(
        address party1, address party2,
        address indexed token1, address indexed token2,
        uint amount1, uint amount2);
    event Post(
        uint indexed postId, address sender,
        address indexed buyToken, address indexed sellToken,
        uint buyAmount, uint sellAmount);

    using SafeERC20 for IERC20;

    mapping(uint => Order) public orders;
    uint private counter = 0;

    function post(
            address buyToken, address sellToken, uint buyAmount,
            uint sellAmount) public {
        counter += 1;
        orders[counter] = Order(
            msg.sender, buyToken, sellToken, buyAmount, sellAmount);
        IERC20(sellToken).safeTransferFrom(
            msg.sender, address(this), sellAmount);
        emit Post(
            counter, msg.sender, buyToken, sellToken, buyAmount, sellAmount);
    }

    function trade(uint postId) public {
        Order storage order = orders[postId];
        if (order.buyAmount == 0) {
            revert("order not found");
        }
        IERC20(order.buyToken).safeTransferFrom(
            msg.sender, order.sender, order.buyAmount);
        IERC20(order.sellToken).safeTransfer(msg.sender, order.sellAmount);
        emit Trade(order.sender, msg.sender, order.buyToken, order.sellToken,
            order.buyAmount, order.sellAmount);
        delete orders[counter];
    }
}
