const CommissionController = require('../controllers/commissionController');

class CommissionRoutes {
    constructor() {
        this.controller = new CommissionController();
    }

    setupRoutes(app) {
        // GET All Commissions
        app.get('/api/commissions/', (req, res) => {
            this.controller.getAllCommissions(req, res);
        });

        // GET Commissions by Rep
        app.get('/api/commissions/rep/:id', (req, res) => {
            this.controller.getCommissionsByRep(req, res);
        });

        // PUT Process Payout
        app.put('/api/commissions/payout/:id', (req, res) => {
            this.controller.processPayout(req, res);
        });
    }
}

module.exports = CommissionRoutes;