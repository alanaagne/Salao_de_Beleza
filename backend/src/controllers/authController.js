// /backend/src/controllers/authController.js - VERSÃO FUNCIONANDO

const db = require('../config/db');

const SIMULATED_TOKEN = 'mock-jwt-token-12345';
const DEFAULT_USER = { id: 1, nome: 'Administrador', email: 'admin@salao.com', role: 'admin' };
const DEFAULT_PASSWORD = '123456';

// Login
exports.login = async (req, res) => {
    console.log('=== LOGIN INICIADO ===');
    
    try {
        const { email, senha } = req.body;
        console.log('Email:', email, 'Senha:', senha);

        // Login do admin (bypass)
        if (email === DEFAULT_USER.email && senha === DEFAULT_PASSWORD) {
            console.log('✅ Login admin (bypass)');
            return res.json({
                success: true,
                message: 'Login bem-sucedido!',
                data: {
                    user: DEFAULT_USER,
                    token: SIMULATED_TOKEN
                }
            });
        }

        // Busca no banco
        console.log('🔍 Buscando no banco...');
        const [rows] = await db.execute(
            'SELECT id, nome, email, senha, role FROM Usuario WHERE email = ?',
            [email]
        );

        console.log('📊 Resultado:', rows);

        if (rows.length === 0) {
            console.log('❌ Email não encontrado');
            return res.status(401).json({ 
                success: false, 
                message: 'Email não encontrado.' 
            });
        }

        const user = rows[0];
        console.log('✅ Usuário encontrado:', user.nome);

        if (user.senha === senha) {
            console.log('✅ Senha correta - Login OK');
            return res.json({
                success: true,
                message: 'Login bem-sucedido!',
                data: {
                    user: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email,
                        role: user.role || 'user'
                    },
                    token: SIMULATED_TOKEN
                }
            });
        } else {
            console.log('❌ Senha incorreta');
            return res.status(401).json({ 
                success: false, 
                message: 'Senha incorreta.' 
            });
        }

    } catch (error) {
        console.error('💥 ERRO NO LOGIN:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno: ' + error.message 
        });
    }
};

// Cadastro
exports.register = async (req, res) => {
    console.log('=== CADASTRO INICIADO ===');
    
    try {
        const { nome, email, senha } = req.body;
        const role = 'user';

        console.log('Dados:', { nome, email, senha });

        // Verifica se email já existe
        const [existing] = await db.execute(
            'SELECT id FROM Usuario WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            console.log('❌ Email já existe');
            return res.status(409).json({ 
                success: false, 
                message: 'Email já cadastrado.' 
            });
        }

        // Insere usuário
        console.log('📝 Inserindo usuário...');
        const [result] = await db.execute(
            'INSERT INTO Usuario (nome, email, senha, role) VALUES (?, ?, ?, ?)',
            [nome, email, senha, role]
        );

        console.log('✅ Usuário inserido, ID:', result.insertId);

        const newUser = {
            id: result.insertId,
            nome,
            email,
            role
        };

        return res.status(201).json({
            success: true,
            message: 'Conta criada com sucesso!',
            data: {
                user: newUser,
                token: SIMULATED_TOKEN
            }
        });

    } catch (error) {
        console.error('💥 ERRO NO CADASTRO:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno: ' + error.message 
        });
    }
};

// Verificar Token
exports.verifyToken = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if (token === SIMULATED_TOKEN) {
        return res.json({
            success: true,
            message: 'Token válido.',
            data: { user: DEFAULT_USER }
        });
    } else {
        return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
};