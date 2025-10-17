// /backend/src/config/db.js
//precisa da dependência instalada e o bd precisa estar local

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost', // Mude se seu BD estiver em outro lugar
    user: '', // mude para Seu usuário do MySQL
    password: '', // Sua senha do MySQL
    database: 'ExpressoDaBeleza', // O nome do banco que você criou
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connection;