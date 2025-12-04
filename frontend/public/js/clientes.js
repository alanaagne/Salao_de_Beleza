// /frontend/public/js/clientes.js

const API_URL = 'http://localhost:3000/api/clientes';

// REFERÊNCIAS GERAIS E DE TELA 
const form = document.getElementById('formEditarCliente');
const tableBody = document.getElementById('clientes-table-body');
const listContainer = document.getElementById('listagem-container');
const formContainer = document.getElementById('formulario-container');
const formTitle = document.getElementById('form-title-text');
const btnShowCreate = document.getElementById('btn-show-create');
const modalExcluir = document.getElementById('modalExcluir');
const modalDeleteConfirmBtn = document.getElementById('modal-delete-confirm');

// NOVAS REFERÊNCIAS PARA A BUSCA 
const searchInput = document.getElementById('search-input'); 
const searchButton = document.getElementById('searchButton'); 

// REFERÊNCIAS DOS INPUTS 
const cpfOriginalInput = document.getElementById('editCpfOriginal');
const nomeInput = document.getElementById('editNome');
const cpfInput = document.getElementById('editCPF');
const dataNascimentoInput = document.getElementById('editDataNascimento');
const cepInput = document.getElementById('editCEP');
const cidadeInput = document.getElementById('editCidade');
const ufInput = document.getElementById('editUF');
const bairroInput = document.getElementById('editBairro');
const logradouroInput = document.getElementById('editLogradouro');
const numeroInput = document.getElementById('editNumero');
const telefoneInput = document.getElementById('editTelefone');


let cpfParaDeletar = null; 


// LÓGICA DE INTERFACE: Troca de Telas

// Mostra o formulário no modo 'Cadastrar'
function mostrarFormularioCadastro() {
    form.reset();
    cpfOriginalInput.value = '';
    formTitle.textContent = 'Cadastrar Novo Cliente';
    cpfInput.disabled = false;
    listContainer.style.display = 'none';
    formContainer.style.display = 'block';
}

// Prepara e mostra o formulário no modo 'Editar'
function mostrarFormularioEdicao(cliente) {
    preencherFormulario(cliente); 
    
    cpfOriginalInput.value = cliente.cpf;
    formTitle.textContent = 'Editar Cliente: ' + cliente.nome;
    cpfInput.disabled = true; // Não permite editar o CPF
    listContainer.style.display = 'none';
    formContainer.style.display = 'block';
}

// Volta para a tela de listagem
function cancelarEdicao() {
    
    const isEditing = formContainer.style.display === 'block';

    if (isEditing && confirm('Deseja retornar?')) {
        form.reset();
        formContainer.style.display = 'none';
        listContainer.style.display = 'block';
        carregarClientes(); // Recarrega a lista
    } else if (!isEditing) {
        // Se estiver na modal de sucesso, apenas volta.
        form.reset();
        formContainer.style.display = 'none';
        listContainer.style.display = 'block';
        carregarClientes();
    }
}


// CRUD: Funções Principais

// LÓGICA DE BUSCA
function executarBusca() {
    // Pega o valor do campo de busca
    const termo = searchInput.value.trim();
    // Chama a função de carregar clientes com o termo
    carregarClientes(termo);
}

