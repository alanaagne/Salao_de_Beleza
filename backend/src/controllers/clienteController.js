// /backend/src/controllers/clienteController.js

// 1. Importa a conexão com o banco de dados
const db = require('../config/db');

//U: UPDATE (Atualizar Cliente Existente) 
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


//D: DELETE (Remover Cliente)
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
        // Importante: Se o cliente tem agendamentos (chave estrangeira), o BD pode rejeitar a exclusão.
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro interno ao excluir cliente. Verifique se há dados relacionados.' });
    }
};