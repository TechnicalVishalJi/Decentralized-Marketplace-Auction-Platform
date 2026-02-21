const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const AppError = require("../utils/errors");

class IpfsService {
  constructor() {
    this.jwt = process.env.PINATA_JWT;
    this.baseURL = "https://api.pinata.cloud";
  }

  // Helper to ensure Pinata JWT is configured
  checkConfig() {
    if (!this.jwt) {
      throw new AppError("Pinata JWT is not configured in .env", 500);
    }
  }

  /**
   * Upload an image file to IPFS
   * @param {Object} file - The file object from multer
   * @returns {Promise<string>} The standard ipfs:// URI
   */
  async uploadImage(file) {
    this.checkConfig();

    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      // Add optional metadata for the Pinata dashboard
      const metadata = JSON.stringify({
        name: `nft-image-${Date.now()}`,
      });
      formData.append("pinataMetadata", metadata);

      // Tell Pinata to use CID v1 (standard for NFTs)
      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", options);

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`,
            ...formData.getHeaders(),
          },
        },
      );

      // Cleanup the temporary file created by multer
      fs.unlinkSync(file.path);

      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      // Ensure temp file is cleaned up even if upload fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      console.error(
        "IPFS Image Upload Error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to upload image to IPFS", 500);
    }
  }

  /**
   * Upload NFT JSON Metadata to IPFS
   * @param {Object} metadataObj - The JSON object containing name, description, image, etc.
   * @returns {Promise<string>} The standard ipfs:// URI
   */
  async uploadMetadata(metadataObj) {
    this.checkConfig();

    try {
      // Format specifically for Pinata's pinJSONToIPFS endpoint
      const pinataData = {
        pinataContent: metadataObj,
        pinataMetadata: {
          name: `nft-metadata-${metadataObj.name.replace(/\s+/g, "-").toLowerCase()}`,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      };

      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        pinataData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.jwt}`,
          },
        },
      );

      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error(
        "IPFS Metadata Upload Error:",
        error.response?.data || error.message,
      );
      throw new AppError("Failed to upload metadata to IPFS", 500);
    }
  }
}

module.exports = new IpfsService();
