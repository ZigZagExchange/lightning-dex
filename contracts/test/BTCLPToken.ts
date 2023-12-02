import { Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { ZapBTCLPToken } from "../typechain-types";

describe("LPTokens", () => {
  let tokenContract: ZapBTCLPToken;
  let owner: Signer;
  let user1: Signer;

  beforeEach(async () => {
    const LPTokens = await ethers.getContractFactory("ZapBTCLPToken");
    [owner, user1] = await ethers.getSigners();
    tokenContract = await LPTokens.deploy();
  });
  describe("minting", async () => {
    it("should revert if no owner tried to mint", async () => {
      await expect(
        tokenContract
          .connect(user1)
          .mint(user1.getAddress(), ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should allow owner to mint tokens", async () => {
      await tokenContract
        .connect(owner)
        .mint(user1.getAddress(), ethers.utils.parseEther("1"));
      const postCallUser1Balance = await tokenContract.balanceOf(
        user1.getAddress()
      );
      expect(postCallUser1Balance).to.equal(1);
      const firstTokenOwner = await tokenContract.ownerOf(0);
      expect(firstTokenOwner).to.equal(await user1.getAddress());
      const depositInfo = await tokenContract.deposits(0);
      expect(depositInfo.amount).to.equal(ethers.utils.parseEther("1"));
    });
  });
  describe("removing liquidity", async () => {
    it("should burn the specified token and emit the correct event", async () => {
      // mint use 1 some tokens
      const mintTx = await tokenContract
        .connect(owner)
        .mint(user1.getAddress(), ethers.utils.parseEther("100"));
      const removeLiquidityTx = await tokenContract.removeLiquidity(
        0,
        "BTC_ADDRESS"
      );
      expect(removeLiquidityTx)
        .to.emit(tokenContract, "LiquidityRemoved")
        .withArgs(
          ethers.utils.parseEther("100"),
          mintTx.timestamp,
          "BTC_ADDRESS"
        );
      const postRemoveUserTokenBalance = await tokenContract.balanceOf(
        user1.getAddress()
      );
      expect(postRemoveUserTokenBalance).to.equal(0);
      await expect(tokenContract.ownerOf(0)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });
  });
});
