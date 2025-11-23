const TransactionController = require('../controllers/transactionController');

class TransactionRoutes {
    constructor() {
        this.controller = new TransactionController();
    }

    setupRoutes(app) {
        // POST Create Transaction
        app.post('/api/transactions/', (req, res) => {
            this.controller.createTransaction(req, res);
        });

        // GET All Transactions
        app.get('/api/transactions/', (req, res) => {
            this.controller.getAllTransactions(req, res);
        });

        // GET Single Transaction
        app.get('/api/transactions/:id', (req, res) => {
            this.controller.getTransactionById(req, res);
        });

    }
}

module.exports = TransactionRoutes;