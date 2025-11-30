// /frontend/public/js/produtos.js - VERSÃO CORRIGIDA

const API_URL = 'http://localhost:3000/api/produtos';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Iniciando sistema de produtos');
    
    // =============================
    // REFERÊNCIAS DO DOM
    // =============================
    const form = document.getElementById('formEditarProduto');
    const tableBody = document.getElementById('produtos-table-body');
    const listContainer = document.getElementById('listagem-container');
    const formContainer = document.getElementById('formulario-container');
    const formTitle = document.getElementById('form-title-text');
    const btnShowCreate = document.getElementById('btn-show-create');
    const modalExcluir = document.getElementById('modalExcluir');
    const modalDeleteConfirmBtn = document.getElementById('modal-delete-confirm');
    const searchInput = document.getElementById('search-input'); 
    const searchButton = document.getElementById('searchButton'); 
    
    // Inputs do formulário
    const idOriginalInput = document.getElementById('editIdOriginal');
    const nomeProdutoInput = document.getElementById('editNomeProduto');
    const valorVendaInput = document.getElementById('editValorVenda');
    const categoriaProdutoInput = document.getElementById('editCategoriaProduto');
    const descricaoInput = document.getElementById('editDescricao');
    const dataCadastroInput = document.getElementById('editDataCadastro');
    const statusInput = document.getElementById('editStatus');
    
    // Menu lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const btnFecharMenu = document.querySelector('.fechar-menu');
    
    let idParaDeletar = null;

    // ================================
    // MENU LATERAL
    // ================================
    
    function toggleMenu() {
        if (menuLateral) {
            menuLateral.classList.toggle('aberto');
            console.log('Menu toggle - classe aberto:', menuLateral.classList.contains('aberto'));
        }
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    if (btnFecharMenu) {
        btnFecharMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (menuLateral && menuLateral.classList.contains('aberto')) {
            if (!menuLateral.contains(e.target) && !menuToggle.contains(e.target)) {
                menuLateral.classList.remove('aberto');
            }
        }
    });

    // ================================
    // FUNÇÕES DE TELA
    // ================================
    
    window.mostrarFormularioCadastro = function() {
        form.reset();
        idOriginalInput.value = '';
        formTitle.textContent = 'Cadastrar Novo Produto';
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        
        // Define data de hoje como padrão
        const hoje = new Date().toISOString().split('T')[0];
        dataCadastroInput.value = hoje;
        statusInput.value = 'Disponível';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.mostrarFormularioEdicao = function(produto) {
        preencherFormulario(produto); 
        idOriginalInput.value = produto.id;
        formTitle.textContent = 'Editar Produto: ' + produto.nomeProduto;
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.cancelarEdicao = function() {
        form.reset();
        formContainer.style.display = 'none';
        listContainer.style.display = 'block';
        carregarProdutos();
    };

    // ================================
    // BUSCA (RF030)
    // ================================
    
    function executarBusca() {
        const termo = searchInput.value.trim();
        carregarProdutos(termo);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            executarBusca();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                executarBusca();
            }
        });
    }

    if (btnShowCreate) {
        btnShowCreate.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.mostrarFormularioCadastro();
        });
    }

    // ================================
    // LISTAR PRODUTOS (RF030)
    // ================================
    
    async function carregarProdutos(termo = '') {
        try {
            const urlComBusca = termo ? `${API_URL}?termo=${encodeURIComponent(termo)}` : API_URL;
            const response = await fetch(urlComBusca);
            const produtos = await response.json();
            
            tableBody.innerHTML = '';
            
            if (produtos.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum produto encontrado.</td></tr>`;
                return;
            }
            
            produtos.forEach(produto => {
                const row = tableBody.insertRow();
                
                row.insertCell(0).textContent = produto.id;
                row.insertCell(1).textContent = produto.nomeProduto;
                row.insertCell(2).textContent = produto.categoriaProduto || '-';
                row.insertCell(3).textContent = formatarValor(produto.valorVenda);
                row.insertCell(4).textContent = produto.status || 'Disponível';
                
                const produtoJSON = JSON.stringify(produto).replace(/"/g, '&quot;');
                
                row.insertCell(5).innerHTML = `
                    <button class="btn-editar" onclick='mostrarFormularioEdicao(${produtoJSON})'>
                        <i class="fas fa-pen"></i>
                    </button>`;
                
                row.insertCell(6).innerHTML = `
                    <button class="btn-excluir" onclick="solicitarExclusao(${produto.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            });
    
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Operação não realizada com sucesso, timeout com banco de dados</td></tr>`;
        }
    }

    // ================================
    // CADASTRAR/ATUALIZAR (RF029/RF031)
    // ================================
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // VALIDAÇÃO MANUAL (RF029 [9.1.2])
            if (!validarCamposObrigatorios()) {
                return;
            }
            
            const idOriginal = idOriginalInput.value;
            
            const dados = {
                nomeProduto: nomeProdutoInput.value.trim(),
                valorVenda: parseFloat(valorVendaInput.value),
                categoriaProduto: categoriaProdutoInput.value.trim(),
                descricao: descricaoInput.value.trim() || null,
                dataCadastro: dataCadastroInput.value,
                status: statusInput.value
            };
    
            let method = idOriginal ? 'PUT' : 'POST';
            let url = idOriginal ? `${API_URL}/${idOriginal}` : API_URL;
    
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
                alert('Operação não realizada com sucesso, timeout com banco de dados');
            }
        });
    }

    // ================================
    // VALIDAÇÃO DE CAMPOS (RF029)
    // ================================
    
    function validarCamposObrigatorios() {
        const camposObrigatorios = [
            { input: nomeProdutoInput, nome: 'Nome do Produto' },
            { input: categoriaProdutoInput, nome: 'Categoria' },
            { input: valorVendaInput, nome: 'Valor de Venda' },
            { input: dataCadastroInput, nome: 'Data de Cadastro' },
            { input: statusInput, nome: 'Status' }
        ];

        for (let campo of camposObrigatorios) {
            if (!campo.input.value.trim()) {
                alert(`Preencha este campo: ${campo.nome}`);
                campo.input.focus();
                return false;
            }
        }

        // Validações adicionais
        if (parseFloat(valorVendaInput.value) <= 0) {
            alert('O valor de venda deve ser maior que zero.');
            valorVendaInput.focus();
            return false;
        }

        return true;
    }

    // ================================
    // EXCLUIR (RF032)
    // ================================
    
    window.solicitarExclusao = function(id) {
        idParaDeletar = id; 
        modalExcluir.style.display = 'flex';
    };
    
    if (modalDeleteConfirmBtn) {
        modalDeleteConfirmBtn.addEventListener('click', async () => {
            if (!idParaDeletar) return;
    
            try {
                const response = await fetch(`${API_URL}/${idParaDeletar}`, { 
                    method: 'DELETE' 
                });
    
                if (response.ok) {
                    mostrarModalSucesso();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao excluir: ${errorData.error || 'Erro desconhecido.'}`);
                }
            } catch (error) {
                console.error('Erro de rede na exclusão:', error);
                alert('Operação não realizada com sucesso, timeout com banco de dados');
            } finally {
                fecharModal();
            }
        });
    }

    // ================================
    // MODAIS
    // ================================
    
    window.fecharModal = function() {
        modalExcluir.style.display = 'none';
        idParaDeletar = null; 
    };
    
    function mostrarModalSucesso() {
        document.getElementById('modalSucesso').style.display = 'flex';
    }
    
    window.fecharModalSucesso = function() {
        document.getElementById('modalSucesso').style.display = 'none';
        window.cancelarEdicao();
    };

    // ================================
    // UTILITÁRIOS
    // ================================
    
    function preencherFormulario(produto) {
        nomeProdutoInput.value = produto.nomeProduto || '';
        valorVendaInput.value = produto.valorVenda || '';
        categoriaProdutoInput.value = produto.categoriaProduto || '';
        descricaoInput.value = produto.descricao || '';
        dataCadastroInput.value = formatarDataParaInput(produto.dataCadastro) || '';
        statusInput.value = produto.status || 'Disponível';
    }
    
    function formatarValor(valor) {
        if (valor == null) return 'R$ 0,00';
        return parseFloat(valor).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    }
    
    function formatarDataParaInput(data) {
        if (!data) return '';
        const date = new Date(data);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ================================
    // INICIALIZAÇÃO
    // ================================
    
    carregarProdutos();
    console.log('Sistema de produtos inicializado com sucesso');
});