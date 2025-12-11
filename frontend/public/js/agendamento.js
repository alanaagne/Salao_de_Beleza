// /frontend/public/js/agendamento.js

const API_URL = 'http://localhost:3000/api/agendamentos';
const CLIENTES_URL = 'http://localhost:3000/api/clientes';
const FUNCIONARIOS_URL = 'http://localhost:3000/api/funcionarios';
const SERVICOS_URL = 'http://localhost:3000/api/servicos';

document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos ---
    const viewRegistro = document.getElementById('view-registro');
    const viewCadastro = document.getElementById('view-cadastro');
    const tabelaAgendamentos = document.getElementById('tabela-agendamentos');
    const formAgendamento = document.getElementById('form-agendamento');
    const formTitle = document.getElementById('form-title-text');
    const btnNovoCadastro = document.getElementById('btn-novo-cadastro');
    const btnCancelarForm = document.getElementById('btn-cancelar-form');
    
    // Filtros
    const filtroData = document.getElementById('filtro-data');
    const filtroCliente = document.getElementById('filtro-cliente');
    const filtroProfissional = document.getElementById('filtro-profissional'); // ✅ NOVO

    // Modais
    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const modalSucesso = document.getElementById('modal-sucesso');
    const btnModalConfirmar = document.getElementById('btn-modal-confirmar');
    const btnModalCancelar = document.getElementById('btn-modal-cancelar');
    
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const fecharMenuBtn = document.querySelector('.fechar-menu');
    const statusGroup = document.getElementById('status-group');

    // Elementos Form
    const elProfissional = document.getElementById('cpf_profissional');
    const elServico = document.getElementById('servico_id');
    const elCliente = document.getElementById('cliente_id');
    const elData = document.getElementById('dataAgendamento');
    const elHorario = document.getElementById('horarioInicial');
    const elFim = document.getElementById('dataHorarioFinal');
    const elValor = document.getElementById('valor');
    const elDataSol = document.getElementById('dataSolicitacao');
    const elStatus = document.getElementById('status');
    const infoDuracao = document.getElementById('info-duracao');
    const divOcupados = document.getElementById('lista-ocupados');
    const btnSalvar = document.querySelector('.btn-salvar');

    let codigoParaAcao = null;
    let modoEdicao = false;

    // --- Auxiliares ---
    const toggleMenu = () => menuLateral.classList.toggle('aberto');
    
    const formatarDataInput = (dataString, type) => {
        if (!dataString) dataString = new Date();
        const d = new Date(dataString);
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');

        if (type === 'date') return `${ano}-${mes}-${dia}`;
        if (type === 'datetime') return `${ano}-${mes}-${dia}T${hh}:${min}`;
        if (type === 'time') return `${hh}:${min}`;
        return d.toLocaleDateString();
    };

    const formatarValor = (valor) => {
        if (valor == null) return 'R$ 0,00';
        return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Modais
    const mostrarModalSucesso = (msg) => { 
        const msgElement = document.getElementById('sucesso-msg');
        if(msgElement) msgElement.textContent = msg;
        if(modalSucesso) modalSucesso.style.display = 'flex'; 
    };
    const fecharModalSucesso = () => { if(modalSucesso) modalSucesso.style.display = 'none'; };
    const abrirModalConfirmacao = (codigo) => { 
        codigoParaAcao = codigo; 
        const txt = document.getElementById('modal-confirmacao-texto');
        if(txt) txt.innerHTML = "Tem Certeza<br>de que deseja<br>cancelar este<br>agendamento?";
        if(modalConfirmacao) modalConfirmacao.style.display = 'flex'; 
    };
    const fecharModalConfirmacao = () => { if(modalConfirmacao) modalConfirmacao.style.display = 'none'; };

    // --- Views ---
    const mostrarViewRegistro = () => {
        viewCadastro.style.display = 'none';
        viewRegistro.style.display = 'block';
        formAgendamento.reset();
        divOcupados.style.display = 'none';
        listarAgendamentos();
    };

    const mostrarViewCadastro = (isEdicao = false, dados = null) => {
        viewRegistro.style.display = 'none';
        viewCadastro.style.display = 'block';
        formAgendamento.reset();
        modoEdicao = isEdicao;
        infoDuracao.textContent = '';
        divOcupados.style.display = 'none';
        
        elHorario.innerHTML = '<option value="" disabled selected>Selecione Profissional, Serviço e Data</option>';
        elHorario.disabled = true;

        // Resetar bloqueios (Padrão: tudo liberado)
        [elCliente, elProfissional, elServico, elData, elHorario, elValor, elStatus].forEach(e => e.disabled = false);
        if (btnSalvar) btnSalvar.style.display = 'inline-flex';

        if (isEdicao && dados) {
            formTitle.textContent = 'Editar Agendamento';
            statusGroup.style.display = 'flex';
            
            document.getElementById('codigo-original').value = dados.codigo;
            elCliente.value = dados.cliente_id;
            elProfissional.value = dados.cpf_profissional;
            elServico.value = dados.servico_id;
            elValor.value = dados.valor;
            elStatus.value = dados.status;
            elDataSol.value = formatarDataInput(dados.dataSolicitacao, 'date');

            elData.value = formatarDataInput(dados.dataHorarioInicial, 'date');
            
            // Hack para exibir o horário atual no select
            const horaAtual = formatarDataInput(dados.dataHorarioInicial, 'time');
            elHorario.innerHTML = `<option value="${horaAtual}" selected>${horaAtual}</option>`;
            elHorario.disabled = false;
            
            elFim.value = formatarDataInput(dados.dataHorarioFinal, 'datetime');

            // ✅ CORREÇÃO CRÍTICA: Lógica de Bloqueio "Realizado"
            if (dados.status === 'realizado') {
                // Se realizado, bloqueia TUDO e NÃO chama a busca de disponibilidade
                [elCliente, elProfissional, elServico, elData, elHorario, elValor, elStatus].forEach(e => e.disabled = true);
                if (btnSalvar) btnSalvar.style.display = 'none';
            } else {
                // Se não realizado, bloqueia cliente e data sol, e CHAMA a busca
                elCliente.disabled = true; 
                setTimeout(buscarDisponibilidade, 500); // Só busca se for editável
            }

        } else {
            formTitle.textContent = 'Novo Agendamento';
            statusGroup.style.display = 'none';
            elDataSol.value = formatarDataInput(null, 'date');
        }
    };

    // --- API ---
    const carregarSelect = async (url, elementId, valueKey, textKey) => {
        const el = document.getElementById(elementId);
        try {
            const res = await fetch(url);
            const data = await res.json();
            
            // Se for o filtro, adiciona opção 'Todos'
            if (elementId === 'filtro-profissional') {
                el.innerHTML = '<option value="">Todos</option>';
            } else {
                el.innerHTML = '<option value="" disabled selected>Selecione</option>';
            }

            data.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item[valueKey];
                opt.textContent = item[textKey];
                if (elementId === 'servico_id') {
                    opt.dataset.duracao = item.tempoDuracao;
                    opt.dataset.preco = item.custoServico;
                }
                el.appendChild(opt);
            });
        } catch (err) { console.error(err); }
    };

    const buscarDisponibilidade = async () => {
        // Se o status for realizado (campo status desabilitado), aborta a busca para não resetar o campo
        if (elStatus.value === 'realizado' && elStatus.disabled) return;

        const cpf = elProfissional.value;
        const data = elData.value;
        const servicoId = elServico.value;

        if (!cpf || !data || !servicoId) return;

        const opt = elServico.options[elServico.selectedIndex];
        let duracaoMin = 0;
        if (opt && opt.dataset.duracao) {
            const parts = opt.dataset.duracao.toString().split(':');
            if (parts.length >= 2) duracaoMin = parseInt(parts[0])*60 + parseInt(parts[1]);
            else duracaoMin = parseInt(opt.dataset.duracao);
        }
        
        infoDuracao.textContent = `Duração: ${duracaoMin} min`;
        if (opt.dataset.preco && !modoEdicao) elValor.value = opt.dataset.preco;

        elHorario.innerHTML = '<option>Carregando...</option>';
        divOcupados.style.display = 'none';

        try {
            const res = await fetch(`${API_URL}/disponibilidade?cpf=${cpf}&data=${data}&duracao=${duracaoMin}`);
            const slots = await res.json();
            
            elHorario.innerHTML = '<option value="" disabled selected>Selecione um Horário</option>';
            
            if (slots.length === 0) {
                divOcupados.style.display = 'block';
                divOcupados.innerHTML = `<strong style="color: #d9534f;">❌ Sem horários livres nesta data.</strong>`;
                elHorario.disabled = true;
            } else {
                divOcupados.style.display = 'block';
                divOcupados.innerHTML = `<strong style="color: green;">✅ ${slots.length} horários encontrados.</strong>`;
                elHorario.disabled = false;
                slots.forEach(hora => {
                    const opt = document.createElement('option');
                    opt.value = hora;
                    opt.textContent = hora;
                    elHorario.appendChild(opt);
                });
            }
        } catch (err) { console.error(err); }
    };

    const calcularFim = () => {
        const horaInicio = elHorario.value;
        const dataDia = elData.value;
        if (!horaInicio || !dataDia) return;

        const opt = elServico.options[elServico.selectedIndex];
        let duracaoMin = 0;
        if (opt && opt.dataset.duracao) {
            const parts = opt.dataset.duracao.toString().split(':');
            duracaoMin = (parts.length >= 2) ? parseInt(parts[0])*60 + parseInt(parts[1]) : parseInt(parts[0]);
        }

        const dataInicioObj = new Date(`${dataDia}T${horaInicio}:00`);
        const dataFimObj = new Date(dataInicioObj.getTime() + duracaoMin * 60000);
        
        elFim.value = formatarDataInput(dataFimObj, 'datetime');
    };

    const salvarAgendamento = async (e) => {
        e.preventDefault();
        
        const horario = elHorario.value;
        const dataDia = elData.value;
        const dataHorarioInicialCompleta = `${dataDia}T${horario}:00`;

        if (!formAgendamento.checkValidity()) {
            formAgendamento.reportValidity();
            return;
        }

        const formData = new FormData(formAgendamento);
        const dados = Object.fromEntries(formData.entries());

        // Garante envio de campos desabilitados/calculados
        dados.dataHorarioInicial = dataHorarioInicialCompleta;
        dados.dataHorarioFinal = elFim.value;
        if (elCliente.disabled) dados.cliente_id = elCliente.value;
        if (elDataSol.disabled) dados.dataSolicitacao = elDataSol.value;
        dados.valor = dados.valor || elValor.value; 

        const url = modoEdicao ? `${API_URL}/${document.getElementById('codigo-original').value}` : API_URL;
        const method = modoEdicao ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(dados) 
            });
            
            if (!response.ok) {
                const erro = await response.json();
                if (response.status === 409) throw new Error(erro.error); // Conflito
                if (response.status === 400 || response.status === 403) throw new Error(erro.error);
                throw new Error('Erro ao salvar agendamento.');
            }
            mostrarModalSucesso(modoEdicao ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
            setTimeout(() => { fecharModalSucesso(); mostrarViewRegistro(); }, 1500);
        } catch (err) { alert(err.message); }
    };

    // ✅ LISTAR COM FILTROS ATUALIZADOS
    const listarAgendamentos = async () => {
        const params = new URLSearchParams();
        if (filtroData.value) params.append('data', filtroData.value);
        if (filtroCliente.value) params.append('cliente', filtroCliente.value);
        if (filtroProfissional.value) params.append('cpf', filtroProfissional.value); // Filtro CPF

        try {
            const res = await fetch(`${API_URL}?${params.toString()}`);
            const lista = await res.json();
            tabelaAgendamentos.innerHTML = '';
            
            if (!lista || lista.length === 0) {
                tabelaAgendamentos.innerHTML = '<tr><td colspan="8">Nenhum agendamento encontrado.</td></tr>';
                return;
            }

            lista.forEach(ag => {
                const dt = new Date(ag.dataHorarioInicial);
                const dataFmt = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
                
                tabelaAgendamentos.innerHTML += `
                    <tr>
                        <td>${dataFmt}</td>
                        <td>${ag.nome_cliente || '-'}</td>
                        <td>${ag.nome_profissional || '-'}</td>
                        <td>${ag.nome_servico || '-'}</td>
                        <td>${ag.status}</td>
                        <td>${formatarValor(ag.valor)}</td>
                        <td><i class="fas fa-pencil-alt btn-editar" data-codigo="${ag.codigo}" style="cursor:pointer"></i></td>
                        <td><i class="fas fa-ban btn-cancelar" data-codigo="${ag.codigo}" style="cursor:pointer"></i></td>
                    </tr>
                `;
            });
        } catch (err) { console.error(err); }
    };

    const carregarDadosParaEdicao = async (codigo) => {
        try {
            const res = await fetch(`${API_URL}/${codigo}`);
            if (!res.ok) throw new Error('Erro ao carregar.');
            const dados = await res.json();
            mostrarViewCadastro(true, dados);
        } catch(err) { alert(err.message); }
    };

    const confirmarCancelamento = async () => {
        try {
            const res = await fetch(`${API_URL}/${codigoParaAcao}`, { method: 'DELETE' });
            if (!res.ok) {
                 const erro = await res.json();
                 if (res.status === 403) throw new Error(erro.error);
                 throw new Error(erro.error || 'Erro ao cancelar.');
            }
            mostrarModalSucesso('Cancelado com sucesso!');
            setTimeout(() => { fecharModalSucesso(); listarAgendamentos(); }, 1500);
        } catch (err) { alert(err.message); } finally { fecharModalConfirmacao(); }
    };

    // --- Listeners ---
    btnNovoCadastro.addEventListener('click', () => mostrarViewCadastro(false));
    btnCancelarForm.addEventListener('click', mostrarViewRegistro);
    menuToggle.addEventListener('click', toggleMenu);
    fecharMenuBtn.addEventListener('click', toggleMenu);
    formAgendamento.addEventListener('submit', salvarAgendamento);
    
    if(btnModalConfirmar) btnModalConfirmar.addEventListener('click', confirmarCancelamento);
    if(btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalConfirmacao);
    
    // Filtros
    filtroData.addEventListener('change', listarAgendamentos);
    if (filtroCliente) filtroCliente.addEventListener('input', listarAgendamentos);
    if (filtroProfissional) filtroProfissional.addEventListener('change', listarAgendamentos); // ✅ Listener Novo

    // Lógica Dinâmica
    elProfissional.addEventListener('change', buscarDisponibilidade);
    elData.addEventListener('change', buscarDisponibilidade);
    elServico.addEventListener('change', () => {
        calcularFim(); // Recalcula se mudar serviço pois duração muda
        buscarDisponibilidade();
    });
    elHorario.addEventListener('change', calcularFim);

    // Tabela
    tabelaAgendamentos.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-editar')) {
            carregarDadosParaEdicao(e.target.dataset.codigo);
        }
        if (e.target.classList.contains('btn-cancelar')) {
            abrirModalConfirmacao(e.target.dataset.codigo);
        }
    });

    // --- Inicialização ---
    mostrarViewRegistro();
    carregarSelect(CLIENTES_URL, 'cliente_id', 'ID', 'nome');
    carregarSelect(FUNCIONARIOS_URL, 'cpf_profissional', 'cpf', 'nome');
    carregarSelect(FUNCIONARIOS_URL, 'filtro-profissional', 'cpf', 'nome'); // ✅ Carrega o filtro
    carregarSelect(SERVICOS_URL, 'servico_id', 'idTipo', 'nomeTipo');
});