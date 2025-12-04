// /backend/server.js - VERSÃO COM LOGS DETALHADOS

const express = require('express');
const cors = require('cors');
const path = require('path');

// Importação da rota centralizada
const routes = require('./src/routes/routes');

const app = express();
const PORT = 3000;

console.log('🔄 Iniciando servidor...');

// Middlewares
app.use(cors());
app.use(express.json());

// LOG MIDDLEWARE
app.use((req, res, next) => {
    console.log('=== NOVA REQUISIÇÃO RECEBIDA ===');
    console.log(`📨 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
    console.log('📍 Origin:', req.headers.origin);
    console.log('🔑 Authorization:', req.headers.authorization ? 'Present' : 'Missing');
    next();
});

// CONFIGURAÇÃO DO FRONT-END
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(frontendPath));

const imagensPath = path.join(__dirname, '..', 'imagens');
app.use('/imagens', express.static(imagensPath));

// Rota raiz
app.get('/', (req, res) => {
    console.log('🏠 Servindo página inicial');
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ROTAS DA API
console.log('🔗 Configurando rotas da API...');
app.use('/api', routes);

// MIDDLEWARE DE ERRO 
app.use((error, req, res, next) => {
    console.error('💥 ERRO NÃO TRATADO:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: error.message 
    });
});

// ROTA DE FALLBACK 
/*app.use('*', (req, res) => {
    console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada' 
    });
});*/

// INICIA O SERVIDOR
app.listen(PORT, () => {
    console.log('✅ ====================================');
    console.log('✅ Backend rodando na porta http://localhost:' + PORT);
    console.log('✅ Front-end acessível em http://localhost:' + PORT);
    console.log('✅ ====================================');
});