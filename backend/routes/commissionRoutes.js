const CommissionController = require('../controllers/commissionController');

class CommissionRoutes {
    constructor() {
        this.controller = new CommissionController();
    }

    setupRoutes(app) {
        // GET /api/commissions/:id - Get commission by ID
        app.get('/api/commissions/:id', (req, res) => {
            this.controller.getCommissionById(req, res);
        });

        // GET /api/commissions/rep/:id - Get commissions by sales representative
        app.get('/api/commissions/rep/:id', (req, res) => {
            this.controller.getCommissionsByRep(req, res);
        });

        // PUT /api/commissions/payout/:id - Process payout
        app.put('/api/commissions/payout/:id', (req, res) => {
            this.controller.processPayout(req, res);
        });

        // GET /api/commissions/ - Get all commissions
        app.get('/api/commissions/', (req, res) => {
            this.controller.getAllCommissions(req, res);
        });

        // POST /api/commissions/ - Create commission manually
        app.post('/api/commissions/', (req, res) => {
            this.controller.createCommission(req, res);
        });
    }
}

module.exports = CommissionRoutes;