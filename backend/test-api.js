#!/usr/bin/env node

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (error) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test script
async function runTests() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('🧪 Testing Commission Tracking System API\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health check...');
        const healthResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/health',
            method: 'GET'
        });
        console.log(`✅ Health check: ${healthResponse.statusCode} - ${healthResponse.data.message}\n`);

        // Test 2: Create a commission rule
        console.log('2. Creating commission rule...');
        const ruleResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/rules/',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            name: 'Standard Commission Rule',
            description: 'Basic commission structure for testing',
            base_rate: 10.0,
            tier1_threshold: 1000.0,
            tier1_rate: 12.0,
            tier2_threshold: 5000.0,
            tier2_rate: 15.0,
            performance_bonus_rate: 5.0,
            is_active: true
        });
        console.log(`✅ Rule created: ${ruleResponse.statusCode} - ID: ${ruleResponse.data.data.id}\n`);

        // Test 3: Create a transaction
        console.log('3. Creating transaction...');
        const transactionResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/transactions/',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            sales_rep_id: 1,
            sale_amount: 1500.00,
            product_details: 'Premium Software License - Annual Subscription'
        });
        console.log(`✅ Transaction created: ${transactionResponse.statusCode} - ID: ${transactionResponse.data.data.id}\n`);

        const transactionId = transactionResponse.data.data.id;

        // Test 4: Approve transaction and calculate commission
        console.log('4. Approving transaction and calculating commission...');
        const approveResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: `/api/transactions/${transactionId}/approve-and-calculate`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ Transaction approved: ${approveResponse.statusCode}`);
        console.log(`   Commission calculated: $${approveResponse.data.data.commission.commission_amount}`);
        console.log(`   Performance bonus: $${approveResponse.data.data.commission.performance_bonus}\n`);

        // Test 5: Get all transactions
        console.log('5. Getting all transactions...');
        const transactionsResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/transactions/',
            method: 'GET'
        });
        console.log(`✅ Retrieved ${transactionsResponse.data.data.length} transactions\n`);

        // Test 6: Get commissions by sales rep
        console.log('6. Getting commissions for sales rep #1...');
        const commissionsResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/commissions/rep/1',
            method: 'GET'
        });
        console.log(`✅ Retrieved ${commissionsResponse.data.data.length} commissions\n`);

        // Test 7: Get active commission rule
        console.log('7. Getting active commission rule...');
        const activeRuleResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/rules/active',
            method: 'GET'
        });
        console.log(`✅ Active rule: ${activeRuleResponse.data.data.name} (${activeRuleResponse.data.data.base_rate}% base rate)\n`);

        console.log('🎉 All tests completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Transactions: ${transactionsResponse.data.data.length}`);
        console.log(`   - Commissions: ${commissionsResponse.data.data.length}`);
        console.log(`   - Active Rules: 1`);
        console.log('\n💡 Tip: You can now use the API endpoints with your frontend application!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure the server is running on port 3001 before running tests.');
        console.log('Start the server with: node server.js');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };