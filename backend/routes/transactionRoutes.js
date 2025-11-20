const TransactionController = require('../controllers/transactionController');

class TransactionRoutes {
    constructor() {
        this.controller = new TransactionController();
    }

    setupRoutes(app) {
        // POST /api/transactions/ - Create new transaction
        app.post('/api/transactions/', (req, res) => {
            this.controller.createTransaction(req, res);
        });

        // PUT /api/transactions/status/:id - Update transaction status
        app.put('/api/transactions/status/:id', (req, res) => {
            this.controller.updateTransactionStatus(req, res);
        });

        // GET /api/transactions/ - Get all transactions
        app.get('/api/transactions/', (req, res) => {
            this.controller.getAllTransactions(req, res);
        });

        // GET /api/transactions/:id - Get transaction by ID
        app.get('/api/transactions/:id', (req, res) => {
            this.controller.getTransactionById(req, res);
        });

        // GET /api/transactions/rep/:id - Get transactions by sales representative
        app.get('/api/transactions/rep/:id', (req, res) => {
            this.controller.getTransactionsByRep(req, res);
        });
    }
}

module.exports = TransactionRoutes;