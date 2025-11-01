# Webhook Service - Project Summary

## 🎯 Project Overview

A production-ready NestJS webhook service that receives transaction webhooks from external payment processors (like RazorPay), acknowledges them immediately, and processes transactions reliably in the background.

## ✅ Requirements Completed

### 1. API Endpoints

#### Webhook Endpoint
- **POST** `/v1/webhooks/transactions`
- Accepts transaction webhook payloads
- Returns `202 Accepted` status
- Responds within 500ms
- Request Body:
  ```json
  {
    "transaction_id": "txn_abc123def456",
    "source_account": "acc_user_789",
    "destination_account": "acc_merchant_456",
    "amount": 1500,
    "currency": "INR"
  }
  ```

#### Health Check Endpoint
- **GET** `/`
- Returns service health status
- Response:
  ```json
  {
    "status": "HEALTHY",
    "current_time": "2024-01-15T10:30:00Z"
  }
  ```

#### Transaction Query Endpoint
- **GET** `/v1/transactions/{transaction_id}`
- Retrieves transaction status and details
- Response:
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

### 2. Response Requirements ✅
- Returns `202 Accepted` status code
- Responds within 500ms
- Empty response body with acknowledgment

### 3. Background Processing ✅
- Processes each transaction after receiving webhook
- Includes 30-second delay (simulating external API calls)
- Stores final result in PostgreSQL database
- Uses Bull queue with Redis for reliable job processing

### 4. Idempotency ✅
- Multiple webhooks with same `transaction_id` result in only one processed transaction
- Handles duplicates gracefully without errors
- Database-level unique constraint on `transaction_id`

### 5. Data Storage ✅
- PostgreSQL database with Sequelize-TypeScript ORM
- Stores transactions with status and timing information
- Includes:
  - `id`: Auto-incrementing primary key
  - `uuid`: UUID v4 for external reference
  - `transaction_id`: Unique identifier from payment processor
  - `source_account`: Payer account
  - `destination_account`: Payee account
  - `amount`: Transaction amount (DECIMAL)
  - `currency`: ISO 4217 currency code
  - `status`: PROCESSING or PROCESSED
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp
  - `processed_at`: Processing completion timestamp

## 🏗️ Architecture

### Technology Stack
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL
- **ORM**: Sequelize-TypeScript
- **Job Queue**: Bull (Redis-based)
- **Validation**: class-validator, class-transformer
- **Runtime**: Node.js 20.x

### Project Structure
```
webhook-service/
├── src/
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Health check endpoint
│   ├── app.service.ts             # Health check service
│   ├── main.ts                    # Application bootstrap
│   │
│   ├── config/
│   │   └── env.config.ts          # Environment constants
│   │
│   ├── database/
│   │   ├── database.module.ts     # Database module
│   │   ├── database.providers.ts  # Sequelize configuration
│   │   ├── config/
│   │   │   ├── database.config.ts # Database config (TypeScript)
│   │   │   └── config.js          # Sequelize CLI config
│   │   └── migrations/
│   │       └── 20251101000001-create-transactions-table.js
│   │
│   ├── webhooks/
│   │   ├── webhooks.module.ts     # Webhooks module
│   │   ├── webhooks.controller.ts # Webhook endpoint
│   │   ├── webhooks.service.ts    # Webhook business logic
│   │   ├── dto/
│   │   │   └── transaction-webhook.dto.ts
│   │   └── processors/
│   │       └── transaction.processor.ts
│   │
│   └── transactions/
│       ├── transactions.module.ts      # Transactions module
│       ├── transactions.controller.ts  # Query endpoint
│       ├── transactions.service.ts     # Transaction queries
│       ├── transactions.providers.ts   # Model providers
│       └── models/
│           └── transaction.model.ts    # Sequelize model
│
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment template
├── .sequelizerc                   # Sequelize CLI config
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Main documentation
├── QUICKSTART.md                  # Quick start guide
├── MIGRATIONS.md                  # Migration guide
├── ENVIRONMENT_SETUP.md           # Environment setup
└── PROJECT_SUMMARY.md             # This file
```

## 🔄 Data Flow

### Webhook Reception Flow
1. External payment processor sends webhook to `POST /v1/webhooks/transactions`
2. NestJS receives request and validates payload using DTO
3. WebhooksService checks for duplicate `transaction_id` (idempotency)
4. If new, creates transaction record with `PROCESSING` status
5. Schedules background job in Bull queue with 30-second delay
6. Returns `202 Accepted` immediately (< 500ms)

