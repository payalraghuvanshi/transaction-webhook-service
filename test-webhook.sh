#!/bin/bash

# Webhook Service Test Script
# Tests all three success criteria

echo "🧪 Webhook Service Test Suite"
echo "=============================="
echo ""

BASE_URL="http://localhost:5000"

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s $BASE_URL/ | json_pp
echo ""
echo ""

# Test 2: Single Transaction
echo "2️⃣  Testing Single Transaction..."
TRANSACTION_ID="txn_test_$(date +%s)"
echo "Sending webhook for: $TRANSACTION_ID"

curl -X POST $BASE_URL/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\": \"$TRANSACTION_ID\",
    \"source_account\": \"acc_user_789\",
    \"destination_account\": \"acc_merchant_456\",
    \"amount\": 1500,
    \"currency\": \"INR\"
  }"

echo ""
echo "Checking status immediately..."
curl -s $BASE_URL/v1/transactions/$TRANSACTION_ID | json_pp
echo ""

echo "⏳ Waiting 35 seconds for processing..."
sleep 35

echo "Checking status after processing..."
curl -s $BASE_URL/v1/transactions/$TRANSACTION_ID | json_pp
echo ""
echo ""

# Test 3: Duplicate Prevention
echo "3️⃣  Testing Duplicate Prevention..."
DUPLICATE_ID="txn_duplicate_$(date +%s)"
echo "Sending same webhook 3 times: $DUPLICATE_ID"

for i in {1..3}; do
  echo "  Attempt $i..."
  curl -X POST $BASE_URL/v1/webhooks/transactions \
    -H "Content-Type: application/json" \
    -d "{
      \"transaction_id\": \"$DUPLICATE_ID\",
      \"source_account\": \"acc_user_789\",
      \"destination_account\": \"acc_merchant_456\",
      \"amount\": 2500,
      \"currency\": \"USD\"
    }" \
    -w " (Status: %{http_code})\n"
done

echo ""
echo "Checking transaction (should only exist once)..."
curl -s $BASE_URL/v1/transactions/$DUPLICATE_ID | json_pp
echo ""
echo ""

# Test 4: Performance Test
echo "4️⃣  Testing Performance (Response Time)..."
echo "Sending 10 webhooks and measuring response time..."

TOTAL_TIME=0
for i in {1..10}; do
  PERF_ID="txn_perf_${i}_$(date +%s)"
  RESPONSE_TIME=$(curl -X POST $BASE_URL/v1/webhooks/transactions \
    -H "Content-Type: application/json" \
    -d "{
      \"transaction_id\": \"$PERF_ID\",
      \"source_account\": \"acc_user_789\",
      \"destination_account\": \"acc_merchant_456\",
      \"amount\": 1000,
      \"currency\": \"INR\"
    }" \
    -w "%{time_total}" \
    -o /dev/null \
    -s)
  
  RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
  echo "  Request $i: ${RESPONSE_MS}ms"
  TOTAL_TIME=$(echo "$TOTAL_TIME + $RESPONSE_TIME" | bc)
done

AVG_TIME=$(echo "scale=2; ($TOTAL_TIME / 10) * 1000" | bc)
echo ""
echo "Average response time: ${AVG_TIME}ms"
echo "Requirement: < 500ms"

if (( $(echo "$AVG_TIME < 500" | bc -l) )); then
  echo "✅ PASS: Response time within requirements"
else
  echo "❌ FAIL: Response time exceeds 500ms"
fi

echo ""
echo "=============================="
echo "✅ Test Suite Complete!"
echo "=============================="

