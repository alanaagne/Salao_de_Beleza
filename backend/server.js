// /backend/server.js


const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');

const app = express();
const PORT = 3000; 

// Middlewares
app.use(cors()); // Permite requisições do Frontend
app.use(express.json()); // Habilita o Express a ler JSON do corpo das requisições

// Rotas da aplicação
app.use('/api', routes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Backend rodando na porta http://localhost:${PORT}`);
});