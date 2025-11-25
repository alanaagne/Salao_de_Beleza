// /frontend/public/js/produtos.js

const API_URL = 'http://localhost:3000/api/produtos';

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Iniciando sistema de produtos');
    
    // REFERÊNCIAS GERAIS E DE TELA 
    const form = document.getElementById('formEditarProduto');
    const tableBody = document.getElementById('produtos-table-body');
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
    const idOriginalInput = document.getElementById('editIdOriginal');
    const nomeProdutoInput = document.getElementById('editNomeProduto');
    const valorVendaInput = document.getElementById('editValorVenda');
    const categoriaProdutoInput = document.getElementById('editCategoriaProduto');
    const descricaoInput = document.getElementById('editDescricao');
    const dataCadastroInput = document.getElementById('editDataCadastro');
    const statusInput = document.getElementById('editStatus');
    
    // Menu Lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const btnFecharMenu = document.querySelector('.fechar-menu');
    
    let idParaDeletar = null;
    
    // Verificação de elementos
    console.log('Botão Criar:', btnShowCreate);
    console.log('Menu Toggle:', menuToggle);
    
    
    // ====================================
    // LÓGICA DE INTERFACE: Troca de Telas
    // ====================================
    
    // Mostra o formulário no modo 'Cadastrar'
    window.mostrarFormularioCadastro = function() {
        console.log('Abrindo formulário de cadastro');
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
    
    // Prepara e mostra o formulário no modo 'Editar'
    window.mostrarFormularioEdicao = function(produto) {
        console.log('Abrindo formulário de edição', produto);
        preencherFormulario(produto); 
        
        idOriginalInput.value = produto.id;
        formTitle.textContent = 'Editar Produto: ' + produto.nomeProduto;
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Volta para a tela de listagem
    window.cancelarEdicao = function() {
        const isEditing = formContainer.style.display === 'block';
    
        if (isEditing && confirm('Deseja retornar?')) {
            form.reset();
            formContainer.style.display = 'none';
            listContainer.style.display = 'block';
            carregarProdutos();
        } else if (!isEditing) {
            form.reset();
            formContainer.style.display = 'none';
            listContainer.style.display = 'block';
            carregarProdutos();
        }
    };
    
    
    // ====================================
    // CRUD: Funções Principais
    // ====================================
    
    // LÓGICA DE BUSCA
    function executarBusca() {
        const termo = searchInput.value.trim();
        console.log('Executando busca:', termo);
        carregarProdutos(termo);
    }
    
    // READ: Carregar e Exibir Produtos
    async function carregarProdutos(termo = '') {
        try {
            const urlComBusca = termo ? `${API_URL}?termo=${encodeURIComponent(termo)}` : API_URL;
            console.log('Carregando produtos de:', urlComBusca);
            
            const response = await fetch(urlComBusca);
            const produtos = await response.json();
            
            console.log('Produtos carregados:', produtos.length);
            
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
                
                // Codifica o objeto produto
                const produtoJSONString = JSON.stringify(produto).replace(/"/g, '&quot;');
                
                // Coluna Editar
                const editCell = row.insertCell(5); 
                editCell.innerHTML = `
                    <button class="btn-editar" onclick="mostrarFormularioEdicao(JSON.parse('${produtoJSONString}'))">
                        <i class="fas fa-pen"></i>
                    </button>`;
                
                // Coluna Excluir
                const deleteCell = row.insertCell(6);
                deleteCell.innerHTML = `
                    <button class="btn-excluir" onclick="solicitarExclusao(${produto.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            });
    
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar dados. Verifique se o backend está ativo.</td></tr>`;
        }
    }
    
    // CREATE / UPDATE: Submissão do Formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const idOriginal = idOriginalInput.value;
            
            // Coletando dados
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
                alert('Erro de rede. Verifique se o Backend está ativo.');
            }
        });
    }
    
    // DELETE: Lógica de Exclusão
    window.solicitarExclusao = function(id) {
        console.log('Solicitando exclusão de:', id);
        idParaDeletar = id; 
        modalExcluir.style.display = 'flex';
    };
    
    if (modalDeleteConfirmBtn) {
        modalDeleteConfirmBtn.addEventListener('click', async () => {
            if (!idParaDeletar) return;
    
            try {
                const response = await fetch(`${API_URL}/${idParaDeletar}`, { method: 'DELETE' });
    
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
                fecharModal();
            }
        });
    }
    
    
    // ====================================
    // Funções Auxiliares (Modals)
    // ====================================
    
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
    
    // Função auxiliar para preencher o form 
    function preencherFormulario(produto) {
        nomeProdutoInput.value = produto.nomeProduto || '';
        valorVendaInput.value = produto.valorVenda || '';
        categoriaProdutoInput.value = produto.categoriaProduto || '';
        descricaoInput.value = produto.descricao || '';
        dataCadastroInput.value = formatarDataParaInput(produto.dataCadastro) || '';
        statusInput.value = produto.status || 'Disponível';
    }
    
    
    // ====================================
    // EVENT LISTENERS
    // ====================================
    
    // Botão de criar novo produto
    if (btnShowCreate) {
        btnShowCreate.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Produto clicado');
            window.mostrarFormularioCadastro();
        });
    } else {
        console.error('Botão btn-show-create não encontrado!');
    }
    
    // EVENT LISTENERS DA BUSCA 
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
    
    // Menu Lateral - CORRIGIDO
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu toggle clicado');
            toggleMenu();
        });
    } else {
        console.error('Menu toggle não encontrado!');
    }
    
    if (btnFecharMenu) {
        btnFecharMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão fechar menu clicado');
            toggleMenu();
        });
    }
    
    // Função para toggle do menu
    function toggleMenu() {
        if (menuLateral) {
            menuLateral.classList.toggle('aberto');
            console.log('Menu lateral classe aberto:', menuLateral.classList.contains('aberto'));
        } else {
            console.error('Menu lateral não encontrado!');
        }
    }
    
    
    // ====================================
    // FORMATAÇÃO
    // ====================================
    
    function formatarValor(valor) {
        if (valor == null) return 'R$ 0,00';
        return parseFloat(valor).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    }
    
    function formatarDataParaInput(data) {
        if (!data) return '';
        // Converte a data do banco para o formato YYYY-MM-DD
        const date = new Date(data);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    
    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    
    // Inicia carregando a lista
    carregarProdutos();
    
    console.log('Sistema de produtos inicializado com sucesso');
});