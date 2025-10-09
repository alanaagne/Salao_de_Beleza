// /frontend/public/js/cliente.js

const API_URL = 'http://localhost:3000/api/clientes';

// REFERÊNCIAS DE ELEMENTOS UI 
const form = document.getElementById('cliente-form');
const tableBody = document.getElementById('clientes-table-body');
const formContainer = document.getElementById('form-edit-container');
const listViewContainer = document.getElementById('list-view-container');
const btnShowCreateForm = document.getElementById('btn-show-create-form');
const cancelButton = document.getElementById('cancel-button');
const submitButton = document.getElementById('submit-button');

// REFERÊNCIAS DOS CAMPOS DO FORMULÁRIO
const cpfOriginalInput = document.getElementById('cpf-original'); // Campo oculto para UPDATE
const cpfInput = document.getElementById('cpf');
const nomeInput = document.getElementById('nome');
const dataNascimentoInput = document.getElementById('dataNascimento');
const cepInput = document.getElementById('cep');
const ufInput = document.getElementById('uf');
const cidadeInput = document.getElementById('cidade');
const logradouroInput = document.getElementById('logradouro');
const numeroInput = document.getElementById('numero');
const telefoneInput = document.getElementById('telefone');

//REFERÊNCIAS DA MODAL DE EXCLUSÃO
const modal = document.getElementById('confirmation-modal');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
let cpfParaExcluir = null; 




function mostrarFormulario(cliente = null) {
    if (cliente) {
        prepararEdicao(cliente); // Carrega dados para edição
    } else {
        resetarFormulario(); // Prepara para novo cadastro
        formContainer.querySelector('h2').textContent = 'Cadastrar Novo Cliente';
    }
    listViewContainer.style.display = 'none'; 
    formContainer.style.display = 'block';   
}

/** Reseta o formulário e volta para a tela de listagem. */
function esconderFormulario() {
    resetarFormulario();
    formContainer.style.display = 'none';
    listViewContainer.style.display = 'block'; 
}

/** Limpa todos os campos e define o formulário para o modo "Cadastro". */
function resetarFormulario() {
    form.reset(); 
    cpfOriginalInput.value = ''; 
    submitButton.innerHTML = '<i class="fas fa-save"></i> Cadastrar Cliente';
    cpfInput.disabled = false; 
    formContainer.querySelector('h2').textContent = 'Editar Cliente'; // Volta ao default
}

// Eventos de navegação da interface
btnShowCreateForm.addEventListener('click', () => mostrarFormulario());
cancelButton.addEventListener('click', esconderFormulario);


//READ: Carregar e Exibir Clientes
async function carregarClientes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Falha ao carregar clientes do servidor.');
        const clientes = await response.json();
        
        tableBody.innerHTML = '';
        
        clientes.forEach((cliente, index) => {
            const row = tableBody.insertRow();
            
            // Colunas de exibição conforme o layout
            row.insertCell(0).textContent = index + 1; 
            row.insertCell(1).textContent = cliente.nome;
            row.insertCell(2).textContent = cliente.cidade;
            row.insertCell(3).textContent = cliente.telefone;

            // Ícone EDITAR
            const editCell = row.insertCell(4);
            const editIcon = document.createElement('i');
            editIcon.className = 'fas fa-pen action-icon'; 
            editIcon.onclick = () => mostrarFormulario(cliente); 
            editCell.appendChild(editIcon);

            // Ícone EXCLUIR
            const deleteCell = row.insertCell(5);
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt action-icon'; 
            deleteIcon.onclick = () => solicitarExclusao(cliente.cpf); // Chama a Modal
            deleteCell.appendChild(deleteIcon);
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        // Não usar alert aqui, mas no log do servidor
    }
}


//UPDATE: Preparar Edição (Preenche os campos)
function prepararEdicao(cliente) {
    // 1. Armazena a chave primária original
    cpfOriginalInput.value = cliente.cpf; 

    // 2. Preenche todos os campos do formulário
    cpfInput.value = cliente.cpf;
    nomeInput.value = cliente.nome;
    
    // Converte a data do BD (ISO) para o formato do input Date (YYYY-MM-DD)
    dataNascimentoInput.value = cliente.dataNascimento ? cliente.dataNascimento.split('T')[0] : '';
    
    cepInput.value = cliente.cep || '';
    ufInput.value = cliente.uf || '';
    cidadeInput.value = cliente.cidade || '';
    logradouroInput.value = cliente.logradouro || '';
    numeroInput.value = cliente.numero || '';
    telefoneInput.value = cliente.telefone || '';
    
    // 3. Ajusta o botão e desabilita o CPF
    submitButton.innerHTML = '<i class="fas fa-save"></i> Salvar';
    cpfInput.disabled = true; 
}


//CREATE/UPDATE: Submissão do Formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const cpfOriginal = cpfOriginalInput.value; 
    
    // 1. Coleta todos os dados para envio
    const dados = {
        cpf: cpfInput.value, 
        nome: nomeInput.value,
        dataNascimento: dataNascimentoInput.value,
        cep: cepInput.value,
        uf: ufInput.value,
        cidade: cidadeInput.value,
        logradouro: logradouroInput.value,
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
            alert(`Cliente ${cpfOriginal ? 'editado' : 'cadastrado'} com sucesso!`);
            esconderFormulario(); 
            carregarClientes();
        } else {
            const errorData = await response.json();
            alert(`Erro na operação: ${errorData.error || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro de rede na submissão:', error);
        alert('Erro de rede. Verifique se o Backend está ativo.');
    }
});


//DELETE: Lógica da Modal e Exclusão
function solicitarExclusao(cpf) {
    cpfParaExcluir = cpf; 
    modal.style.display = 'flex'; 
}

async function executarExclusao() {
    if (!cpfParaExcluir) return; 

    try {
        const response = await fetch(`${API_URL}/${cpfParaExcluir}`, {
            method: 'DELETE', 
        });

        if (response.ok) {
            alert('Cliente excluído com sucesso!');
            carregarClientes(); 
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir cliente: ${errorData.error || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro de rede na exclusão:', error);
    } finally {
        modal.style.display = 'none'; 
        cpfParaExcluir = null;
    }
}

// Eventos da Modal
modalConfirmBtn.addEventListener('click', executarExclusao);
modalCancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    cpfParaExcluir = null;
});

// Inicia o carregamento dos clientes ao carregar a página
document.addEventListener('DOMContentLoaded', carregarClientes);