'use strict';

/**
 * Migration: Create Transactions Table
 * 
 * Creates the transactions table for storing webhook transaction data.
 * 
 * Table Structure:
 * - transaction_id: Primary key, unique transaction identifier
 * - source_account: Source account identifier (payer)
 * - destination_account: Destination account identifier (payee)
 * - amount: Transaction amount (DECIMAL for precision)
 * - currency: ISO 4217 currency code
 * - status: Processing status (ENUM: PROCESSING, PROCESSED)
 * - created_at: Record creation timestamp
 * - updated_at: Record update timestamp
 * - processed_at: Processing completion timestamp (nullable)
 * 
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Auto-incrementing primary key',
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        comment: 'Unique UUID for external reference',
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Unique transaction ID from payment processor',
      },
      source_account: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Source account identifier (payer)',
      },
      destination_account: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Destination account identifier (payee)',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Transaction amount with 2 decimal precision',
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Currency code (ISO 4217)',
      },
      status: {
        type: Sequelize.ENUM('PROCESSING', 'PROCESSED'),
        allowNull: false,
        defaultValue: 'PROCESSING',
        comment: 'Current processing status of the transaction',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp when the transaction was created',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp when the transaction was last updated',
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when processing completed (null if still processing)',
      },
    });

    // Create unique index on uuid for faster lookups and uniqueness constraint
    await queryInterface.addIndex('transactions', ['uuid'], {
      name: 'idx_transactions_uuid',
      unique: true,
    });

    // Create index on transaction_id for idempotency checks
    await queryInterface.addIndex('transactions', ['transaction_id'], {
      name: 'idx_transactions_transaction_id',
    });

    // Create index on status for faster queries
    await queryInterface.addIndex('transactions', ['status'], {
      name: 'idx_transactions_status',
    });

    // Create index on created_at for time-based queries
    await queryInterface.addIndex('transactions', ['created_at'], {
      name: 'idx_transactions_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    await queryInterface.removeIndex('transactions', 'idx_transactions_uuid');
    await queryInterface.removeIndex('transactions', 'idx_transactions_transaction_id');
    await queryInterface.removeIndex('transactions', 'idx_transactions_status');
    await queryInterface.removeIndex('transactions', 'idx_transactions_created_at');
    
    // Drop the table
    await queryInterface.dropTable('transactions');
  },
};

