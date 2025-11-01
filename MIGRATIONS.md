# Database Migrations Guide

This document explains how to manage database migrations for the Webhook Service.

## Overview

We use Sequelize CLI for database migrations. Migrations allow you to:
- Version control your database schema
- Apply changes incrementally
- Rollback changes if needed
- Keep development, test, and production databases in sync

## Prerequisites

Ensure you have:
1. PostgreSQL installed and running
2. Database created (see main README.md)
3. `.env` file configured with database credentials

## Migration Commands

### Run All Pending Migrations
```bash
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Revert All Migrations
```bash
npm run migration:revert:all
```

### Generate New Migration
```bash
npm run migration:generate -- create-your-table-name
```

## Initial Setup

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE webhook_transactions;

# Exit psql
\q
```

### 2. Run Migrations
```bash
# Run all pending migrations
npm run migration:run
```

This will create the `transactions` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| transaction_id | VARCHAR(255) | Primary key, unique transaction ID |
| source_account | VARCHAR(255) | Source account identifier |
| destination_account | VARCHAR(255) | Destination account identifier |
| amount | DECIMAL(10,2) | Transaction amount |
| currency | VARCHAR(3) | ISO 4217 currency code |
| status | ENUM | PROCESSING or PROCESSED |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |
| processed_at | TIMESTAMP | Processing completion time (nullable) |

### 3. Verify Migration
```bash
# Connect to database
psql -U postgres -d webhook_transactions

# List tables
\dt

# Describe transactions table
\d transactions

# Exit
\q
```

## Creating New Migrations

### Example: Add New Column

1. **Generate migration file:**
```bash
npm run migration:generate -- add-payment-method-to-transactions
```

2. **Edit the generated file** in `src/database/migrations/`:
```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'payment_method', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Payment method used (e.g., card, upi, netbanking)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'payment_method');
  },
};
```

3. **Run the migration:**
```bash
npm run migration:run
```

### Example: Create New Table

1. **Generate migration:**
```bash
npm run migration:generate -- create-webhooks-log-table
```

2. **Edit migration file:**
```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhooks_log', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'transaction_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      request_payload: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      response_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add index
    await queryInterface.addIndex('webhooks_log', ['transaction_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('webhooks_log');
  },
};
```

## Seeders (Optional)

Seeders allow you to populate your database with test data.

### Create Seeder
```bash
npx sequelize-cli seed:generate --name demo-transactions
```

### Edit Seeder File
Edit the file in `src/database/seeders/`:
```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('transactions', [
      {
        transaction_id: 'txn_demo_001',
        source_account: 'acc_user_001',
        destination_account: 'acc_merchant_001',
        amount: 1500.00,
        currency: 'INR',
        status: 'PROCESSED',
        created_at: new Date(),
        updated_at: new Date(),
        processed_at: new Date(),
      },
      {
        transaction_id: 'txn_demo_002',
        source_account: 'acc_user_002',
        destination_account: 'acc_merchant_001',
        amount: 2500.50,
        currency: 'INR',
        status: 'PROCESSING',
        created_at: new Date(),
        updated_at: new Date(),
        processed_at: null,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transactions', {
      transaction_id: ['txn_demo_001', 'txn_demo_002']
    }, {});
  },
};
```

### Run Seeders
```bash
npm run seed:run
```

### Revert Seeders
```bash
npm run seed:revert
```

## Migration Best Practices

### 1. Always Test Migrations
```bash
# Test in development first
NODE_ENV=development npm run migration:run

# Test rollback
npm run migration:revert

# Run again to ensure it works
npm run migration:run
```

### 2. Write Reversible Migrations
Always implement both `up` and `down` methods:
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    // Apply changes
  },

  async down(queryInterface, Sequelize) {
    // Revert changes
  },
};
```

### 3. Use Transactions for Complex Migrations
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('transactions', 'new_column', {
        type: Sequelize.STRING,
      }, { transaction });

      await queryInterface.addIndex('transactions', ['new_column'], {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex('transactions', ['new_column'], {
        transaction,
      });

      await queryInterface.removeColumn('transactions', 'new_column', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
```

### 4. Never Modify Existing Migrations
Once a migration has been run in production, never modify it. Instead, create a new migration to make changes.

### 5. Keep Migrations Small
Create separate migrations for different changes rather than one large migration.

## Troubleshooting

### Migration Failed
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Manually rollback if needed
npm run migration:revert

# Fix the migration file
# Run again
npm run migration:run
```

### Reset Database (Development Only)
```bash
# Revert all migrations
npm run migration:revert:all

# Drop and recreate database
psql -U postgres
DROP DATABASE webhook_transactions;
CREATE DATABASE webhook_transactions;
\q

# Run migrations again
npm run migration:run
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] Test migrations in staging environment
- [ ] Backup production database
- [ ] Review migration files
- [ ] Plan rollback strategy
- [ ] Schedule maintenance window if needed

### Deployment Steps
```bash
# 1. Backup database
pg_dump -U postgres webhook_transactions > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
NODE_ENV=production npm run migration:run

# 3. Verify
psql -U postgres -d webhook_transactions -c "\d transactions"

# 4. If issues occur, rollback
NODE_ENV=production npm run migration:revert
```

## Additional Resources

- [Sequelize Migrations Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize CLI Documentation](https://github.com/sequelize/cli)

