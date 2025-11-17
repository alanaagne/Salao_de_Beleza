// backend/src/controllers/agendamentoController.js

const db = require('../config/db');

// --- FUNÇÃO AUXILIAR DE VALIDAÇÃO ---
const validarDadosAgendamento = (dados) => {
    // ... (esta função permanece igual à que você já tem) ...
    const { dataHorarioInicial, dataHorarioFinal, valor, cliente_id, cpf_profissional, servico_id } = dados;
    if (!dataHorarioInicial || !dataHorarioFinal || valor == null || !cliente_id || !cpf_profissional || !servico_id) {
        return 'Erro: Campos obrigatórios (data/hora, valor, cliente, profissional e serviço) não podem estar vazios.';
    }
    if (new Date(dataHorarioFinal) <= new Date(dataHorarioInicial)) {
        return 'Erro: O horário final do agendamento deve ser posterior ao horário inicial.';
    }
    return null;
};

// --- CONSULTA BASE COM JOIN (INTEGRAÇÃO) ---
const baseQuery = `
    SELECT 
        a.codigo, a.status, a.dataHorarioInicial, a.dataHorarioFinal, a.dataSolicitacao, a.valor,
        a.cliente_id, c.nome AS nome_cliente, c.telefone AS telefone_cliente,
        a.cpf_profissional, p.nome AS nome_profissional,
        a.servico_id, s.nomeTipo AS nome_servico
    FROM agendamento AS a
    LEFT JOIN cliente AS c ON a.cliente_id = c.id
    LEFT JOIN profissional AS p ON a.cpf_profissional = p.cpf
    LEFT JOIN servico AS s ON a.servico_id = s.idTipo
`;

// ✅ --- NOVA FUNÇÃO AUXILIAR ---
// Busca o status atual de um agendamento no banco
const getStatusAgendamento = async (codigo) => {
    try {
        const [rows] = await db.execute("SELECT status FROM agendamento WHERE codigo = ?", [codigo]);
        if (rows.length > 0) {
            return rows[0].status;
        }
        return null; // Não encontrou o agendamento
    } catch (error) {
        throw new Error("Erro ao buscar status do agendamento.");
    }
};

// --- FUNÇÃO AUXILIAR DE CONFLITO (ATUALIZADA) ---
const verificarConflito = async (cpf, inicio, fim, codigoExcluir = null) => {
    try {
        // --- ✅ REGRA DE NEGÓCIO 3: BLOQUEIO DE HORÁRIO DE ALMOÇO ---
        // Definindo o horário de almoço (12:00 às 13:00)
        const HORA_INICIO_ALMOCO = '12:00:00';
        const HORA_FIM_ALMOCO = '13:00:00';

        // Extrai apenas a parte da hora das datas
        const horaInicioNovo = new Date(inicio).toTimeString().split(' ')[0];
        const horaFimNovo = new Date(fim).toTimeString().split(' ')[0];

        // Lógica de sobreposição de horário: (Inicio < FimAlmoco) E (Fim > InicioAlmoco)
        const conflitoAlmoco = (horaInicioNovo < HORA_FIM_ALMOCO) && (horaFimNovo > HORA_INICIO_ALMOCO);

        if (conflitoAlmoco) {
            // Se houver conflito com o almoço, retorna true imediatamente
            return true;
        }

        // --- Verificação de conflito com outros agendamentos (lógica que já existia) ---
        let sql = `
            SELECT COUNT(*) as conflitos 
            FROM agendamento 
            WHERE cpf_profissional = ? 
              AND (dataHorarioInicial < ? AND dataHorarioFinal > ?)
              AND status <> 'cancelado'
        `;
        const params = [cpf, fim, inicio];

        if (codigoExcluir) {
            sql += ' AND codigo <> ?';
            params.push(codigoExcluir);
        }

        const [rows] = await db.execute(sql, params);
        return rows[0].conflitos > 0; // Retorna true se houver conflito

    } catch (error) {
        console.error("Erro ao verificar conflito:", error);
        throw new Error("Erro ao verificar disponibilidade."); 
    }
};

// =================================================================
// ROTAS DE CRUD (PADRÃO exports.nome)
// =================================================================

