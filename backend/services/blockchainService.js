const crypto = require('crypto');
const pool = require('../config/database');

// Blockchain configuration
const BLOCKCHAIN_CONFIG = {
  DIFFICULTY: 4, // Number of leading zeros required in hash
  BLOCK_TIME: 60000, // 1 minute in milliseconds
  MAX_TRANSACTIONS_PER_BLOCK: 100
};

// Blockchain block structure
class Block {
  constructor(index, timestamp, transactions, previousHash, nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions; // Array of transaction data
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = this.calculateHash();
    this.merkleRoot = this.calculateMerkleRoot();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce +
        this.merkleRoot
      )
      .digest('hex');
  }

  calculateMerkleRoot() {
    if (this.transactions.length === 0) return '0'.repeat(64);

    const hashes = this.transactions.map(tx =>
      crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex')
    );

    return this.buildMerkleTree(hashes);
  }

  buildMerkleTree(hashes) {
    if (hashes.length === 1) return hashes[0];

    const newHashes = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : left;
      const combined = crypto
        .createHash('sha256')
        .update(left + right)
        .digest('hex');
      newHashes.push(combined);
    }

    return this.buildMerkleTree(newHashes);
  }

  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }
}

// Transaction types for different operations
const TRANSACTION_TYPES = {
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_UPDATED: 'SESSION_UPDATED',
  SESSION_COMPLETED: 'SESSION_COMPLETED',
  REVIEW_ADDED: 'REVIEW_ADDED',
  USER_BLOCKED: 'USER_BLOCKED',
  GROUP_CREATED: 'GROUP_CREATED',
  SKILL_ADDED: 'SKILL_ADDED',
  PAYMENT_PROCESSED: 'PAYMENT_PROCESSED'
};

