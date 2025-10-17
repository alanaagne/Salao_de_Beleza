// /backend/src/controllers/authController.js

const db = require('../config/db'); // Certifique-se de que este caminho está correto: 'src' -> 'config' -> 'db.js'

// Token de simulação para o Front-end. EM PROD, use 'jsonwebtoken'
const SIMULATED_TOKEN = 'mock-jwt-token-12345';
const DEFAULT_USER = { id: 1, nome: 'Administrador', email: 'admin@salao.com', role: 'admin' };
const DEFAULT_PASSWORD = '123456'; // A senha padrão para a simulação


// Login (Corrigido para MySQL)

exports.login = (req, res) => {
    const { email, senha } = req.body;

    // Simulação: Verifica se é o usuário padrão 'admin'
    if (email === DEFAULT_USER.email && senha === DEFAULT_PASSWORD) {
        return res.json({
            success: true,
            message: 'Login bem-sucedido!',
            data: {
                user: DEFAULT_USER,
                token: SIMULATED_TOKEN
            }
        });
    }

    // Tenta buscar no banco usando db.query() (Sintaxe MySQL)
    // CUIDADO: Este código não usa HASH de senha (bcrypt). É apenas para o fluxo inicial.
    const sql = 'SELECT id, nome, email, senha, role FROM Usuario WHERE email = ?';

    // MySQL usa .query() e a função de callback retorna 'results' (um array)
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Erro no MySQL durante o login:', err);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
        
        // Pega o primeiro resultado (a linha do usuário)
        const row = results.length ? results[0] : null;

        if (!row) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas: Email não encontrado.' });
        }
        
        // Simulação de verificação de senha
        if (row.senha === senha) {
             const user = { id: row.id, nome: row.nome, email: row.email, role: row.role || 'user' };
             return res.json({
                success: true,
                message: 'Login bem-sucedido!',
                data: {
                    user: user,
                    token: SIMULATED_TOKEN 
                }
            });
        } else {
             return res.status(401).json({ success: false, message: 'Credenciais inválidas: Senha incorreta.' });
        }
    });
};


//  Cadastro (Corrigido para MySQL)

exports.register = (req, res) => {
    const { nome, email, senha } = req.body;
    
    // Na vida real, verifique a existência do email antes de inserir!

    const sql = 'INSERT INTO Usuario (nome, email, senha, role) VALUES (?, ?, ?, ?)';
    const role = 'user'; // Novo usuário é sempre 'user'

    // db.query() também é usado para INSERT
    db.query(sql, [nome, email, senha, role], (err, result) => {
        if (err) {
            // Código 409: Conflito (provavelmente email duplicado)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Erro: Este email já está em uso.' });
            }
            console.error('Erro no MySQL durante o cadastro:', err);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
        
        // Simula o retorno de sucesso
        const newUser = { id: result.insertId, nome, email, role };
        
        return res.status(201).json({
            success: true,
            message: 'Conta criada com sucesso!',
            data: {
                user: newUser,
                token: SIMULATED_TOKEN // Geração simulada
            }
        });
    });
};


//  Verificar Token (Simulado)

exports.verifyToken = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    //  Verifica se o token é o nosso mock
    if (token === SIMULATED_TOKEN) {
        return res.json({
            success: true,
            message: 'Token válido.',
            data: { user: DEFAULT_USER } // Retorna os dados do usuário
        });
    } else {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
    }
};


//  Middleware de Proteção (Opcional, mas útil para o CRUD)

exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Acesso negado. Token necessário.' });
    }
    const token = authHeader.split(' ')[1];

    if (token === SIMULATED_TOKEN) {
        // Simulação de usuário autenticado
        req.user = DEFAULT_USER; 
        next(); // Permite que a requisição prossiga
    } else {
        return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
};