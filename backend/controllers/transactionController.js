const Database = require('../database');

class TransactionController {
    constructor() {
        this.db = new Database();
    }

    // Create a new transaction
    async createTransaction(req, res) {
        try {
            const { sales_rep_id, sale_amount, product_details, transaction_date } = req.body;

            // Validation
            if (!sales_rep_id || !sale_amount || !product_details) {
                return res.status(400).json({
                    error: 'Missing required fields: sales_rep_id, sale_amount, product_details'
                });
            }

            const transaction = await this.db.createTransaction({
                sales_rep_id: parseInt(sales_rep_id),
                sale_amount: parseFloat(sale_amount),
                product_details,
                transaction_date: transaction_date || new Date().toISOString()
            });

            res.status(201).json({
                success: true,
                data: transaction
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Update transaction status
    async updateTransactionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    error: 'Status is required'
                });
            }

            const validStatuses = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
                });
            }

            const transaction = await this.db.updateTransactionStatus(id, status);
            if (!transaction) {
                return res.status(404).json({
                    error: 'Transaction not found'
                });
            }

            res.json({
                success: true,
                data: transaction
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get all transactions
    async getAllTransactions(req, res) {
        try {
            const transactions = await this.db.getAllTransactions();
            res.json({
                success: true,
                data: transactions
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get transaction by ID
    async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await this.db.getTransactionById(id);

            if (!transaction) {
                return res.status(404).json({
                    error: 'Transaction not found'
                });
            }

            res.json({
                success: true,
                data: transaction
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get transactions by sales representative
    async getTransactionsByRep(req, res) {
        try {
            const { id } = req.params;
            const transactions = await this.db.getTransactionsByRep(id);

            res.json({
                success: true,
                data: transactions
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = TransactionController;