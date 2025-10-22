// /backend/src/config/db.js


const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    // O host é 'localhost' (se o Node e o MySQL estiverem na mesma máquina)
    host: 'localhost', 
    
    // Geralmente o usuário é 'root'
    user: 'root', 
    
    // Coloque a senha que você definiu durante a instalação do MySQL Installer.
    password: '', 
    
    // O nome do banco de dados que você criou (e rodou o script SQL)
    database: 'expressodabeleza', 

    //port: 3307,

    // CORREÇÃO FINAL PARA ACENTUAÇÃO
    charset: 'utf8',
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connection;

async function testConnection() {
    try {
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        console.log('Resultado do teste:', rows);
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        return false;
    }
}

testConnection();