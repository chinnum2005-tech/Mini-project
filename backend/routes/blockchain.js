const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { blockchainService, TRANSACTION_TYPES } = require("../services/blockchainService");
const pool = require("../config/database");

const router = express.Router();

// ✅ Verify data integrity for a specific record
router.get("/verify/:table/:recordId", authenticateToken, async (req, res) => {
  try {
    const { table, recordId } = req.params;
    const userId = req.user.id;

    // Get current data from the table
    const currentDataQuery = `
      SELECT * FROM ${table} WHERE id = $1
    `;
    const currentDataResult = await pool.query(currentDataQuery, [recordId]);

    if (currentDataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    const currentData = currentDataResult.rows[0];

    // Verify blockchain integrity
    const verification = await blockchainService.verifyDataIntegrity(table, recordId, currentData);

    res.json({
      success: true,
      data: {
        table: table,
        record_id: recordId,
        verification: verification,
        current_data_hash: require('crypto').createHash('sha256').update(JSON.stringify(currentData)).digest('hex')
      }
    });

  } catch (error) {
    console.error("Error verifying blockchain data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get blockchain statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const stats = blockchainService.getBlockchainStats();

    // Get additional database statistics
    const dbStatsQuery = `
      SELECT
        COUNT(*) as total_blocks,
        COUNT(DISTINCT table_name) as tables_tracked,
        COUNT(DISTINCT user_id) as active_users,
        MAX(created_at) as last_activity
      FROM blockchain_audit_trail
    `;
    const dbStatsResult = await pool.query(dbStatsQuery);

    res.json({
      success: true,
      data: {
        blockchain: stats,
        database: dbStatsResult.rows[0]
      }
    });

  } catch (error) {
    console.error("Error getting blockchain stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get blockchain blocks with pagination
router.get("/blocks", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM blockchain_blocks
      ORDER BY block_index DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM blockchain_blocks`;
    const countResult = await pool.query(countQuery);

    res.json({
      success: true,
      data: {
        blocks: result.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          total_pages: Math.ceil(countResult.rows[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Error getting blockchain blocks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get specific block details
router.get("/blocks/:blockIndex", authenticateToken, async (req, res) => {
  try {
    const { blockIndex } = req.params;

    const query = `
      SELECT * FROM blockchain_blocks WHERE block_index = $1
    `;
    const result = await pool.query(query, [blockIndex]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    const block = result.rows[0];
    block.transactions = JSON.parse(block.transactions);

    // Verify block integrity
    const isValid = blockchainService.isChainValid();

    res.json({
      success: true,
      data: {
        block: block,
        chain_valid: isValid
      }
    });

  } catch (error) {
    console.error("Error getting block details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get audit trail for a specific record
router.get("/audit/:table/:recordId", authenticateToken, async (req, res) => {
  try {
    const { table, recordId } = req.params;

    const query = `
      SELECT bat.*, u.first_name, u.last_name, u.email
      FROM blockchain_audit_trail bat
      LEFT JOIN users u ON bat.user_id = u.id
      WHERE bat.table_name = $1 AND bat.record_id = $2
      ORDER BY bat.created_at DESC
    `;
    const result = await pool.query(query, [table, recordId]);

    res.json({
      success: true,
      data: {
        table: table,
        record_id: recordId,
        audit_trail: result.rows
      }
    });

  } catch (error) {
    console.error("Error getting audit trail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Verify entire blockchain integrity
router.get("/verify-chain", authenticateToken, async (req, res) => {
  try {
    const isValid = blockchainService.isChainValid();
    const stats = blockchainService.getBlockchainStats();

    // Get detailed verification results
    const verificationDetails = [];
    for (let i = 1; i < blockchainService.chain.length; i++) {
      const block = blockchainService.chain[i];
      const previousBlock = blockchainService.chain[i - 1];

      const blockValid = block.hash === block.calculateHash();
      const linkValid = block.previousHash === previousBlock.hash;
      const proofOfWorkValid = block.hash.substring(0, 4) === '0000';

      verificationDetails.push({
        block_index: block.index,
        block_hash: block.hash,
        block_valid: blockValid,
        link_valid: linkValid,
        proof_of_work_valid: proofOfWorkValid
      });
    }

    res.json({
      success: true,
      data: {
        chain_valid: isValid,
        blockchain_stats: stats,
        verification_details: verificationDetails
      }
    });

  } catch (error) {
    console.error("Error verifying blockchain:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get transactions by type
router.get("/transactions/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50 } = req.query;

    if (!Object.values(TRANSACTION_TYPES).includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type"
      });
    }

    const query = `
      SELECT bb.block_index, bb.timestamp, bat.*, u.first_name, u.last_name
      FROM blockchain_audit_trail bat
      JOIN blockchain_blocks bb ON bat.block_hash = bb.current_hash
      LEFT JOIN users u ON bat.user_id = u.id
      WHERE bat.operation_type = $1
      ORDER BY bb.block_index DESC, bat.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [type, limit]);

    res.json({
      success: true,
      data: {
        transaction_type: type,
        transactions: result.rows
      }
    });

  } catch (error) {
    console.error("Error getting transactions by type:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Admin: Force mine pending transactions
router.post("/admin/mine", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role verification
    const userId = req.user.id;

    // Check if user is admin (you might want to add an admin table)
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const initialPendingCount = blockchainService.pendingTransactions.length;
    blockchainService.minePendingTransactions();

    res.json({
      success: true,
      message: `Mining completed. Processed ${initialPendingCount} transactions.`
    });

  } catch (error) {
    console.error("Error mining blockchain:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get real-time blockchain status
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const stats = blockchainService.getBlockchainStats();

    res.json({
      success: true,
      data: {
        blockchain_status: stats,
        pending_transactions: blockchainService.pendingTransactions.length,
        is_mining: blockchainService.miningInProgress
      }
    });

  } catch (error) {
    console.error("Error getting blockchain status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Blockchain skill verification endpoint (for testing)
router.post("/verify-skill", async (req, res) => {
  try {
    const { sessionId, skillId, userId } = req.body;

    if (!sessionId || !skillId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Session ID, skill ID, and user ID are required"
      });
    }

    // For testing purposes, simulate blockchain verification
    // In a real implementation, this would interact with smart contracts

    // Simulate blockchain transaction
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64);
    const blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
    const gasUsed = Math.floor(Math.random() * 100000) + 50000;

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 100));

    res.status(201).json({
      success: true,
      message: "Skill completion verified on blockchain",
      data: {
        sessionId: sessionId,
        skillId: skillId,
        userId: userId,
        transactionHash: transactionHash,
        blockNumber: blockNumber,
        gasUsed: gasUsed,
        verifiedAt: new Date().toISOString(),
        status: "verified",
        certificateUrl: `https://blockchain.blocklearn.com/certificate/${transactionHash}`
      }
    });

  } catch (error) {
    console.error("Error verifying skill on blockchain:", error);
    res.status(500).json({
      success: false,
      message: "Blockchain verification failed"
    });
  }
});

// ✅ Get blockchain verification status
router.get("/verify-skill/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    // For testing purposes, return mock verification data
    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        status: "verified",
        verifiedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        certificateUrl: `https://blockchain.blocklearn.com/certificate/${sessionId}`
      }
    });

  } catch (error) {
    console.error("Error getting blockchain verification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get verification status"
    });
  }
});

module.exports = router;
