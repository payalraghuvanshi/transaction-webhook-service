# Environment Setup Guide

This guide will help you set up the environment variables for the Webhook Service.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your actual credentials**

## Environment Variables Reference

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment (development/test/production) | `development` | Yes |
| `PORT` | Port number for the application | `5000` | Yes |

### PostgreSQL Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL server host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL server port | `5432` | Yes |
| `DB_USER` | PostgreSQL username | `postgres` | Yes |
| `DB_PASS` | PostgreSQL password | - | Yes |
| `DB_DIALECT` | Database dialect | `postgres` | Yes |
| `DB_NAME_DEVELOPMENT` | Development database name | `webhook_service_dev` | Yes |
| `DB_NAME_TEST` | Test database name | `webhook_service_test` | No |
| `DB_NAME_PRODUCTION` | Production database name | `webhook_service_prod` | No |

### Database Connection Pool Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_POOL_MAX` | Maximum connections in pool | `5` | No |
| `DB_POOL_MIN` | Minimum connections in pool | `0` | No |
| `DB_POOL_ACQUIRE` | Max time (ms) to get connection | `50000` | No |
| `DB_POOL_IDLE` | Max time (ms) connection can be idle | `10000` | No |

### Redis Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REDIS_HOST` | Redis server host | `localhost` | Yes |
| `REDIS_PORT` | Redis server port | `6379` | Yes |
| `REDIS_PASSWORD` | Redis password (if required) | - | No |

### Webhook Processing Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TRANSACTION_PROCESSING_DELAY` | Delay before processing (ms) | `50000` | No |

### Logging Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `debug` | No |

## Environment-Specific Setup

### Development Environment

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=1234
DB_NAME_DEVELOPMENT=webhook_service_dev
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Test Environment

```env
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=1234
DB_NAME_TEST=webhook_service_test
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Production Environment

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_USER=your_production_user
DB_PASS=your_secure_password
DB_NAME_PRODUCTION=webhook_service_prod
REDIS_HOST=your-production-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

## Prerequisites

### 1. PostgreSQL Installation

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install and remember your password

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Redis Installation

**Windows:**
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use Docker: `docker run -d -p 6379:6379 redis`

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE webhook_service_dev;

# Verify database creation
\l

# Exit
\q
```

### 4. Run Database Migrations

```bash
npm run migrate
```

## Verification

### Check PostgreSQL Connection

```bash
psql -U postgres -d webhook_service_dev
```

### Check Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Test Application

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

## Troubleshooting

### PostgreSQL Connection Issues

**Error: `password authentication failed`**
- Verify your `DB_PASS` in `.env` matches your PostgreSQL password
- Check PostgreSQL is running: `pg_isready`

**Error: `database does not exist`**
- Create the database: `createdb -U postgres webhook_service_dev`

### Redis Connection Issues

**Error: `ECONNREFUSED`**
- Check Redis is running: `redis-cli ping`
- Start Redis: `redis-server` or `brew services start redis`

### Port Already in Use

**Error: `EADDRINUSE`**
- Change the `PORT` in `.env` to a different value (e.g., 3001)
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

## Security Best Practices

1. **Never commit `.env` file to version control**
   - Already included in `.gitignore`

2. **Use strong passwords in production**
   - Minimum 16 characters
   - Mix of letters, numbers, and symbols

3. **Rotate credentials regularly**
   - Change database passwords every 90 days
   - Update Redis passwords periodically

4. **Use environment-specific credentials**
   - Different passwords for dev/test/prod
   - Separate databases for each environment

5. **Secure Redis in production**
   - Always set `REDIS_PASSWORD`
   - Use TLS/SSL for connections
   - Bind to specific IP addresses

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)

