const Database = require('../database');

class SalesRepController {
    constructor() {
        this.db = new Database();
    }

    // Create a new sales representative
    async createSalesRep(req, res) {
        try {
            const { name, email, phone, hire_date } = req.body;

            // Validation
            if (!name || !email) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Name and email are required'
                });
            }

            // Check if email exists (using a DB helper method)
            const existingRep = await this.db.getSalesRepByEmail(email);
            if (existingRep) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Email already exists'
                });
            }

            // Create the rep
            const salesRep = await this.db.createSalesRep({
                name,
                email,
                phone,
                hire_date
            });

            res.status(201).json({
                success: true,
                data: salesRep,
                message: 'Sales representative created successfully'
            });
        } catch (error) {
            console.error('Controller Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get all sales representatives
    async getAllSalesReps(req, res) {
        try {
            const salesReps = await this.db.getAllSalesReps();
            res.json({
                success: true,
                data: salesReps
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Get sales representative by ID
    async getSalesRepById(req, res) {
        try {
            const { id } = req.params;
            const salesRep = await this.db.getSalesRepById(id);

            if (!salesRep) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Sales representative not found'
                });
            }

            res.json({
                success: true,
                data: salesRep
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Update Sales Rep
    async updateSalesRep(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedRep = await this.db.updateSalesRep(id, updates);

            if (!updatedRep) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Sales representative not found'
                });
            }

            res.json({
                success: true,
                data: updatedRep,
                message: 'Sales representative updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Delete Sales Rep
    async deleteSalesRep(req, res) {
        try {
            const { id } = req.params;

            const deleted = await this.db.deleteSalesRep(id);

            if (!deleted) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Sales representative not found'
                });
            }

            res.json({
                success: true,
                message: 'Sales representative deleted successfully'
            });
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    error: 'Cannot delete',
                    message: 'Cannot delete sales rep with associated transactions.'
                });
            }
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = SalesRepController;