#!/usr/bin/env node

const http = require('http');

// Example usage of the Commission Tracking System API
class CommissionAPIClient {
    constructor(baseUrl = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
    }

    async request(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: path,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                });
            });

            req.on('error', reject);
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }

    // Transaction methods
    async createTransaction(salesRepId, saleAmount, productDetails) {
        return this.request('POST', '/api/transactions/', {
            sales_rep_id: salesRepId,
            sale_amount: saleAmount,
            product_details: productDetails
        });
    }

    async approveTransaction(transactionId) {
        return this.request('PUT', `/api/transactions/${transactionId}/approve-and-calculate`);
    }

    async getTransactionsByRep(salesRepId) {
        return this.request('GET', `/api/transactions/rep/${salesRepId}`);
    }

    // Commission methods
    async getCommissionsByRep(salesRepId) {
        return this.request('GET', `/api/commissions/rep/${salesRepId}`);
    }

    async processPayout(commissionId) {
        return this.request('PUT', `/api/commissions/payout/${commissionId}`, {
            status: 'PAID'
        });
    }

    // Commission rules methods
    async createCommissionRule(ruleData) {
        return this.request('POST', '/api/rules/', ruleData);
    }

    async getActiveRule() {
        return this.request('GET', '/api/rules/active');
    }
}

// Example workflow
async function demonstrateWorkflow() {
    console.log('🚀 Commission Tracking System - Example Workflow\n');
    
    const api = new CommissionAPIClient();

    try {
        // Step 1: Create a commission rule
        console.log('📋 Step 1: Creating commission rule...');
        const rule = await api.createCommissionRule({
            name: 'Sales Team Commission Rule',
            description: 'Commission structure for the sales team',
            base_rate: 8.0,
            tier1_threshold: 2000.0,
            tier1_rate: 10.0,
            tier2_threshold: 10000.0,
            tier2_rate: 12.0,
            performance_bonus_rate: 3.0,
            is_active: true
        });
        console.log(`✅ Rule created: ${rule.data.name}\n`);

        // Step 2: Sales rep makes several sales
        console.log('💰 Step 2: Recording sales transactions...');
        const salesRepId = 1;
        
        const sale1 = await api.createTransaction(salesRepId, 1500, 'Basic Software License');
        const sale2 = await api.createTransaction(salesRepId, 2500, 'Premium Software License');
        const sale3 = await api.createTransaction(salesRepId, 800, 'Add-on Module');
        
        console.log(`✅ Created 3 sales transactions (IDs: ${sale1.data.id}, ${sale2.data.id}, ${sale3.data.id})\n`);

        // Step 3: Manager approves transactions and calculates commissions
        console.log('✅ Step 3: Manager approving transactions...');
        
        const commission1 = await api.approveTransaction(sale1.data.id);
        const commission2 = await api.approveTransaction(sale2.data.id);
        const commission3 = await api.approveTransaction(sale3.data.id);
        
        console.log(`✅ Approved transaction ${sale1.data.id} - Commission: $${commission1.data.commission.commission_amount}`);
        console.log(`✅ Approved transaction ${sale2.data.id} - Commission: $${commission2.data.commission.commission_amount}`);
        console.log(`✅ Approved transaction ${sale3.data.id} - Commission: $${commission3.data.commission.commission_amount}\n`);

        // Step 4: View sales rep's commission summary
        console.log('📊 Step 4: Sales Rep Commission Summary...');
        const commissions = await api.getCommissionsByRep(salesRepId);
        const totalCommission = commissions.data.reduce((sum, c) => sum + c.commission_amount + c.performance_bonus, 0);
        
        console.log(`✅ Sales Rep #1 has ${commissions.data.length} commission records`);
        console.log(`💵 Total commission earned: $${totalCommission.toFixed(2)}\n`);

        // Step 5: Process payouts
        console.log('💳 Step 5: Processing commission payouts...');
        for (const commission of commissions.data) {
            await api.processPayout(commission.id);
        }
        console.log(`✅ Processed ${commissions.data.length} commission payouts\n`);

        console.log('🎉 Workflow completed successfully!');
        console.log('\n📈 Business Impact:');
        console.log(`   - Total Sales: $${(sale1.data.sale_amount + sale2.data.sale_amount + sale3.data.sale_amount).toFixed(2)}`);
        console.log(`   - Total Commission: $${totalCommission.toFixed(2)}`);
        console.log(`   - Commission Rate: ${((totalCommission / (sale1.data.sale_amount + sale2.data.sale_amount + sale3.data.sale_amount)) * 100).toFixed(2)}%`);

    } catch (error) {
        console.error('❌ Error in workflow:', error.message);
        console.log('\nMake sure the server is running on port 3001');
    }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
    demonstrateWorkflow();
}

module.exports = { CommissionAPIClient, demonstrateWorkflow };