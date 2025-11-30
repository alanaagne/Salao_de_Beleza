// ================================
// SERVICOS.JS - VERSÃO FINAL CORRIGIDA
// ================================


const CLIENTES_URL = 'http://localhost:3000/api/clientes';
const FUNCIONARIOS_URL = 'http://localhost:3000/api/funcionarios';
const SERVICOS_URL = 'http://localhost:3000/api/servicos'
const API_URL = 'http://localhost:3000/api/servicos';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Iniciando sistema de serviços');
    
    // =============================
    // REFERÊNCIAS DO DOM
    // =============================
    const form = document.getElementById('formEditarServico');
    const tableBody = document.getElementById('servicos-table-body');
    const listContainer = document.getElementById('listagem-container');
    const formContainer = document.getElementById('formulario-container');
    const formTitle = document.getElementById('form-title-text');
    const btnShowCreate = document.getElementById('btn-show-create');
    const modalExcluir = document.getElementById('modalExcluir');
    const modalDeleteConfirmBtn = document.getElementById('modal-delete-confirm');
    const searchInput = document.getElementById('search-input'); 
    const searchButton = document.getElementById('searchButton'); 
    
    // Inputs do formulário
    const idTipoOriginalInput = document.getElementById('editIdTipoOriginal');
    const idTipoInput = document.getElementById('editIdTipo');
    const nomeTipoInput = document.getElementById('editNomeTipo');
    const custoServicoInput = document.getElementById('editCustoServico');
    const tempoDuracaoInput = document.getElementById('editTempoDuracao');
    const descricaoInput = document.getElementById('editDescricao');

    // Menu lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const btnFecharMenu = document.querySelector('.fechar-menu');

    let idTipoParaDeletar = null;

    // ================================
    // MENU LATERAL
    // ================================
    
    function abrirMenu() {
        if (menuLateral) {
            menuLateral.classList.add('menu-aberto');
            console.log("Menu aberto");
        }
    }

    function fecharMenuLateral() {
        if (menuLateral) {
            menuLateral.classList.remove('menu-aberto');
            console.log("Menu fechado");
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            abrirMenu();
        });
    }

    if (btnFecharMenu) {
        btnFecharMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            fecharMenuLateral();
        });
    }

    // Fecha ao clicar fora
    document.addEventListener('click', function(e) {
        if (menuLateral && menuLateral.classList.contains('menu-aberto')) {
            if (!menuLateral.contains(e.target) && !menuToggle.contains(e.target)) {
                fecharMenuLateral();
            }
        }
    });

    if (menuLateral) {
        menuLateral.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // ================================
    // FUNÇÕES DE TELA
    // ================================
    
    window.mostrarFormularioCadastro = function() {
        form.reset();
        idTipoOriginalInput.value = '';
        formTitle.textContent = 'Cadastrar Novo Serviço';
        idTipoInput.disabled = false;
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.mostrarFormularioEdicao = function(servico) {
        preencherFormulario(servico);
        idTipoOriginalInput.value = servico.idTipo;
        formTitle.textContent = 'Editar Serviço: ' + servico.nomeTipo;
        idTipoInput.disabled = true; // Código imutável (RF027)
        listContainer.style.display = 'none';
        formContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.cancelarEdicao = function() {
        form.reset();
        formContainer.style.display = 'none';
        listContainer.style.display = 'block';
        carregarServicos();
    };

    // ================================
    // BUSCA (RF026)
    // ================================
    
    function executarBusca() {
        const termo = searchInput.value.trim();
        carregarServicos(termo);
    }

    if (searchButton) {
        searchButton.addEventListener('click', executarBusca);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executarBusca();
            }
        });
    }

    if (btnShowCreate) {
        btnShowCreate.addEventListener('click', mostrarFormularioCadastro);
    }

    // ================================
    // LISTAR SERVIÇOS (RF026)
    // ================================
    
    async function carregarServicos(termo = '') {
        try {
            const urlComBusca = termo ? `${API_URL}?termo=${encodeURIComponent(termo)}` : API_URL;
            const response = await fetch(urlComBusca);
            const servicos = await response.json();

            tableBody.innerHTML = '';

            if (servicos.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center">Nenhum serviço encontrado.</td></tr>`;
                return;
            }

            servicos.forEach(servico => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = servico.idTipo;
                row.insertCell(1).textContent = servico.nomeTipo;
                row.insertCell(2).textContent = formatarValor(servico.custoServico);
                row.insertCell(3).textContent = servico.tempoDuracao + ' min';

                const servicoJSON = JSON.stringify(servico).replace(/"/g, '&quot;');

                row.insertCell(4).innerHTML = `
                    <button class="btn-editar" onclick='mostrarFormularioEdicao(${servicoJSON})'>
                        <i class="fas fa-pen"></i>
                    </button>
                `;

                row.insertCell(5).innerHTML = `
                    <button class="btn-excluir" onclick="solicitarExclusao('${servico.idTipo}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            });

        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red">Erro ao carregar dados.</td></tr>`;
        }
    }

    // ================================
    // CADASTRAR/ATUALIZAR (RF025/RF027)
    // ================================
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // VALIDAÇÃO MANUAL (RF025 [9.1.2])
            if (!validarCamposObrigatorios()) {
                return;
            }

            const idTipoOriginal = idTipoOriginalInput.value;

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
                    
                    // RF025 [9.3.2] - Mensagem específica para ID duplicado
                    if (errorData.error && errorData.error.includes('já cadastrado')) {
                        alert('Erro na operação: ID do serviço (idTipo) já cadastrado');
                    } else {
                        alert(`Erro: ${errorData.error}`);
                    }
                }

            } catch (error) {
                console.error('Erro ao salvar:', error);
                alert('Erro de rede ao tentar salvar o serviço.');
            }
        });
    }

    // ================================
    // VALIDAÇÃO DE CAMPOS (RF025)
    // ================================
    
    function validarCamposObrigatorios() {
        const camposObrigatorios = [
            { input: idTipoInput, nome: 'Código do Serviço' },
            { input: nomeTipoInput, nome: 'Nome do Serviço' },
            { input: custoServicoInput, nome: 'Custo do Serviço' },
            { input: tempoDuracaoInput, nome: 'Tempo de Duração' }
        ];

        for (let campo of camposObrigatorios) {
            if (!campo.input.value.trim()) {
                alert(`Preencha este campo: ${campo.nome}`);
                campo.input.focus();
                return false;
            }
        }

        // Validações adicionais
        if (parseFloat(custoServicoInput.value) <= 0) {
            alert('O custo do serviço deve ser maior que zero.');
            custoServicoInput.focus();
            return false;
        }

        if (parseInt(tempoDuracaoInput.value) <= 0) {
            alert('O tempo de duração deve ser maior que zero.');
            tempoDuracaoInput.focus();
            return false;
        }

        return true;
    }

    // ================================
    // EXCLUIR (RF028)
    // ================================
    
    window.solicitarExclusao = function(idTipo) {
        idTipoParaDeletar = idTipo;
        modalExcluir.style.display = 'flex';
    };

    if (modalDeleteConfirmBtn) {
        modalDeleteConfirmBtn.addEventListener('click', async () => {
            if (!idTipoParaDeletar) return;

            try {
                const response = await fetch(`${API_URL}/${idTipoParaDeletar}`, { 
                    method: 'DELETE' 
                });

                if (response.ok) {
                    mostrarModalSucesso();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao excluir: ${errorData.error}`);
                }

            } catch (error) {
                console.error('Erro ao excluir:', error);
                alert('Operação não realizada com sucesso, timeout com banco de dados');
            } finally {
                fecharModalExcluir();
            }
        });
    }

    // ================================
    // MODAIS
    // ================================
    
    window.fecharModal = function() {
        fecharModalExcluir();
    };

    function fecharModalExcluir() {
        modalExcluir.style.display = 'none';
        idTipoParaDeletar = null;
    }

    function mostrarModalSucesso() {
        document.getElementById('modalSucesso').style.display = 'flex';
    }

    window.fecharModalSucesso = function() {
        document.getElementById('modalSucesso').style.display = 'none';
        cancelarEdicao();
    };

    // ================================
    // UTILITÁRIOS
    // ================================
    
    function preencherFormulario(servico) {
        idTipoInput.value = servico.idTipo || '';
        nomeTipoInput.value = servico.nomeTipo || '';
        custoServicoInput.value = servico.custoServico || '';
        tempoDuracaoInput.value = servico.tempoDuracao || '';
        descricaoInput.value = servico.descricao || '';
    }

    function formatarValor(valor) {
        if (valor == null) return 'R$ 0,00';
        return parseFloat(valor).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    }

    // ================================
    // INICIALIZAÇÃO
    // ================================
    
    carregarServicos();
    console.log('Sistema de serviços inicializado com sucesso');
});