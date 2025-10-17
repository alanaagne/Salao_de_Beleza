const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
// Corrigindo a importação do banco de dados (provavelmente está em ../config/db.js)
const connection = require('../config/db'); 
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const registerValidation = [
    body('nome')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nome deve ter entre 2 e 255 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ser válido'),
    body('senha')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ser válido'),
    body('senha')
        .notEmpty()
        .withMessage('Senha é obrigatória')
];

// Rota de registro
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { nome, email, senha } = req.body;

        // Verificar se o usuário já existe
        // Use connection.execute se for mysql2/promise, ou connection.query se for mysql
        const [existingUsers] = await connection.execute(
            'SELECT id FROM novoLogin WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email já está cadastrado'
            });
        }

        // Hash da senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        // Inserir novo usuário
        const [result] = await connection.execute(
            'INSERT INTO novoLogin (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, hashedPassword]
        );

        // Gerar token JWT
        const user = {
            id: result.insertId,
            nome,
            email
        };

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            data: {
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                },
                token
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota de login
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { email, senha } = req.body;

        // Buscar usuário no banco
        const [users] = await connection.execute(
            'SELECT id, nome, email, senha FROM novoLogin WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }

        const user = users[0];

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }

        // Gerar token JWT
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                },
                token
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota protegida para dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar dados atualizados do usuário
        const [users] = await connection.execute(
            'SELECT id, nome, email FROM novoLogin WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            message: 'Acesso autorizado ao dashboard',
            data: {
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                },
                dashboard: {
                    titulo: 'Bem-vindo ao Expresso da Beleza',
                    mensagem: `Olá, ${user.nome}! Você está logado no sistema.`,
                    servicos_disponiveis: [
                        'Corte de Cabelo',
                        'Coloração',
                        'Tratamentos Capilares',
                        'Manicure e Pedicure',
                       'Maquiagem',
                        'Sobrancelhas'
                    ]
                }
            }
        });

    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para verificar token
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        data: {
            user: req.user
       }
    });
});

module.exports = router;