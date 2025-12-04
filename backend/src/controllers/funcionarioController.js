// backend/src/controllers/funcionarioController.js

const connection = require('../config/db');

// FUNÇÕES AUXILIARES
const limparSalario = (salarioStr) => {
    if (!salarioStr) return 0.00;
    const limpo = salarioStr.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0.00;
};

const limparCpf = (cpfStr) => {
    if (!cpfStr) return '';
    return cpfStr.replace(/\D/g, '');
};

//  ROTAS DE CRUD 

// READ (Listar Todos) 
exports.list = async (req, res) => {
    try {
        // 'especializacao' para 'cargo' usando 'AS'.
    
        const sql = 'SELECT cpf AS id, cpf, nome, especializacao AS cargo, telefone FROM profissional ORDER BY nome';
        const [rows] = await connection.execute(sql);

        return res.json(rows);
    } catch (erro) {
        console.error('Erro ao buscar funcionários:', erro);
        return res.status(500).json({ error: 'Erro ao buscar a lista de funcionários.' });
    }
};

//  CREATE (Criar Novo)
exports.create = async (req, res) => {
    const dados = req.body;
    const salarioNumerico = limparSalario(dados.salario);
    const cpfLimpo = limparCpf(dados.cpf);
    
    try {
        const sql = `INSERT INTO profissional (cpf, nome, salario, endereco, telefone, especializacao, rg, cep, cidade, email, data_admissao, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        
        const values = [
            cpfLimpo,
            dados.nome || null,
            salarioNumerico,
            dados.endereco || null,
            dados.telefone || null,
            dados.especializacao || dados.cargo || null, // Aceita 'especializacao' ou 'cargo'
            dados.rg || null,
            dados.cep || null,
            dados.cidade || null,
            dados.email || null,
            dados.data_admissao || dados.dataAdmissao || null, // Aceita 'data_admissao' ou 'dataAdmissao'
            'Ativo' // Status padrão no cadastro
        ];

        await connection.execute(sql, values);
        return res.status(201).json({ message: 'Funcionário cadastrado com sucesso.' });
    } catch (error) {
        console.error("Erro ao cadastrar funcionário:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'CPF já cadastrado.' });
        }
        return res.status(400).json({ error: 'Erro ao cadastrar: ' + error.message });
    }
};
//  READ (Buscar por CPF)
exports.findByCpf = async (req, res) => {
    const cpfLimpo = limparCpf(req.params.cpf);
    try {
        const [rows] = await connection.execute('SELECT * FROM profissional WHERE cpf = ?', [cpfLimpo]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        const profissional = rows[0];
        if (profissional.data_admissao) {
            profissional.data_admissao = new Date(profissional.data_admissao).toISOString().split('T')[0];
        }
        return res.json(profissional);
    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar funcionário.' });
    }
};

//  UPDATE (Editar)
exports.update = async (req, res) => {
    const cpfLimpo = limparCpf(req.params.cpf);
    const dados = req.body;
    const salarioNumerico = limparSalario(dados.salario);
    
    try {
        const sql = `UPDATE profissional SET nome = ?, salario = ?, endereco = ?, telefone = ?, especializacao = ?, rg = ?, cep = ?, cidade = ?, email = ?, data_admissao = ?, status = ? WHERE cpf = ?`;
        
        
        const values = [
            dados.nome || null,
            salarioNumerico,
            dados.endereco || null,
            dados.telefone || null,
            dados.especializacao || dados.cargo || null, // Aceita 'especializacao' ou 'cargo'
            dados.rg || null,
            dados.cep || null,
            dados.cidade || null,
            dados.email || null,
            dados.data_admissao || dados.dataAdmissao || null, // Aceita 'data_admissao' ou 'dataAdmissao'
            dados.status || 'Ativo',
            cpfLimpo
        ];

        const [resultado] = await connection.execute(sql, values);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        return res.json({ message: 'Funcionário atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao editar funcionário:', error);
        return res.status(400).json({ error: 'Erro ao editar: ' + error.message });
    }
};
//  DELETE (Deletar)
exports.remove = async (req, res) => {
    const cpfLimpo = limparCpf(req.params.cpf);
    try {
        const [resultado] = await connection.execute('DELETE FROM profissional WHERE cpf = ?', [cpfLimpo]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        return res.status(500).json({ error: 'Erro ao deletar o profissional.' });
    }
};