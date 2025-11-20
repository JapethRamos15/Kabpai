const CommissionRuleController = require('../controllers/commissionRuleController');

class CommissionRuleRoutes {
    constructor() {
        this.controller = new CommissionRuleController();
    }

    setupRoutes(app) {
        // POST /api/rules/ - Create new commission rule
        app.post('/api/rules/', (req, res) => {
            this.controller.createRule(req, res);
        });

        // PUT /api/rules/:id - Update commission rule
        app.put('/api/rules/:id', (req, res) => {
            this.controller.updateRule(req, res);
        });

        // GET /api/rules/ - Get all commission rules
        app.get('/api/rules/', (req, res) => {
            this.controller.getAllRules(req, res);
        });

        // GET /api/rules/:id - Get commission rule by ID
        app.get('/api/rules/:id', (req, res) => {
            this.controller.getRuleById(req, res);
        });

        // DELETE /api/rules/:id - Delete commission rule
        app.delete('/api/rules/:id', (req, res) => {
            this.controller.deleteRule(req, res);
        });

        // GET /api/rules/active - Get active commission rule
        app.get('/api/rules/active', (req, res) => {
            this.controller.getActiveRule(req, res);
        });
    }
}

module.exports = CommissionRuleRoutes;