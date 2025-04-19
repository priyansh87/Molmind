const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(deployer.address); // Await here is enough in v6

  // No need for: await lock.deployed();
  console.log(`Lock deployed to: ${lock.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
