// /backend/src/routes/routes.js

const express = require('express');
const router = express.Router();

//Importa o controller de Cliente
const clienteController = require('../controllers/clienteController'); 
const funcionarioController = require('../controllers/funcionarioController');
const authRoutes = require('../controllers/loginController');

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
// R: READ (Listar Todos)
router.get('/funcionarios', funcionarioController.list);
// C: CREATE
router.post('/funcionarios', funcionarioController.create);
// R: READ (Buscar por CPF)
router.get('/funcionarios/:cpf', funcionarioController.findByCpf);
// U: UPDATE
router.put('/funcionarios/:cpf', funcionarioController.update);
// D: DELETE
router.delete('/funcionarios/:cpf', funcionarioController.remove);

router.use('/auth', authRoutes);
router.post('/auth/login', (req, res) => {
    console.log("A ROTA DE LOGIN FOI ACESSADA!"); // <--- ADICIONE ESTA LINHA
    // ...resto do seu código da rota
});

module.exports = router;


