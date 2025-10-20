// /backend/src/config/db.js


const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    // O host é 'localhost' (se o Node e o MySQL estiverem na mesma máquina)
    host: 'localhost', 
    
    // Geralmente o usuário é 'root'
    user: 'root', 
    
    // Coloque a senha que você definiu durante a instalação do MySQL Installer.
    password: ' ', 
    
    // O nome do banco de dados que você criou (e rodou o script SQL)
    database: 'ExpressoDaBeleza', 

    // CORREÇÃO FINAL PARA ACENTUAÇÃO
    charset: 'utf8',
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connection;