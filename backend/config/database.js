const mysql = require('mysql2/promise');

class DatabaseConnection {
    constructor() {
        this.config = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'commission_tracking',
            port: 3306,
            waitForConnections: true,
            connectionLimit: 10, // Allows 10 simultaneous actions
            queueLimit: 0
        };
        
        // Create the pool immediately
        this.pool = mysql.createPool(this.config);
    }

    async getConnection() {
        try {
            // Get a connection from the pool
            return await this.pool.getConnection();
        } catch (error) {
            console.error('Error getting database connection from pool:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.getConnection();
            await connection.execute('SELECT 1');
            connection.release(); // Important: Release it back to the pool
            console.log('Database connection test successful');
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    async closeConnection() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = DatabaseConnection;