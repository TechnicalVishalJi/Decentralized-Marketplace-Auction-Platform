const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Marketplace Contract - Comprehensive Test Suite", function () {
  let marketplace, nft;
  let owner, user1, user2, user3, user4;
  let LISTING_FEE, AUCTION_FEE;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3, user4] = await ethers.getSigners();

    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy("Test NFT", "TNFT");

    // Deploy Marketplace contract
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();

    // Get fee values
    LISTING_FEE = await marketplace.listingFee();
    AUCTION_FEE = await marketplace.auctionFee();

    // Mint NFTs for testing
    await nft
      .connect(user1)
      .mint("ipfs://token1", { value: ethers.parseEther("0.00001") });
    await nft
      .connect(user1)
      .mint("ipfs://token2", { value: ethers.parseEther("0.00001") });
    await nft
      .connect(user2)
      .mint("ipfs://token3", { value: ethers.parseEther("0.00001") });
    await nft
      .connect(user2)
      .mint("ipfs://token4", { value: ethers.parseEther("0.00001") });
  });

  // ============================================================================
  // 1. SETUP & DEPLOYMENT TESTS
  // ============================================================================

  describe("1. Contract Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(marketplace.target).to.be.properAddress;
    });

    it("Should set owner correctly", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should set fee recipient to deployer", async function () {
      expect(await marketplace.feeRecipient()).to.equal(owner.address);
    });

    it("Should set initial listing fee to 0.001 ETH", async function () {
      expect(await marketplace.listingFee()).to.equal(
        ethers.parseEther("0.001"),
      );
    });

    it("Should set initial auction fee to 0.002 ETH", async function () {
      expect(await marketplace.auctionFee()).to.equal(
        ethers.parseEther("0.002"),
      );
    });

    it("Should initialize counters to 0", async function () {
      expect(await marketplace.listingCounter()).to.equal(0);
      expect(await marketplace.auctionCounter()).to.equal(0);
    });

    it("Should initialize accumulated fees to 0", async function () {
      expect(await marketplace.accumulatedFees()).to.equal(0);
    });
  });

  // ============================================================================
  // 2-4. PAYMENT SYSTEM TESTS
  // ============================================================================

  describe("2. Deposit Function", function () {
    it("Should allow user to deposit ETH", async function () {
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("1") });
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );
    });

    it("Should increase balance correctly", async function () {
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("0.5") });
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("0.5"),
      );
    });

    it("Should emit FundsDeposited event", async function () {
      await expect(
        marketplace.connect(user1).deposit({ value: ethers.parseEther("1") }),
      )
        .to.emit(marketplace, "FundsDeposited")
        .withArgs(user1.address, ethers.parseEther("1"));
    });

    it("Should accumulate multiple deposits", async function () {
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("0.5") });
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("0.3") });
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("0.8"),
      );
    });

    it("Should fail when depositing 0 ETH", async function () {
      await expect(
        marketplace.connect(user1).deposit({ value: 0 }),
      ).to.be.revertedWith("Deposit amount must be greater than zero");
    });

    it("Should work independently for multiple users", async function () {
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("1") });
      await marketplace
        .connect(user2)
        .deposit({ value: ethers.parseEther("2") });

      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );
      expect(await marketplace.getBalanceOfUser(user2.address)).to.equal(
        ethers.parseEther("2"),
      );
    });
  });

  describe("3. Withdraw Function", function () {
    beforeEach(async function () {
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("2") });
    });

    it("Should allow user to withdraw their balance", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await marketplace
        .connect(user1)
        .withdraw(ethers.parseEther("1"));
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter - balanceBefore + gasCost).to.equal(
        ethers.parseEther("1"),
      );
    });

    it("Should decrease balance correctly", async function () {
      await marketplace.connect(user1).withdraw(ethers.parseEther("1"));
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );
    });

    it("Should emit FundsWithdrawn event", async function () {
      await expect(marketplace.connect(user1).withdraw(ethers.parseEther("1")))
        .to.emit(marketplace, "FundsWithdrawn")
        .withArgs(user1.address, ethers.parseEther("1"));
    });

    it("Should allow partial withdrawal", async function () {
      await marketplace.connect(user1).withdraw(ethers.parseEther("0.5"));
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1.5"),
      );
    });

    it("Should allow full withdrawal", async function () {
      await marketplace.connect(user1).withdraw(ethers.parseEther("2"));
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(0);
    });

    it("Should fail when withdrawing 0 amount", async function () {
      await expect(marketplace.connect(user1).withdraw(0)).to.be.revertedWith(
        "Withdrawal amount must be greater than zero",
      );
    });

    it("Should fail when withdrawing more than balance", async function () {
      await expect(
        marketplace.connect(user1).withdraw(ethers.parseEther("3")),
      ).to.be.revertedWith(
        "Withdrawal amount must be less than account balance",
      );
    });

    it("Should fail when balance is 0", async function () {
      await expect(
        marketplace.connect(user2).withdraw(ethers.parseEther("1")),
      ).to.be.revertedWith(
        "Withdrawal amount must be less than account balance",
      );
    });
  });

  // ============================================================================
  // 5-10. FIXED-PRICE LISTING TESTS
  // ============================================================================

  describe("5-6. List NFT - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
    });

    it("Should list NFT with ETH fee payment", async function () {
      const tx = await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });

      const listing = await marketplace.listings(0);
      expect(listing.seller).to.equal(user1.address);
      expect(listing.price).to.equal(ethers.parseEther("1"));
      expect(listing.active).to.be.true;
    });

    it("Should list NFT with balance fee payment", async function () {
      await marketplace.connect(user1).deposit({ value: LISTING_FEE });

      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), true);

      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.true;
    });

    it("Should increment listing ID correctly", async function () {
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
      expect(await marketplace.listingCounter()).to.equal(1);

      await nft.connect(user1).approve(marketplace.target, 1);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 1, ethers.parseEther("2"), false, {
          value: LISTING_FEE,
        });
      expect(await marketplace.listingCounter()).to.equal(2);
    });

    it("Should emit NFTListed event", async function () {
      await expect(
        marketplace
          .connect(user1)
          .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
            value: LISTING_FEE,
          }),
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(0, user1.address, nft.target, 0, ethers.parseEther("1"));
    });

    it("Should accumulate listing fee", async function () {
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
      expect(await marketplace.accumulatedFees()).to.equal(LISTING_FEE);
    });

    it("Should refund excess ETH to balance", async function () {
      const excess = ethers.parseEther("0.01");
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE + excess,
        });

      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        excess,
      );
    });

    it("Should allow multiple listings by same user", async function () {
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });

      await nft.connect(user1).approve(marketplace.target, 1);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 1, ethers.parseEther("2"), false, {
          value: LISTING_FEE,
        });

      expect(await marketplace.listingCounter()).to.equal(2);
    });

    it("Should work with operator approval (isApprovedForAll)", async function () {
      await nft.connect(user1).setApprovalForAll(marketplace.target, true);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });

      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.true;
    });

    it("Should fail without NFT ownership", async function () {
      await expect(
        marketplace
          .connect(user2)
          .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
            value: LISTING_FEE,
          }),
      ).to.be.revertedWith("Not the owner");
    });

    it("Should fail without marketplace approval", async function () {
      await nft.connect(user2).approve(ethers.ZeroAddress, 2);
      await expect(
        marketplace
          .connect(user2)
          .listNFT(nft.target, 2, ethers.parseEther("1"), false, {
            value: LISTING_FEE,
          }),
      ).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail with price = 0", async function () {
      await expect(
        marketplace
          .connect(user1)
          .listNFT(nft.target, 0, 0, false, { value: LISTING_FEE }),
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should fail with insufficient fee (ETH)", async function () {
      await expect(
        marketplace
          .connect(user1)
          .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
            value: LISTING_FEE / 2n,
          }),
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail with insufficient balance", async function () {
      await expect(
        marketplace
          .connect(user1)
          .listNFT(nft.target, 0, ethers.parseEther("1"), true),
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail when sending ETH with balance payment", async function () {
      await marketplace.connect(user1).deposit({ value: LISTING_FEE });
      await expect(
        marketplace
          .connect(user1)
          .listNFT(nft.target, 0, ethers.parseEther("1"), true, {
            value: LISTING_FEE,
          }),
      ).to.be.revertedWith("Cannot send ETH when using balance");
    });
  });

  describe("7-8. Buy NFT - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
    });

    it("Should buy with exact ETH amount", async function () {
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });
      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should buy with excess ETH (refund to balance)", async function () {
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1.5") });
      expect(await marketplace.getBalanceOfUser(user2.address)).to.equal(
        ethers.parseEther("0.5"),
      );
    });

    it("Should buy with marketplace balance", async function () {
      await marketplace
        .connect(user2)
        .deposit({ value: ethers.parseEther("1") });
      await marketplace.connect(user2).buyNFT(0, true);
      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should transfer NFT to buyer", async function () {
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });
      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should add payment to seller's balance", async function () {
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );
    });

    it("Should mark listing as inactive", async function () {
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });
      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should emit NFTSold event", async function () {
      await expect(
        marketplace
          .connect(user2)
          .buyNFT(0, false, { value: ethers.parseEther("1") }),
      )
        .to.emit(marketplace, "NFTSold")
        .withArgs(0, user2.address, user1.address, ethers.parseEther("1"));
    });

    it("Should fail on inactive listing", async function () {
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });
      await expect(
        marketplace
          .connect(user3)
          .buyNFT(0, false, { value: ethers.parseEther("1") }),
      ).to.be.revertedWith("Listing has been sold or doesn't exist");
    });

    it("Should fail with insufficient ETH", async function () {
      await expect(
        marketplace
          .connect(user2)
          .buyNFT(0, false, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail with insufficient balance", async function () {
      await expect(
        marketplace.connect(user2).buyNFT(0, true),
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail when sending ETH with balance payment", async function () {
      await marketplace
        .connect(user2)
        .deposit({ value: ethers.parseEther("1") });
      await expect(
        marketplace
          .connect(user2)
          .buyNFT(0, true, { value: ethers.parseEther("1") }),
      ).to.be.revertedWith("Cannot send ETH when using balance");
    });
  });

  describe("9-10. Cancel Listing - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
    });

    it("Should allow seller to cancel own listing", async function () {
      await marketplace.connect(user1).cancelListing(0);
      const listing = await marketplace.listings(0);
      expect(listing.active).to.be.false;
    });

    it("Should emit ListingCancelled event", async function () {
      await expect(marketplace.connect(user1).cancelListing(0))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(0);
    });

    it("Should allow listing again after cancellation", async function () {
      await marketplace.connect(user1).cancelListing(0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("2"), false, {
          value: LISTING_FEE,
        });

      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.true;
    });

    it("Should fail when non-seller tries to cancel", async function () {
      await expect(
        marketplace.connect(user2).cancelListing(0),
      ).to.be.revertedWith("Only seller can cancel listing");
    });

    it("Should fail when cancelling inactive listing", async function () {
      await marketplace.connect(user1).cancelListing(0);
      await expect(
        marketplace.connect(user1).cancelListing(0),
      ).to.be.revertedWith("No such Listing");
    });
  });

  // ============================================================================
  // 11-21. AUCTION TESTS
  // ============================================================================

  describe("11-12. Create Auction - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
    });

    it("Should create auction with ETH fee", async function () {
      await marketplace.connect(user1).createAuction(
        nft.target,
        0,
        ethers.parseEther("0.5"),
        86400, // 1 day
        false,
        { value: AUCTION_FEE },
      );

      const auction = await marketplace.auctions(0);
      expect(auction.seller).to.equal(user1.address);
      expect(auction.startingPrice).to.equal(ethers.parseEther("0.5"));
    });

    it("Should create auction with balance fee", async function () {
      await marketplace.connect(user1).deposit({ value: AUCTION_FEE });
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, true);

      const auction = await marketplace.auctions(0);
      expect(auction.seller).to.equal(user1.address);
    });

    it("Should increment auction ID correctly", async function () {
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
      expect(await marketplace.auctionCounter()).to.equal(1);
    });

    it("Should calculate end time correctly", async function () {
      const duration = 86400;
      const tx = await marketplace
        .connect(user1)
        .createAuction(
          nft.target,
          0,
          ethers.parseEther("0.5"),
          duration,
          false,
          { value: AUCTION_FEE },
        );
      const block = await ethers.provider.getBlock(tx.blockNumber);

      const auction = await marketplace.auctions(0);
      expect(auction.endTime).to.equal(block.timestamp + duration);
    });

    it("Should emit AuctionCreated event", async function () {
      const duration = 86400;
      const tx = await marketplace
        .connect(user1)
        .createAuction(
          nft.target,
          0,
          ethers.parseEther("0.5"),
          duration,
          false,
          { value: AUCTION_FEE },
        );
      const block = await ethers.provider.getBlock(tx.blockNumber);
      const expectedEndTime = block.timestamp + duration;

      await expect(tx)
        .to.emit(marketplace, "AuctionCreated")
        .withArgs(
          0,
          user1.address,
          nft.target,
          0,
          ethers.parseEther("0.5"),
          expectedEndTime,
        );
    });

    it("Should accumulate auction fee", async function () {
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
      expect(await marketplace.accumulatedFees()).to.equal(AUCTION_FEE);
    });

    it("Should fail without NFT ownership", async function () {
      await expect(
        marketplace
          .connect(user2)
          .createAuction(
            nft.target,
            0,
            ethers.parseEther("0.5"),
            86400,
            false,
            { value: AUCTION_FEE },
          ),
      ).to.be.revertedWith("Not the owner");
    });

    it("Should fail without marketplace approval", async function () {
      await nft.connect(user2).approve(ethers.ZeroAddress, 2);
      await expect(
        marketplace
          .connect(user2)
          .createAuction(
            nft.target,
            2,
            ethers.parseEther("0.5"),
            86400,
            false,
            { value: AUCTION_FEE },
          ),
      ).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail with startingPrice = 0", async function () {
      await expect(
        marketplace
          .connect(user1)
          .createAuction(nft.target, 0, 0, 86400, false, {
            value: AUCTION_FEE,
          }),
      ).to.be.revertedWith("Price should not be zero");
    });

    it("Should fail with duration = 0", async function () {
      await expect(
        marketplace
          .connect(user1)
          .createAuction(nft.target, 0, ethers.parseEther("0.5"), 0, false, {
            value: AUCTION_FEE,
          }),
      ).to.be.revertedWith("Duration should not be zero");
    });

    it("Should fail with insufficient fee", async function () {
      await expect(
        marketplace
          .connect(user1)
          .createAuction(
            nft.target,
            0,
            ethers.parseEther("0.5"),
            86400,
            false,
            { value: AUCTION_FEE / 2n },
          ),
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("13-15. Place Bid - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
    });

    it("Should accept first bid at starting price (ETH)", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      const auction = await marketplace.auctions(0);
      expect(auction.highestBid).to.equal(ethers.parseEther("0.5"));
      expect(auction.highestBidder).to.equal(user2.address);
    });

    it("Should accept first bid above starting price (ETH)", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("1") });

      const auction = await marketplace.auctions(0);
      expect(auction.highestBid).to.equal(ethers.parseEther("1"));
    });

    it("Should accept higher bid from different user", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });
      await marketplace
        .connect(user3)
        .placeBid(0, 0, false, { value: ethers.parseEther("1") });

      const auction = await marketplace.auctions(0);
      expect(auction.highestBidder).to.equal(user3.address);
    });

    it("Should refund previous bidder to balance", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });
      await marketplace
        .connect(user3)
        .placeBid(0, 0, false, { value: ethers.parseEther("1") });

      expect(await marketplace.getBalanceOfUser(user2.address)).to.equal(
        ethers.parseEther("0.5"),
      );
    });

    it("Should emit BidPlaced event", async function () {
      await expect(
        marketplace
          .connect(user2)
          .placeBid(0, 0, false, { value: ethers.parseEther("0.5") }),
      )
        .to.emit(marketplace, "BidPlaced")
        .withArgs(0, user2.address, ethers.parseEther("0.5"));
    });

    it("Should accept bid using marketplace balance", async function () {
      await marketplace
        .connect(user2)
        .deposit({ value: ethers.parseEther("1") });
      await marketplace
        .connect(user2)
        .placeBid(0, ethers.parseEther("0.5"), true);

      const auction = await marketplace.auctions(0);
      expect(auction.highestBidder).to.equal(user2.address);
      expect(await marketplace.getBalanceOfUser(user2.address)).to.equal(
        ethers.parseEther("0.5"),
      );
    });

    it("Should fail on cancelled auction", async function () {
      await marketplace.connect(user1).cancelAuction(0);
      await expect(
        marketplace
          .connect(user2)
          .placeBid(0, 0, false, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Auction cancelled");
    });

    it("Should fail on ended auction", async function () {
      await time.increase(86401); // Move past end time
      await expect(
        marketplace
          .connect(user2)
          .placeBid(0, 0, false, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Auction has been ended or doesn't exist");
    });

    it("Should fail with bid below starting price", async function () {
      await expect(
        marketplace
          .connect(user2)
          .placeBid(0, 0, false, { value: ethers.parseEther("0.1") }),
      ).to.be.revertedWith("Insufficient Payment");
    });

    it("Should fail with bid equal to current highest", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });
      await expect(
        marketplace
          .connect(user3)
          .placeBid(0, 0, false, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Insufficient Payment");
    });

    it("Should fail with bid lower than current highest", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("1") });
      await expect(
        marketplace
          .connect(user3)
          .placeBid(0, 0, false, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Insufficient Payment");
    });

    it("Should fail when sending ETH with balance payment", async function () {
      await marketplace
        .connect(user2)
        .deposit({ value: ethers.parseEther("1") });
      await expect(
        marketplace.connect(user2).placeBid(0, ethers.parseEther("0.5"), true, {
          value: ethers.parseEther("0.5"),
        }),
      ).to.be.revertedWith("Cannot send ETH when using balance");
    });

    it("Should fail with bidAmount=0 when using balance", async function () {
      await marketplace
        .connect(user2)
        .deposit({ value: ethers.parseEther("1") });
      await expect(
        marketplace.connect(user2).placeBid(0, 0, true),
      ).to.be.revertedWith("Bid amount must be specified when using balance");
    });

    it("Should fail with bidAmount>0 when using ETH", async function () {
      await expect(
        marketplace
          .connect(user2)
          .placeBid(0, ethers.parseEther("0.5"), false, {
            value: ethers.parseEther("0.5"),
          }),
      ).to.be.revertedWith("Bid amount should be 0 when sending ETH");
    });
  });

  describe("16-17. Claim NFT - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("1") });
    });

    it("Should allow winner to claim after auction ends", async function () {
      await time.increase(86401);
      await marketplace.connect(user2).claimNFT(0);

      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should transfer NFT to winner", async function () {
      await time.increase(86401);
      await marketplace.connect(user2).claimNFT(0);

      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should add payment to seller's balance", async function () {
      await time.increase(86401);
      await marketplace.connect(user2).claimNFT(0);

      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );
    });

    it("Should set claimed flag to true", async function () {
      await time.increase(86401);
      await marketplace.connect(user2).claimNFT(0);

      const auction = await marketplace.auctions(0);
      expect(auction.claimed).to.be.true;
    });

    it("Should emit AuctionFinalized event", async function () {
      await time.increase(86401);
      await expect(marketplace.connect(user2).claimNFT(0))
        .to.emit(marketplace, "AuctionFinalized")
        .withArgs(0, user2.address, ethers.parseEther("1"));
    });

    it("Should fail before auction ends", async function () {
      await expect(marketplace.connect(user2).claimNFT(0)).to.be.revertedWith(
        "Auction hasn't ended",
      );
    });

    it("Should fail when non-winner tries to claim", async function () {
      await time.increase(86401);
      await expect(marketplace.connect(user3).claimNFT(0)).to.be.revertedWith(
        "Only Winner can claim",
      );
    });

    it("Should fail when claiming already claimed auction", async function () {
      await time.increase(86401);
      await marketplace.connect(user2).claimNFT(0);

      await expect(marketplace.connect(user2).claimNFT(0)).to.be.revertedWith(
        "Already claimed",
      );
    });

    it("Should fail on cancelled auction", async function () {
      // Create new auction without bids
      await nft.connect(user1).approve(marketplace.target, 1);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 1, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
      await marketplace.connect(user1).cancelAuction(1);

      await time.increase(86401);
      await expect(marketplace.connect(user2).claimNFT(1)).to.be.revertedWith(
        "Auction cancelled",
      );
    });
  });

  describe("18-19. Change Auction End Time - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
    });

    it("Should allow seller to extend auction (no bids)", async function () {
      const currentTime = await time.latest();
      const newEndTime = currentTime + 172800; // 2 days

      await marketplace.connect(user1).changeAuctionEndTime(0, newEndTime);

      const auction = await marketplace.auctions(0);
      expect(auction.endTime).to.equal(newEndTime);
    });

    it("Should allow seller to shorten auction (no bids)", async function () {
      const currentTime = await time.latest();
      const newEndTime = currentTime + 43200; // 12 hours

      await marketplace.connect(user1).changeAuctionEndTime(0, newEndTime);

      const auction = await marketplace.auctions(0);
      expect(auction.endTime).to.equal(newEndTime);
    });

    it("Should emit AuctionEndTimeChanged event", async function () {
      const auction = await marketplace.auctions(0);
      const oldEndTime = auction.endTime;
      const currentTime = await time.latest();
      const newEndTime = currentTime + 172800;

      await expect(
        marketplace.connect(user1).changeAuctionEndTime(0, newEndTime),
      )
        .to.emit(marketplace, "AuctionEndTimeChanged")
        .withArgs(0, oldEndTime, newEndTime);
    });

    it("Should fail when non-seller tries to change", async function () {
      const currentTime = await time.latest();
      const newEndTime = currentTime + 172800;

      await expect(
        marketplace.connect(user2).changeAuctionEndTime(0, newEndTime),
      ).to.be.revertedWith("Only Auction owner can do this");
    });

    it("Should fail after bids placed", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      const currentTime = await time.latest();
      const newEndTime = currentTime + 172800;

      await expect(
        marketplace.connect(user1).changeAuctionEndTime(0, newEndTime),
      ).to.be.revertedWith("Cannot change after bids placed");
    });

    it("Should fail when changing to past time", async function () {
      const currentTime = await time.latest();
      const pastTime = currentTime - 1000;

      await expect(
        marketplace.connect(user1).changeAuctionEndTime(0, pastTime),
      ).to.be.revertedWith("EndTime has gone");
    });

    it("Should fail when changing to time > 30 days from now", async function () {
      const currentTime = await time.latest();
      const farFuture = currentTime + 31 * 24 * 60 * 60; // 31 days

      await expect(
        marketplace.connect(user1).changeAuctionEndTime(0, farFuture),
      ).to.be.revertedWith("Extension too long");
    });
  });

  describe("20-21. Cancel Auction - Success & Failure Cases", function () {
    beforeEach(async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
    });

    it("Should allow seller to cancel before bids", async function () {
      await marketplace.connect(user1).cancelAuction(0);

      const auction = await marketplace.auctions(0);
      expect(auction.cancelled).to.be.true;
    });

    it("Should set cancelled flag to true", async function () {
      await marketplace.connect(user1).cancelAuction(0);

      const auction = await marketplace.auctions(0);
      expect(auction.cancelled).to.be.true;
    });

    it("Should emit AuctionCancelled event", async function () {
      await expect(marketplace.connect(user1).cancelAuction(0))
        .to.emit(marketplace, "AuctionCancelled")
        .withArgs(0);
    });

    it("Should fail when non-seller tries to cancel", async function () {
      await expect(
        marketplace.connect(user2).cancelAuction(0),
      ).to.be.revertedWith("Only Auction owner can cancel");
    });

    it("Should fail after bids placed", async function () {
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      await expect(
        marketplace.connect(user1).cancelAuction(0),
      ).to.be.revertedWith("Cannot cancel after bids placed");
    });

    it("Should fail when cancelling already cancelled auction", async function () {
      await marketplace.connect(user1).cancelAuction(0);

      await expect(
        marketplace.connect(user1).cancelAuction(0),
      ).to.be.revertedWith("Auction cancelled");
    });

    it("Should fail when cancelling ended auction", async function () {
      await time.increase(86401);

      await expect(
        marketplace.connect(user1).cancelAuction(0),
      ).to.be.revertedWith("Auction already ended or doesn't exist");
    });
  });

  // ============================================================================
  // 22-26. ADMIN/OWNER TESTS
  // ============================================================================

  describe("22. Set Listing Fee", function () {
    it("Should allow owner to change listing fee", async function () {
      const newFee = ethers.parseEther("0.002");
      await marketplace.connect(owner).setListingFee(newFee);

      expect(await marketplace.listingFee()).to.equal(newFee);
    });

    it("Should emit ListingFeeUpdated event", async function () {
      const oldFee = await marketplace.listingFee();
      const newFee = ethers.parseEther("0.002");

      await expect(marketplace.connect(owner).setListingFee(newFee))
        .to.emit(marketplace, "ListingFeeUpdated")
        .withArgs(oldFee, newFee);
    });

    it("Should apply new fee to new listings", async function () {
      const newFee = ethers.parseEther("0.002");
      await marketplace.connect(owner).setListingFee(newFee);

      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: newFee,
        });

      expect(await marketplace.accumulatedFees()).to.equal(newFee);
    });

    it("Should fail when non-owner tries to change fee", async function () {
      await expect(
        marketplace.connect(user1).setListingFee(ethers.parseEther("0.002")),
      ).to.be.revertedWithCustomError(
        marketplace,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should fail when fee > 0.01 ETH", async function () {
      await expect(
        marketplace.connect(owner).setListingFee(ethers.parseEther("0.011")),
      ).to.be.revertedWith("Listing fee cannot exceed 0.01 ETH");
    });
  });

  describe("23. Set Auction Fee", function () {
    it("Should allow owner to change auction fee", async function () {
      const newFee = ethers.parseEther("0.003");
      await marketplace.connect(owner).setAuctionFee(newFee);

      expect(await marketplace.auctionFee()).to.equal(newFee);
    });

    it("Should emit AuctionFeeUpdated event", async function () {
      const oldFee = await marketplace.auctionFee();
      const newFee = ethers.parseEther("0.003");

      await expect(marketplace.connect(owner).setAuctionFee(newFee))
        .to.emit(marketplace, "AuctionFeeUpdated")
        .withArgs(oldFee, newFee);
    });

    it("Should fail when non-owner tries to change fee", async function () {
      await expect(
        marketplace.connect(user1).setAuctionFee(ethers.parseEther("0.003")),
      ).to.be.revertedWithCustomError(
        marketplace,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should fail when fee > 0.02 ETH", async function () {
      await expect(
        marketplace.connect(owner).setAuctionFee(ethers.parseEther("0.021")),
      ).to.be.revertedWith("Auction fee cannot exceed 0.02 ETH");
    });
  });

  describe("24. Set Fee Recipient", function () {
    it("Should allow owner to change fee recipient", async function () {
      await marketplace.connect(owner).setFeeRecipient(user1.address);
      expect(await marketplace.feeRecipient()).to.equal(user1.address);
    });

    it("Should emit FeeRecipientUpdated event", async function () {
      await expect(marketplace.connect(owner).setFeeRecipient(user1.address))
        .to.emit(marketplace, "FeeRecipientUpdated")
        .withArgs(owner.address, user1.address);
    });

    it("Should send fees to new recipient", async function () {
      // Accumulate some fees
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });

      // Change recipient
      await marketplace.connect(owner).setFeeRecipient(user2.address);

      // Withdraw fees
      const balanceBefore = await ethers.provider.getBalance(user2.address);
      await marketplace.connect(owner).withdrawFees();
      const balanceAfter = await ethers.provider.getBalance(user2.address);

      expect(balanceAfter - balanceBefore).to.equal(LISTING_FEE);
    });

    it("Should fail when non-owner tries to change recipient", async function () {
      await expect(
        marketplace.connect(user1).setFeeRecipient(user2.address),
      ).to.be.revertedWithCustomError(
        marketplace,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should fail when setting to zero address", async function () {
      await expect(
        marketplace.connect(owner).setFeeRecipient(ethers.ZeroAddress),
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("25. Withdraw Fees", function () {
    beforeEach(async function () {
      // Accumulate some fees
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
    });

    it("Should allow owner to withdraw accumulated fees", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter - balanceBefore + gasCost).to.equal(LISTING_FEE);
    });

    it("Should reset accumulated fees to 0", async function () {
      await marketplace.connect(owner).withdrawFees();
      expect(await marketplace.accumulatedFees()).to.equal(0);
    });

    it("Should emit FeesWithdrawn event", async function () {
      await expect(marketplace.connect(owner).withdrawFees()).to.emit(
        marketplace,
        "FeesWithdrawn",
      );
    });

    it("Should fail when non-owner tries to withdraw", async function () {
      await expect(
        marketplace.connect(user1).withdrawFees(),
      ).to.be.revertedWithCustomError(
        marketplace,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should fail when no fees accumulated", async function () {
      await marketplace.connect(owner).withdrawFees();
      await expect(
        marketplace.connect(owner).withdrawFees(),
      ).to.be.revertedWith("No fees to withdraw");
    });
  });

  // ============================================================================
  // 35-38. INTEGRATION TESTS
  // ============================================================================

  describe("35-38. Integration Tests", function () {
    it("Complete listing flow: Deposit → List → Buy → Withdraw", async function () {
      // Deposit
      await marketplace.connect(user1).deposit({ value: LISTING_FEE });

      // List with balance
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), true);

      // Buy with ETH
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });

      // Seller withdraws
      await marketplace.connect(user1).withdraw(ethers.parseEther("1"));

      // Verify final state
      expect(await nft.ownerOf(0)).to.equal(user2.address);
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(0);
    });

    it("Complete auction flow: Create → Bid → Bid → Claim → Withdraw", async function () {
      // Create auction
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });

      // First bid
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      // Second bid (higher)
      await marketplace
        .connect(user3)
        .placeBid(0, 0, false, { value: ethers.parseEther("1") });

      // Wait for auction to end
      await time.increase(86401);

      // Winner claims
      await marketplace.connect(user3).claimNFT(0);

      // Seller withdraws
      await marketplace.connect(user1).withdraw(ethers.parseEther("1"));

      // Verify final state
      expect(await nft.ownerOf(0)).to.equal(user3.address);
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(0);
      expect(await marketplace.getBalanceOfUser(user2.address)).to.equal(
        ethers.parseEther("0.5"),
      ); // Refunded
    });

    it("Fee collection flow: Multiple operations → Withdraw fees", async function () {
      // List NFT (fee)
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });

      // Create auction (fee)
      await nft.connect(user1).approve(marketplace.target, 1);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 1, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });

      // Verify accumulated fees
      const expectedFees = LISTING_FEE + AUCTION_FEE;
      expect(await marketplace.accumulatedFees()).to.equal(expectedFees);

      // Withdraw fees
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter - balanceBefore + gasCost).to.equal(expectedFees);
    });

    it("Balance management: Sell → Balance increases → Use for fees", async function () {
      // List and sell NFT
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
      await marketplace
        .connect(user2)
        .buyNFT(0, false, { value: ethers.parseEther("1") });

      // User1 now has 1 ETH in balance
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );

      // Use balance to pay for next listing
      await nft.connect(user1).approve(marketplace.target, 1);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 1, ethers.parseEther("2"), true);

      // Balance should be reduced by listing fee
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1") - LISTING_FEE,
      );
    });
  });

  // ============================================================================
  // STRESS & EDGE CASE TESTS
  // ============================================================================

  describe("Stress Tests", function () {
    it("Should handle multiple listings by same user", async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await nft.connect(user1).approve(marketplace.target, 1);

      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 1, ethers.parseEther("2"), false, {
          value: LISTING_FEE,
        });

      expect(await marketplace.listingCounter()).to.equal(2);
    });

    it("Should handle multiple bids on same auction", async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.1"), 86400, false, {
          value: AUCTION_FEE,
        });

      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.1") });
      await marketplace
        .connect(user3)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.2") });
      await marketplace
        .connect(user4)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.3") });

      const auction = await marketplace.auctions(0);
      expect(auction.highestBidder).to.equal(user4.address);
    });
  });

  describe("Time-Based Edge Cases", function () {
    it("Should allow bid 1 second before auction ends", async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });

      // Increase time to just before auction ends (86400 - 2 to account for block mining)
      await time.increase(86398);
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      const auction = await marketplace.auctions(0);
      expect(auction.highestBidder).to.equal(user2.address);
    });

    it("Should fail to claim 1 second before auction ends", async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });

      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      // Increase time to just before auction ends (86400 - 5 to account for block mining)
      await time.increase(86395);
      await expect(marketplace.connect(user2).claimNFT(0)).to.be.revertedWith(
        "Auction hasn't ended",
      );
    });

    it("Should allow claim 1 second after auction ends", async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .createAuction(nft.target, 0, ethers.parseEther("0.5"), 86400, false, {
          value: AUCTION_FEE,
        });
      await marketplace
        .connect(user2)
        .placeBid(0, 0, false, { value: ethers.parseEther("0.5") });

      await time.increase(86401);
      await marketplace.connect(user2).claimNFT(0);

      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });
  });

  describe("View Functions", function () {
    it("getBalanceOfUser should return 0 for new user", async function () {
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(0);
    });

    it("getBalanceOfUser should return correct balance after deposit", async function () {
      await marketplace
        .connect(user1)
        .deposit({ value: ethers.parseEther("1") });
      expect(await marketplace.getBalanceOfUser(user1.address)).to.equal(
        ethers.parseEther("1"),
      );
    });

    it("Public mappings should return correct data", async function () {
      await nft.connect(user1).approve(marketplace.target, 0);
      await marketplace
        .connect(user1)
        .listNFT(nft.target, 0, ethers.parseEther("1"), false, {
          value: LISTING_FEE,
        });

      const listing = await marketplace.listings(0);
      expect(listing.seller).to.equal(user1.address);
      expect(listing.price).to.equal(ethers.parseEther("1"));
    });
  });
});
