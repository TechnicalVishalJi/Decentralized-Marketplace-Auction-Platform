const { ethers } = require("ethers");
const blockchainConfig = require("../config/blockchain");

class BlockchainService {
  async getNFTOwner(tokenId) {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      const owner = await nftContract.ownerOf(tokenId);
      return owner.toLowerCase();
    } catch (error) {
      console.error(`Error getting NFT owner: ${error.message}`);
      throw error;
    }
  }

  async getTokenURI(tokenId) {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      return await nftContract.tokenURI(tokenId);
    } catch (error) {
      console.error(`Error getting tokenURI: ${error.message}`);
      throw error;
    }
  }

  async getTotalSupply() {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      const supply = await nftContract.getTotalSupply();
      return Number(supply); // Convert BigInt to Number
    } catch (error) {
      console.error(`Error getting total supply: ${error.message}`);
      throw error;
    }
  }

  async getListingDetails(listingId) {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const listing = await marketplace.listings(listingId);
      return {
        seller: listing.seller.toLowerCase(),
        nftContract: listing.nftContract.toLowerCase(),
        tokenId: Number(listing.tokenId),
        price: listing.price.toString(), // BigInt → String
        active: listing.active,
      };
    } catch (error) {
      console.error(`Error getting listing: ${error.message}`);
      throw error;
    }
  }

  async getAuctionDetails(auctionId) {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const auction = await marketplace.auctions(auctionId);
      return {
        seller: auction.seller.toLowerCase(),
        nftContract: auction.nftContract.toLowerCase(),
        tokenId: Number(auction.tokenId),
        startPrice: auction.startPrice.toString(),
        highestBid: auction.highestBid.toString(),
        highestBidder: auction.highestBidder.toLowerCase(),
        endTime: Number(auction.endTime), // Unix timestamp
        active: auction.active,
        claimed: auction.claimed,
        cancelled: auction.cancelled,
      };
    } catch (error) {
      console.error(`Error getting auction: ${error.message}`);
      throw error;
    }
  }

  async isApprovedForMarketplace(tokenId, ownerAddress) {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;

      // Check single-token approval
      const approvedAddress = await nftContract.getApproved(tokenId);
      if (approvedAddress.toLowerCase() === marketplaceAddress.toLowerCase()) {
        return true;
      }

      // Check approval-for-all
      const isApprovedAll = await nftContract.isApprovedForAll(
        ownerAddress,
        marketplaceAddress,
      );
      return isApprovedAll;
    } catch (error) {
      console.error(`Error checking approval: ${error.message}`);
      throw error;
    }
  }

  // Get user's deposited balance inside the marketplace contract
  async getUserBalance(address) {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const balance = await marketplace.getBalanceOfUser(address);
      return balance.toString(); // Returns wei as string
    } catch (error) {
      console.error(`Error getting user balance: ${error.message}`);
      throw error;
    }
  }

  // Get current listing fee from contract
  async getListingFee() {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const fee = await marketplace.listingFee();
      return fee.toString();
    } catch (error) {
      console.error(`Error getting listing fee: ${error.message}`);
      throw error;
    }
  }

  // Get current auction fee from contract
  async getAuctionFee() {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const fee = await marketplace.auctionFee();
      return fee.toString();
    } catch (error) {
      console.error(`Error getting auction fee: ${error.message}`);
      throw error;
    }
  }

  // Get total accumulated fees in the contract (admin use)
  async getAccumulatedFees() {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const fees = await marketplace.accumulatedFees();
      return fees.toString();
    } catch (error) {
      console.error(`Error getting accumulated fees: ${error.message}`);
      throw error;
    }
  }

  // Verify a transaction was successful (frontend sends txHash after a tx)
  async getTransactionReceipt(txHash) {
    try {
      const provider = blockchainConfig.getProvider();
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt; // null if not mined yet
    } catch (error) {
      console.error(`Error getting transaction receipt: ${error.message}`);
      throw error;
    }
  }

  formatEther(wei) {
    return ethers.formatEther(wei);
  }

  parseEther(ether) {
    return ethers.parseEther(ether.toString());
  }

  async getBlockTimestamp() {
    const provider = blockchainConfig.getProvider();
    const block = await provider.getBlock("latest");
    return block.timestamp;
  }
}

module.exports = new BlockchainService();
