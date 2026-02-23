const NFT = require("../models/NFT");
const blockchainService = require("./blockchainService");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");
const aiVisionService = require("./ai/aiVisionService");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const handleTransfer = async (from, to, tokenId, event) => {
  try {
    const tokenIdNum = Number(tokenId);
    const fromAddr = from.toLowerCase();
    const toAddr = to.toLowerCase();

    // Case 1: Mint (from = zero address)
    if (fromAddr === ZERO_ADDRESS) {
      console.log(`🎨 NFT #${tokenIdNum} minted to ${toAddr}`);

      // 1. Get token URI from chain
      const tokenURI = await blockchainService.getTokenURI(tokenIdNum);
      const httpTokenURI = tokenURI.startsWith("ipfs://")
        ? tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
        : tokenURI;

      // 2. Fetch JSON metadata
      let metadata = {};
      try {
        const response = await axios.get(httpTokenURI);
        metadata = response.data;
      } catch (ipfsError) {
        console.error(
          `⚠️ Failed to fetch IPFS metadata for #${tokenIdNum}:`,
          ipfsError.message,
        );
      }

      // 3. Download the actual image and generate an IMAGE embedding for plagiarism detection
      let imageEmbedding = [];
      const imageIpfsUrl = (metadata.image || "").startsWith("ipfs://")
        ? metadata.image.replace(
            "ipfs://",
            "https://gateway.pinata.cloud/ipfs/",
          )
        : metadata.image;

      if (imageIpfsUrl) {
        let tempImagePath = null;
        try {
          // Download image as buffer
          const imageResponse = await axios.get(imageIpfsUrl, {
            responseType: "arraybuffer",
          });
          const imageBuffer = Buffer.from(imageResponse.data);

          // Write to OS temp file so aiVisionService can read it from disk
          tempImagePath = path.join(
            os.tmpdir(),
            `nft_${tokenIdNum}_${Date.now()}.jpg`,
          );
          fs.writeFileSync(tempImagePath, imageBuffer);

          // Generate image embedding via Groq Vision + Gemini
          imageEmbedding =
            await aiVisionService.getImageEmbedding(tempImagePath);
          console.log(
            `✅ Generated image embedding for NFT #${tokenIdNum} (${imageEmbedding.length} dims)`,
          );
        } catch (embeddingError) {
          console.error(
            `⚠️ Failed to generate image embedding: ${embeddingError.message}`,
          );
        } finally {
          // Always clean up the temp file
          if (tempImagePath && fs.existsSync(tempImagePath)) {
            fs.unlinkSync(tempImagePath);
          }
        }
      }

      // 4. Save NFT record to MongoDB with the image embedding
      await NFT.create({
        tokenId: tokenIdNum,
        contractAddress: process.env.NFT_CONTRACT_ADDRESS.toLowerCase(),
        owner: toAddr,
        creator: toAddr,
        tokenURI,
        name: metadata.name || `NFT #${tokenIdNum}`,
        description: metadata.description || "",
        image: metadata.image || "",
        attributes: metadata.attributes || [],
        category: metadata.category || "other",
        embedding: imageEmbedding, // Image embedding stored for plagiarism vector search
      });

      console.log(
        `✅ Saved NFT #${tokenIdNum} to DB with ${imageEmbedding.length > 0 ? "image embedding ✓" : "no embedding (skipped)"}`,
      );
      return;
    }

    // Case 2: Burn (to = zero address)
    if (toAddr === ZERO_ADDRESS) {
      console.log(`🔥 NFT #${tokenIdNum} burned`);
      await NFT.findOneAndDelete({ tokenId: tokenIdNum });
      return;
    }

    // Case 3: Regular transfer — just update owner
    console.log(
      `🔄 NFT #${tokenIdNum} transferred from ${fromAddr} to ${toAddr}`,
    );
    await NFT.findOneAndUpdate({ tokenId: tokenIdNum }, { owner: toAddr });
  } catch (error) {
    console.error(`Error handling Transfer event: ${error.message}`);
  }
};

module.exports = { handleTransfer };