class BlockchainService {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.createGenesisBlock();
    this.miningInProgress = false;
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), [], '0');
    genesisBlock.mineBlock(BLOCKCHAIN_CONFIG.DIFFICULTY);
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    // Validate transaction structure
    if (!transaction.type || !transaction.data || !transaction.userId) {
      throw new Error('Invalid transaction structure');
    }

    // Add timestamp and hash to transaction
    transaction.timestamp = Date.now();
    transaction.id = crypto.createHash('sha256')
      .update(JSON.stringify(transaction.data) + transaction.timestamp)
      .digest('hex');

    this.pendingTransactions.push(transaction);

    // Auto-mine if we have enough transactions or enough time has passed
    if (this.pendingTransactions.length >= BLOCKCHAIN_CONFIG.MAX_TRANSACTIONS_PER_BLOCK) {
      this.minePendingTransactions();
    }
  }

  minePendingTransactions() {
    if (this.miningInProgress || this.pendingTransactions.length === 0) {
      return;
    }

    this.miningInProgress = true;

    // Create new block with pending transactions
    const block = new Block(
      this.chain.length,
      Date.now(),
      [...this.pendingTransactions],
      this.getLatestBlock().hash
    );

    // Mine the block (this could be done asynchronously in production)
    block.mineBlock(BLOCKCHAIN_CONFIG.DIFFICULTY);

    // Add block to chain
    this.chain.push(block);

    // Clear pending transactions
    this.pendingTransactions = [];

    // Save to database
    this.saveBlockToDatabase(block);

    this.miningInProgress = false;

    console.log(`Block ${block.index} mined and added to blockchain`);
  }

  saveBlockToDatabase(block) {
    const query = `
      INSERT INTO blockchain_blocks (
        block_index, timestamp, transactions, previous_hash, current_hash,
        nonce, merkle_root, difficulty
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    pool.query(query, [
      block.index,
      new Date(block.timestamp),
      JSON.stringify(block.transactions),
      block.previousHash,
      block.hash,
      block.nonce,
      block.merkleRoot,
      BLOCKCHAIN_CONFIG.DIFFICULTY
    ]).catch(error => {
      console.error('Error saving block to database:', error);
    });
  }

  // Verify blockchain integrity
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Verify block is properly linked
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Verify proof of work
      if (currentBlock.hash.substring(0, BLOCKCHAIN_CONFIG.DIFFICULTY) !== '0'.repeat(BLOCKCHAIN_CONFIG.DIFFICULTY)) {
        return false;
      }
    }
    return true;
  }

  // Get transaction by ID
  getTransaction(transactionId) {
    for (const block of this.chain) {
      const transaction = block.transactions.find(tx => tx.id === transactionId);
      if (transaction) return transaction;
    }
    return null;
  }

  // Verify data integrity for a specific record
  verifyDataIntegrity(tableName, recordId, currentData) {
    const query = `
      SELECT transaction_data, block_hash FROM blockchain_audit_trail
      WHERE table_name = $1 AND record_id = $2
      ORDER BY created_at DESC LIMIT 1
    `;

    return pool.query(query, [tableName, recordId])
      .then(result => {
        if (result.rows.length === 0) {
          return { verified: false, reason: 'No blockchain record found' };
        }

        const blockchainData = result.rows[0].transaction_data;
        const currentDataHash = crypto.createHash('sha256')
          .update(JSON.stringify(currentData))
          .digest('hex');

        const blockchainDataHash = crypto.createHash('sha256')
          .update(JSON.stringify(blockchainData))
          .digest('hex');

        return {
          verified: currentDataHash === blockchainDataHash,
          blockchain_hash: result.rows[0].block_hash,
          current_hash: currentDataHash,
          recorded_hash: blockchainDataHash
        };
      })
      .catch(error => {
        console.error('Error verifying data integrity:', error);
        return { verified: false, reason: 'Verification error' };
      });
  }

  // Record operation in blockchain
  recordOperation(operationType, userId, tableName, recordId, oldData, newData, metadata = {}) {
    const transaction = {
      type: operationType,
      userId: userId,
      tableName: tableName,
      recordId: recordId,
      oldData: oldData,
      newData: newData,
      metadata: metadata,
      timestamp: Date.now()
    };

    this.addTransaction(transaction);

    // Also save to audit trail table for easy querying
    const auditQuery = `
      INSERT INTO blockchain_audit_trail (
        transaction_id, table_name, record_id, operation_type,
        user_id, transaction_data, block_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    pool.query(auditQuery, [
      transaction.id,
      tableName,
      recordId,
      operationType,
      userId,
      JSON.stringify(newData),
      null // Will be updated when block is mined
    ]).catch(error => {
      console.error('Error saving audit trail:', error);
    });

    return transaction.id;
  }

  // Get blockchain statistics
  getBlockchainStats() {
    return {
      chainLength: this.chain.length,
      pendingTransactions: this.pendingTransactions.length,
      lastBlockHash: this.getLatestBlock().hash,
      isValid: this.isChainValid(),
      totalTransactions: this.chain.reduce((total, block) => total + block.transactions.length, 0)
    };
  }

  // Load blockchain from database on startup
  async loadFromDatabase() {
    try {
      const query = `
        SELECT * FROM blockchain_blocks ORDER BY block_index ASC
      `;
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        console.log('No blockchain data found, starting with genesis block');
        return;
      }

      // Reconstruct blockchain from database
      this.chain = result.rows.map(row => new Block(
        row.block_index,
        new Date(row.timestamp).getTime(),
        JSON.parse(row.transactions),
        row.previous_hash,
        row.nonce
      ));

      // Set the hash for loaded blocks (since we don't store it directly)
      for (let i = 0; i < this.chain.length; i++) {
        this.chain[i].hash = this.chain[i].calculateHash();
        this.chain[i].merkleRoot = this.chain[i].calculateMerkleRoot();
      }

      console.log(`Loaded ${this.chain.length} blocks from database`);
    } catch (error) {
      console.error('Error loading blockchain from database:', error);
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

// Auto-mine pending transactions every minute
setInterval(() => {
  blockchainService.minePendingTransactions();
}, BLOCKCHAIN_CONFIG.BLOCK_TIME);

module.exports = {
  blockchainService,
  TRANSACTION_TYPES,
  BLOCKCHAIN_CONFIG
};
