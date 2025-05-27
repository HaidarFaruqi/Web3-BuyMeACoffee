const hre = require("hardhat");

async function main() {
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const coffee = await BuyMeACoffee.deploy();
  console.log("Deployed to:", coffee.target || coffee.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
