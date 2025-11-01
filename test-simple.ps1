# Simple Webhook Test Script
Write-Host "🧪 Testing Webhook Service" -ForegroundColor Cyan
Write-Host ""

$BaseUrl = "http://localhost:5000"

# Wait for server to be ready
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/" -Method Get
    Write-Host "✅ Server is healthy!" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Server not responding: $_" -ForegroundColor Red
    Write-Host "Make sure the server is running with: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Send a webhook
Write-Host "2️⃣  Sending webhook..." -ForegroundColor Cyan
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$transactionId = "txn_test_$timestamp"

$body = @{
    transaction_id = $transactionId
    source_account = "acc_user_789"
    destination_account = "acc_merchant_456"
    amount = 1500
    currency = "INR"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/v1/webhooks/transactions" -Method Post -Body $body -ContentType "application/json"
    if ($response.StatusCode -eq 202) {
        Write-Host "✅ Webhook accepted (202 Accepted)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Webhook failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Check transaction status
Write-Host "3️⃣  Checking transaction status..." -ForegroundColor Cyan
try {
    $transaction = Invoke-RestMethod -Uri "$BaseUrl/v1/transactions/$transactionId" -Method Get
    Write-Host "✅ Transaction found!" -ForegroundColor Green
    Write-Host "   Transaction ID: $($transaction.transaction_id)" -ForegroundColor Gray
    Write-Host "   Status: $($transaction.status)" -ForegroundColor Gray
    Write-Host "   Amount: $($transaction.amount) $($transaction.currency)" -ForegroundColor Gray
    Write-Host "   Created: $($transaction.created_at)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to retrieve transaction: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting 35 seconds for background processing..." -ForegroundColor Yellow
Start-Sleep -Seconds 35

# Test 4: Check processed status
Write-Host "4️⃣  Checking processed status..." -ForegroundColor Cyan
try {
    $transaction = Invoke-RestMethod -Uri "$BaseUrl/v1/transactions/$transactionId" -Method Get
    if ($transaction.status -eq "PROCESSED") {
        Write-Host "✅ Transaction processed successfully!" -ForegroundColor Green
        Write-Host "   Status: $($transaction.status)" -ForegroundColor Gray
        Write-Host "   Processed at: $($transaction.processed_at)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Transaction still processing (status: $($transaction.status))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to retrieve transaction: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ Test Complete!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Cyan

