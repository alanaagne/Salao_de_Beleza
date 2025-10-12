// /backend/src/routes/routes.js

const express = require('express');
const router = express.Router();

//Importa o controller de Cliente
const clienteController = require('../controllers/clienteController'); 

// Rotas de Cliente 
// A rota base definida no server.js é '/api', então essas rotas serão:
// /api/clientes, /api/clientes/:cpf, etc.

//CREATE (Cadastrar Cliente)
router.post('/clientes', clienteController.create);      

//READ (todos os clientes)
router.get('/clientes', clienteController.list);       

//READ (por cpf)
router.get('/clientes/:cpf', clienteController.findByCpf);


//UPDATE (Atualizar Cliente)
//Método: PUT
router.put('/clientes/:cpf', clienteController.update); 

//DELETE (Remover Cliente)
//Método: DELETE
router.delete('/clientes/:cpf', clienteController.remove);

// rotas de profissional devem vir abaixo

module.exports = router;