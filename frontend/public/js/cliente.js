// /frontend/public/js/clientes.js

// MUDANÇA: URL da API para Clientes
const API_URL = 'http://localhost:3000/api/clientes';

// --- REFERÊNCIAS DE ELEMENTOS UI ---
const form = document.getElementById('formEditarCliente'); // MUDANÇA: ID do formulário
const tableBody = document.getElementById('clientes-table-body'); // NOTA: A tabela de listagem deve ser implementada

// --- REFERÊNCIAS DOS CAMPOS DO FORMULÁRIO (COMPLETAS para Cliente) ---
const cpfOriginalInput = document.getElementById('editCpfOriginal');
const cpfInput = document.getElementById('editCPF');
const nomeInput = document.getElementById('editNome');
const dataNascimentoInput = document.getElementById('editDataNascimento');
const cepInput = document.getElementById('editCEP');
const ufInput = document.getElementById('editUF');
const bairroInput = document.getElementById('editBairro'); // NOVO CAMPO
const logradouroInput = document.getElementById('editLogradouro');
const cidadeInput = document.getElementById('editCidade');
const numeroInput = document.getElementById('editNumero');
const telefoneInput = document.getElementById('editTelefone');

// --- REFERÊNCIAS E VARIÁVEIS DE CONTROLE ---
// NOTA: Para funcionar, você precisará dos elementos de controle da lista:
// ex: const listContainer = document.getElementById('list-view-container');
// ex: const editContainer = document.querySelector('.edit-form-container');
// ... (outros)

let cpfParaExcluir = null; 

// ----------------------------------------------------
// I. LÓGICA DE INTERFACE: Funções de navegação (Adaptadas)
// ----------------------------------------------------

// NOTA: Estas funções (cancelarEdicao, fecharModal, fecharModalSucesso) 
// dependem da sua implementação de CSS/JS do Menu Lateral e da Listagem.

function mostrarMensagemSucesso() {
    // NOTA: Depende do ID da sua modal de sucesso
    document.getElementById('modalSucesso').style.display = 'flex';
}

function fecharModalSucesso() {
    document.getElementById('modalSucesso').style.display = 'none';
    // Após sucesso, voltamos à lista (se implementada) ou recarregamos
    // carregarClientes();
    // voltarParaListagem(); 
}

function fecharModal() {
    document.getElementById('modalExcluir').style.display = 'none';
    cpfParaExcluir = null;
}

function cancelarEdicao() {
    // NOTA: Esta função precisa ser ajustada para mostrar a tela de LISTAGEM
    // por agora, apenas limpa o formulário.
    form.reset();
    cpfOriginalInput.value = '';
    cpfInput.disabled = false;
    document.querySelector('.form-title h1').textContent = 'Editar Cliente';
    document.getElementById('btnSalvar').innerHTML = '<i class="fas fa-save"></i> Salvar';
    // Se a listagem estivesse implementada: voltarParaListagem();
}

// ----------------------------------------------------
// II. LÓGICA CRUD E OPERAÇÕES DE DADOS
// ----------------------------------------------------

// [A] READ: Carregar e Exibir Clientes (Implementação Padrão)
async function carregarClientes() {
    // ... Implementação de fetch para GET /api/clientes e preenchimento da tabela ...
}

// [B] UPDATE: Prepara o formulário para edição
function prepararEdicao(cliente) {
    cpfOriginalInput.value = cliente.cpf;
    cpfInput.value = cliente.cpf;
    nomeInput.value = cliente.nome;
    
    // Mapeamento dos campos do cliente
    dataNascimentoInput.value = cliente.dataNascimento ? cliente.dataNascimento.split('T')[0] : '';
    cepInput.value = cliente.cep || '';
    ufInput.value = cliente.uf || '';
    bairroInput.value = cliente.bairro || '';
    logradouroInput.value = cliente.logradouro || '';
    cidadeInput.value = cliente.cidade || '';
    numeroInput.value = cliente.numero || '';
    telefoneInput.value = cliente.telefone || '';

    cpfInput.disabled = true;
    document.querySelector('.form-title h1').textContent = 'Editar Cliente';
    document.getElementById('btnSalvar').innerHTML = '<i class="fas fa-save"></i> Atualizar';
}

// [C] CREATE/UPDATE: Submissão do Formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const cpfOriginal = cpfOriginalInput.value;
    
    // Coleta dos dados do cliente (todos os campos)
    const dados = {
        cpf: cpfInput.value,
        nome: nomeInput.value,
        dataNascimento: dataNascimentoInput.value,
        cep: cepInput.value,
        uf: ufInput.value,
        bairro: bairroInput.value,
        logradouro: logradouroInput.value,
        cidade: cidadeInput.value,
        numero: numeroInput.value,
        telefone: telefoneInput.value,
    };

    let method = cpfOriginal ? 'PUT' : 'POST';
    let url = cpfOriginal ? `${API_URL}/${cpfOriginal}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        if (response.ok) {
            mostrarMensagemSucesso();
            cancelarEdicao(); // Limpa o form após sucesso
        } else {
            // Tratar erros do servidor
            const errorData = await response.json();
            alert(`Erro na operação: ${errorData.error || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro de rede na submissão:', error);
        alert('Erro de rede. Verifique se o Backend está ativo.');
    }
});

// [D] DELETE: Lógica de Exclusão
function abrirModalExcluir(cpf) {
    cpfParaExcluir = cpf;
    document.getElementById('modalExcluir').style.display = 'flex';
}

async function confirmarExclusao() {
    if (!cpfParaExcluir) return;

    try {
        const response = await fetch(`${API_URL}/${cpfParaExcluir}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            mostrarMensagemSucesso();
            fecharModal();
        } else {
            // Tratar erro de exclusão
            alert('Erro ao excluir. Verifique se o cliente não possui agendamentos.');
            fecharModal();
        }
    } catch (error) {
        console.error('Erro de rede na exclusão:', error);
        fecharModal();
    }
}

// Inicialização: Se a listagem estivesse pronta, chamaríamos carregarClientes
document.addEventListener('DOMContentLoaded', () => {
    console.log('Módulo Cliente Carregado.');
    // carregarClientes(); 
});