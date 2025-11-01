# Webhook Service

A production-ready NestJS webhook service for processing transaction webhooks from external payment processors (like RazorPay).

## Features

✅ **Immediate Webhook Acknowledgment** - Returns 202 Accepted within 500ms  
✅ **Background Processing** - Asynchronous transaction processing with 30-second delay  
✅ **Idempotency** - Prevents duplicate transaction processing  
✅ **PostgreSQL Storage** - Persistent transaction data storage  
✅ **Redis Queue** - Reliable background job processing with Bull  
✅ **Industry-Level Code** - Comprehensive documentation and error handling  

## Architecture

- **PostgreSQL**: Persistent storage for transaction data
- **Redis**: Queue management for background job processing
- **Sequelize**: ORM for database operations
- **Bull**: Background job processing
- **NestJS**: Application framework

## API Endpoints

### 1. Webhook Endpoint
```
POST /v1/webhooks/transactions
```
Receives transaction webhooks from payment processors.

**Request Body:**
```json
{
  "transaction_id": "txn_abc123def456",
  "source_account": "acc_user_789",
  "destination_account": "acc_merchant_456",
  "amount": 1500,
  "currency": "INR"
}
```

**Response:** `202 Accepted`

### 2. Health Check
```
GET /
```
Returns service health status.

**Response:**
```json
{
  "status": "HEALTHY",
  "current_time": "2024-01-15T10:30:00Z"
}
```

### 3. Transaction Query
```
GET /v1/transactions/{transaction_id}
```
Retrieves transaction status and details.

**Response:**
```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655450000",
  "transaction_id": "txn_abc123def456",
  "source_account": "acc_user_789",
  "destination_account": "acc_merchant_456",
  "amount": "1500.00",
  "currency": "INR",
  "status": "PROCESSED",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:30Z",
  "processed_at": "2024-01-15T10:30:30Z"
}
```

## 🚀 Quick Setup & Run

