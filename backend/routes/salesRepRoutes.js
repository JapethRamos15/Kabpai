const SalesRepController = require('../controllers/salesRepController');

class SalesRepRoutes {
    constructor() {
        this.controller = new SalesRepController();
    }

    setupRoutes(app) {
        // POST /api/sales-reps/ - Create new sales representative
        app.post('/api/sales-reps/', (req, res) => {
            this.controller.createSalesRep(req, res);
        });

        // GET /api/sales-reps/ - Get all sales representatives
        app.get('/api/sales-reps/', (req, res) => {
            this.controller.getAllSalesReps(req, res);
        });

        // GET /api/sales-reps/:id - Get sales representative by ID
        app.get('/api/sales-reps/:id', (req, res) => {
            this.controller.getSalesRepById(req, res);
        });

        // PUT /api/sales-reps/:id - Update sales representative
        app.put('/api/sales-reps/:id', (req, res) => {
            this.controller.updateSalesRep(req, res);
        });

        // DELETE /api/sales-reps/:id - Delete sales representative
        app.delete('/api/sales-reps/:id', (req, res) => {
            this.controller.deleteSalesRep(req, res);
        });
    }
}

module.exports = SalesRepRoutes;