# Redis Setup Guide

Redis is required for the background job processing in this webhook service. Here's how to install and run Redis on different platforms.

## ⚠️ Important

**Without Redis, the application will accept webhooks but background processing won't work.**

You'll see this error:
```
MaxRetriesPerRequestError: Reached the max retries per request limit
```

## Windows Installation

### Option 1: Using MSI Installer (Recommended)

1. **Download Redis for Windows:**
   - Visit: https://github.com/microsoftarchive/redis/releases
   - Download: `Redis-x64-3.0.504.msi`

2. **Install:**
   - Run the MSI installer
   - Follow the installation wizard
   - Redis will automatically start as a Windows service

3. **Verify Installation:**
   ```powershell
   redis-cli ping
   # Should return: PONG
   ```

### Option 2: Using Chocolatey

```powershell
# Install Chocolatey if not already installed
# Visit: https://chocolatey.org/install

# Install Redis
choco install redis-64

# Start Redis
redis-server
```

### Option 3: Using Docker (Easiest)

```powershell
# Pull and run Redis container
docker run -d -p 6379:6379 --name redis redis:latest

# Verify it's running
docker ps

# Stop Redis
docker stop redis

# Start Redis again
docker start redis
```

## macOS Installation

### Using Homebrew (Recommended)

```bash
# Install Redis
brew install redis

# Start Redis as a service
brew services start redis

# Or start Redis manually
redis-server

# Verify installation
redis-cli ping
# Should return: PONG
```

### Using Docker

```bash
# Pull and run Redis container
docker run -d -p 6379:6379 --name redis redis:latest

# Verify it's running
docker ps
```

## Linux Installation

### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Verify installation
redis-cli ping
# Should return: PONG
```

### CentOS/RHEL

```bash
# Install Redis
sudo yum install redis

# Start Redis service
sudo systemctl start redis

# Enable Redis to start on boot
sudo systemctl enable redis

# Verify installation
redis-cli ping
# Should return: PONG
```

### Using Docker

```bash
# Pull and run Redis container
docker run -d -p 6379:6379 --name redis redis:latest

# Verify it's running
docker ps
```

## Verifying Redis is Running

### Check Redis Connection

```bash
redis-cli ping
```

**Expected output:** `PONG`

### Check Redis is Listening on Port 6379

**Windows:**
```powershell
netstat -an | findstr 6379
```

**Linux/macOS:**
```bash
netstat -an | grep 6379
```

**Expected output:** Should show port 6379 is listening

### Test with the Webhook Service

Once Redis is running, restart your application:

```bash
npm run start:dev
```

You should see in the logs:
```
✅ Database connection established successfully.
✅ WebhooksService initialized successfully
✅ TransactionsService initialized successfully
```

**No Redis connection errors!**

## Troubleshooting

### Issue: "Connection refused" or "ECONNREFUSED"

**Solution:**
- Make sure Redis is running: `redis-cli ping`
- Check if Redis is on the correct port: `netstat -an | grep 6379`
- Restart Redis service

**Windows:**
```powershell
# Restart Redis service
net stop Redis
net start Redis
```

**Linux/macOS:**
```bash
sudo systemctl restart redis
```

### Issue: "MaxRetriesPerRequestError"

**Solution:**
- Redis is not running. Start Redis using one of the methods above.
- Check your `.env` file has correct Redis settings:
  ```env
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  ```

### Issue: Redis running but application can't connect

**Solution:**
1. Check firewall settings
2. Verify Redis is listening on all interfaces:
   ```bash
   redis-cli -h localhost ping
   ```
3. Check Redis configuration file (`redis.conf`):
   ```
   bind 127.0.0.1
   port 6379
   ```

## Redis Configuration for Production

For production environments, consider:

1. **Enable Authentication:**
   ```bash
   # In redis.conf
   requirepass your_strong_password
   ```
   
   Update `.env`:
   ```env
   REDIS_PASSWORD=your_strong_password
   ```

2. **Enable Persistence:**
   ```bash
   # In redis.conf
   save 900 1
   save 300 10
   save 60 10000
   ```

3. **Set Max Memory:**
   ```bash
   # In redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

4. **Use Redis Cluster for High Availability**

## Quick Start Commands

### Start Redis (Choose one based on your installation)

**Windows Service:**
```powershell
net start Redis
```

**Manual Start:**
```bash
redis-server
```

**Docker:**
```bash
docker start redis
```

**macOS (Homebrew):**
```bash
brew services start redis
```

**Linux:**
```bash
sudo systemctl start redis
```

### Stop Redis

**Windows Service:**
```powershell
net stop Redis
```

**Docker:**
```bash
docker stop redis
```

**macOS (Homebrew):**
```bash
brew services stop redis
```

**Linux:**
```bash
sudo systemctl stop redis
```

## Testing the Complete Setup

Once Redis is running, test the webhook service:

```powershell
# Run the test script
.\test-simple.ps1
```

Or manually:

```bash
# 1. Check health
curl http://localhost:5000/

# 2. Send webhook
curl -X POST http://localhost:5000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_789",
    "destination_account": "acc_merchant_456",
    "amount": 1500,
    "currency": "INR"
  }'

# 3. Check status immediately
curl http://localhost:5000/v1/transactions/txn_test_001
# Status should be: PROCESSING

# 4. Wait 35 seconds and check again
curl http://localhost:5000/v1/transactions/txn_test_001
# Status should be: PROCESSED
```

If everything works, you'll see the transaction status change from `PROCESSING` to `PROCESSED` after 30 seconds! ✅

## Additional Resources

- [Redis Official Documentation](https://redis.io/documentation)
- [Redis Windows Port](https://github.com/microsoftarchive/redis)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

