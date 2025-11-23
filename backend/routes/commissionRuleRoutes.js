const CommissionRuleController = require('../controllers/commissionRuleController');

class CommissionRuleRoutes {
    constructor() {
        this.controller = new CommissionRuleController();
    }

    setupRoutes(app) {
        // POST Create Rule
        app.post('/api/rules/', (req, res) => {
            this.controller.createRule(req, res);
        });

        // GET All Rules
        app.get('/api/rules/', (req, res) => {
            this.controller.getAllRules(req, res);
        });

        // DELETE Rule
        app.delete('/api/rules/:id', (req, res) => {
            this.controller.deleteRule(req, res);
        });
    }
}

module.exports = CommissionRuleRoutes;