### Prerequisites
Ensure you have these installed:
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Redis** 6+ ([Download](https://redis.io/download/))

### Step-by-Step Setup

**1. Clone the repository**
```bash
git clone https://github.com/payalraghuvanshi/transaction-webhook-service.git
cd transaction-webhook-service
```

**2. Install dependencies**
```bash
npm install
```

**3. Start Redis (Required for background jobs)**

**Windows:**
```bash
redis-server
```

**Linux/macOS:**
```bash
redis-server
```

**4. Create PostgreSQL database**
```bash
# Using psql
psql -U postgres
CREATE DATABASE webhook_transactions;
\q

# Or using createdb command
createdb -U postgres webhook_transactions
```

**5. Configure environment variables**
```bash
# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Linux/macOS
```

Edit `.env` file with your database credentials:
```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=webhook_transactions

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**6. Run database migrations**
```bash
npm run migrate
```

**7. Start the application**
```bash
# Development mode (hot reload)
npm run start:dev
```

**8. Verify the service is running**
```bash
# Test health endpoint
curl http://localhost:5000/

# Expected response:
# {"status":"HEALTHY","current_time":"2025-11-01T..."}
```

### ✅ You're ready! Service is running at:
- 🏠 Health Check: `http://localhost:5000/`
- 📥 Webhook Endpoint: `http://localhost:5000/v1/webhooks/transactions`
- 🔍 Transaction Query: `http://localhost:5000/v1/transactions/:transaction_id`

## Installation

```bash
$ npm install
```

## Prerequisites

- Node.js 20+
- PostgreSQL 12+
- Redis 6+

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for installation instructions.

## Running the Application

```bash
# development
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev

# production mode
$ npm run start:prod
```

The service will be available at:
- 🚀 Application: `http://localhost:5000`
- 📊 Health Check: `http://localhost:5000/`
- 📥 Webhook Endpoint: `http://localhost:5000/v1/webhooks/transactions`
- 🔍 Transaction Query: `http://localhost:5000/v1/transactions/:transaction_id`

## Testing

### Automated Test Suite

**Windows (PowerShell):**
```powershell
.\test-webhook.ps1
```

**Linux/macOS:**
```bash
chmod +x test-webhook.sh
./test-webhook.sh
```

### Manual Testing with cURL

**1. Send a webhook:**
```bash
curl -X POST http://localhost:5000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_123",
    "source_account": "acc_user_001",
    "destination_account": "acc_merchant_001",
    "amount": 1500,
    "currency": "INR"
  }'
```

**2. Check transaction status immediately:**
```bash
curl http://localhost:5000/v1/transactions/txn_test_123
# Expected: status = "PROCESSING"
```

**3. Wait 30+ seconds and check again:**
```bash
curl http://localhost:5000/v1/transactions/txn_test_123
# Expected: status = "PROCESSED", processed_at populated
```

**4. Test idempotency (send same webhook again):**
```bash
curl -X POST http://localhost:5000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_123",
    "source_account": "acc_user_001",
    "destination_account": "acc_merchant_001",
    "amount": 1500,
    "currency": "INR"
  }'
# Should return 202 but not create duplicate
```

## Project Structure

```
webhook-service/
├── src/
│   ├── config/
│   │   └── env.config.ts                  # Environment constants
│   ├── database/
│   │   ├── config/
│   │   │   ├── database.config.ts         # Database configuration
│   │   │   └── config.js                  # Sequelize CLI config
│   │   ├── migrations/
│   │   │   └── 20251101000001-create-transactions-table.js
│   │   ├── database.module.ts             # Database module
│   │   └── database.providers.ts          # Sequelize providers
│   ├── transactions/
│   │   ├── models/
│   │   │   └── transaction.model.ts       # Transaction entity
│   │   ├── transactions.controller.ts     # Query endpoint
│   │   ├── transactions.module.ts         # Transactions module
│   │   ├── transactions.providers.ts      # Model providers
│   │   └── transactions.service.ts        # Business logic
│   ├── webhooks/
│   │   ├── dto/
│   │   │   └── transaction-webhook.dto.ts # DTO with validation
│   │   ├── processors/
│   │   │   └── transaction.processor.ts   # Background processor
│   │   ├── webhooks.controller.ts         # Webhook endpoint
│   │   ├── webhooks.module.ts             # Webhooks module
│   │   └── webhooks.service.ts            # Business logic
│   ├── app.controller.ts                  # Health check
│   ├── app.module.ts                      # Root module
│   ├── app.service.ts                     # App service
│   └── main.ts                            # Entry point
├── test-webhook.ps1                       # Windows test script
├── test-webhook.sh                        # Linux/macOS test script
├── .env.example                           # Environment template
├── .sequelizerc                           # Sequelize CLI config
├── QUICKSTART.md                          # Quick start guide
├── MIGRATIONS.md                          # Migration guide
├── ENVIRONMENT_SETUP.md                   # Environment setup
├── PROJECT_SUMMARY.md                     # Project summary
└── README.md                              # This file
```

## Success Criteria

✅ **Single Transaction**: Send one webhook → verify it's processed after ~30 seconds  
✅ **Duplicate Prevention**: Send the same webhook multiple times → verify only one transaction is processed  
✅ **Performance**: Webhook endpoint responds quickly (< 500ms) even under processing load  
✅ **Reliability**: Service handles errors gracefully and doesn't lose transactions  

## Documentation

- [Quick Start Guide](QUICKSTART.md) - Get up and running in 5 minutes
- [Environment Setup](ENVIRONMENT_SETUP.md) - Detailed environment configuration
- [Migrations Guide](MIGRATIONS.md) - Database migration management
- [Project Summary](PROJECT_SUMMARY.md) - Complete project overview

## 📋 All Essential Commands

### Quick Setup (Copy & Paste)
```bash
# 1. Clone and install
git clone https://github.com/payalraghuvanshi/transaction-webhook-service.git
cd transaction-webhook-service
npm install

# 2. Start Redis (in separate terminal)
redis-server

# 3. Create database
createdb -U postgres webhook_transactions

# 4. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 5. Run migrations
npm run migrate

# 6. Start application
npm run start:dev
```

### Available Scripts

```bash
# Development
npm run start              # Start application
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Production
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run migrate            # Run migrations
npm run migrate:undo       # Undo last migration
npm run migration:generate # Generate new migration

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
npm test                   # Run tests
```

### Troubleshooting

**Redis connection error:**
```bash
# Make sure Redis is running
redis-server
# Or check if running
redis-cli ping
# Expected: PONG
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -l | grep webhook_transactions
```

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3000  # or any other available port
```

## License

UNLICENSED - Private Project
