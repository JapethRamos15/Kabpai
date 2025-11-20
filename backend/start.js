#!/usr/bin/env node

const CommissionTrackingServer = require('./server');

console.log('Starting Commission Tracking System Backend...');
console.log('Using only Node.js built-in modules (no external dependencies)');

const server = new CommissionTrackingServer();
server.start();