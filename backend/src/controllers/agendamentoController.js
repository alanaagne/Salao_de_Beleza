// backend/src/controllers/agendamentoController.js

const db = require('../config/db');

// --- CONFIGURAÇÕES DA EMPRESA ---
const HORARIO_ABERTURA = '08:00:00';
const HORARIO_FECHAMENTO = '18:00:00';
const INICIO_ALMOCO = '12:00:00';
const FIM_ALMOCO = '13:00:00';
const INTERVALO_SLOT = 30; // Minutos entre cada opção de horário

// --- VALIDAÇÃO ---
const validarDadosAgendamento = (dados) => {
    const { dataHorarioInicial, dataHorarioFinal, valor, cliente_id, cpf_profissional, servico_id } = dados;
    if (!dataHorarioInicial || !dataHorarioFinal || valor == null || !cliente_id || !cpf_profissional || !servico_id) {
        return 'Erro: Todos os campos são obrigatórios.';
    }
    if (new Date(dataHorarioFinal) <= new Date(dataHorarioInicial)) {
        return 'Erro: Hora final deve ser maior que hora inicial.';
    }
    return null;
};

// --- QUERY BASE ---
const baseQuery = `
    SELECT 
        a.codigo, a.status, a.dataHorarioInicial, a.dataHorarioFinal, a.dataSolicitacao, a.valor,
        a.cliente_id, c.nome AS nome_cliente,
        a.cpf_profissional, p.nome AS nome_profissional,
        a.servico_id, s.nomeTipo AS nome_servico
    FROM agendamento AS a
    LEFT JOIN cliente AS c ON a.cliente_id = c.ID
    LEFT JOIN profissional AS p ON a.cpf_profissional = p.cpf
    LEFT JOIN servico AS s ON a.servico_id = s.idTipo
`;

// --- VERIFICAÇÃO DE CONFLITO (Segurança Final) ---
const verificarConflito = async (cpf, inicio, fim, codigoExcluir = null) => {
    try {
        // 1. Verifica Almoço
        const horaIni = new Date(inicio).toTimeString().split(' ')[0];
        const horaFim = new Date(fim).toTimeString().split(' ')[0];
        if (horaIni < FIM_ALMOCO && horaFim > INICIO_ALMOCO) return true;

        // 2. Verifica Banco de Dados
        let sql = `
            SELECT COUNT(*) as conflitos FROM agendamento 
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
        return rows[0].conflitos > 0;
    } catch (error) {
        throw new Error("Erro ao verificar conflito.");
    }
};

// =================================================================
// ROTAS
// =================================================================

// ✅ NOVA ROTA: CALCULAR DISPONIBILIDADE
exports.checkAvailability = async (req, res) => {
    try {
        const { cpf, data, duracao } = req.query;
        if (!cpf || !data || !duracao) return res.status(400).json({ error: 'Faltam dados.' });

        const duracaoMin = parseInt(duracao);

        // 1. Busca ocupações do dia
        const [ocupados] = await db.execute(`
            SELECT dataHorarioInicial, dataHorarioFinal 
            FROM agendamento 
            WHERE cpf_profissional = ? AND DATE(dataHorarioInicial) = ? AND status <> 'cancelado'
        `, [cpf, data]);

        // 2. Prepara variáveis de tempo
        const base = data + 'T';
        const inicioDia = new Date(base + HORARIO_ABERTURA);
        const fimDia = new Date(base + HORARIO_FECHAMENTO);
        const inicioAlmoco = new Date(base + INICIO_ALMOCO);
        const fimAlmoco = new Date(base + FIM_ALMOCO);

        let slots = [];
        let cursor = new Date(inicioDia);

        // 3. Gera slots e filtra
        while (cursor.getTime() + duracaoMin * 60000 <= fimDia.getTime()) {
            const slotFim = new Date(cursor.getTime() + duracaoMin * 60000);
            let livre = true;

            // Colide com almoço?
            if (cursor < fimAlmoco && slotFim > inicioAlmoco) livre = false;

            // Colide com agendamento?
            if (livre) {
                for (let ag of ocupados) {
                    if (cursor < ag.dataHorarioFinal && slotFim > ag.dataHorarioInicial) {
                        livre = false; 
                        break; 
                    }
                }
            }

            if (livre) {
                const hh = String(cursor.getHours()).padStart(2, '0');
                const mm = String(cursor.getMinutes()).padStart(2, '0');
                slots.push(`${hh}:${mm}`);
            }

            // Próximo slot a cada 30 min
            cursor = new Date(cursor.getTime() + INTERVALO_SLOT * 60000);
        }

        res.json(slots);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao calcular disponibilidade.' });
    }
};

exports.create = async (req, res) => {
    const dados = req.body;
    const erro = validarDadosAgendamento(dados);
    if (erro) return res.status(400).json({ error: erro });

    try {
        const conflito = await verificarConflito(dados.cpf_profissional, dados.dataHorarioInicial, dados.dataHorarioFinal);
        if (conflito) return res.status(409).json({ error: 'Horário indisponível ou horário de almoço.' });

        const sql = `INSERT INTO agendamento (status, dataHorarioInicial, dataHorarioFinal, dataSolicitacao, valor, cliente_id, cpf_profissional, servico_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            dados.status || 'agendado', dados.dataHorarioInicial, dados.dataHorarioFinal,
            dados.dataSolicitacao || new Date(), dados.valor, dados.cliente_id, dados.cpf_profissional, dados.servico_id
        ];
        const [result] = await db.execute(sql, values);
        res.status(201).json({ message: 'Sucesso!', codigo: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar.' });
    }
};

exports.list = async (req, res) => {
    try {
        const { data, cpf, cliente } = req.query;
        let query = baseQuery;
        let params = [];
        let wheres = [];

        if (data) { wheres.push('DATE(a.dataHorarioInicial) = ?'); params.push(data); }
        if (cpf) { wheres.push('a.cpf_profissional = ?'); params.push(cpf); }
        if (cliente) { wheres.push('c.nome LIKE ?'); params.push(`%${cliente}%`); }

        if (wheres.length > 0) query += ' WHERE ' + wheres.join(' AND ');
        query += ' ORDER BY a.dataHorarioInicial ASC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar.' });
    }
};