### Background Processing Flow
1. Bull queue waits for 30 seconds
2. TransactionProcessor picks up the job
3. Simulates external API call (30-second delay)
4. Updates transaction status to `PROCESSED`
5. Records `processed_at` timestamp
6. Job completes successfully

### Query Flow
1. Client sends request to `GET /v1/transactions/{transaction_id}`
2. TransactionsService queries database
3. Returns transaction details with current status
4. Returns 404 if transaction not found

## 🔐 Security Features

1. **Input Validation**
   - DTO validation with class-validator
   - Type checking and transformation
   - SQL injection prevention via ORM

2. **Idempotency**
   - Database-level unique constraints
   - Duplicate detection before processing
   - Graceful handling of duplicate webhooks

3. **Error Handling**
   - Comprehensive try-catch blocks
   - Structured error logging
   - Proper HTTP status codes

4. **Environment Variables**
   - Sensitive data in `.env` file
   - Not committed to version control
   - Environment-specific configurations

## 📊 Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(255) NOT NULL UNIQUE,
  source_account VARCHAR(255) NOT NULL,
  destination_account VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'PROCESSING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL
);

-- Indexes
CREATE UNIQUE INDEX idx_transactions_uuid ON transactions(uuid);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

## 🧪 Testing Scenarios

### 1. Single Transaction Test
```bash
# Send webhook
curl -X POST http://localhost:5000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_123",
    "destination_account": "acc_merchant_456",
    "amount": 1500,
    "currency": "INR"
  }'

# Check status immediately
curl http://localhost:5000/v1/transactions/txn_test_001
# Expected: status = "PROCESSING"

# Wait 30+ seconds and check again
curl http://localhost:5000/v1/transactions/txn_test_001
# Expected: status = "PROCESSED", processed_at populated
```

### 2. Duplicate Prevention Test
```bash
# Send same webhook multiple times
for i in {1..5}; do
  curl -X POST http://localhost:5000/v1/webhooks/transactions \
    -H "Content-Type: application/json" \
    -d '{
      "transaction_id": "txn_duplicate_test",
      "source_account": "acc_user_123",
      "destination_account": "acc_merchant_456",
      "amount": 1500,
      "currency": "INR"
    }'
done

# Verify only one transaction exists
psql -U postgres -d webhook_service_dev \
  -c "SELECT COUNT(*) FROM transactions WHERE transaction_id = 'txn_duplicate_test';"
# Expected: 1
```

### 3. Performance Test
```bash
# Send multiple webhooks rapidly
for i in {1..100}; do
  curl -X POST http://localhost:5000/v1/webhooks/transactions \
    -H "Content-Type: application/json" \
    -d "{
      \"transaction_id\": \"txn_perf_$i\",
      \"source_account\": \"acc_user_123\",
      \"destination_account\": \"acc_merchant_456\",
      \"amount\": 1500,
      \"currency\": \"INR\"
    }" &
done

# All should respond within 500ms
# All should be processed after 30 seconds
```

## 📝 Available Scripts

```bash
# Development
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

## 🚀 Deployment Checklist

### Prerequisites
- [ ] PostgreSQL 12+ installed and running
- [ ] Redis 6+ installed and running
- [ ] Node.js 20+ installed
- [ ] Environment variables configured

### Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Create database: `createdb webhook_service_prod`
5. Run migrations: `npm run migrate`
6. Build application: `npm run build`
7. Start application: `npm run start:prod`

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASS=your-secure-password
DB_NAME_PRODUCTION=webhook_service_prod
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## 🔍 Monitoring & Logging

### Log Levels
- **LOG**: General information (startup, initialization)
- **WARN**: Warnings (duplicate webhooks, missing data)
- **ERROR**: Errors (database failures, processing errors)

### Key Metrics to Monitor
1. Webhook response time (should be < 500ms)
2. Processing success rate
3. Queue length and processing time
4. Database connection pool usage
5. Redis connection status

## 🐛 Troubleshooting

### Common Issues

**Issue**: Database connection failed
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

**Issue**: Redis connection failed
- Check Redis is running
- Verify Redis host/port in `.env`
- Check firewall settings

**Issue**: Webhooks not processing
- Check Bull queue status
- Verify Redis connection
- Check application logs

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 👥 Contributors

Webhook Service Team

## 📄 License

UNLICENSED - Private Project

