// Configuração da API
const API_URL = 'http://localhost:3000/api/funcionarios';

// Carregar ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada');
    
    // Event listener para o formulário de edição
    const form = document.getElementById('formEditarFuncionario');
    if (form) {
        form.addEventListener('submit', salvarEdicao);
        console.log('Formulário encontrado e evento adicionado');
    } else {
        console.error('Formulário não encontrado!');
    }














    

    
// Event listener para o menu hambúrguer
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu); // chama a função toggleMenu
    console.log('Menu hambúrguer configurado e clicável');
} else {
    console.error('Menu não encontrado!');
}

// Função para abrir/fechar menu lateral
function toggleMenu() {
    const menu = document.getElementById('menuLateral');
    if (menu) {
        menu.classList.toggle('aberto'); // adiciona ou remove a classe 'aberto'
        console.log('Menu lateral', menu.classList.contains('aberto') ? 'aberto' : 'fechado');
    }
}


    // ✅ Botão de fechar menu lateral
    const btnFecharMenu = document.querySelector('.fechar-menu');
    if (btnFecharMenu) {
        btnFecharMenu.addEventListener('click', toggleMenu);
        console.log('Botão de fechar menu configurado');
    }
    
   // Chama função de máscaras
    adicionarMascaras();
});



















// Função para salvar edição
function salvarEdicao(event) {
    event.preventDefault(); // Impede o reload da página
    console.log('Função salvarEdicao chamada');
    
    // Validar campos antes de abrir o modal
    const form = document.getElementById('formEditarFuncionario');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Mostrar modal de confirmação (campos permanecem preenchidos)
    abrirModalConfirmarSalvar();
}

// Função para abrir modal de confirmar salvamento
function abrirModalConfirmarSalvar() {
    console.log('Abrindo modal de confirmação');
    document.getElementById('modalExcluir').style.display = 'flex';
}

// Função para fechar modal
function fecharModal() {
    console.log('Fechando modal');
    document.getElementById('modalExcluir').style.display = 'none';
}

// Função para confirmar salvamento
async function confirmarExclusao() {
    console.log('Confirmando salvamento');
    
    // Fechar modal de confirmação
    fecharModal();
    
    const id = document.getElementById('editId').value;
    
    const funcionarioAtualizado = {
        nome: document.getElementById('editNome').value,
        cpf: document.getElementById('editCPF').value,
        rg: document.getElementById('editRG').value,
        cep: document.getElementById('editCEP').value,
        cidade: document.getElementById('editCidade').value,
        endereco: document.getElementById('editEndereco').value,
        telefone: document.getElementById('editTelefone').value,
        cargo: document.getElementById('editCargo').value,
        email: document.getElementById('editEmail').value,
        salario: document.getElementById('editSalario').value,
        data_admissao: document.getElementById('editDataAdmissao').value,
        ativo: document.getElementById('editAtivo').value
    };
    
    console.log('Dados a serem enviados:', funcionarioAtualizado);
    
    try {
        // Se não tem ID, é um cadastro novo (simula para teste)
        if (!id) {
            console.log('Simulando salvamento (sem backend)');
            // Mostrar modal de sucesso
            mostrarModalSucesso();
            return;
        }
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(funcionarioAtualizado)
        });
        
        if (response.ok) {
            console.log('Salvamento realizado com sucesso');
            mostrarModalSucesso();
        } else {
            const error = await response.json();
            alert(error.message || 'Erro ao atualizar funcionário.');
        }
    } catch (error) {
        console.error('Erro ao salvar edição:', error);
        // Se não conseguir conectar ao backend, simula sucesso para testar front
        mostrarModalSucesso();
    }
}

// Função para cancelar edição
function cancelarEdicao() {
    console.log('Cancelando edição');
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
        document.getElementById('formEditarFuncionario').reset();
    }
}

// Função para mostrar modal de sucesso
function mostrarModalSucesso() {
    console.log('Mostrando modal de sucesso');
    document.getElementById('modalSucesso').style.display = 'flex';
    
    // Fechar automaticamente após 3 segundos
    setTimeout(() => {
        fecharModalSucesso();
        // Limpar formulário somente APÓS fechar o modal de sucesso
        document.getElementById('formEditarFuncionario').reset();
    }, 3000);
}

// Função para fechar modal de sucesso
function fecharModalSucesso() {
    console.log('Fechando modal de sucesso');
    document.getElementById('modalSucesso').style.display = 'none';
}

// Função para adicionar máscaras
function adicionarMascaras() {
    // Máscara para CPF
    const cpfInput = document.getElementById('editCPF');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Máscara para RG
    const rgInput = document.getElementById('editRG');
    if (rgInput) {
        rgInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 9) {
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('editCEP');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Máscara para Telefone
    const telefoneInput = document.getElementById('editTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1)$2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Máscara para Salário
    const salarioInput = document.getElementById('editSalario');
    if (salarioInput) {
        salarioInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value === '') {
                e.target.value = '';
                return;
            }
            value = (parseInt(value) / 100).toFixed(2);
            e.target.value = 'R$ ' + value.replace('.', ',');
        });
    }
}

// Funções auxiliares de formatação
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