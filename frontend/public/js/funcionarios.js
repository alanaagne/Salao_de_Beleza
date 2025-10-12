// frontend/public/js/funcionarios.js

// Configuração da API - Usando a porta 3000 e o endpoint padronizado
const API_URL = 'http://localhost:3000/api/funcionarios';

let cpfParaExcluir = null;
let modoAtual = null; // 'cadastro' ou 'edicao'

// =========================================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO E INTERFACE (Baseado no código da colega)
// =========================================================================

// Função para abrir/fechar menu lateral
function toggleMenu() {
    const menu = document.getElementById('menuLateral');
    if (menu) {
        menu.classList.toggle('aberto');
    }
}

// Função para fechar modal de confirmação
function fecharModal() {
    document.getElementById('modalExcluir').style.display = 'none';
}

// Função para fechar modal de sucesso
function fecharModalSucesso() {
    document.getElementById('modalSucesso').style.display = 'none';
}

// Função para mostrar modal de sucesso (com fechamento automático)
function mostrarModalSucesso() {
    document.getElementById('modalSucesso').style.display = 'flex';

    setTimeout(() => {
        fecharModalSucesso();

        // Se estiver em modo cadastro, limpa o formulário
        if (modoAtual === 'cadastro') {
            const formCadastro = document.getElementById('formCadastroFuncionario');
            if (formCadastro) formCadastro.reset();
        }

        // Se estiver na tela de registro/listagem, recarrega
        if (document.getElementById('tabela-profissionais')) {
            carregarProfissionais();
        } else {
            // Se estiver na tela de edição e salvou, volta para a listagem
            window.location.href = 'registro.html';
        }

    }, 3000);
}

// Função para abrir modal de confirmar salvamento
function abrirModalConfirmarSalvar(modo) {
    modoAtual = modo;
    document.getElementById('modalExcluir').style.display = 'flex';
}

// Funções de formatação (Telefone e Data)
function formatarTelefone(telefone) {
    if (!telefone) return '';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.substr(0, 2)})${cleaned.substr(2, 5)}-${cleaned.substr(7)}`;
    }
    return telefone;
}

function formatarDataParaInput(data) {
    if (!data) return '';
    const date = new Date(data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// [ ... ADICIONAR A FUNÇÃO adicionarMascaras() COMPLETA AQUI ... ]
// Esta função é essencial e deve vir do código da sua colega, incluindo todas as lógicas de máscara (CPF, RG, CEP, Salário, etc.)

// =========================================================================
// LÓGICA DE CRUD (CRIAR, LER, ATUALIZAR, DELETAR)
// =========================================================================

// C: CREATE (Chamada ao submeter o formulário de cadastro)
function salvarCadastro(event) {
    event.preventDefault();
    const form = document.getElementById('formCadastroFuncionario');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    abrirModalConfirmarSalvar('cadastro');
}

// U: UPDATE (Chamada ao submeter o formulário de edição)
function salvarEdicao(event) {
    event.preventDefault();
    const form = document.getElementById('formEditarFuncionario');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    console.log("oi");
    abrirModalConfirmarSalvar('edicao');
}


// Função principal de envio: Cadastra (POST) ou Edita (PUT)
async function confirmarSalvar() {
    fecharModal();

    // Define qual formulário e rota usar
    const modo = modoAtual;
    const formId = modo === 'cadastro' ? 'formCadastroFuncionario' : 'formEditarFuncionario';
    const form = document.getElementById(formId);

    const formData = new FormData(form);
    const dadosFormulario = Object.fromEntries(formData.entries());

    // Mapeamento dos campos (usando os IDs/Names do formulário dela)
    const dadosParaEnvio = {
        cpf: dadosFormulario.editCPF,
        nome: dadosFormulario.editNome,
        salario: dadosFormulario.editSalario, // Será limpo pelo backend
        endereco: dadosFormulario.editEndereco,
        telefone: dadosFormulario.editTelefone,
        // O campo dela é 'Cargo', o seu é 'especializacao'
        cargo: dadosFormulario.editCargo,
        rg: dadosFormulario.editRG,
        cep: dadosFormulario.editCEP,
        cidade: dadosFormulario.editCidade,
        email: dadosFormulario.editEmail,
        dataAdmissao: dadosFormulario.editDataAdmissao,
        // O campo 'ativo' só existe na edição e é crucial para o PUT
        ativo: dadosFormulario.editAtivo || '1'
    };

    try {
        const cpfURL = dadosParaEnvio.cpf; // Usamos o CPF como identificador
        const url = modo === 'cadastro' ? API_URL : `${API_URL}/${cpfURL}`;
        const method = modo === 'cadastro' ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosParaEnvio)
        });

        if (response.ok || response.status === 201) {
            mostrarModalSucesso();
        } else {
            const error = await response.json();
            alert(error.error || error.message || `Erro ao ${modo}.`);
        }
    } catch (error) {
        console.error(`Erro ao ${modo}:`, error);
        alert('Erro de conexão com o servidor.');
    }
}


// R: READ (Função para buscar 1 funcionário e preencher o form de edição)
async function editarFuncionario(cpf) {
    try {
        // 1. Busca os dados do funcionário
        const response = await fetch(`${API_URL}/${cpf}`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Funcionário não encontrado.');
            return;
        }

        // 2. Redireciona para a página de edição
        // Se a lógica dela usa a mesma página para Edição, você teria que preencher os campos aqui.
        // Já que você tem um arquivo funcionarios.html (que parece ser a edição), vamos passar o CPF pela URL
        window.location.href = `funcionarios.html?cpf=${cpf}`;

    } catch (error) {
        console.error('Erro ao buscar dados para edição:', error);
        alert('Não foi possível carregar dados para edição.');
    }
}

// R: READ (Função para carregar a lista de funcionários na tela de Registro)
async function carregarProfissionais() {
    const tbody = document.querySelector('#tabela-profissionais tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    try {
        const response = await fetch(API_URL);
        const profissionais = await response.json();

        if (profissionais.length === 0) {
            document.getElementById('mensagem-vazio').style.display = 'block';
            return;
        }
        document.getElementById('mensagem-vazio').style.display = 'none';

        profissionais.forEach(p => {
            const row = tbody.insertRow();
            row.insertCell().textContent = p.cpf;
            row.insertCell().textContent = p.nome;
            row.insertCell().textContent = p.especializacao;
            row.insertCell().textContent = formatarTelefone(p.telefone);

            // Botões de Ação
            const acoesCell = row.insertCell();
            acoesCell.innerHTML = `
                <button class="btn-editar" onclick="editarFuncionario('${p.cpf}')">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn-excluir" onclick="abrirModalExcluir('${p.cpf}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
        });

    } catch (error) {
        console.error('Erro ao carregar a lista:', error);
    }
}


