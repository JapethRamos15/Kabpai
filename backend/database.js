const DatabaseConnection = require('./config/database');

class Database {
    constructor() {
        this.dbConnection = new DatabaseConnection();
        this.initDatabase();
    }

    async initDatabase() {
        try {
            // Test database connection
            await this.dbConnection.testConnection();
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    // ==========================================
    // TRANSACTION METHODS
    // ==========================================
    async createTransaction(transactionData) {
        const connection = await this.dbConnection.getConnection();
        
        const query = `
            INSERT INTO transactions (sales_rep_id, sale_amount, transaction_date, status)
            VALUES (?, ?, ?, ?)
        `;
        
        const values = [
            transactionData.sales_rep_id,
            transactionData.sale_amount,
            transactionData.transaction_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
            transactionData.status || 'PENDING_APPROVAL'
        ];

        try {
            const [result] = await connection.execute(query, values);
            const [newTransaction] = await connection.execute(
                'SELECT * FROM transactions WHERE id = ?',
                [result.insertId]
            );
            return newTransaction[0];
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    }

    async updateTransactionStatus(id, status) {
        const connection = await this.dbConnection.getConnection();
        
        const query = `
            UPDATE transactions 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        
        try {
            const [result] = await connection.execute(query, [status, id]);
            
            if (result.affectedRows === 0) return null;
            
            const [transaction] = await connection.execute(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            );
            return transaction[0];
        } catch (error) {
            console.error('Error updating transaction status:', error);
            throw error;
        }
    }

    async getAllTransactions() {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM transactions ORDER BY transaction_date DESC');
            return rows;
        } catch (error) {
            console.error('Error getting all transactions:', error);
            throw error;
        }
    }

    async getTransactionById(id) {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting transaction by ID:', error);
            throw error;
        }
    }

    async getTransactionsByRep(salesRepId) {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM transactions WHERE sales_rep_id = ? ORDER BY transaction_date DESC',
                [salesRepId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting transactions by rep:', error);
            throw error;
        }
    }

    // ==========================================
    // COMMISSION METHODS
    // ==========================================
    async createCommission(commissionData) {
        // 1. Get connection from pool
        const connection = await this.dbConnection.getConnection();
        
        const query = `
            INSERT INTO commissions (transaction_id, commission_amount, performance_bonus, status)
            VALUES (?, ?, ?, ?)
        `;
        
        const values = [
            commissionData.transaction_id,
            commissionData.commission_amount,
            commissionData.performance_bonus || 0,
            commissionData.status || 'PENDING'
        ];

        try {
            const [result] = await connection.execute(query, values);
            const [newCommission] = await connection.execute(
                'SELECT * FROM commissions WHERE id = ?',
                [result.insertId]
            );
            
            return newCommission[0];
        } catch (error) {
            console.error('Error creating commission:', error);
            throw error;
        } finally { 
            connection.release();
        }
    }

    async updateCommission(id, updates) {
        const connection = await this.dbConnection.getConnection();
        
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            // FIX: Only add the field if the value is NOT undefined
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) return null;
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        
        const query = `UPDATE commissions SET ${fields.join(', ')} WHERE id = ?`;
        
        try {
            const [result] = await connection.execute(query, values);
            if (result.affectedRows === 0) return null;
            
            const [commission] = await connection.execute(
                'SELECT * FROM commissions WHERE id = ?',
                [id]
            );
            return commission[0];
        } catch (error) {
            console.error('Error updating commission:', error);
            throw error;
        }
    }

    async getCommissionById(id) {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM commissions WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting commission by ID:', error);
            throw error;
        }
    }

    async getCommissionsByRep(salesRepId) {
        const connection = await this.dbConnection.getConnection();
        
        const query = `
            SELECT c.*, t.sales_rep_id 
            FROM commissions c
            JOIN transactions t ON c.transaction_id = t.id
            WHERE t.sales_rep_id = ?
            ORDER BY c.created_at DESC
        `;
        
        try {
            const [rows] = await connection.execute(query, [salesRepId]);
            return rows;
        } catch (error) {
            console.error('Error getting commissions by rep:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAllCommissions() {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT c.*, t.sales_rep_id, t.sale_amount, t.transaction_date
                FROM commissions c
                JOIN transactions t ON c.transaction_id = t.id
                ORDER BY c.created_at DESC
            `);
            return rows;
        } catch (error) {
            console.error('Error getting all commissions:', error);
            throw error;
        }
    }

    // ==========================================
    // COMMISSION RULES METHODS
    // ==========================================
    async createRule(ruleData) {
        const connection = await this.dbConnection.getConnection();
        
        const query = `
            INSERT INTO commission_rules (rule_name, base_rate, is_active)
            VALUES (?, ?, ?)
        `;

        let activeValue = 1; 
        if (ruleData.is_active !== undefined) {
            activeValue = ruleData.is_active ? 1 : 0;
        }

        const values = [
            ruleData.rule_name,
            ruleData.base_rate,
            activeValue
        ];

        try {
            const [result] = await connection.execute(query, values);
            
            const [newRule] = await connection.execute(
                'SELECT * FROM commission_rules WHERE id = ?',
                [result.insertId]
            );
            
            return newRule[0];
        } catch (error) {
            console.error('Error creating rule:', error);
            throw error;
        }
    }

    async updateRule(id, updates) {
        const connection = await this.dbConnection.getConnection();
        
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        
        if (fields.length === 0) return null;
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        
        const query = `UPDATE commission_rules SET ${fields.join(', ')} WHERE id = ?`;
        
        try {
            const [result] = await connection.execute(query, values);
            if (result.affectedRows === 0) return null;
            
            const [rule] = await connection.execute(
                'SELECT * FROM commission_rules WHERE id = ?',
                [id]
            );
            return rule[0];
        } catch (error) {
            console.error('Error updating rule:', error);
            throw error;
        }
    }

    async getAllRules() {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM commission_rules ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            console.error('Error getting all rules:', error);
            throw error;
        }
    }

