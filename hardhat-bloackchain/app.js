// app.js
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

import { ethers } from 'ethers';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { abi } = require("./artifacts/contracts/Lock.sol/Lock.json");

const API_URL = "http://127.0.0.1:8545"; // Hardhat local node
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Create a provider with ENS disabled
const provider = new ethers.JsonRpcProvider(API_URL, {
  name: "localhost",
  chainId: 31337,
  ensAddress: null  // Set ENS to null to disable ENS resolution
});

// Create signer with the provider
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Create contract instance with signer
export const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// API to record a new molecule transaction
app.post('/molecule/record', async (req, res) => {
  try {
    const { moleculeId, name, notes, researchLink } = req.body;
    
    // Input validation
    if (!moleculeId || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Required parameters missing: moleculeId and name are required" 
      });
    }
    
    // Call the contract to record molecule
    const tx = await contractInstance.recordMolecule(
      moleculeId,
      name,
      notes || "",
      researchLink || ""
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Extract transaction ID from events
    const recordEvent = receipt.logs.find(log => {
      try {
        const parsedLog = contractInstance.interface.parseLog(log);
        return parsedLog && parsedLog.name === "MoleculeRecorded";
      } catch (e) {
        return false;
      }
    });
    
    let transactionId;
    if (recordEvent) {
      const parsedLog = contractInstance.interface.parseLog(recordEvent);
      transactionId = parsedLog.args[2]; // The transactionId is the third argument in the MoleculeRecorded event
    }
    
    res.json({
      success: true,
      message: "Molecule recorded successfully",
      transactionId: transactionId ? transactionId.toString() : undefined,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error("Error recording molecule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record molecule",
      error: error.message
    });
  }
});

// API to update an existing molecule
app.put('/molecule/update', async (req, res) => {
  try {
    const { moleculeId, name, notes, researchLink } = req.body;
    
    // Input validation
    if (!moleculeId || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Required parameters missing: moleculeId and name are required" 
      });
    }
    
    // Check if molecule exists
    const exists = await contractInstance.moleculeExists(moleculeId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Molecule not found"
      });
    }
    
    // Call the contract to update molecule
    const tx = await contractInstance.updateMolecule(
      moleculeId,
      name,
      notes || "",
      researchLink || ""
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Extract transaction ID from events
    const updateEvent = receipt.logs.find(log => {
      try {
        const parsedLog = contractInstance.interface.parseLog(log);
        return parsedLog && parsedLog.name === "MoleculeUpdated";
      } catch (e) {
        return false;
      }
    });
    
    let transactionId;
    if (updateEvent) {
      const parsedLog = contractInstance.interface.parseLog(updateEvent);
      transactionId = parsedLog.args[2]; // The transactionId is the third argument in the MoleculeUpdated event
    }
    
    res.json({
      success: true,
      message: "Molecule updated successfully",
      transactionId: transactionId ? transactionId.toString() : undefined,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error("Error updating molecule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update molecule",
      error: error.message
    });
  }
});

// API to get molecule data
app.get('/molecule/:moleculeId', async (req, res) => {
  try {
    const moleculeId = req.params.moleculeId;
    
    // Check if molecule exists
    const exists = await contractInstance.moleculeExists(moleculeId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Molecule not found"
      });
    }
    
    // Call the contract to get molecule data
    const data = await contractInstance.getMoleculeData(moleculeId);
    
    // Format timestamp to readable date
    const date = new Date(Number(data[5]) * 1000); // Convert from seconds to milliseconds
    
    res.json({
      success: true,
      molecule: {
        id: data[0],
        name: data[1],
        notes: data[2],
        researchLink: data[3],
        researcher: data[4],
        timestamp: data[5].toString(),
        date: date.toISOString()
      }
    });
  } catch (error) {
    console.error("Error getting molecule data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get molecule data",
      error: error.message
    });
  }
});

// API to get molecule data by transaction ID
app.get('/transaction/:transactionId', async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    
    // Call the contract to get molecule data by transaction ID
    const data = await contractInstance.getMoleculeByTransaction(transactionId);
    
    // Format timestamp to readable date
    const date = new Date(Number(data[5]) * 1000); // Convert from seconds to milliseconds
    
    res.json({
      success: true,
      molecule: {
        id: data[0],
        name: data[1],
        notes: data[2],
        researchLink: data[3],
        researcher: data[4],
        timestamp: data[5].toString(),
        date: date.toISOString()
      }
    });
  } catch (error) {
    console.error("Error getting molecule by transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get molecule data",
      error: error.message
    });
  }
});

// API to get researcher's transactions
app.get('/researcher/:address/transactions', async (req, res) => {
  try {
    const address = req.params.address;
    
    // Validate address format
    try {
      ethers.getAddress(address); // Will throw if invalid address
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid researcher address format" 
      });
    }
    
    // Call the contract to get researcher's transactions
    const transactions = await contractInstance.getResearcherTransactions(address);
    
    res.json({
      success: true,
      researcher: address,
      transactions: transactions.map(tx => tx.toString())
    });
  } catch (error) {
    console.error("Error getting researcher transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get researcher transactions",
      error: error.message
    });
  }
});

// API to get total number of transactions
app.get('/transactions/count', async (req, res) => {
  try {
    const count = await contractInstance.getTotalTransactions();
    
    res.json({
      success: true,
      count: count.toString()
    });
  } catch (error) {
    console.error("Error getting transaction count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get transaction count",
      error: error.message
    });
  }
});

// API to check if molecule exists
app.get('/molecule/:moleculeId/exists', async (req, res) => {
  try {
    const moleculeId = req.params.moleculeId;
    
    // Call the contract to check if molecule exists
    const exists = await contractInstance.moleculeExists(moleculeId);
    
    res.json({
      success: true,
      moleculeId,
      exists
    });
  } catch (error) {
    console.error("Error checking molecule existence:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check molecule existence",
      error: error.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;