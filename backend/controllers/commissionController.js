const Database = require('../database');

class CommissionController {
    constructor() {
        this.db = new Database();
    }

    // Get commission by ID
    async getCommissionById(req, res) {
        try {
            const { id } = req.params;
            const commission = await this.db.getCommissionById(id);

            if (!commission) {
                return res.status(404).json({
                    error: 'Commission not found'
                });
            }

            res.json({
                success: true,
                data: commission
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get commissions by sales representative
    async getCommissionsByRep(req, res) {
        try {
            const { id } = req.params;
            const commissions = await this.db.getCommissionsByRep(id);

            res.json({
                success: true,
                data: commissions
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Process payout (update commission status to PAID)
    async processPayout(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    error: 'Status is required'
                });
            }

            const validStatuses = ['PENDING', 'APPROVED', 'PAID', 'REJECTED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
                });
            }

            const commission = await this.db.updateCommission(id, { status });
            if (!commission) {
                return res.status(404).json({
                    error: 'Commission not found'
                });
            }

            res.json({
                success: true,
                data: commission
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Calculate and create commission for a transaction
    async calculateCommission(transactionId) {
        try {
            const transaction = await this.db.getTransactionById(transactionId);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Get commission rules (for now, use a simple 10% rate)
            const rules = await this.db.getAllRules();
            let commissionRate = 0.10; // Default 10%

            if (rules.length > 0) {
                // Use the first active rule (in a real app, you'd have more sophisticated logic)
                const activeRule = rules.find(rule => rule.is_active);
                if (activeRule) {
                    commissionRate = activeRule.base_rate / 100;
                }
            }

            const commissionAmount = transaction.sale_amount * commissionRate;
            const performanceBonus = this.calculatePerformanceBonus(transaction.sale_amount);

            const commission = await this.db.createCommission({
                transaction_id: transaction.id,
                commission_amount: commissionAmount,
                performance_bonus: performanceBonus,
                status: 'PENDING'
            });

            return commission;
        } catch (error) {
            throw error;
        }
    }

    // Calculate performance bonus based on sale amount
    calculatePerformanceBonus(saleAmount) {
        // Simple bonus structure: 5% bonus for sales over $1000
        if (saleAmount > 1000) {
            return saleAmount * 0.05;
        }
        return 0;
    }

    // Get all commissions
    async getAllCommissions(req, res) {
        try {
            const commissions = await this.db.getAllCommissions();
            res.json({
                success: true,
                data: commissions
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Create commission manually
    async createCommission(req, res) {
        try {
            const { transaction_id, commission_amount, performance_bonus, status } = req.body;

            if (!transaction_id || !commission_amount) {
                return res.status(400).json({
                    error: 'Missing required fields: transaction_id, commission_amount'
                });
            }

            const commission = await this.db.createCommission({
                transaction_id: parseInt(transaction_id),
                commission_amount: parseFloat(commission_amount),
                performance_bonus: parseFloat(performance_bonus) || 0,
                status: status || 'PENDING'
            });

            res.status(201).json({
                success: true,
                data: commission
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = CommissionController;