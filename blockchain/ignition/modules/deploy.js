const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("fullDeployment", (m)=>{
    const nft = m.contract("NFT", ["Tokens", "MNFT"]);
    const marketplace = m.contract("Marketplace");

    return {nft, marketplace};
})