// CREATE (Atualizado para usar a nova verificação de conflito)
exports.create = async (req, res) => {
    const dados = req.body;
    
    const erroValidacao = validarDadosAgendamento(dados);
    if (erroValidacao) {
        return res.status(400).json({ error: erroValidacao });
    }

    try {
        const { cpf_profissional, dataHorarioInicial, dataHorarioFinal } = dados;
        const temConflito = await verificarConflito(cpf_profissional, dataHorarioInicial, dataHorarioFinal);
        
        if (temConflito) {
            return res.status(409).json({ 
                error: 'agendamento nao realizado, não há disponivel horário/data. (Horário de almoço ou profissional ocupado)' 
            });
        }

        const sql = `
            INSERT INTO agendamento 
            (status, dataHorarioInicial, dataHorarioFinal, dataSolicitacao, valor, cliente_id, cpf_profissional, servico_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            dados.status || 'agendado',
            dados.dataHorarioInicial,
            dados.dataHorarioFinal,
            dados.dataSolicitacao || new Date(),
            dados.valor,
            dados.cliente_id,
            dados.cpf_profissional,
            dados.servico_id
        ];

        const [result] = await db.execute(sql, values);
        res.status(201).json({ 
            message: 'Agendamento cadastrado com sucesso!',
            codigo: result.insertId 
        });

    } catch (error) {
        console.error('Erro ao cadastrar agendamento:', error);
        res.status(500).json({ error: 'Erro interno ao cadastrar agendamento.' });
    }
};

// READ (Listar Agendamentos) - Sem alterações
exports.list = async (req, res) => {
    // ... (esta função permanece igual à que você já tem) ...
    try {
        const { data, cpf } = req.query; 
        let query = baseQuery;
        let params = [];
        let whereClauses = [];

        if (data) {
            whereClauses.push('DATE(a.dataHorarioInicial) = ?');
            params.push(data);
        }
        if (cpf) {
            whereClauses.push('a.cpf_profissional = ?');
            params.push(cpf);
        }
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }
        query += ' ORDER BY a.dataHorarioInicial ASC';

        const [agendamentos] = await db.execute(query, params);
        res.status(200).json(agendamentos);
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({ error: 'Erro interno ao listar agendamentos.' });
    }
};

// READ (Buscar Agendamento por Código) - Sem alterações
exports.findByCodigo = async (req, res) => {
    // ... (esta função permanece igual à que você já tem) ...
     try {
        const { codigo } = req.params;
        const query = baseQuery + ' WHERE a.codigo = ?';
        const [agendamentos] = await db.execute(query, [codigo]);

        if (agendamentos.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        res.status(200).json(agendamentos[0]);
    } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ error: 'Erro interno ao buscar agendamento.' });
    }
};

// UPDATE (ATUALIZADO COM AS NOVAS REGRAS)
exports.update = async (req, res) => {
    try {
        const { codigo } = req.params;
        const dados = req.body;

        // --- ✅ REGRA DE NEGÓCIO 2: NÃO ALTERAR AGENDAMENTO REALIZADO ---
        const statusAtual = await getStatusAgendamento(codigo);
        if (statusAtual === 'realizado') {
            return res.status(403).json({ error: 'Não é possível alterar um agendamento que já foi realizado.' });
        }
        if (statusAtual === null) {
            return res.status(404).json({ message: 'Agendamento não encontrado para atualização.' });
        }
        // --- Fim da Regra 2 ---

        // 1. Validação de campos (horário, etc.)
        const erroValidacao = validarDadosAgendamento(dados);
        if (erroValidacao) {
            return res.status(400).json({ error: erroValidacao });
        }
        
        // 2. Verificar conflito (incluindo almoço e outros agendamentos)
        const { cpf_profissional, dataHorarioInicial, dataHorarioFinal } = dados;
        const temConflito = await verificarConflito(cpf_profissional, dataHorarioInicial, dataHorarioFinal, codigo);

        if (temConflito) {
            return res.status(409).json({ 
                error: 'agendamento nao realizado, não há disponivel horário/data. (Horário de almoço ou profissional ocupado)' 
            });
        }

        // 3. Se não houver conflito, prossegue com a atualização
        const sql = `
            UPDATE agendamento SET 
            status = ?, dataHorarioInicial = ?, dataHorarioFinal = ?, 
            dataSolicitacao = ?, valor = ?, cliente_id = ?, 
            cpf_profissional = ?, servico_id = ? 
            WHERE codigo = ?
        `;
        const values = [
            dados.status,
            dados.dataHorarioInicial,
            dados.dataHorarioFinal,
            dados.dataSolicitacao,
            dados.valor,
            dados.cliente_id,
            dados.cpf_profissional,
            dados.servico_id,
            codigo
        ];

        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {
             // Esta verificação agora é redundante por causa do getStatusAgendamento, mas mantemos por segurança
            return res.status(404).json({ message: 'Agendamento não encontrado para atualização.' });
        }

        res.status(200).json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar agendamento.' });
    }
};

// DELETE (ATUALIZADO COM AS NOVAS REGRAS)
exports.remove = async (req, res) => {
    try {
        const { codigo } = req.params; 

        // --- ✅ REGRA DE NEGÓCIO 1: NÃO CANCELAR AGENDAMENTO REALIZADO ---
        const statusAtual = await getStatusAgendamento(codigo);
        if (statusAtual === 'realizado') {
            return res.status(403).json({ error: 'Não é possível cancelar um agendamento que já foi realizado.' });
        }
        if (statusAtual === null) {
            return res.status(404).json({ message: 'Agendamento não encontrado para cancelamento.' });
        }
        // --- Fim da Regra 1 ---

        // Executa o "soft delete" (cancelamento)
        const sql = "UPDATE agendamento SET status = 'cancelado' WHERE codigo = ?";
        const [result] = await db.execute(sql, [codigo]);

        if (result.affectedRows === 0) {
            // Redundante, mas seguro
            return res.status(404).json({ message: 'Agendamento não encontrado para cancelamento.' });
        }

        res.status(200).json({ message: 'Agendamento cancelado com sucesso!' });
        
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        res.status(500).json({ error: 'Erro interno ao cancelar o agendamento.' });
    }
};