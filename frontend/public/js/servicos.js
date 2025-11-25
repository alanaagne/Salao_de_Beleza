// /frontend/public/js/servicos.js

const API_URL = 'http://localhost:3000/api/servicos';

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Iniciando sistema de serviços');
    
    // REFERÊNCIAS GERAIS E DE TELA 
    const form = document.getElementById('formEditarServico');
    const tableBody = document.getElementById('servicos-table-body');
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
    const idTipoOriginalInput = document.getElementById('editIdTipoOriginal');
    const idTipoInput = document.getElementById('editIdTipo');
    const nomeTipoInput = document.getElementById('editNomeTipo');
    const custoServicoInput = document.getElementById('editCustoServico');
    const tempoDuracaoInput = document.getElementById('editTempoDuracao');
    const descricaoInput = document.getElementById('editDescricao');
    
    // Menu Lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const btnFecharMenu = document.querySelector('.fechar-menu');
    
    let idTipoParaDeletar = null;
    
    // Verificação de elementos
    console.log('Botão Criar:', btnShowCreate);
    console.log('Menu Toggle:', menuToggle);
    console.log('Menu Lateral:', menuLateral);
    
    
    // ====================================
    // LÓGICA DE INTERFACE: Troca de Telas
    // ====================================
    
    // Mostra o formulário no modo 'Cadastrar'
    window.mostrarFormularioCadastro = function() {
        console.log('Abrindo formulário de cadastro');
        form.reset();
        idTipoOriginalInput.value = '';
        formTitle.textContent = 'Cadastrar Novo Serviço';
        idTipoInput.disabled = false;
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        
        // Scroll suave para o topo
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Prepara e mostra o formulário no modo 'Editar'
    window.mostrarFormularioEdicao = function(servico) {
        console.log('Abrindo formulário de edição', servico);
        preencherFormulario(servico); 
        
        idTipoOriginalInput.value = servico.idTipo;
        formTitle.textContent = 'Editar Serviço: ' + servico.nomeTipo;
        idTipoInput.disabled = true;
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        
        // Scroll suave para o topo
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Volta para a tela de listagem
    window.cancelarEdicao = function() {
        const isEditing = formContainer.style.display === 'block';
    
        if (isEditing && confirm('Deseja retornar?')) {
            form.reset();
            formContainer.style.display = 'none';
            listContainer.style.display = 'block';
            carregarServicos();
        } else if (!isEditing) {
            form.reset();
            formContainer.style.display = 'none';
            listContainer.style.display = 'block';
            carregarServicos();
        }
    };
    
    
    // ====================================
    // CRUD: Funções Principais
    // ====================================
    
    // LÓGICA DE BUSCA
    function executarBusca() {
        const termo = searchInput.value.trim();
        console.log('Executando busca:', termo);
        carregarServicos(termo);
    }
    
    // READ: Carregar e Exibir Serviços
    async function carregarServicos(termo = '') {
        try {
            const urlComBusca = termo ? `${API_URL}?termo=${encodeURIComponent(termo)}` : API_URL;
            console.log('Carregando serviços de:', urlComBusca);
            
            const response = await fetch(urlComBusca);
            const servicos = await response.json();
            
            console.log('Serviços carregados:', servicos.length);
            
            tableBody.innerHTML = '';
            
            if (servicos.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum serviço encontrado.</td></tr>`;
                return;
            }
            
            servicos.forEach(servico => {
                const row = tableBody.insertRow();
                
                row.insertCell(0).textContent = servico.idTipo;
                row.insertCell(1).textContent = servico.nomeTipo;
                row.insertCell(2).textContent = formatarValor(servico.custoServico);
                row.insertCell(3).textContent = servico.tempoDuracao;
                
                // Codifica o objeto servico
                const servicoJSONString = JSON.stringify(servico).replace(/"/g, '&quot;');
                
                // Coluna Editar
                const editCell = row.insertCell(4); 
                editCell.innerHTML = `
                    <button class="btn-editar" onclick="mostrarFormularioEdicao(JSON.parse('${servicoJSONString}'))">
                        <i class="fas fa-pen"></i>
                    </button>`;
                
                // Coluna Excluir
                const deleteCell = row.insertCell(5);
                deleteCell.innerHTML = `
                    <button class="btn-excluir" onclick="solicitarExclusao('${servico.idTipo}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            });
    
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar dados. Verifique se o backend está ativo.</td></tr>`;
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
            
            const idTipoOriginal = idTipoOriginalInput.value;
            
            // Coletando dados
            const dados = {
                idTipo: idTipoInput.value.trim(),
                nomeTipo: nomeTipoInput.value.trim(),
                custoServico: parseFloat(custoServicoInput.value),
                tempoDuracao: parseInt(tempoDuracaoInput.value),
                descricao: descricaoInput.value.trim() || null
            };
    
            let method = idTipoOriginal ? 'PUT' : 'POST';
            let url = idTipoOriginal ? `${API_URL}/${idTipoOriginal}` : API_URL;
    
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
    window.solicitarExclusao = function(idTipo) {
        console.log('Solicitando exclusão de:', idTipo);
        idTipoParaDeletar = idTipo; 
        modalExcluir.style.display = 'flex';
    };
    
    if (modalDeleteConfirmBtn) {
        modalDeleteConfirmBtn.addEventListener('click', async () => {
            if (!idTipoParaDeletar) return;
    
            try {
                const response = await fetch(`${API_URL}/${idTipoParaDeletar}`, { method: 'DELETE' });
    
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
        idTipoParaDeletar = null; 
    };
    
    function mostrarModalSucesso() {
        document.getElementById('modalSucesso').style.display = 'flex';
    }
    
    window.fecharModalSucesso = function() {
        document.getElementById('modalSucesso').style.display = 'none';
        window.cancelarEdicao();
    };
    
    // Função auxiliar para preencher o form 
    function preencherFormulario(servico) {
        idTipoInput.value = servico.idTipo || '';
        nomeTipoInput.value = servico.nomeTipo || '';
        custoServicoInput.value = servico.custoServico || '';
        tempoDuracaoInput.value = servico.tempoDuracao || '';
        descricaoInput.value = servico.descricao || '';
    }
    
    
    // ====================================
    // EVENT LISTENERS
    // ====================================
    
    // Botão de criar novo serviço
    if (btnShowCreate) {
        btnShowCreate.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Serviço clicado');
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
    
    
    // ====================================
    // INICIALIZAÇÃO
    // ====================================
    
    // Inicia carregando a lista
    carregarServicos();
    
    console.log('Sistema de serviços inicializado com sucesso');
});