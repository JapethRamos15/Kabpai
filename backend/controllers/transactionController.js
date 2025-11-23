const Database = require('../database');

class TransactionController {
    constructor() {
        this.db = new Database();
    }

    async createTransaction(req, res) {
        try {
            const { sales_rep_id, sale_amount, product_details } = req.body;

            if (!sales_rep_id || !sale_amount) {
                return res.status(400).json({ 
                    error: 'Validation Error', 
                    message: 'Sales Rep ID and Sale Amount are required' 
                });
            }

            const transaction = await this.db.createTransaction({
                sales_rep_id,
                sale_amount,
                product_details,
                status: 'PENDING_APPROVAL'
            });

            res.status(201).json({
                success: true,
                data: transaction
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllTransactions(req, res) {
        try {
            const transactions = await this.db.getAllTransactions();
            res.json({ success: true, data: transactions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await this.db.getTransactionById(id);
            if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
            res.json({ success: true, data: transaction });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TransactionController;