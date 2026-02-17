// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title Marketplace
 * @notice A decentralized marketplace for buying, selling, and auctioning NFTs
 * @dev Supports both fixed-price listings and time-based auctions
 */
contract Marketplace is ReentrancyGuard, Ownable2Step {
    
    // ============ Structs ============
    
    /**
     * @dev Represents a fixed-price listing
     */
    struct Listing {
        address seller;          // Address of the NFT seller
        address nftContract;     // Address of the NFT contract
        uint256 tokenId;         // Token ID of the NFT
        uint256 price;           // Fixed price in wei
        bool active;             // Whether listing is still active
    }
    
    /**
     * @dev Represents an auction
     */
    struct Auction {
        address seller;          // Address of the NFT seller
        address nftContract;     // Address of the NFT contract
        uint256 tokenId;         // Token ID of the NFT
        uint256 startingPrice;   // Minimum bid price
        uint256 highestBid;      // Current highest bid
        address highestBidder;   // Address of highest bidder
        uint256 endTime;         // Timestamp when auction ends
        bool cancelled;          // Auction is cancelled
        bool claimed;            // NFT was claimed
    }
    
    // ============ State Variables ============

    
    /// @dev Fixed fee to create a listing (in wei)
    uint256 public listingFee = 1000000000000000; // 0.001 ETH

    /// @dev Fixed fee to create an auction (in wei)
    uint256 public auctionFee = 2000000000000000; // 0.002 ETH

    /// @dev Accumulated marketplace fees
    uint256 public accumulatedFees;

    /// @dev Address that receives marketplace fees (can be different from owner)
    address public feeRecipient;
    
    /// @dev Counter for generating unique listing IDs
    uint256 public listingCounter;
    
    /// @dev Counter for generating unique auction IDs
    uint256 public auctionCounter;
    
    /// @dev Mapping from listing ID to Listing struct
    mapping(uint256 => Listing) public listings;
    
    /// @dev Mapping from auction ID to Auction struct
    mapping(uint256 => Auction) public auctions;
    
    /// @dev Mapping from address to pending withdrawal amount
    mapping(address => uint256) public pendingWithdrawals;
    
    // ============ Events ============
    
    /**
     * @dev Emitted when a new listing is created
     */
    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    
    /**
     * @dev Emitted when an NFT is purchased from a listing
     */
    event NFTSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    
    /**
     * @dev Emitted when a listing is cancelled
     */
    event ListingCancelled(uint256 indexed listingId);
    
    /**
     * @dev Emitted when a new auction is created
     */
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 endTime
    );
    
    /**
     * @dev Emitted when a bid is placed on an auction
     */
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 bidAmount
    );
    
    /**
     * @dev Emitted when an auction is finalized and NFT is claimed
     */
    event AuctionFinalized(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalPrice
    );
    
    /**
     * @dev Emitted when an auction is cancelled
     */
    event AuctionCancelled(uint256 indexed auctionId);

    /**
     * @dev Emitted when auction end time is changed
     */
    event AuctionEndTimeChanged(uint256 indexed auctionId, uint256 oldEndTime, uint256 newEndTime);
    
    /**
     * @dev Emitted when funds are withdrawn
     */
    event FundsWithdrawn(address indexed user, uint256 amount);

    /**
     * @dev Emitted when funds are deposited to marketplace balance
     */
    event FundsDeposited(address indexed user, uint256 amount);

    /**
     * @dev Emitted when fee recipient is updated
     */
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    
    /**
     * @dev Emitted when marketplace fees are withdrawn
     */
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    
    /**
     * @dev Emitted when listing fee is updated
     */
    event ListingFeeUpdated(uint256 oldFee, uint256 newFee);
    
    /**
     * @dev Emitted when auction fee is updated
     */
    event AuctionFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender){
        feeRecipient = msg.sender; // Initially owner receives fees
    }
    
    // ============ Fixed-Price Listing Functions ============
    
    /**
     * @notice List an NFT for sale at a fixed price
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT to list
     * @param price Sale price in wei
     * @param useBalance If true, use marketplace balance for listing fee; if false, use msg.value
     * @return listingId The ID of the created listing
     */
    function listNFT(address nftContract, uint256 tokenId, uint256 price, bool useBalance) public payable returns (uint256){
        IERC721 nft = IERC721(nftContract);
        require(price > 0, "Price must be greater than zero");
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nft.getApproved(tokenId) == address(this) || 
        nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");

        deductBalance(msg.sender, msg.value, listingFee, useBalance);
        accumulatedFees += listingFee;

        uint256 listingId = listingCounter++;
        listings[listingId] = Listing(msg.sender, nftContract, tokenId, price, true);

        emit NFTListed(listingId, msg.sender, nftContract, tokenId, price);

        return listingId;
    }
    
    /**
     * @notice Purchase an NFT from a fixed-price listing
     * @param listingId The ID of the listing to purchase
     * @param useBalance If true, use marketplace balance for payment; if false, use msg.value
     * @return success True if purchase was successful
     */
    function buyNFT(uint256 listingId, bool useBalance) public payable nonReentrant returns (bool) {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing has been sold or doesn't exist");

        uint256 price = listing.price;
        
        deductBalance(msg.sender, msg.value, price, useBalance);

        listing.active = false;

        pendingWithdrawals[listing.seller] += price;

        IERC721(listing.nftContract).transferFrom(listing.seller, msg.sender, listing.tokenId);

        emit NFTSold(listingId, msg.sender, listing.seller, price);
        return true;
    }

    /**
     * @notice Cancel an active listing (only seller)
     * @param listingId The ID of the listing to cancel
     * @return success True if cancellation was successful
     */
    function cancelListing(uint256 listingId) public returns (bool) {
        Listing storage listing = listings[listingId];
        require(listing.active, "No such Listing");
        require(listing.seller == msg.sender, "Only seller can cancel listing");
        listing.active = false;
        emit ListingCancelled(listingId);
        return true;
    }
    
    // ============ Auction Functions ============
    
    /**
     * @notice Create a new auction for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT to auction
     * @param startingPrice Minimum bid price in wei
     * @param duration Auction duration in seconds
     * @param useBalance If true, use marketplace balance for auction fee; if false, use msg.value
     * @return auctionId The ID of the created auction
     */
    function createAuction(address nftContract, uint256 tokenId, uint256 startingPrice, uint256 duration, bool useBalance) public payable returns (uint256) {
        IERC721 nft = IERC721(nftContract);
        require(startingPrice > 0, "Price should not be zero");
        require(duration > 0, "Duration should not be zero");
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nft.getApproved(tokenId) == address(this) || 
        nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");

        deductBalance(msg.sender, msg.value, auctionFee, useBalance);
        accumulatedFees += auctionFee;

        uint256 auctionId = auctionCounter++;
        uint256 endTime = block.timestamp + duration;
        auctions[auctionId] = Auction(msg.sender, nftContract, tokenId, startingPrice, 0, address(0), endTime, false, false);

        emit AuctionCreated(auctionId, msg.sender, nftContract, tokenId, startingPrice, endTime);

        return auctionId;
    }
    
    /**
     * @notice Place a bid on an active auction
     * @param auctionId The ID of the auction to bid on
     * @param bidAmount Bid amount in wei (only used when useBalance is true, set to 0 otherwise)
     * @param useBalance If true, use marketplace balance for bid; if false, use msg.value
     * @return success True if bid was successfully placed
     */
    function placeBid(uint256 auctionId, uint256 bidAmount, bool useBalance) public payable nonReentrant returns (bool){
        Auction storage auction = auctions[auctionId];
        require(!auction.cancelled, "Auction cancelled");
        require(block.timestamp < auction.endTime, "Auction has been ended or doesn't exist");

        uint256 startingPrice = auction.startingPrice;
        uint256 prevBid = auction.highestBid;
        address prevBidder = auction.highestBidder;

        uint256 actualBid;
        if (useBalance) {
            require(bidAmount > 0, "Bid amount must be specified when using balance");
            require(msg.value == 0, "Cannot send ETH when using balance");
            actualBid = bidAmount;
        } else {
            require(bidAmount == 0, "Bid amount should be 0 when sending ETH");
            actualBid = msg.value;
        }
        require(actualBid >= startingPrice && actualBid > prevBid, "Insufficient Payment");

        deductBalance(msg.sender, msg.value, actualBid, useBalance);

        auction.highestBid = actualBid;
        auction.highestBidder = msg.sender;

        if(prevBidder != address(0)){
            pendingWithdrawals[prevBidder] += prevBid;
        }

        emit BidPlaced(auctionId, msg.sender, actualBid); 

        return true;     
    }

    /**
     * @notice Claim NFT after winning an auction (only winner)
     * @param auctionId The ID of the auction to claim from
     * @return success True if NFT was successfully claimed
     */
    function claimNFT(uint256 auctionId) public nonReentrant returns (bool) {
        Auction storage auction = auctions[auctionId];
        require(!auction.cancelled, "Auction cancelled");
        require(block.timestamp >= auction.endTime, "Auction hasn't ended");
        require(!auction.claimed, "Already claimed");
        require(msg.sender == auction.highestBidder, "Only Winner can claim");
        
        auction.claimed = true;

        address winner = auction.highestBidder;
        require(winner != address(0), "No bids placed");
        
        uint256 finalPrice = auction.highestBid;

        IERC721(auction.nftContract).transferFrom(auction.seller, winner, auction.tokenId);

        pendingWithdrawals[auction.seller] += finalPrice;

        emit AuctionFinalized(auctionId, winner, finalPrice);

        return true;
    }

    /**
     * @notice Change the end time of an auction (only seller, before bids)
     * @param auctionId The ID of the auction to modify
     * @param endTime New end time as Unix timestamp
     * @return success True if end time was successfully changed
     */
    function changeAuctionEndTime(uint256 auctionId, uint256 endTime) public returns (bool) {
        Auction storage auction = auctions[auctionId];
        require(endTime > block.timestamp, "EndTime has gone");
        require(!auction.cancelled, "Auction cancelled");
        require(auction.seller == msg.sender, "Only Auction owner can do this");
        require(auction.highestBidder == address(0), "Cannot change after bids placed");
        require(endTime <= block.timestamp + 30 days, "Extension too long");

        uint256 oldEndTime = auction.endTime;
        auction.endTime = endTime;

        emit AuctionEndTimeChanged(auctionId, oldEndTime, endTime);
        
        return true;
    }

    /**
     * @notice Cancel an auction (only seller, before bids)
     * @param auctionId The ID of the auction to cancel
     * @return success True if auction was successfully cancelled
     */
    function cancelAuction(uint256 auctionId) public returns (bool) {
        Auction storage auction = auctions[auctionId];
        require(!auction.cancelled, "Auction cancelled");
        require(auction.endTime > block.timestamp, "Auction already ended or doesn't exist");
        require(auction.seller == msg.sender, "Only Auction owner can cancel");
        require(auction.highestBidder == address(0), "Cannot cancel after bids placed");

        auction.endTime = block.timestamp;
        auction.cancelled = true;

        emit AuctionCancelled(auctionId);

        return true;
    }
    
    // ============ Withdrawal Functions ============
    
    /**
     * @notice Withdraw funds from your marketplace balance
     * @param amount Amount to withdraw in wei
     * @return success True if withdrawal was successful
     */
    function withdraw(uint256 amount) public nonReentrant returns (bool) {
        uint256 balance = pendingWithdrawals[msg.sender];
        require(amount > 0, "Withdrawal amount must be greater than zero");
        require(balance >= amount, "Withdrawal amount must be less than account balance");

        pendingWithdrawals[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(msg.sender, amount);

        return true;
    }

    /**
     * @notice Deposit ETH to your marketplace balance
     */
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        
        pendingWithdrawals[msg.sender] += msg.value;
        
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Internal helper to deduct payment from either balance or msg.value
     * @param sender Address of the payer
     * @param sentValue Amount of ETH sent with transaction (msg.value)
     * @param requiredAmount Required payment amount
     * @param useBalance If true, deduct from balance; if false, use sentValue
     * @return amount The amount deducted
     */
    function deductBalance(address sender, uint256 sentValue, uint256 requiredAmount, bool useBalance) internal returns (uint256) {
        if (useBalance) {
            // Pay using marketplace balance
            require(pendingWithdrawals[sender] >= requiredAmount, "Insufficient balance");
            require(sentValue == 0, "Cannot send ETH when using balance");
            
            pendingWithdrawals[sender] -= requiredAmount;
            return requiredAmount;
        } else {
            // Pay using ETH sent with transaction
            require(sentValue >= requiredAmount, "Insufficient payment");
            
            // Refund excess payment
            if (sentValue > requiredAmount) {
                pendingWithdrawals[sender] += (sentValue - requiredAmount);
            }

            return requiredAmount;
        }
    }

    /**
     * @notice Get pending withdrawal balance for an address
     * @param user Address to check
     * @return balance Pending withdrawal amount
     */
    function getBalanceOfUser(address user) public view returns (uint256) {
        return pendingWithdrawals[user];
    }

    /**
     * @notice Update listing fee (only owner)
     * @param newFee New listing fee in wei
     */
    function setListingFee(uint256 newFee) public onlyOwner {
        require(newFee <= 0.01 ether, "Listing fee cannot exceed 0.01 ETH");
        uint256 oldFee = listingFee;
        listingFee = newFee;
        emit ListingFeeUpdated(oldFee, newFee);
    }
    /**
     * @notice Update auction fee (only owner)
     * @param newFee New auction fee in wei
     */
    function setAuctionFee(uint256 newFee) public onlyOwner {
        require(newFee <= 0.02 ether, "Auction fee cannot exceed 0.02 ETH");
        uint256 oldFee = auctionFee;
        auctionFee = newFee;
        emit AuctionFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @notice Update fee recipient address (only owner)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) public onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Withdraw accumulated marketplace fees (only owner)
     */
    function withdrawFees() public onlyOwner nonReentrant {
        require(accumulatedFees > 0, "No fees to withdraw");
        
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        
        (bool success, ) = payable(feeRecipient).call{value: amount}("");
        require(success, "Fee withdrawal failed");
        
        emit FeesWithdrawn(msg.sender, amount);
    }
} 