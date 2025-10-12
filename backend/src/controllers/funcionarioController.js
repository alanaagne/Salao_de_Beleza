// backend/src/controllers/funcionarioController.js

// Importa a pool de conexão
const connection = require('../config/db');

// =================================================================
// FUNÇÕES AUXILIARES
// =================================================================

// Função para limpar e converter o salário de R$ 0.000,00 para 0000.00
function limparSalario(salarioStr) {
    if (!salarioStr) return 0.00;
    // Remove o 'R$', pontos de milhar, e substitui a vírgula por ponto
     const limpo = salarioStr.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0.00;
}

// =================================================================
// ROTAS DE CRUD (PADRÃO exports.nome)
// =================================================================

// R: READ (Listar Todos)
exports.list = async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM profissional ORDER BY nome');

        // Mapeamento e formatação de data para o frontend
        const profissionais = rows.map(p => ({
            ...p,
            data_admissao: p.data_admissao ? new Date(p.data_admissao).toISOString().split('T')[0] : null
        }));

        return res.json(profissionais);
    } catch (erro) {
        console.error('Erro ao buscar funcionários:', erro);
        return res.status(500).json({ error: 'Erro ao buscar a lista de funcionários.' });
    }
};

// C: CREATE (Criar Novo)
exports.create = async (req, res) => {
    const dados = req.body;

    const salarioNumerico = limparSalario(dados.salario);
    const statusDefault = 'Ativo';

    try {
        const sql = `
 INSERT INTO profissional 
 (cpf, nome, salario, endereco, telefone, especializacao, rg, cep, cidade, email, data_admissao, status)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

        const values = [
            dados.cpf, dados.nome, salarioNumerico, dados.endereco, dados.telefone,
            dados.cargo, dados.rg, dados.cep, dados.cidade, dados.email,
            dados.dataAdmissao, statusDefault
        ];

        const [resultado] = await connection.execute(sql, values);

        return res.status(201).json({ id: resultado.insertId, cpf: dados.cpf, message: 'Funcionário cadastrado com sucesso.' });
    } catch (error) {
        console.error("Erro ao cadastrar funcionário:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'CPF já cadastrado.' });
        }

        return res.status(400).json({ error: 'Erro ao cadastrar: ' + error.message });
    }
};

// R: READ (Buscar por CPF - Para edição)
exports.findByCpf = async (req, res) => {
    const cpf = req.params.cpf;
    try {
        const [rows] = await connection.execute('SELECT * FROM profissional WHERE cpf = ?', [cpf]);
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

// U: UPDATE (Editar)
exports.update = async (req, res) => {
    const cpf = req.params.cpf;
    const dados = req.body;
    
    // 1. Mapeamento e limpeza de dados
    const salarioNumerico = limparSalario(dados.salario); // Calcula o valor numérico
    const status = dados.status === '1' ? 'Ativo' : 'Inativo'; // Converte o status do front (1/0)
    
    try {
        const sql = `
            UPDATE profissional SET
            nome = ?, salario = ?, endereco = ?, telefone = ?, especializacao = ?, 
            rg = ?, cep = ?, cidade = ?, email = ?, data_admissao = ?, status = ?
            WHERE cpf = ?
        `;
        
        // 2. O array de valores (values) é a parte CRÍTICA:
        //    Usamos '|| null' para garantir que NENHUM campo seja 'undefined', 
        //    evitando o erro do driver mysql2/promise.
        const values = [
            dados.nome || null, // 1.
            salarioNumerico,    // 2. Usando o valor local calculado (CORRIGIDO)
            dados.endereco || null, // 3.
            dados.telefone || null, // 4.
            dados.cargo || null,    // 5. Mapeado para 'especializacao'
            dados.rg || null,       // 6.
            dados.cep || null,      // 7.
            dados.cidade || null,   // 8.
            dados.email || null,    // 9.
            dados.dataAdmissao || null, // 10. Mapeado para 'data_admissao'
            status,             // 11. 
            cpf                 // 12. WHERE condition
        ];

        const [resultado] = await connection.execute(sql, values);

        if (resultado.affectedRows === 0 && resultado.changedRows === 0) {
            return res.status(404).json({ message: 'Funcionário não encontrado ou nenhum dado alterado.' });
        }
        
        return res.json({ message: 'Funcionário atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao editar funcionário:', error);
        // Retorna 400 Bad Request se houver falha na query (como CPF duplicado, mas a chave é a condição WHERE)
        return res.status(400).json({ error: 'Erro ao editar: ' + error.message });
    }
};

// D: DELETE (Deletar)
exports.remove = async (req, res) => {
    const cpf = req.params.cpf;
    try {
        const [resultado] = await connection.execute('DELETE FROM profissional WHERE cpf = ?', [cpf]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        return res.status(500).json({ error: 'Erro ao deletar o profissional.' });
    }
};