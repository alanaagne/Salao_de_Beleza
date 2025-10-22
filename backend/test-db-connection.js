// backend/test-db-connection.js
const db = require('./src/config/db');

async function testDatabase() {
    console.log('🔄 Iniciando teste de banco de dados...');
    
    try {
        // Teste 1: Conexão básica
        console.log('1. Testando conexão...');
        const [test1] = await db.execute('SELECT 1 as resultado');
        console.log('✅ Conexão OK:', test1);

        // Teste 2: Buscar usuários
        console.log('2. Buscando usuários...');
        const [users] = await db.execute('SELECT * FROM Usuario WHERE email = ?', ['erica@gmail.com']);
        console.log('✅ Usuários encontrados:', users);

        // Teste 3: Inserir usuário
        console.log('3. Testando inserção...');
        const [insert] = await db.execute(
            'INSERT INTO Usuario (nome, email, senha, role) VALUES (?, ?, ?, ?)',
            ['Teste', 'teste' + Date.now() + '@teste.com', '123456', 'user']
        );
        console.log('✅ Inserção OK, ID:', insert.insertId);

        console.log('🎉 TODOS OS TESTES PASSARAM!');

    } catch (error) {
        console.error('💥 ERRO NO BANCO:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        console.error('Stack:', error.stack);
    }
}

testDatabase();