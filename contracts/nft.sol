// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721, ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title NFT
 * @author Your Name
 * @notice This contract implements an ERC721 NFT with minting fees and IPFS metadata storage
 * @dev Inherits from ERC721URIStorage for metadata management and Ownable2Step for secure ownership transfers
 */
contract NFT is ERC721URIStorage, Ownable2Step {
    
    // ============ State Variables ============
    
    /**
     * @dev Counter for tracking the next token ID to be minted
     * @notice Token IDs start from 0 and increment sequentially
     */
    uint256 private _tokenIdCounter;
    
    /**
     * @notice Maximum number of NFTs that can be minted
     * @dev This is a hard cap that cannot be changed after deployment
     */
    uint256 public constant MAX_SUPPLY = 10000;
    
    /**
     * @notice The fee required to mint an NFT (in wei)
     * @dev Can be updated by the contract owner using setMintingFee()
     */
    uint256 public mintingFee = 0.00001 ether;

    // ============ Events ============
    
    /**
     * @dev Emitted when a new NFT is minted
     * @param tokenId The ID of the newly minted token
     * @param owner The address that received the token
     * @param uri The IPFS URI pointing to the token's metadata
     */
    event TokenCreated(uint256 indexed tokenId, address indexed owner, string uri);
    
    /**
     * @dev Emitted when the minting fee is updated
     * @param oldFee The previous minting fee
     * @param newFee The new minting fee
     */
    event MintingFeeUpdated(uint256 oldFee, uint256 newFee);
    
    /**
     * @dev Emitted when the contract owner withdraws accumulated fees
     * @param recipient The address that received the funds
     * @param amount The amount of ETH withdrawn
     */
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    // ============ Constructor ============
    
    /**
     * @notice Initializes the NFT contract with a name and symbol
     * @dev Sets the deployer as the initial owner via Ownable2Step
     * @param name The name of the NFT collection (e.g., "My Awesome NFT")
     * @param symbol The symbol of the NFT collection (e.g., "MANFT")
     */
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol)
        Ownable(msg.sender)
    {}

    // ============ Public Functions ============
    
    /**
     * @notice Mints a new NFT to the caller with the specified metadata URI
     * @dev Requires payment of the minting fee and checks against MAX_SUPPLY
     * @param uri The IPFS URI pointing to the token's metadata (e.g., "ipfs://Qm...")
     * @return The ID of the newly minted token
     * @custom:throws "Max supply reached" if all tokens have been minted
     * @custom:throws "Insufficient minting fee" if msg.value is less than mintingFee
     */
    function mint(string memory uri) public payable returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintingFee, "Insufficient minting fee");
        
        uint256 tokenId = _tokenIdCounter++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit TokenCreated(tokenId, msg.sender, uri);
        
        return tokenId;
    }

    // ============ Owner Functions ============
    
    /**
     * @notice Updates the minting fee
     * @dev Only callable by the contract owner
     * @param newFee The new minting fee in wei
     */
    function setMintingFee(uint256 newFee) public onlyOwner {
        uint256 oldFee = mintingFee;
        mintingFee = newFee;
        emit MintingFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Withdraws all accumulated minting fees to the contract owner
     * @dev Only callable by the contract owner. Uses call for safe ETH transfer
     * @custom:throws "No funds to withdraw" if contract balance is zero
     * @custom:throws "Withdrawal failed" if the ETH transfer fails
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }

    // ============ View Functions ============
    
    /**
     * @notice Returns the total number of NFTs that have been minted
     * @dev This count includes burned tokens if any burning mechanism is added later
     * @return The total number of minted tokens
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Returns an array of all token IDs owned by a specific address
     * @dev This function iterates through all tokens and can be gas-intensive for large supplies
     * @dev Consider using this function off-chain or implementing a more efficient tracking mechanism
     * @param owner The address to query for owned tokens
     * @return An array of token IDs owned by the specified address
     */
    function getTokensOwnedBy(address owner) public view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](balanceOf(owner));
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; ++i) {
            if (_ownerOf(i) == owner) {
                tokens[index++] = i;
            }
        }
        
        return tokens;
    }

    /**
     * @notice Returns the number of NFTs owned by a specific address
     * @dev This is a convenience wrapper around the inherited balanceOf function
     * @param owner The address to query
     * @return The number of tokens owned by the specified address
     */
    function getTokenCountOwnedBy(address owner) public view returns (uint256) {
        return balanceOf(owner);
    }
}