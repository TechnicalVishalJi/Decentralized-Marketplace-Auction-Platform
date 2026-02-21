const NFT = require("../models/NFT");
const blockchainService = require("./blockchainService");
const axios = require("axios");
const aiEmbeddingService = require("./ai/aiEmbeddingService");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const handleTransfer = async (from, to, tokenId, event) => {
  try {
    const tokenIdNum = Number(tokenId);
    const fromAddr = from.toLowerCase();
    const toAddr = to.toLowerCase();

    // Case 1: Mint (from = zero address)
    if (fromAddr === ZERO_ADDRESS) {
      console.log(`🎨 NFT #${tokenIdNum} minted to ${toAddr}`);
      // 1. Get standard URI from contract (usually looks like: ipfs://QmHash...)
      const tokenURI = await blockchainService.getTokenURI(tokenIdNum);
      // 2. Convert standard IPFS link to an HTTP Gateway link so axios can fetch it
      const httpTokenURI = tokenURI.startsWith("ipfs://")
        ? tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
        : tokenURI;
      // 3. Fetch the JSON metadata via Axios
      let metadata = {};
      try {
        const response = await axios.get(httpTokenURI);
        metadata = response.data;
      } catch (ipfsError) {
        console.error(
          `⚠️ Failed to fetch IPFS metadata for #${tokenIdNum}:`,
          ipfsError.message,
        );
        // We continue so the DB record is still created even if IPFS is temporarily down
      }

      // 4. Generate Semantic Vector Embedding via AI
      let textEmbedding = [];
      try {
        const textToEmbed =
          `${metadata.name || ""} ${metadata.description || ""} ${metadata.category || ""}`.trim();
        if (textToEmbed) {
          textEmbedding =
            await aiEmbeddingService.generateTextEmbedding(textToEmbed);
          console.log(
            `✅ Generated AI Semantic Text Embedding for NFT #${tokenIdNum}`,
          );
        }
      } catch (embeddingError) {
        console.error(
          `⚠️ Failed to generate AI Semantic Embedding: ${embeddingError.message}`,
        );
      }

      // 5. Save to Database with the metadata included
      await NFT.create({
        tokenId: tokenIdNum,
        contractAddress: process.env.NFT_CONTRACT_ADDRESS.toLowerCase(),
        owner: toAddr,
        creator: toAddr,
        tokenURI: tokenURI, // Keep original standard URI in DB
        name: metadata.name || `NFT #${tokenIdNum}`,
        description: metadata.description || "",
        image: metadata.image || "", // usually another ipfs:// link
        attributes: metadata.attributes || [],
        category: "other", // Or pull from metadata if you stored it there
        embedding: textEmbedding, // Store the vector array (optional field in schema)
      });

      console.log(`✅ Saved NFT #${tokenIdNum} with IPFS metadata to DB`);
      return;
    }

    // Case 2: Burn (to = zero address)
    if (toAddr === ZERO_ADDRESS) {
      console.log(`🔥 NFT #${tokenIdNum} burned`);
      await NFT.findOneAndDelete({ tokenId: tokenIdNum });
      return;
    }

    // Case 3: Regular transfer - just update owner
    console.log(
      `🔄 NFT #${tokenIdNum} transferred from ${fromAddr} to ${toAddr}`,
    );
    await NFT.findOneAndUpdate({ tokenId: tokenIdNum }, { owner: toAddr });
  } catch (error) {
    console.error(`Error handling Transfer event: ${error.message}`);
  }
};

module.exports = { handleTransfer };
