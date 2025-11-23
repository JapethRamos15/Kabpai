const Database = require('../database');

class CommissionRuleController {
    constructor() {
        this.db = new Database();
    }

    async createRule(req, res) {
        try {
            const { rule_name, base_rate, is_active } = req.body;

            const rule = await this.db.createRule({
                rule_name,
                base_rate,
                is_active
            });

            res.status(201).json({ success: true, data: rule });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllRules(req, res) {
        try {
            const rules = await this.db.getAllRules();
            res.json({ success: true, data: rules });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteRule(req, res) {
        try {
            const { id } = req.params;
            const success = await this.db.deleteRule(id);
            if (!success) return res.status(404).json({ error: 'Rule not found' });
            res.json({ success: true, message: 'Rule deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CommissionRuleController;