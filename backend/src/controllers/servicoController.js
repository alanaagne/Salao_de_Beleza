//src\controllers\servicoController.js

// Importa a conexão com o banco de dados
const db = require('../config/db');

// Colunas da tabela Servico (idTipo, nomeTipo, custoServico, tempoDuracao, descricao)
const SERVICO_COLUMNS = 'idTipo, nomeTipo, custoServico, tempoDuracao, descricao';



//  CREATE (Cadastrar Novo Serviço)

exports.create = async (req, res) => {
    try {
        // NÃO ESPERA idTipo no body (AUTO_INCREMENT)
        const { nomeTipo, custoServico, tempoDuracao, descricao } = req.body; 

        // Validação básica: ID não é mais obrigatório
        if (!nomeTipo || custoServico == null || tempoDuracao == null) {
            return res.status(400).json({ error: 'Nome, Custo e Duração são obrigatórios.' });
        }

        const sql = `
            INSERT INTO Servico (nomeTipo, custoServico, tempoDuracao, descricao) 
            VALUES (?, ?, ?, ?)
        `;
        
        // Values sem o idTipo
        const values = [nomeTipo, custoServico, tempoDuracao, descricao];

        const [result] = await db.execute(sql, values);

        res.status(201).json({ 
            message: 'Serviço cadastrado com sucesso!',
            servico: { 
                idTipo: result.insertId, // Retorna o ID gerado pelo MySQL
                nomeTipo, 
                custoServico 
            }
        });
    } catch (error) {
        console.error('Erro ao cadastrar serviço:', error);
        res.status(500).json({ error: 'Erro interno ao cadastrar serviço.' });
    }
};



//  READ (Listar Serviços COM FUNCIONALIDADE DE BUSCA)

exports.list = async (req, res) => {
    try {
        const termoBusca = req.query.termo; 
        
        let query = `SELECT ${SERVICO_COLUMNS} FROM Servico`;
        let params = [];
        
        // Lógica de Busca (por Nome ou ID)
        if (termoBusca) {
            const termoLike = '%' + termoBusca + '%'; 
            query += ' WHERE nomeTipo LIKE ? OR idTipo LIKE ?'; 
            params = [termoLike, termoLike]; 
        }

        query += ' ORDER BY idTipo ASC'; 

        const [servicos] = await db.execute(query, params);

        res.status(200).json(servicos);
    } catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({ error: 'Erro interno ao listar serviços.' });
    }
};



//  READ (Buscar Serviço por ID PK)

exports.findByidTipo = async (req, res) => {
    try {
        const { idTipo } = req.params;

        // SQL para buscar serviço específico
        const [servicos] = await db.execute(`SELECT ${SERVICO_COLUMNS} FROM Servico WHERE idTipo = ?`, [idTipo]);

        if (servicos.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }

        res.status(200).json(servicos[0]);
    } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        res.status(500).json({ error: 'Erro interno ao buscar serviço.' });
    }
};



//  UPDATE (Atualizar Serviço Existente) 

exports.update = async (req, res) => {
    try {
        const { idTipo } = req.params; 
        
        // Pega os novos dados do corpo da requisição
        const { nomeTipo, custoServico, tempoDuracao, descricao } = req.body; 

        // SQL de atualização 
        const [result] = await db.execute(
            'UPDATE Servico SET nomeTipo = ?, custoServico = ?, tempoDuracao = ?, descricao = ? WHERE idTipo = ?',
            [nomeTipo, custoServico, tempoDuracao, descricao, idTipo]
        );

        // Verifica se o serviço existia
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado para atualização.' });
        }

        res.status(200).json({ message: 'Serviço atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar serviço.' });
    }
};


// DELETE (Remover Serviço)

exports.remove = async (req, res) => {
    try {
        const { idTipo } = req.params; 

        // SQL de exclusão
        const [result] = await db.execute('DELETE FROM Servico WHERE idTipo = ?', [idTipo]);

        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado para exclusão.' });
        }

        res.status(200).json({ message: 'Serviço excluído com sucesso!' });
    } catch (error) {
        
        console.error('Erro ao excluir serviço:', error);
        // Retorna um erro amigável se houver dependência 
        res.status(500).json({ error: 'Erro interno ao excluir serviço. Verifique se há agendamentos vinculados.' });
    }
};