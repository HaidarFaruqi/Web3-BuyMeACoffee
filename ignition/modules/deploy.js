const hre = require("hardhat");

async function main() {
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");

  const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Sepolia ETH/USD price feed address
  const coffee = await BuyMeACoffee.deploy(priceFeedAddress);
  await coffee.waitForDeployment();
  console.log("Deployed to:", coffee.target || coffee.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
