const mysql = require('mysql2/promise');

class DatabaseConnection {
    constructor() {
        // XAMPP MySQL configuration
        this.config = {
            host: 'localhost',
            user: 'root',  // Default XAMPP user
            password: '',  // Default XAMPP password (empty)
            database: 'commission_tracking',
            port: 3306,    // Default MySQL port
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        
        this.connection = null;
    }

    // Create connection pool
    async createConnection() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('Connected to MySQL database successfully');
            return this.connection;
        } catch (error) {
            console.error('MySQL connection error:', error);
            throw error;
        }
    }

    // Get connection pool
    async getConnection() {
        try {
            if (!this.connection) {
                await this.createConnection();
            }
            return this.connection;
        } catch (error) {
            console.error('Error getting database connection:', error);
            throw error;
        }
    }

    // Close connection
    async closeConnection() {
        try {
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
                console.log('MySQL connection closed');
            }
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }

    // Test database connection
    async testConnection() {
        try {
            const connection = await this.getConnection();
            await connection.execute('SELECT 1');
            console.log('Database connection test successful');
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}

module.exports = DatabaseConnection;