exports.findByCodigo = async (req, res) => {
    try {
        const [rows] = await db.execute(baseQuery + ' WHERE a.codigo = ?', [req.params.codigo]);
        if (rows.length === 0) return res.status(404).json({ message: 'Não encontrado.' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno.' });
    }
};

exports.update = async (req, res) => {
    try {
        const { codigo } = req.params;
        const dados = req.body;
        
        // Verifica se já foi realizado
        const [statusRow] = await db.execute("SELECT status FROM agendamento WHERE codigo = ?", [codigo]);
        if (statusRow.length > 0 && statusRow[0].status === 'realizado') {
            return res.status(403).json({ error: 'Não é possível alterar agendamento realizado.' });
        }

        const erro = validarDadosAgendamento(dados);
        if (erro) return res.status(400).json({ error: erro });

        const conflito = await verificarConflito(dados.cpf_profissional, dados.dataHorarioInicial, dados.dataHorarioFinal, codigo);
        if (conflito) return res.status(409).json({ error: 'Horário indisponível.' });

        const sql = `UPDATE agendamento SET status=?, dataHorarioInicial=?, dataHorarioFinal=?, dataSolicitacao=?, valor=?, cliente_id=?, cpf_profissional=?, servico_id=? WHERE codigo=?`;
        const values = [dados.status, dados.dataHorarioInicial, dados.dataHorarioFinal, dados.dataSolicitacao, dados.valor, dados.cliente_id, dados.cpf_profissional, dados.servico_id, codigo];
        
        await db.execute(sql, values);
        res.json({ message: 'Atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar.' });
    }
};

exports.remove = async (req, res) => {
    try {
        const { codigo } = req.params;
        const [statusRow] = await db.execute("SELECT status FROM agendamento WHERE codigo = ?", [codigo]);
        if (statusRow.length > 0 && statusRow[0].status === 'realizado') {
            return res.status(403).json({ error: 'Não é possível cancelar agendamento realizado.' });
        }
        await db.execute("UPDATE agendamento SET status = 'cancelado' WHERE codigo = ?", [codigo]);
        res.json({ message: 'Cancelado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cancelar.' });
    }
};