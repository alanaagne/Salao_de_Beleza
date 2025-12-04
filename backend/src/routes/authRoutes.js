// /backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota POST para Login
router.post('/login', authController.login);

// Rota POST para Cadastro (Inscrição)
router.post('/register', authController.register);

// Rota GET para Verificação de Token 
router.get('/verify', authController.verifyToken);

module.exports = router;