const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CertificateRegistry to localhost...");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const contract = await CertificateRegistry.deploy();

  await contract.deployed();

  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contract.address);
  console.log("\n📋 Verify this address matches your backend/.env:");
  console.log(`CONTRACT_ADDRESS=${contract.address}`);
  
  // Write ABI to file for backend use
  const artifact = await hre.artifacts.readArtifact("CertificateRegistry");
  const fs = require('fs');
  fs.writeFileSync('../backend/abi/CertificateRegistry.json', JSON.stringify(artifact, null, 2));
  console.log("\n📄 ABI written to backend/abi/CertificateRegistry.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });