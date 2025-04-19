// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Lock is Ownable {
    uint256 public transactionCount;
    
    struct MoleculeData {
        string moleculeId;
        string name;
        string notes;
        string researchLink;
        address researcher;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => MoleculeData) private _molecules;
    mapping(uint256 => string) private _transactionToMoleculeId;
    mapping(address => uint256[]) private _researcherTransactions;
    
    event MoleculeRecorded(string moleculeId, address researcher, uint256 transactionId);
    event MoleculeUpdated(string moleculeId, address researcher, uint256 transactionId);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        transactionCount = 0;
    }

    
    /**
     * @dev Record a new molecule transaction
     */
    function recordMolecule(
        string calldata moleculeId,
        string calldata name,
        string calldata notes,
        string calldata researchLink
    ) external returns (uint256) {
        require(bytes(moleculeId).length > 0, "Molecule ID cannot be empty");
        require(!_molecules[moleculeId].exists, "Molecule already exists");
        
        uint256 transactionId = transactionCount;
        
        _molecules[moleculeId] = MoleculeData({
            moleculeId: moleculeId,
            name: name,
            notes: notes,
            researchLink: researchLink,
            researcher: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        _transactionToMoleculeId[transactionId] = moleculeId;
        _researcherTransactions[msg.sender].push(transactionId);
        
        transactionCount++;
        
        emit MoleculeRecorded(moleculeId, msg.sender, transactionId);
        
        return transactionId;
    }
    
    /**
     * @dev Update an existing molecule
     */
    function updateMolecule(
        string calldata moleculeId,
        string calldata name,
        string calldata notes,
        string calldata researchLink
    ) external returns (uint256) {
        require(_molecules[moleculeId].exists, "Molecule not found");
        require(
            _molecules[moleculeId].researcher == msg.sender || owner() == msg.sender,
            "Not authorized to update this molecule"
        );
        
        uint256 transactionId = transactionCount;
        
        _molecules[moleculeId].name = name;
        _molecules[moleculeId].notes = notes;
        _molecules[moleculeId].researchLink = researchLink;
        _molecules[moleculeId].timestamp = block.timestamp;
        
        _transactionToMoleculeId[transactionId] = moleculeId;
        _researcherTransactions[msg.sender].push(transactionId);
        
        transactionCount++;
        
        emit MoleculeUpdated(moleculeId, msg.sender, transactionId);
        
        return transactionId;
    }
    
    /**
     * @dev Get molecule data
     */
    function getMoleculeData(string calldata moleculeId) external view returns (
        string memory id,
        string memory name,
        string memory notes,
        string memory researchLink,
        address researcher,
        uint256 timestamp
    ) {
        require(_molecules[moleculeId].exists, "Molecule not found");
        
        MoleculeData storage molecule = _molecules[moleculeId];
        return (
            molecule.moleculeId,
            molecule.name,
            molecule.notes,
            molecule.researchLink,
            molecule.researcher,
            molecule.timestamp
        );
    }
    
    /**
     * @dev Get molecule data by transaction ID
     */
    function getMoleculeByTransaction(uint256 transactionId) external view returns (
        string memory id,
        string memory name,
        string memory notes,
        string memory researchLink,
        address researcher,
        uint256 timestamp
    ) {
        require(transactionId < transactionCount, "Transaction does not exist");
        
        string memory moleculeId = _transactionToMoleculeId[transactionId];
        MoleculeData storage molecule = _molecules[moleculeId];
        
        return (
            molecule.moleculeId,
            molecule.name,
            molecule.notes,
            molecule.researchLink,
            molecule.researcher,
            molecule.timestamp
        );
    }
    
    /**
     * @dev Check if molecule exists
     */
    function moleculeExists(string calldata moleculeId) external view returns (bool) {
        return _molecules[moleculeId].exists;
    }
    
    /**
     * @dev Get researcher's transactions
     */
    function getResearcherTransactions(address researcher) external view returns (uint256[] memory) {
        return _researcherTransactions[researcher];
    }
    
    /**
     * @dev Get total number of transactions
     */
    function getTotalTransactions() external view returns (uint256) {
        return transactionCount;
    }
}