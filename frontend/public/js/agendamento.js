// /frontend/public/js/agendamento.js

//  URLs da API 
const API_URL = 'http://localhost:3000/api/agendamentos';
const CLIENTES_URL = 'http://localhost:3000/api/clientes';
const FUNCIONARIOS_URL = 'http://localhost:3000/api/funcionarios';
const SERVICOS_URL = 'http://localhost:3000/api/servicos';

document.addEventListener('DOMContentLoaded', () => {

    
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

    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const modalSucesso = document.getElementById('modal-sucesso');
    const btnModalConfirmar = document.getElementById('btn-modal-confirmar');
    const btnModalCancelar = document.getElementById('btn-modal-cancelar');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const fecharMenuBtn = document.querySelector('.fechar-menu');
    const statusGroup = document.getElementById('status-group');

    //  Estado da Aplicação 
    let codigoParaAcao = null;
    let modoEdicao = false;

    //  Funções de Interface 
    const toggleMenu = () => menuLateral.classList.toggle('aberto');

    const mostrarViewRegistro = () => {
        viewCadastro.style.display = 'none';
        viewRegistro.style.display = 'block';
        formAgendamento.reset();
        listarAgendamentos();
    };

   
    const formatarDataParaInput = (dataString, isDateOnly = false) => {
        let data;
        
        if (!dataString) {
            // Se não passar data, usa a data/hora atual
            data = new Date();
        } else {
            // Se passar data, cria o objeto
            data = new Date(dataString);
        }

        // Pega as partes da data baseadas no horário LOCAL do computador
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');

        if (isDateOnly) {
            return `${ano}-${mes}-${dia}`;
        }
        // Retorna formato para datetime-local: YYYY-MM-DDTHH:MM
        return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
    };

    const mostrarViewCadastro = (isEdicao = false, dados = null) => {
        viewRegistro.style.display = 'none';
        viewCadastro.style.display = 'block';
        formAgendamento.reset();
        modoEdicao = isEdicao;

        // Elementos do formulário
        const elCliente = document.getElementById('cliente_id');
        const elProfissional = document.getElementById('cpf_profissional');
        const elServico = document.getElementById('servico_id');
        const elInicio = document.getElementById('dataHorarioInicial');
        const elFim = document.getElementById('dataHorarioFinal');
        const elValor = document.getElementById('valor');
        const elDataSol = document.getElementById('dataSolicitacao');
        const elStatus = document.getElementById('status');
        const btnSalvar = document.querySelector('.btn-salvar');

        // 1. Reseta o estado dos campos (habilita tudo por padrão)
        [elCliente, elProfissional, elServico, elInicio, elFim, elValor, elDataSol, elStatus].forEach(el => el.disabled = false);
        if (btnSalvar) btnSalvar.style.display = 'inline-flex';

        if (isEdicao && dados) {
            formTitle.textContent = 'Editar Agendamento';
            statusGroup.style.display = 'flex';
            
            // Preenche o formulário
            document.getElementById('codigo-original').value = dados.codigo;
            elCliente.value = dados.cliente_id;
            elProfissional.value = dados.cpf_profissional;
            elServico.value = dados.servico_id;
            
            // Usa a função corrigida para preencher as datas
            elInicio.value = formatarDataParaInput(dados.dataHorarioInicial);
            elFim.value = formatarDataParaInput(dados.dataHorarioFinal);
            
            elValor.value = dados.valor;
            elDataSol.value = formatarDataParaInput(dados.dataSolicitacao, true);
            elStatus.value = dados.status;

            // Lógica de Bloqueio
            if (dados.status === 'realizado') {
                [elCliente, elProfissional, elServico, elInicio, elFim, elValor, elDataSol, elStatus].forEach(el => el.disabled = true);
                if (btnSalvar) btnSalvar.style.display = 'none';
            } else {
                elCliente.disabled = true;
                elDataSol.disabled = true;
            }

        } else {
            formTitle.textContent = 'Novo Agendamento';
            statusGroup.style.display = 'none';
            
            
            elDataSol.value = formatarDataParaInput(null, true);
            elDataSol.disabled = true;
        }
    };
    
    //  Funções de Carregamento de Dados 
    const carregarSelect = async (url, selectId, valueField, textField) => {
        const selectElement = document.getElementById(selectId);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Falha ao carregar ${selectId}`);
            const data = await response.json();
            
            selectElement.innerHTML = `<option value="" disabled selected>Selecione</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(error);
            selectElement.innerHTML = `<option value="" disabled selected>Erro ao carregar</option>`;
        }
    };

    // Funções de Lógica (CRUD)
    const listarAgendamentos = async () => {
        const data = filtroData.value;
        const cliente = filtroCliente ? filtroCliente.value : '';

        const params = new URLSearchParams();
        if (data) params.append('data', data);
        if (cliente) params.append('cliente', cliente);

        const url = `${API_URL}?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Falha ao carregar agendamentos.');
            const agendamentos = await response.json();
            renderizarTabela(agendamentos);
        } catch (error) {
            console.error(error);
            tabelaAgendamentos.innerHTML = `<tr><td colspan="8">Erro ao carregar dados. Verifique o servidor.</td></tr>`;
        }
    };

    const renderizarTabela = (dados) => {
        tabelaAgendamentos.innerHTML = '';
        if (!dados || dados.length === 0) {
            tabelaAgendamentos.innerHTML = `<tr><td colspan="8">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }
        dados.forEach(ag => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatarDataHora(ag.dataHorarioInicial)}</td>
                <td>${ag.nome_cliente || 'Cliente não encontrado'}</td>
                <td>${ag.nome_profissional || 'Profissional não encontrado'}</td>
                <td>${ag.nome_servico || 'Serviço não encontrado'}</td>
                <td>${ag.status}</td>
                <td>${formatarValor(ag.valor)}</td>
                <td><i class="fas fa-pencil-alt btn-editar" data-codigo="${ag.codigo}" style="cursor: pointer;"></i></td>
                <td><i class="fas fa-ban btn-cancelar" data-codigo="${ag.codigo}" style="cursor: pointer; color: white;"></i></td>            `;
            tabelaAgendamentos.appendChild(tr);
        });
    };

    const salvarAgendamento = async (event) => {
        event.preventDefault();
        
        if (!formAgendamento.checkValidity()) {
            formAgendamento.reportValidity();
            return;
        }

        const formData = new FormData(formAgendamento);
        const dados = Object.fromEntries(formData.entries());

        if (document.getElementById('cliente_id').disabled) {
            dados.cliente_id = document.getElementById('cliente_id').value;
        }
        if (document.getElementById('dataSolicitacao').disabled) {
            dados.dataSolicitacao = document.getElementById('dataSolicitacao').value;
        }
        dados.valor = dados.valor || document.getElementById('valor').value; 

        const url = modoEdicao ? `${API_URL}/${document.getElementById('codigo-original').value}` : API_URL;
        const method = modoEdicao ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
            
            if (!response.ok) {
                const erro = await response.json();
                if (response.status === 409 || response.status === 400 || response.status === 403) {
                    throw new Error(erro.error);
                }
                throw new Error('Erro ao salvar agendamento.');
            }
            
            mostrarModalSucesso(modoEdicao ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
            setTimeout(() => { fecharModalSucesso(); mostrarViewRegistro(); }, 2000);
        } catch (error) {
            alert(error.message);
        }
    };
    
    const carregarDadosParaEdicao = async (codigo) => {
        try {
            const response = await fetch(`${API_URL}/${codigo}`);
            if (!response.ok) throw new Error('Agendamento não encontrado.');
            const agendamento = await response.json();
            mostrarViewCadastro(true, agendamento);
        } catch(error) {
            alert(error.message);
        }
    };

    const confirmarCancelamento = async () => {
        try {
            const response = await fetch(`${API_URL}/${codigoParaAcao}`, { method: 'DELETE' });
            if (!response.ok) {
                 const erro = await response.json();
                 if (response.status === 403) {
                     throw new Error(erro.error);
                 }
                 throw new Error(erro.error || 'Erro ao cancelar.');
            }
            mostrarModalSucesso('Agendamento cancelado com sucesso!');
            setTimeout(() => { fecharModalSucesso(); listarAgendamentos(); }, 2000);
        } catch (error) {
            alert(error.message);
        } finally {
            fecharModalConfirmacao();
        }
    };

    //  Funções Auxiliares (Modais e Formatação) 
    const abrirModalConfirmacao = (codigo) => { 
        codigoParaAcao = codigo; 
        document.getElementById('modal-confirmacao-texto').innerHTML = "Tem Certeza<br>de que deseja<br>cancelar este<br>agendamento?";
        modalConfirmacao.style.display = 'flex'; 
    };
    const fecharModalConfirmacao = () => modalConfirmacao.style.display = 'none';
    const mostrarModalSucesso = (msg) => { document.getElementById('sucesso-msg').textContent = msg; modalSucesso.style.display = 'flex'; };
    const fecharModalSucesso = () => modalSucesso.style.display = 'none';

    const formatarDataHora = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    
    const formatarValor = (valor) => {
        if (valor == null) return 'R$ 0,00';
        return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    //  Vinculação de Eventos 
    btnNovoCadastro.addEventListener('click', () => mostrarViewCadastro(false));
    btnCancelarForm.addEventListener('click', mostrarViewRegistro);
    menuToggle.addEventListener('click', toggleMenu);
    fecharMenuBtn.addEventListener('click', toggleMenu);
    formAgendamento.addEventListener('submit', salvarAgendamento);
    btnModalConfirmar.addEventListener('click', confirmarCancelamento);
    btnModalCancelar.addEventListener('click', fecharModalConfirmacao);
    
    filtroData.addEventListener('change', listarAgendamentos);
    if (filtroCliente) {
        filtroCliente.addEventListener('input', listarAgendamentos);
    }
    
    tabelaAgendamentos.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-editar')) {
            carregarDadosParaEdicao(target.dataset.codigo);
        }
        if (target.classList.contains('btn-cancelar')) {
            abrirModalConfirmacao(target.dataset.codigo);
        }
    });

    //  Inicialização 
    mostrarViewRegistro();
    carregarSelect(CLIENTES_URL, 'cliente_id', 'ID', 'nome');
    carregarSelect(FUNCIONARIOS_URL, 'cpf_profissional', 'cpf', 'nome');
    carregarSelect(SERVICOS_URL, 'servico_id', 'idTipo', 'nomeTipo');
});