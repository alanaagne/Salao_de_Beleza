// /backend/src/routes/routes.js

const express = require('express');
const router = express.Router();


//  IMPORTAÇÃO DOS CONTROLLERS


// Módulos Existentes
const clienteController = require('../controllers/clienteController'); 
const funcionarioController = require('../controllers/funcionarioController');
const servicoController = require('../controllers/servicoController');
const produtoController = require('../controllers/produtoController');

// Módulos de Autenticação (É crucial para o seu login.js)
const authController = require('../controllers/authController');       


//  ROTAS DE CLIENTES (/api/clientes)


//CREATE (Cadastrar Cliente)
router.post('/clientes', clienteController.create);      
//READ (todos os clientes)
router.get('/clientes', clienteController.list);       
//READ (por cpf)
router.get('/clientes/:cpf', clienteController.findByCpf);
//UPDATE (Atualizar Cliente)
router.put('/clientes/:cpf', clienteController.update); 
//DELETE (Remover Cliente)
router.delete('/clientes/:cpf', clienteController.remove);


//  ROTAS DE FUNCIONÁRIOS (/api/funcionarios)


// READ (Listar Todos)
router.get('/funcionarios', funcionarioController.list);
// CREATE
router.post('/funcionarios', funcionarioController.create);
// READ (Buscar por CPF)
router.get('/funcionarios/:cpf', funcionarioController.findByCpf);
// UPDATE
router.put('/funcionarios/:cpf', funcionarioController.update);
// DELETE
router.delete('/funcionarios/:cpf', funcionarioController.remove);

// Rotas de Serviço
router.post('/servicos', servicoController.create); // CREATE
router.get('/servicos', servicoController.list);   // READ ALL 
router.get('/servicos/:idTipo', servicoController.findByidTipo); // READ 
router.put('/servicos/:idTipo', servicoController.update); // UPDATE
router.delete('/servicos/:idTipo', servicoController.remove); // DELETE

// Rotas de Produtos
// Rotas de Produto
router.post('/produtos', produtoController.create);      
router.get('/produtos', produtoController.list);       
router.get('/produtos/:id', produtoController.findById);
router.put('/produtos/:id', produtoController.update); 
router.delete('/produtos/:id', produtoController.remove);


//  ROTAS DE AUTENTICAÇÃO (/api/auth)
// POST /api/auth/login
router.post('/auth/login', authController.login);
// POST /api/auth/register
router.post('/auth/register', authController.register);
// GET /api/auth/verify
router.get('/auth/verify', authController.verifyToken);



module.exports = router;