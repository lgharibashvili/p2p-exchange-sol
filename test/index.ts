import { expect } from "chai";
import { ethers } from "hardhat";

// run this test using `npx hardhat test`

describe("PeerExchange", function () {
  it("Should exchange between two users", async function () {
    const [john, paul] = await ethers.getSigners();

    // We create two hypothetical currencies ExactCash and ProCash
    // to illustrate how to exchange between two tokens
    const ExactCash = await ethers.getContractFactory("ExactCash");
    const exact = await ExactCash.deploy(1000);
    await exact.deployed();
    // ExactCash is deployed by John, who gets the initial supply
    expect(await exact.balanceOf(john.address)).to.equal(1000);

    const ProCash = await ethers.getContractFactory('ProCash');
    const pro = await ProCash.deploy(1000);
    await pro.deployed();
    await pro.transfer(paul.address, 1000);
    // ProCash is also deployed by John and he receives the initial supply again
    expect(await pro.balanceOf(john.address)).to.equal(0);
    // Later he transfers all of his ProCash to his friend Paul
    expect(await pro.balanceOf(paul.address)).to.equal(1000);

    // PeerExchange is born
    const PeerExchange = await ethers.getContractFactory("PeerExchange");
    const exchange = await PeerExchange.deploy();
    await exchange.deployed();

    // ProCash seems to be doing great (better than ExactCash)
    // John decides to sell some of his ExactCash for ProCash,
    // so he posts a listing on PeerExchange
    await exact.approve(exchange.address, 400);
    await expect(exchange.post(pro.address, exact.address, 300, 400))
      .to.emit(exchange, 'Post')
      .withArgs(1, john.address, pro.address, exact.address, 300, 400);

    // Paul sees a listing on PeerExchange made by John
    // He wants to diversify his portfolio and decides to exchange
    // some of his ProCash for ExactCash
    const exchangeOther = exchange.connect(paul);
    await pro.connect(paul).approve(exchangeOther.address, 300);
    await expect(exchangeOther.trade(1))
      .to.emit(exchange, 'Trade')
      .withArgs(
        john.address, paul.address, pro.address, exact.address, 300, 400);
      
    // 300 ProCash was transferred from Paul to John
    expect(await pro.balanceOf(john.address)).to.equal(300);
    expect(await pro.balanceOf(paul.address)).to.equal(700);
    // and 400 ExactCash was transferred from John to Paul
    expect(await exact.balanceOf(john.address)).to.equal(600);
    expect(await exact.balanceOf(paul.address)).to.equal(400);
  });
});
