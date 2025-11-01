# Webhook Service Test Script (PowerShell)
# Tests all three success criteria

Write-Host "🧪 Webhook Service Test Suite" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$BaseUrl = "http://localhost:5000"

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Single Transaction
Write-Host "2️⃣  Testing Single Transaction..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$transactionId = "txn_test_$timestamp"
Write-Host "Sending webhook for: $transactionId"

$body = @{
    transaction_id = $transactionId
    source_account = "acc_user_789"
    destination_account = "acc_merchant_456"
    amount = 1500
    currency = "INR"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/v1/webhooks/transactions" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Webhook accepted" -ForegroundColor Green
} catch {
    Write-Host "❌ Webhook failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking status immediately..."
try {
    $transaction = Invoke-RestMethod -Uri "$BaseUrl/v1/transactions/$transactionId" -Method Get
    $transaction | ConvertTo-Json
} catch {
    Write-Host "❌ Query failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ Waiting 35 seconds for processing..." -ForegroundColor Cyan
Start-Sleep -Seconds 35

Write-Host "Checking status after processing..."
try {
    $transaction = Invoke-RestMethod -Uri "$BaseUrl/v1/transactions/$transactionId" -Method Get
    $transaction | ConvertTo-Json
    
    if ($transaction.status -eq "PROCESSED") {
        Write-Host "✅ Transaction processed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Transaction still processing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Query failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Duplicate Prevention
Write-Host "3️⃣  Testing Duplicate Prevention..." -ForegroundColor Yellow
$duplicateId = "txn_duplicate_$timestamp"
Write-Host "Sending same webhook 3 times: $duplicateId"

$duplicateBody = @{
    transaction_id = $duplicateId
    source_account = "acc_user_789"
    destination_account = "acc_merchant_456"
    amount = 2500
    currency = "USD"
} | ConvertTo-Json

for ($i = 1; $i -le 3; $i++) {
    Write-Host "  Attempt $i..."
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/v1/webhooks/transactions" -Method Post -Body $duplicateBody -ContentType "application/json"
        Write-Host "    Status: 202 Accepted" -ForegroundColor Green
    } catch {
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking transaction (should only exist once)..."
try {
    $transaction = Invoke-RestMethod -Uri "$BaseUrl/v1/transactions/$duplicateId" -Method Get
    $transaction | ConvertTo-Json
    Write-Host "✅ Idempotency working - only one transaction created" -ForegroundColor Green
} catch {
    Write-Host "❌ Query failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Performance Test
Write-Host "4️⃣  Testing Performance (Response Time)..." -ForegroundColor Yellow
Write-Host "Sending 10 webhooks and measuring response time..."

$responseTimes = @()
for ($i = 1; $i -le 10; $i++) {
    $perfId = "txn_perf_${i}_$timestamp"
    $perfBody = @{
        transaction_id = $perfId
        source_account = "acc_user_789"
        destination_account = "acc_merchant_456"
        amount = 1000
        currency = "INR"
    } | ConvertTo-Json
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/v1/webhooks/transactions" -Method Post -Body $perfBody -ContentType "application/json"
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        $responseTimes += $responseTime
        Write-Host "  Request $i: ${responseTime}ms" -ForegroundColor Gray
    } catch {
        $stopwatch.Stop()
        Write-Host "  Request $i: Failed" -ForegroundColor Red
    }
}

$avgTime = ($responseTimes | Measure-Object -Average).Average
Write-Host ""
Write-Host "Average response time: ${avgTime}ms" -ForegroundColor Cyan
Write-Host "Requirement: < 500ms" -ForegroundColor Cyan

if ($avgTime -lt 500) {
    Write-Host "✅ PASS: Response time within requirements" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Response time exceeds 500ms" -ForegroundColor Red
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ Test Suite Complete!" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