    async getRuleById(id) {
        const connection = await this.dbConnection.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM commission_rules WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting rule by ID:', error);
            throw error;
        }
    }

    async deleteRule(id) {
        const connection = await this.dbConnection.getConnection();
        try {
            const [result] = await connection.execute('DELETE FROM commission_rules WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting rule:', error);
            throw error;
        }
    }

    // ==========================================
    // SALES REP METHODS (FIXED & EXPANDED)
    // ==========================================
    
    async createSalesRep(salesRepData) {
        const connection = await this.dbConnection.getConnection();
        
        const query = `
            INSERT INTO sales_reps (name, email, phone, hire_date)
            VALUES (?, ?, ?, ?)
        `;
        
        const values = [
            salesRepData.name,
            salesRepData.email,
            salesRepData.phone || null,
            salesRepData.hire_date || null
        ];

        try {
            const [result] = await connection.execute(query, values);
            
            // Return the created sales rep
            const [newSalesRep] = await connection.execute(
                'SELECT * FROM sales_reps WHERE id = ?',
                [result.insertId]
            );
            
            return newSalesRep[0];
        } catch (error) {
            console.error('Error creating sales rep:', error);
            throw error;
        }
    }

    async getAllSalesReps() {
        const connection = await this.dbConnection.getConnection();
        
        try {
            const [rows] = await connection.execute('SELECT * FROM sales_reps ORDER BY name');
            return rows;
        } catch (error) {
            console.error('Error getting all sales reps:', error);
            throw error;
        }
    }

    async getSalesRepById(id) {
        const connection = await this.dbConnection.getConnection();
        
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM sales_reps WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting sales rep by ID:', error);
            throw error;
        }
    }

    // ADDED: Needed for validation in controller
    async getSalesRepByEmail(email) {
        const connection = await this.dbConnection.getConnection();
        
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM sales_reps WHERE email = ?',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting sales rep by Email:', error);
            throw error;
        }
    }

    // ADDED: Needed for UPDATE endpoint
    async updateSalesRep(id, updates) {
        const connection = await this.dbConnection.getConnection();
        
        // Build dynamic update query
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            // Only add field if it's not undefined
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) {
            return null;
        }
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        
        const query = `UPDATE sales_reps SET ${fields.join(', ')} WHERE id = ?`;
        
        try {
            const [result] = await connection.execute(query, values);
            
            if (result.affectedRows === 0) {
                return null;
            }
            
            const [salesRep] = await connection.execute(
                'SELECT * FROM sales_reps WHERE id = ?',
                [id]
            );
            return salesRep[0];
        } catch (error) {
            console.error('Error updating sales rep:', error);
            throw error;
        }
    }

    // ADDED: Needed for DELETE endpoint
    async deleteSalesRep(id) {
        const connection = await this.dbConnection.getConnection();
        
        try {
            const [result] = await connection.execute('DELETE FROM sales_reps WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting sales rep:', error);
            throw error;
        }
    }

    async close() {
        await this.dbConnection.closeConnection();
    }
}

module.exports = Database;