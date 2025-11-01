# Quick Start Guide

Get the Webhook Service up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Redis installed and running

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:

```env
# Node Environment
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_DATABASE=webhook_transactions

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Port
PORT=5000
```

### 3. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE webhook_transactions;

# Exit
\q
```

### 4. Run Migrations
```bash
npm run migration:run
```

### 5. Start the Application
```bash
npm run start:dev
```

You should see:
```
🚀 Webhook Service is running on: http://localhost:5000
📊 Health Check: http://localhost:5000/
📥 Webhook Endpoint: http://localhost:5000/v1/webhooks/transactions
🔍 Transaction Query: http://localhost:5000/v1/transactions/:transaction_id
```

## Test the Service

### 1. Health Check
```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "status": "HEALTHY",
  "current_time": "2024-01-15T10:30:00Z"
}
```

### 2. Send a Test Webhook
```bash
curl -X POST http://localhost:5000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_001",
    "destination_account": "acc_merchant_001",
    "amount": 1500,
    "currency": "INR"
  }'
```

Expected response:
```
Webhook received and accepted for processing.
```
Status: `202 Accepted`

### 3. Check Transaction Status (Immediately)
```bash
curl http://localhost:5000/v1/transactions/txn_test_001
```

Expected response (status: PROCESSING):
```json
{
  "transaction_id": "txn_test_001",
  "source_account": "acc_user_001",
  "destination_account": "acc_merchant_001",
  "amount": "1500.00",
  "currency": "INR",
  "status": "PROCESSING",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "processed_at": null
}
```

### 4. Check Again After 30 Seconds
```bash
# Wait 30 seconds, then check again
sleep 30
curl http://localhost:5000/v1/transactions/txn_test_001
```

Expected response (status: PROCESSED):
```json
{
  "transaction_id": "txn_test_001",
  "source_account": "acc_user_001",
  "destination_account": "acc_merchant_001",
  "amount": "1500.00",
  "currency": "INR",
  "status": "PROCESSED",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:30.000Z",
  "processed_at": "2024-01-15T10:30:30.000Z"
}
```

### 5. Test Idempotency
Send the same webhook again:
```bash
curl -X POST http://localhost:5000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_001",
    "destination_account": "acc_merchant_001",
    "amount": 1500,
    "currency": "INR"
  }'
```

The webhook will be acknowledged (202), but no duplicate transaction will be created.

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### PostgreSQL Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Verify credentials in .env match your PostgreSQL setup
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start if not running
sudo systemctl start redis-server
```

### Migration Errors
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Revert and try again
npm run migration:revert:all
npm run migration:run
```

### Application Won't Start
```bash
# Check logs for errors
npm run start:dev

# Common issues:
# 1. Missing .env file
# 2. Database not created
# 3. Wrong database credentials
# 4. Redis not running
```

## Next Steps

- ✅ Service is running!
- 📖 Read [README.md](README.md) for full documentation
- 🔄 Read [MIGRATIONS.md](MIGRATIONS.md) for database migrations
- 🧪 Write tests for your endpoints
- 🚀 Deploy to production

## Quick Commands Reference

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugger

# Migrations
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Database
psql -U postgres -d webhook_transactions  # Connect to DB
\dt                        # List tables
\d transactions            # Describe table
SELECT * FROM transactions;  # View data

# Redis
redis-cli                  # Connect to Redis
KEYS *                     # List all keys
LLEN bull:transactions:wait  # Check queue length
```

## Support

If you encounter issues:
1. Check the logs in the console
2. Verify all prerequisites are installed
3. Ensure .env file is configured correctly
4. Check PostgreSQL and Redis are running

Happy coding! 🚀

