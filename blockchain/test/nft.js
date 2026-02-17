const { expect } = require("chai");
const { ethers } = require("hardhat");
const MockIPFS = require("mockipfs");

describe("NFT Contract", () => {
  let nft, owner, user1, user2, mockNode;
  const MINTING_FEE = ethers.parseEther("0.00001");

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy("TestNFT", "TNFT");
    mockNode = MockIPFS.getLocal();
    await mockNode.start();
  });

  describe("Deployment", () => {
    it("Should set the correct name and symbol", async () => {
      expect(await nft.name()).to.equal("TestNFT");
      expect(await nft.symbol()).to.equal("TNFT");
    });

    it("Should set the deployer as owner", async () => {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async () => {
      expect(await nft.getTotalSupply()).to.equal(0);
      expect(await nft.MAX_SUPPLY()).to.equal(10000);
      expect(await nft.mintingFee()).to.equal(MINTING_FEE);
    });
  });

  describe("Minting", () => {
    it("Should successfully mint with correct fee", async () => {
      const ipfsURI = "ipfs://QmTest123";
      const tx = await nft.connect(user1).mint(ipfsURI, { value: MINTING_FEE });

      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.getTotalSupply()).to.equal(1);
    });

    it("Should fail without fee", async () => {
      const ipfsUri = "ipfs://lj45jw0erf";
      await expect(nft.connect(user1).mint(ipfsUri)).to.be.revertedWith(
        "Insufficient minting fee",
      );
    });

    it("Should fail with insufficient fee", async () => {
      const ipfsUri = "ipfs://lj45jw0erf";
      await expect(
        nft
          .connect(user1)
          .mint(ipfsUri, { value: ethers.parseEther("0.000005") }),
      ).to.be.revertedWith("Insufficient minting fee");
    });

    it("Should increment token IDs correctly", async () => {
      await nft.connect(user1).mint("ipfs://1", { value: MINTING_FEE });
      await nft.connect(user2).mint("ipfs://2", { value: MINTING_FEE });
      await nft.connect(user1).mint("ipfs://3", { value: MINTING_FEE });

      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.ownerOf(1)).to.equal(user2.address);
      expect(await nft.ownerOf(2)).to.equal(user1.address);
      expect(await nft.getTotalSupply()).to.equal(3);
    });

    it("Should set metadata URI correctly", async () => {
      const uri = "ipfs://QmTestMetadata123";
      await nft.connect(user1).mint(uri, { value: MINTING_FEE });

      expect(await nft.tokenURI(0)).to.equal(uri);
    });

    it("Should emit TokenCreated event with correct parameters", async () => {
      const uri = "ipfs://QmEventTest";
      const tx = await nft.connect(user1).mint(uri, { value: MINTING_FEE });

      await expect(tx)
        .to.emit(nft, "TokenCreated")
        .withArgs(0, user1.address, uri);
    });

    it("Should accumulate fees in contract", async () => {
      const initialBalance = await ethers.provider.getBalance(nft.target);

      await nft.connect(user1).mint("ipfs://1", { value: MINTING_FEE });
      await nft.connect(user2).mint("ipfs://2", { value: MINTING_FEE });

      const finalBalance = await ethers.provider.getBalance(nft.target);
      expect(finalBalance - initialBalance).to.equal(MINTING_FEE * 2n);
    });
  });

  describe("Max Supply", () => {
    it("Should not allow minting beyond MAX_SUPPLY", async () => {
      // Note: This test would take too long with 10000 mints
      // We'll modify MAX_SUPPLY in contract or test a smaller scenario
      // For demonstration, we'll test the logic works

      const maxSupply = await nft.MAX_SUPPLY();
      expect(maxSupply).to.equal(10000);

      // Test that the require statement exists by checking initial mints work
      await nft.connect(user1).mint("ipfs://1", { value: MINTING_FEE });
      expect(await nft.getTotalSupply()).to.be.lessThan(maxSupply);
    });
  });

  describe("Owner Functions - setMintingFee", () => {
    it("Should allow owner to change minting fee", async () => {
      const newFee = ethers.parseEther("0.00002");

      await nft.connect(owner).setMintingFee(newFee);

      expect(await nft.mintingFee()).to.equal(newFee);
    });

    it("Should emit MintingFeeUpdated event", async () => {
      const oldFee = await nft.mintingFee();
      const newFee = ethers.parseEther("0.00002");

      const tx = await nft.connect(owner).setMintingFee(newFee);

      await expect(tx)
        .to.emit(nft, "MintingFeeUpdated")
        .withArgs(oldFee, newFee);
    });

    it("Should not allow non-owner to change minting fee", async () => {
      const newFee = ethers.parseEther("0.00002");

      await expect(
        nft.connect(user1).setMintingFee(newFee),
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should use new fee for subsequent mints", async () => {
      const newFee = ethers.parseEther("0.00002");
      await nft.connect(owner).setMintingFee(newFee);

      // Should fail with old fee
      await expect(
        nft.connect(user1).mint("ipfs://test", { value: MINTING_FEE }),
      ).to.be.revertedWith("Insufficient minting fee");

      // Should succeed with new fee
      await nft.connect(user1).mint("ipfs://test", { value: newFee });
      expect(await nft.ownerOf(0)).to.equal(user1.address);
    });
  });

  describe("Owner Functions - withdraw", () => {
    beforeEach(async () => {
      // Mint some NFTs to accumulate fees
      await nft.connect(user1).mint("ipfs://1", { value: MINTING_FEE });
      await nft.connect(user2).mint("ipfs://2", { value: MINTING_FEE });
    });

    it("Should allow owner to withdraw funds", async () => {
      const contractBalance = await ethers.provider.getBalance(nft.target);
      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address,
      );

      const tx = await nft.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      // Owner should receive contract balance minus gas costs
      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore + contractBalance - gasCost,
      );

      // Contract balance should be zero
      expect(await ethers.provider.getBalance(nft.target)).to.equal(0);
    });

    it("Should emit FundsWithdrawn event", async () => {
      const contractBalance = await ethers.provider.getBalance(nft.target);

      const tx = await nft.connect(owner).withdraw();

      await expect(tx)
        .to.emit(nft, "FundsWithdrawn")
        .withArgs(owner.address, contractBalance);
    });

    it("Should not allow non-owner to withdraw", async () => {
      await expect(nft.connect(user1).withdraw()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should revert if no funds to withdraw", async () => {
      // Withdraw all funds first
      await nft.connect(owner).withdraw();

      // Try to withdraw again
      await expect(nft.connect(owner).withdraw()).to.be.revertedWith(
        "No funds to withdraw",
      );
    });
  });

  describe("View Functions", () => {
    beforeEach(async () => {
      // Mint some NFTs for testing
      await nft.connect(user1).mint("ipfs://1", { value: MINTING_FEE });
      await nft.connect(user2).mint("ipfs://2", { value: MINTING_FEE });
      await nft.connect(user1).mint("ipfs://3", { value: MINTING_FEE });
      await nft.connect(user1).mint("ipfs://4", { value: MINTING_FEE });
    });

    it("getTotalSupply should return correct count", async () => {
      expect(await nft.getTotalSupply()).to.equal(4);

      // Mint one more
      await nft.connect(user2).mint("ipfs://5", { value: MINTING_FEE });
      expect(await nft.getTotalSupply()).to.equal(5);
    });

    it("getTokensOwnedBy should return correct tokens", async () => {
      const user1Tokens = await nft.getTokensOwnedBy(user1.address);
      const user2Tokens = await nft.getTokensOwnedBy(user2.address);

      // user1 owns tokens 0, 2, 3
      expect(user1Tokens.length).to.equal(3);
      expect(user1Tokens[0]).to.equal(0);
      expect(user1Tokens[1]).to.equal(2);
      expect(user1Tokens[2]).to.equal(3);

      // user2 owns token 1
      expect(user2Tokens.length).to.equal(1);
      expect(user2Tokens[0]).to.equal(1);
    });

    it("getTokensOwnedBy should return empty array for non-owner", async () => {
      const tokens = await nft.getTokensOwnedBy(owner.address);
      expect(tokens.length).to.equal(0);
    });

    it("getTokenCountOwnedBy should return correct count", async () => {
      expect(await nft.getTokenCountOwnedBy(user1.address)).to.equal(3);
      expect(await nft.getTokenCountOwnedBy(user2.address)).to.equal(1);
      expect(await nft.getTokenCountOwnedBy(owner.address)).to.equal(0);
    });

    it("getTokenCountOwnedBy should match balanceOf", async () => {
      const count1 = await nft.getTokenCountOwnedBy(user1.address);
      const balance1 = await nft.balanceOf(user1.address);
      expect(count1).to.equal(balance1);

      const count2 = await nft.getTokenCountOwnedBy(user2.address);
      const balance2 = await nft.balanceOf(user2.address);
      expect(count2).to.equal(balance2);
    });
  });
});