// READ: Carregar e Exibir Clientes (AGORA ACEITA UM TERMO PARA BUSCA)
async function carregarClientes(termo = '') {
    try {
        // Constrói a URL: se houver termo, adiciona "?termo=..."
        const urlComBusca = termo ? `${API_URL}?termo=${encodeURIComponent(termo)}` : API_URL;
        
        const response = await fetch(urlComBusca);
        const clientes = await response.json();
        
        tableBody.innerHTML = '';
        
        if (clientes.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum cliente encontrado.</td></tr>`;
            return;
        }
        
        clientes.forEach(cliente => {
            const row = tableBody.insertRow();
            
            // O ID é um valor de exemplo, deve vir do BD 
            row.insertCell(0).textContent = cliente.ID || '1'; 
            
            row.insertCell(1).textContent = cliente.nome;
            row.insertCell(2).textContent = cliente.cidade;
            row.insertCell(3).textContent = formatarTelefone(cliente.telefone);
            
            
            // Codifica o objeto cliente para ser seguro no atributo onclick
            const clienteJSONString = JSON.stringify(cliente).replace(/"/g, '&quot;');
            
            // Coluna Editar (Célula 4)
            const editCell = row.insertCell(4); 
            editCell.innerHTML = `
                <button class="btn-editar" onclick="mostrarFormularioEdicao(JSON.parse('${clienteJSONString}'))">
                    <i class="fas fa-pen"></i>
                </button>`;
            
            // Coluna Excluir (Célula 5)
            const deleteCell = row.insertCell(5);
            deleteCell.innerHTML = `
                <button class="btn-excluir" onclick="solicitarExclusao('${cliente.cpf}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
        });

    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

// CREATE / UPDATE: Submissão do Formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const cpfOriginal = cpfOriginalInput.value;
    
    // Coletando dados (removendo máscaras antes de enviar para o backend)
    const dados = {
        nome: nomeInput.value,
        cpf: cpfInput.value.replace(/\D/g, ''),
        dataNascimento: dataNascimentoInput.value,
        cep: cepInput.value.replace(/\D/g, ''),
        cidade: cidadeInput.value,
        uf: ufInput.value,
        bairro: bairroInput.value,
        logradouro: logradouroInput.value,
        numero: numeroInput.value,
        telefone: telefoneInput.value.replace(/\D/g, ''),
    };

    let method = cpfOriginal ? 'PUT' : 'POST';
    let url = cpfOriginal ? `${API_URL}/${cpfOriginal}` : API_URL;

    try {
        const response = await fetch(url, { 
            method, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(dados) 
        });

        if (response.ok) {
            mostrarModalSucesso();
        } else {
            const errorData = await response.json();
            alert(`Erro na operação: ${errorData.error || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro de rede na submissão:', error);
        alert('Erro de rede. Verifique se o Backend está ativo.');
    }
});

// DELETE: Lógica de Exclusão (Modal de Confirmação)
function solicitarExclusao(cpf) {
    cpfParaDeletar = cpf; 
    modalExcluir.style.display = 'flex'; // Abre a modal de exclusão
}

modalDeleteConfirmBtn.addEventListener('click', async () => {
    if (!cpfParaDeletar) return;

    try {
        const response = await fetch(`${API_URL}/${cpfParaDeletar}`, { method: 'DELETE' });

        if (response.ok) {
            mostrarModalSucesso();
        } else {
            const errorData = await response.json();
            alert(`Erro ao excluir: ${errorData.error || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro de rede na exclusão:', error);
        alert('Erro de rede. Verifique o Backend.');
    } finally {
        fecharModal(); // Fecha a modal de exclusão
    }
});


// Funções Auxiliares (Modals e Preenchimento)


function fecharModal() {
    modalExcluir.style.display = 'none';
    cpfParaDeletar = null; 
}

function mostrarModalSucesso() {
    document.getElementById('modalSucesso').style.display = 'flex';
}

function fecharModalSucesso() {
    document.getElementById('modalSucesso').style.display = 'none';
    cancelarEdicao(); // Volta para a listagem
}

// Função auxiliar para preencher o form 
function preencherFormulario(cliente) {
    nomeInput.value = cliente.nome || '';
    cpfInput.value = formatarCPF(cliente.cpf) || ''; 
    dataNascimentoInput.value = formatarDataParaInput(cliente.dataNascimento) || '';
    cepInput.value = formatarCEP(cliente.cep) || '';
    cidadeInput.value = cliente.cidade || '';
    ufInput.value = cliente.uf || '';
    bairroInput.value = cliente.bairro || '';
    logradouroInput.value = cliente.logradouro || '';
    numeroInput.value = cliente.numero || '';
    telefoneInput.value = formatarTelefone(cliente.telefone) || '';
}


//  INICIALIZAÇÃO E EVENTOS 
document.addEventListener('DOMContentLoaded', () => {
    btnShowCreate.addEventListener('click', mostrarFormularioCadastro); 
    
    // EVENT LISTENERS DA BUSCA 
    if (searchButton) {
        // Evento de clique na lupa
        searchButton.addEventListener('click', executarBusca);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            // Verifica se a tecla pressionada é ENTER 
            if (e.key === 'Enter') {
                e.preventDefault(); // Impede o submit padrão do form
                executarBusca();
            }
        });
    }
    

    // Menu Lateral
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    const btnFecharMenu = document.querySelector('.fechar-menu');
    if (btnFecharMenu) btnFecharMenu.addEventListener('click', toggleMenu);
    
    // Máscaras
    adicionarMascaras(); 
    
    // Inicia carregando a lista
    carregarClientes(); 
});



// FUNÇÕES DE INTERFACE (Menu Lateral e Máscaras)


function toggleMenu() {
    const menu = document.getElementById('menuLateral');
    if (menu) {
        menu.classList.toggle('aberto');
    }
}

function adicionarMascaras() {
    // Aplica máscaras aos inputs referenciados (cpfInput, cepInput, telefoneInput)
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            e.target.maxLength = 14;
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }

    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            e.target.maxLength = 9;
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }

    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            e.target.maxLength = 15;
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 10) { // Celular
                value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
            } else if (value.length > 6) { // Fixo
                value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1)$2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d)/, '($1)$2');
            }
            e.target.value = value;
        });
    }
}


// FUNÇÕES DE FORMATAÇÃO


function formatarCPF(cpf) {
    if (!cpf) return '';
    const cleaned = String(cpf).replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCEP(cep) {
    if (!cep) return '';
    const cleaned = String(cep).replace(/\D/g, '');
    if (cleaned.length !== 8) return cep;
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function formatarTelefone(telefone) {
    if (!telefone) return '';
    const cleaned = String(telefone).replace(/\D/g, '');
    
    if (cleaned.length === 11) { // Celular com DDD
        return `(${cleaned.substr(0, 2)})${cleaned.substr(2, 5)}-${cleaned.substr(7)}`;
    }
    if (cleaned.length === 10) { // Fixo ou Celular sem o 9 (antigo)
        return `(${cleaned.substr(0, 2)})${cleaned.substr(2, 4)}-${cleaned.substr(6)}`;
    }
    return telefone;
}

function formatarDataParaInput(data) {
    if (!data) return '';
    // Converte a data do banco para o formato YYYY-MM-DD exigido pelo input type="date"
    const date = new Date(data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}