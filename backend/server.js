// /backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path'); // Necessário para gerenciar caminhos de arquivos estáticos

// Importação da rota centralizada
const routes = require('./src/routes/routes');

const app = express();
const PORT = 3000; 

// Middlewares
app.use(cors()); // Permite requisições do Front-end
app.use(express.json()); // Habilita o Express a ler JSON do corpo das requisições


// CONFIGURAÇÃO DO FRONT-END (Arquivos Estáticos)


// 1. Servir a pasta 'public' do frontend (para HTML, CSS, JS)
// O '..' sobe do /backend/ para o diretório raiz do projeto.
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(frontendPath));

// 2. SERVIR A PASTA DE IMAGENS (CORREÇÃO PARA IMAGENS QUE NÃO CARREGAM)
// Mapeia a pasta 'imagens' que está no diretório raiz do projeto.
// O prefixo '/imagens' no URL do navegador (src="/imagens/...") agora aponta para essa pasta.
const imagensPath = path.join(__dirname, '..', 'imagens');
app.use('/imagens', express.static(imagensPath));


// Define a rota raiz para servir a página de Login/Inicial (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});


// ROTAS DA API (BACKEND)


// Rotas da aplicação (Clientes, Funcionários, Auth)
app.use('/api', routes);


// INICIA O SERVIDOR

app.listen(PORT, () => {
    console.log(`Backend rodando na porta http://localhost:${PORT}`);
    console.log(`Front-end acessível em http://localhost:${PORT}`);
});