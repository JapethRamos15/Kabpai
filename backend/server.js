const http = require('http');
const url = require('url');

const TransactionRoutes = require('./routes/transactionRoutes');
const CommissionRoutes = require('./routes/commissionRoutes');
const CommissionRuleRoutes = require('./routes/commissionRuleRoutes');

const CommissionController = require('./controllers/commissionController');

class CommissionTrackingServer {
    constructor() {
        this.port = process.env.PORT || 3001;
        this.server = http.createServer(this.handleRequest.bind(this));
        
        // Initialize routes
        this.transactionRoutes = new TransactionRoutes();
        this.commissionRoutes = new CommissionRoutes();
        this.commissionRuleRoutes = new CommissionRuleRoutes();
        this.commissionController = new CommissionController();
        
        this.setupRoutes();
    }

    setupRoutes() {
        // Setup all routes
        this.transactionRoutes.setupRoutes(this);
        this.commissionRoutes.setupRoutes(this);
        this.commissionRuleRoutes.setupRoutes(this);

        // Additional utility routes
        this.get('/api/health', (req, res) => {
            res.json({
                success: true,
                message: 'Commission Tracking System API is running',
                timestamp: new Date().toISOString()
            });
        });

        // Auto-calculate commission when transaction is approved
        this.put('/api/transactions/:id/approve-and-calculate', async (req, res) => {
            try {
                const { id } = req.params;
                
                // First update transaction status to APPROVED
                const transaction = await this.commissionController.db.updateTransactionStatus(id, 'APPROVED');
                if (!transaction) {
                    return res.status(404).json({
                        error: 'Transaction not found'
                    });
                }

                // Then calculate and create commission
                const commission = await this.commissionController.calculateCommission(id);

                res.json({
                    success: true,
                    data: {
                        transaction,
                        commission
                    },
                    message: 'Transaction approved and commission calculated successfully'
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });
    }

    // Helper method to register GET routes
    get(path, handler) {
        this.registerRoute('GET', path, handler);
    }

    // Helper method to register POST routes
    post(path, handler) {
        this.registerRoute('POST', path, handler);
    }

    // Helper method to register PUT routes
    put(path, handler) {
        this.registerRoute('PUT', path, handler);
    }

    // Helper method to register DELETE routes
    delete(path, handler) {
        this.registerRoute('DELETE', path, handler);
    }

    // Route registration method
    registerRoute(method, path, handler) {
        if (!this.routes) {
            this.routes = {};
        }
        if (!this.routes[method]) {
            this.routes[method] = {};
        }
        this.routes[method][path] = handler;
    }

    // Parse request body
    parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve(parsed);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // Main request handler
    async handleRequest(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const method = req.method;
            const pathname = parsedUrl.pathname;

            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // Handle preflight requests
            if (method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // Set content type
            res.setHeader('Content-Type', 'application/json');

            // Parse body for POST/PUT requests
            if (method === 'POST' || method === 'PUT') {
                req.body = await this.parseBody(req);
            }

            // Find matching route
            let handler = null;
            if (this.routes && this.routes[method]) {
                // Exact match first
                if (this.routes[method][pathname]) {
                    handler = this.routes[method][pathname];
                } else {
                    // Pattern matching for routes with parameters
                    for (const route in this.routes[method]) {
                        if (this.routeMatches(route, pathname)) {
                            // Extract parameters and add to req.params
                            req.params = this.extractParams(route, pathname);
                            handler = this.routes[method][route];
                            break;
                        }
                    }
                }
            }

            if (handler) {
                // Create response object with json method
                const response = {
                    json: (data) => {
                        res.writeHead(data.statusCode || 200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(data));
                    },
                    status: (code) => {
                        res.statusCode = code;
                        return response;
                    }
                };

                // Call the handler
                handler(req, response);
            } else {
                // 404 Not Found
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Route not found',
                    message: `Cannot ${method} ${pathname}`
                }));
            }
        } catch (error) {
            console.error('Request handling error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }));
        }
    }

    // Route pattern matching
    routeMatches(route, pathname) {
        const routeParts = route.split('/');
        const pathParts = pathname.split('/');

        if (routeParts.length !== pathParts.length) {
            return false;
        }

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                continue; // Parameter matches anything
            }
            if (routeParts[i] !== pathParts[i]) {
                return false;
            }
        }

        return true;
    }

    // Extract parameters from route
    extractParams(route, pathname) {
        const routeParts = route.split('/');
        const pathParts = pathname.split('/');
        const params = {};

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                const paramName = routeParts[i].substring(1);
                params[paramName] = pathParts[i];
            }
        }

        return params;
    }

    // Start the server
    start() {
        this.server.listen(this.port, () => {
            console.log(`Commission Tracking System API server running on port ${this.port}`);
            console.log('Available endpoints:');
            console.log('  GET  /api/health - Health check');
            console.log('  GET  /api/transactions/ - Get all transactions');
            console.log('  POST /api/transactions/ - Create transaction');
            console.log('  GET  /api/transactions/:id - Get transaction by ID');
            console.log('  PUT  /api/transactions/status/:id - Update transaction status');
            console.log('  GET  /api/transactions/rep/:id - Get transactions by sales rep');
            console.log('  PUT  /api/transactions/:id/approve-and-calculate - Approve and calculate commission');
            console.log('  GET  /api/commissions/ - Get all commissions');
            console.log('  GET  /api/commissions/:id - Get commission by ID');
            console.log('  GET  /api/commissions/rep/:id - Get commissions by sales rep');
            console.log('  PUT  /api/commissions/payout/:id - Process payout');
            console.log('  POST /api/commissions/ - Create commission manually');
            console.log('  GET  /api/rules/ - Get all commission rules');
            console.log('  POST /api/rules/ - Create commission rule');
            console.log('  GET  /api/rules/:id - Get commission rule by ID');
            console.log('  PUT  /api/rules/:id - Update commission rule');
            console.log('  DELETE /api/rules/:id - Delete commission rule');
            console.log('  GET  /api/rules/active - Get active commission rule');
        });
    }

    // Stop the server
    stop() {
        this.server.close(() => {
            console.log('Server stopped');
        });
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new CommissionTrackingServer();
    server.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down gracefully...');
        server.stop();
        process.exit(0);
    });
}

module.exports = CommissionTrackingServer;