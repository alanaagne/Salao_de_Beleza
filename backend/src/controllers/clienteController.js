// /backend/src/controllers/clienteController.js

// Importa a conexão com o banco de dados
const db = require('../config/db');

//UPDATE (Atualizar Cliente Existente) 
exports.update = async (req, res) => {
    try {
        // Pega o CPF do cliente a ser atualizado da URL 
        const { cpf } = req.params; 
        
        // Pega os novos dados do corpo da requisição
        const { cep, uf, bairro, logradouro, cidade, numero, telefone, dataNascimento, nome } = req.body; 

        // SQL de atualização (WHERE cpf = ?)
        const [result] = await db.execute(
            'UPDATE Cliente SET cep = ?, uf = ?, bairro = ?, logradouro = ?, cidade = ?, numero = ?, telefone = ?, dataNascimento = ?, nome = ? WHERE cpf = ?',
            [cep, uf, bairro, logradouro, cidade, numero, telefone, dataNascimento, nome, cpf]
        );

        // Verifica se o cliente existia
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado para atualização.' });
        }

        res.status(200).json({ message: 'Cliente atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar cliente.' });
    }
};


//DELETE (Remover Cliente)
exports.remove = async (req, res) => {
    try {
        // Pega o CPF do cliente a ser excluído da URL
        const { cpf } = req.params; 

        // SQL de exclusão
        const [result] = await db.execute('DELETE FROM Cliente WHERE cpf = ?', [cpf]);

        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado para exclusão.' });
        }

        res.status(200).json({ message: 'Cliente excluído com sucesso!' });
    } catch (error) {
        // Se o cliente tem agendamentos (chave estrangeira), o BD pode rejeitar a exclusão.
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro interno ao excluir cliente. Verifique se há dados relacionados.' });
    }
};


//CREATE (Cadastrar Novo Cliente)
exports.create = async (req, res) => {
    try {
        // Pega os dados do corpo da requisição
        const { cpf, cep, uf, bairro, logradouro, cidade, numero, telefone, dataNascimento, nome } = req.body;

        // Validação básica
        if (!cpf || !nome || !telefone) {
            return res.status(400).json({ error: 'CPF, nome e telefone são obrigatórios.' });
        }

        // SQL de inserção
        const [result] = await db.execute(
            'INSERT INTO Cliente (cpf, cep, uf, bairro, logradouro, cidade, numero, telefone, dataNascimento, nome) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cpf, cep, uf, bairro, logradouro, cidade, numero, telefone, dataNascimento, nome]
        );

        res.status(201).json({ 
            message: 'Cliente cadastrado com sucesso!',
            cliente: { cpf, nome, telefone }
        });
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        
        // Verifica se é erro de duplicidade (CPF já existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'CPF já cadastrado.' });
        }
        
        res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
    }
};

//READ (Listar Clientes)
exports.list = async (req, res) => {
    try {
        // SQL para buscar todos os clientes
        const [clientes] = await db.execute('SELECT * FROM Cliente ORDER BY nome');

        res.status(200).json(clientes);
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({ error: 'Erro interno ao listar clientes.' });
    }
};

// READ (Buscar Cliente por CPF)
exports.findByCpf = async (req, res) => {
    try {
        const { cpf } = req.params;

        // SQL para buscar cliente específico
        const [clientes] = await db.execute('SELECT * FROM Cliente WHERE cpf = ?', [cpf]);

        // Verifica se encontrou o cliente
        if (clientes.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        res.status(200).json(clientes[0]);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro interno ao buscar cliente.' });
    }
};