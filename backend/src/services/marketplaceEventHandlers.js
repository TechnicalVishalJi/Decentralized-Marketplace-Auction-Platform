const Listing = require('../models/Listing');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const handleNFTListed = async (listingId, seller, nftContract, tokenId, price, event) => {
  try {
    await Listing.create({
      listingId: Number(listingId),
      seller: seller.toLowerCase(),
      nftContract: nftContract.toLowerCase(),
      tokenId: Number(tokenId),
      price: price.toString(),
      active: true,
      transactionHash: event.log.transactionHash
    });
    console.log(`✅ Listing #${listingId} created`);
  } catch (error) {
    console.error(`Error handling NFTListed: ${error.message}`);
  }
};

const handleNFTSold = async (listingId, buyer, seller, price, event) => {
  try {
    await Listing.findOneAndUpdate(
      { listingId: Number(listingId) },
      {
        active: false,
        buyer: buyer.toLowerCase(),
        soldAt: new Date(),
        transactionHash: event.log.transactionHash
      }
    );
    console.log(`💰 Listing #${listingId} sold to ${buyer}`);
  } catch (error) {
    console.error(`Error handling NFTSold: ${error.message}`);
  }
};

const handleListingCancelled = async (listingId, event) => {
  try {
    await Listing.findOneAndUpdate(
      { listingId: Number(listingId) },
      {
        active: false,
        cancelledAt: new Date()
      }
    );
    console.log(`❌ Listing #${listingId} cancelled`);
  } catch (error) {
    console.error(`Error handling ListingCancelled: ${error.message}`);
  }
};

const handleAuctionCreated = async (auctionId, seller, nftContract, tokenId, startingPrice, endTime, event) => {
  try {
    await Auction.create({
      auctionId: Number(auctionId),
      seller: seller.toLowerCase(),
      nftContract: nftContract.toLowerCase(),
      tokenId: Number(tokenId),
      startPrice: startingPrice.toString(),
      highestBid: '0',
      endTime: new Date(Number(endTime) * 1000), // Unix → JS Date
      active: true,
      claimed: false,
      cancelled: false,
      transactionHash: event.log.transactionHash
    });
    console.log(`🏷️ Auction #${auctionId} created`);
  } catch (error) {
    console.error(`Error handling AuctionCreated: ${error.message}`);
  }
};

const handleBidPlaced = async (auctionId, bidder, bidAmount, event) => {
  try {
    const auctionIdNum = Number(auctionId);

    // Update auction's highest bid
    await Auction.findOneAndUpdate(
      { auctionId: auctionIdNum },
      {
        highestBid: bidAmount.toString(),
        highestBidder: bidder.toLowerCase()
      }
    );

    // Save bid to history
    await Bid.create({
      auctionId: auctionIdNum,
      bidder: bidder.toLowerCase(),
      amount: bidAmount.toString(),
      transactionHash: event.log.transactionHash
    });

    console.log(`💵 Bid placed on Auction #${auctionId}: ${bidAmount} wei by ${bidder}`);
  } catch (error) {
    console.error(`Error handling BidPlaced: ${error.message}`);
  }
};

const handleAuctionFinalized = async (auctionId, winner, finalPrice, event) => {
  try {
    await Auction.findOneAndUpdate(
      { auctionId: Number(auctionId) },
      {
        active: false,
        claimed: true,
        winner: winner.toLowerCase()
      }
    );
    console.log(`🏆 Auction #${auctionId} finalized. Winner: ${winner}`);
  } catch (error) {
    console.error(`Error handling AuctionFinalized: ${error.message}`);
  }
};

const handleAuctionCancelled = async (auctionId, event) => {
  try {
    await Auction.findOneAndUpdate(
      { auctionId: Number(auctionId) },
      {
        active: false,
        cancelled: true
      }
    );
    console.log(`🚫 Auction #${auctionId} cancelled`);
  } catch (error) {
    console.error(`Error handling AuctionCancelled: ${error.message}`);
  }
};

module.exports = {
  handleNFTListed,
  handleNFTSold,
  handleListingCancelled,
  handleAuctionCreated,
  handleBidPlaced,
  handleAuctionFinalized,
  handleAuctionCancelled
};