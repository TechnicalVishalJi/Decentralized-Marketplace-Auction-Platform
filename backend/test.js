require('dotenv').config();
const blockchainConfig = require('./src/config/blockchain');
const blockchainService = require('./src/services/blockchainService');

async function test() {
  await blockchainConfig.initialize();

  // Test: Get total supply
  const supply = await blockchainService.getTotalSupply();
  console.log('Total NFTs:', supply);

  // Test: Get listing (if any exist)
  // const listing = await blockchainService.getListingDetails(1);
  // console.log('Listing:', listing);
}

test().catch(console.error);