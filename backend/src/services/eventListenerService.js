const blockchainConfig = require('../config/blockchain');
const { handleTransfer } = require('./nftEventHandlers');
const {
  handleNFTListed,
  handleNFTSold,
  handleListingCancelled,
  handleAuctionCreated,
  handleBidPlaced,
  handleAuctionFinalized,
  handleAuctionCancelled
} = require('./marketplaceEventHandlers');

const startEventListeners = () => {
  const nftContract = blockchainConfig.getNFTContract();
  const marketplace = blockchainConfig.getMarketplaceContract();

  console.log('🎧 Starting event listeners...');

  // ── NFT Contract Events ──────────────────────────────────
  nftContract.on('Transfer', handleTransfer);

  // ── Marketplace Contract Events ──────────────────────────
  marketplace.on('NFTListed', handleNFTListed);
  marketplace.on('NFTSold', handleNFTSold);
  marketplace.on('ListingCancelled', handleListingCancelled);
  marketplace.on('AuctionCreated', handleAuctionCreated);
  marketplace.on('BidPlaced', handleBidPlaced);
  marketplace.on('AuctionFinalized', handleAuctionFinalized);
  marketplace.on('AuctionCancelled', handleAuctionCancelled);

  console.log('✅ Event listeners active');
};

const stopEventListeners = () => {
  const nftContract = blockchainConfig.getNFTContract();
  const marketplace = blockchainConfig.getMarketplaceContract();

  nftContract.removeAllListeners();
  marketplace.removeAllListeners();

  console.log('🛑 Event listeners stopped');
};

module.exports = { startEventListeners, stopEventListeners };