// D: DELETE (Função de confirmação que envia o DELETE para a API)
async function confirmarExclusao() {
    fecharModal();
    if (!cpfParaExcluir) return;

    try {
        const response = await fetch(`${API_URL}/${cpfParaExcluir}`, {
            method: 'DELETE',
        });

        if (response.status === 204) { // 204 = No Content (Sucesso DELETE)
            mostrarModalSucesso();
        } else {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
            alert(error.message || 'Erro ao excluir funcionário.');
        }
    } catch (error) {
        alert('Erro de conexão ao excluir funcionário.');
    }
}


// =========================================================================
// LÓGICA DE CARREGAMENTO DA PÁGINA
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. LÓGICA DE EVENTOS GLOBAIS (MENU E MODAL)
    // O menu e o botão de confirmar modal só são configurados UMA VEZ.
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    const btnFecharMenu = document.querySelector('.fechar-menu');
    if (btnFecharMenu) {
        btnFecharMenu.addEventListener('click', toggleMenu);
    }

    // Configuração do botão de CONFIRMAR do modal (UNIFICADO)
    const btnConfirmarModal = document.querySelector('#modalExcluir .btn-confirmar');
    if (btnConfirmarModal) {
        btnConfirmarModal.onclick = () => {
            if (modoAtual === 'cadastro' || modoAtual === 'edicao') {
                confirmarSalvar();
            } else if (cpfParaExcluir) {
                confirmarExclusao();
            }
        };
    }
    
    // -------------------------------------------------------------------
    // 2. LÓGICA DE INICIALIZAÇÃO ESPECÍFICA DA PÁGINA (Executada uma única vez)
    // -------------------------------------------------------------------

    const urlParams = new URLSearchParams(window.location.search);
    const cpf = urlParams.get('cpf');
    const formEdicao = document.getElementById('formEditarFuncionario');
    const formCadastro = document.getElementById('formCadastroFuncionario');
    const tabelaRegistro = document.getElementById('tabela-profissionais');


    if (cpf && formEdicao) {
        // MODO EDIÇÃO: Inicializa o formulário de edição
        modoAtual = 'edicao';
        formEdicao.addEventListener('submit', salvarEdicao);
        carregarDadosNoFormulario(cpf);
        adicionarMascaras(); 

    } else if (tabelaRegistro) {
        // MODO LISTAGEM: Inicializa a listagem
        carregarProfissionais();
    
    } else if (formCadastro) {
        // MODO CADASTRO: Inicializa o formulário de cadastro
        modoAtual = 'cadastro';
        formCadastro.addEventListener('submit', salvarCadastro);
        adicionarMascaras();
    }
});

// FUNÇÃO AUXILIAR PARA CARREGAR DADOS NO FORMULÁRIO DE EDIÇÃO
async function carregarDadosNoFormulario(cpf) {
    try {
        const response = await fetch(`${API_URL}/${cpf}`);
        const p = await response.json();

        if (!response.ok) {
            alert(p.message || 'Erro ao carregar dados do funcionário.');
            return;
        }

        // Preenche os campos do formulário (usando os IDs dela)
        document.getElementById('editId').value = p.cpf; // Assume que o ID é o CPF
        document.getElementById('editCPF').value = p.cpf;
        document.getElementById('editNome').value = p.nome;
        document.getElementById('editRG').value = p.rg;
        document.getElementById('editCEP').value = p.cep;
        document.getElementById('editCidade').value = p.cidade;
        document.getElementById('editEndereco').value = p.endereco;
        document.getElementById('editTelefone').value = formatarTelefone(p.telefone).replace(/[^0-9\(\)\-\s]/g, ''); // Preenche e deixa a máscara do JS agir
        document.getElementById('editCargo').value = p.especializacao;
        document.getElementById('editEmail').value = p.email;

        // Mapeamento de Status: Ativo='1', Inativo='0'
        const statusValue = p.status === 'Ativo' ? '1' : '0';
        document.getElementById('editAtivo').value = statusValue;

        // Data deve ser formatada para AAAA-MM-DD para o input type="date"
        document.getElementById('editDataAdmissao').value = formatarDataParaInput(p.data_admissao);

        // Salário deve ser preenchido para a máscara funcionar no próximo 'input'
        // NOTA: O Salário precisa ser preenchido com o valor numérico antes da máscara ser ativada
        document.getElementById('editSalario').value = (p.salario || 0).toString().replace('.', ',');

    } catch (error) {
        console.error('Erro ao preencher formulário:', error);
    }
}