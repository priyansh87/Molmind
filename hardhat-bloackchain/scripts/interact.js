const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = require("../artifacts/contracts/Lock.sol/Lock.json").abi;
  
  const lockContract = new ethers.Contract(contractAddress, contractABI, provider);
  
  // Read contract data
  const unlockTime = await lockContract.unlockTime();
  console.log("Unlock time:", new Date(unlockTime * 1000).toString());
}

main();