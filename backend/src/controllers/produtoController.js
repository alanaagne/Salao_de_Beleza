const db = require('../config/db');

// CREATE - Cadastrar Novo Produto
exports.create = async (req, res) => {
    try {
        const { nomeProduto, valorVenda, categoriaProduto, descricao, dataCadastro, status } = req.body;

        if (!nomeProduto || !valorVenda || !dataCadastro) {
            return res.status(400).json({ error: 'Nome, valor e data de cadastro são obrigatórios.' });
        }

        const [result] = await db.execute(
            'INSERT INTO Produto (nomeProduto, valorVenda, categoriaProduto, descricao, dataCadastro, status) VALUES (?, ?, ?, ?, ?, ?)',
            [nomeProduto, valorVenda, categoriaProduto, descricao, dataCadastro, status || 'Disponível']
        );

        res.status(201).json({ 
            message: 'Produto cadastrado com sucesso!',
            produto: { 
                id: result.insertId,
                nomeProduto, 
                valorVenda 
            }
        });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ error: 'Erro interno ao cadastrar produto.' });
    }
};

// READ - Listar Produtos com Busca
exports.list = async (req, res) => {
    try {
        const termoBusca = req.query.termo; 
        
        let query = 'SELECT * FROM Produto';
        let params = [];
        
        if (termoBusca) {
            const termoLike = '%' + termoBusca + '%'; 
            query += ' WHERE nomeProduto LIKE ? OR categoriaProduto LIKE ?'; 
            params = [termoLike, termoLike]; 
        }

        query += ' ORDER BY id ASC';

        const [produtos] = await db.execute(query, params);

        res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ error: 'Erro interno ao listar produtos.' });
    }
};

// READ - Buscar Produto por ID
exports.findById = async (req, res) => {
    try {
        const { id } = req.params;

        const [produtos] = await db.execute('SELECT * FROM Produto WHERE id = ?', [id]);

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.status(200).json(produtos[0]);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro interno ao buscar produto.' });
    }
};

// UPDATE - Atualizar Produto
exports.update = async (req, res) => {
    try {
        const { id } = req.params; 
        const { nomeProduto, valorVenda, categoriaProduto, descricao, status } = req.body; 

        const [result] = await db.execute(
            'UPDATE Produto SET nomeProduto = ?, valorVenda = ?, categoriaProduto = ?, descricao = ?, status = ? WHERE id = ?',
            [nomeProduto, valorVenda, categoriaProduto, descricao, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
        }

        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
    }
};

// DELETE - Remover Produto
exports.remove = async (req, res) => {
    try {
        const { id } = req.params; 

        const [result] = await db.execute('DELETE FROM Produto WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado para exclusão.' });
        }

        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro interno ao excluir produto.' });
    }
};