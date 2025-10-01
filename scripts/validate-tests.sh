#!/bin/bash

# Validate test counts to ensure all tests are running
echo "Running test validation..."

# Run Node.js tests and capture output
NODE_OUTPUT=$(npm run test:node 2>&1)
NODE_COUNT=$(echo "$NODE_OUTPUT" | grep "Tests:" | grep -o '[0-9]\+ passed' | grep -o '[0-9]\+')

# Run web tests and capture output  
WEB_OUTPUT=$(npm run test:web 2>&1)
WEB_COUNT=$(echo "$WEB_OUTPUT" | grep "Tests:" | grep -o '[0-9]\+ passed' | grep -o '[0-9]\+')

echo "Node.js tests: $NODE_COUNT passed"
echo "Web tests: $WEB_COUNT passed"

# Expected counts
EXPECTED_NODE=172
EXPECTED_WEB=46

# Validate counts
if [ "$NODE_COUNT" -eq "$EXPECTED_NODE" ] && [ "$WEB_COUNT" -eq "$EXPECTED_WEB" ]; then
    echo "✅ All expected tests passed!"
    exit 0
else
    echo "❌ Test count mismatch!"
    echo "Expected: Node=$EXPECTED_NODE, Web=$EXPECTED_WEB"
    echo "Actual: Node=$NODE_COUNT, Web=$WEB_COUNT"
    exit 1
fi