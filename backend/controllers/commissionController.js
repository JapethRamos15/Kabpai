const Database = require('../database');

class CommissionController {
    constructor() {
        this.db = new Database();
    }

    async calculateCommission(transactionId) {
        try {
            console.log(`Starting calculation for Transaction ID: ${transactionId}`);

            const transaction = await this.db.getTransactionById(transactionId);
            if (!transaction) {
                console.error("Transaction not found!");
                throw new Error(`Transaction with ID ${transactionId} not found`);
            }
            console.log(`Transaction Found. Amount: ${transaction.sale_amount}`);

            const rules = await this.db.getAllRules();
            
            let activeRule = rules.find(r => r.is_active === 1 || r.is_active === true);
            
            if (!activeRule) {
                console.log("No active rule found in DB. Using Emergency Fallback (15%).");
                activeRule = { base_rate: 15.00 };
            } else {
                console.log(`Active Rule Found: ${activeRule.rule_name} (${activeRule.base_rate}%)`);
            }
            
            const amount = parseFloat(transaction.sale_amount);
            const rate = parseFloat(activeRule.base_rate) / 100;
            const commissionAmount = (amount * rate).toFixed(2);

            console.log(`Math: ${amount} * ${rate} = ${commissionAmount}`);

            const newCommission = await this.db.createCommission({
                transaction_id: transactionId,
                commission_amount: commissionAmount,
                performance_bonus: 0,
                status: 'PENDING'
            });

            console.log("Commission Saved Successfully:", newCommission);
            return newCommission;

        } catch (error) {
            console.error('CRITICAL ERROR inside calculateCommission:', error);
            throw error; 
        }
    }

    // Process Payout
    async processPayout(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; 

            if (!status) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Validation Error',
                    message: 'Status is required' 
                });
            }

            const updated = await this.db.updateCommission(id, { status });
            
            if (!updated) {
                return res.status(404).json({ success: false, error: 'Commission not found' });
            }

            res.json({ success: true, data: updated });
        } catch (error) {
            console.error('Payout Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get All Commissions
    async getAllCommissions(req, res) {
        try {
            const commissions = await this.db.getAllCommissions();
            res.json({ success: true, data: commissions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get Commissions by Rep
    async getCommissionsByRep(req, res) {
        try {
            const { id } = req.params;
            console.log(`Fetching commissions for Rep ID: ${id}`);
            const commissions = await this.db.getCommissionsByRep(id);
            res.json({ success: true, data: commissions });
        } catch (error) {
            console.error('Get Rep Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CommissionController;