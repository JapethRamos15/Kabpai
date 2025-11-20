const Database = require('../database');

class CommissionRuleController {
    constructor() {
        this.db = new Database();
    }

    // Create a new commission rule
    async createRule(req, res) {
        try {
            const {
                rule_name,
                base_rate,
                is_active
            } = req.body;

            // Validation
            if (!rule_name || !base_rate) {
                return res.status(400).json({
                    error: 'Missing required fields: rule_name, base_rate'
                });
            }

            const rule = await this.db.createRule({
                rule_name,
                base_rate: parseFloat(base_rate),
                is_active: is_active !== undefined ? Boolean(is_active) : true
            });

            res.status(201).json({
                success: true,
                data: rule
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Update an existing commission rule
    async updateRule(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Convert numeric fields
            if (updates.base_rate) updates.base_rate = parseFloat(updates.base_rate);
            if (updates.is_active !== undefined) updates.is_active = Boolean(updates.is_active);

            const rule = await this.db.updateRule(id, updates);
            if (!rule) {
                return res.status(404).json({
                    error: 'Commission rule not found'
                });
            }

            res.json({
                success: true,
                data: rule
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get all commission rules
    async getAllRules(req, res) {
        try {
            const rules = await this.db.getAllRules();
            res.json({
                success: true,
                data: rules
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get commission rule by ID
    async getRuleById(req, res) {
        try {
            const { id } = req.params;
            const rule = await this.db.getRuleById(id);

            if (!rule) {
                return res.status(404).json({
                    error: 'Commission rule not found'
                });
            }

            res.json({
                success: true,
                data: rule
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Delete a commission rule
    async deleteRule(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.db.deleteRule(id);

            if (!deleted) {
                return res.status(404).json({
                    error: 'Commission rule not found'
                });
            }

            res.json({
                success: true,
                message: 'Commission rule deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get active commission rule
    async getActiveRule(req, res) {
        try {
            const rules = await this.db.getAllRules();
            const activeRule = rules.find(rule => rule.is_active);

            if (!activeRule) {
                return res.status(404).json({
                    error: 'No active commission rule found'
                });
            }

            res.json({
                success: true,
                data: activeRule
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = CommissionRuleController;