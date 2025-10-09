// /backend/src/routes/routes.js

const express = require('express');
const router = express.Router();

// 1. Importa o controller de Cliente
const clienteController = require('../controllers/clienteController'); 

// Rotas de Cliente (CRUD COMPLETO)
// A rota base que definimos no server.js é '/api', então essas rotas serão:
// /api/clientes, /api/clientes/:cpf, etc.

//C - create


//R - read



//UPDATE (Atualizar Cliente)
//Método: PUT
router.put('/clientes/:cpf', clienteController.update); 

//DELETE (Remover Cliente)
//Método: DELETE
router.delete('/clientes/:cpf', clienteController.remove);

// rotas de profissional devem vir abaixo

module.exports = router;