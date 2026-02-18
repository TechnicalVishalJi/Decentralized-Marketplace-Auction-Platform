const ethers = require('ethers');
require('dotenv').config();

class BlockchainConfig{
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.nftContract = null;
        this.marketplaceContract = null;
    }

    async initialize() {
        try {
            // 1. Create provider
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            // 2. Create wallet
            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            // 3. Load ABIs and create contracts
            const NFT_ABI = require('../../contracts/NFT.json').abi;
            const MARKETPLACE_ABI = require('../../contracts/Marketplace.json').abi;

            this.nftContract = new ethers.Contract(
                process.env.NFT_CONTRACT_ADDRESS,
                NFT_ABI,
                this.wallet
            );

            this.marketplaceContract = new ethers.Contract(
                process.env.MARKETPLACE_CONTRACT_ADDRESS,
                MARKETPLACE_ABI,
                this.wallet
            );

            // 4. Verify connection
            const network = await this.provider.getNetwork();
            console.log(`✅ Connected to blockchain: ${network.name} (Chain ID: ${network.chainId})`);
            return true;
        } catch (error) {
            console.error(`❌ Blockchain initialization failed: ${error.message}`);
            throw error;
        }
    }

    getProvider() {return this.provider;}
    getWallet() {return this.wallet}
    getNFTContract() {return this.nftContract}
    getMarketplaceContract() {return this.marketplaceContract}
}

module.exports = new BlockchainConfig();