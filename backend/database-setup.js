const mysql = require('mysql2/promise');
const DatabaseConnection = require('./config/database');

class DatabaseSetup {
    constructor() {
        this.dbConnection = new DatabaseConnection();
    }

    async createDatabase() {
        try {
            // First, connect without specifying a database to create it
            const config = {
                host: 'localhost',
                user: 'root',
                password: '',
                port: 3306
            };

            const connection = await mysql.createConnection(config);
            
            // Create database if it doesn't exist
            await connection.execute('CREATE DATABASE IF NOT EXISTS commission_tracking');
            console.log('Database "commission_tracking" created or already exists');
            
            await connection.end();
        } catch (error) {
            console.error('Error creating database:', error);
            throw error;
        }
    }

    async createTables() {
        try {
            const connection = await this.dbConnection.getConnection();

            // Create transactions table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sales_rep_id INT NOT NULL,
                    sale_amount DECIMAL(10,2) NOT NULL,
                    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED') DEFAULT 'PENDING_APPROVAL',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Create commissions table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS commissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    transaction_id INT NOT NULL,
                    commission_amount DECIMAL(10,2) NOT NULL,
                    performance_bonus DECIMAL(10,2) DEFAULT 0.00,
                    status ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED') DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
                )
            `);

            // Create commission_rules table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS commission_rules (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    rule_name VARCHAR(255) NOT NULL,
                    base_rate DECIMAL(5,2) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Create sales_reps table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS sales_reps (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    hire_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            console.log('All tables created successfully');

            // Insert default commission rule
            await connection.execute(`
                INSERT IGNORE INTO commission_rules (rule_name, base_rate, is_active)
                VALUES ('Default Rule', 10.00, TRUE)
            `);

            // Insert sample sales rep
            await connection.execute(`
                INSERT IGNORE INTO sales_reps (name, email, phone, hire_date)
                VALUES ('John Doe', 'john.doe@example.com', '+1234567890', '2023-01-01')
            `);

            console.log('Default data inserted successfully');

        } catch (error) {
            console.error('Error creating tables:', error);
            throw error;
        }
    }

    async runSetup() {
        try {
            console.log('Starting database setup...');
            
            await this.createDatabase();
            await this.createTables();
            
            console.log('Database setup completed successfully!');
            console.log('Database: commission_tracking');
            console.log('Tables created: transactions, commissions, commission_rules, sales_reps');
            console.log('Default data: commission rule and sample sales rep inserted');
            
        } catch (error) {
            console.error('Database setup failed:', error);
            throw error;
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    const setup = new DatabaseSetup();
    setup.runSetup().then(() => {
        console.log('Setup completed');
        process.exit(0);
    }).catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}

module.exports = DatabaseSetup;