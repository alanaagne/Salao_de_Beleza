// frontend/public/js/funcionarios.js

const API_URL = 'http://localhost:3000/api/funcionarios';

document.addEventListener('DOMContentLoaded', () => {

    // Seleção de Elementos 
    const viewRegistro = document.getElementById('view-registro');
    const viewCadastro = document.getElementById('view-cadastro');
    const tabelaFuncionarios = document.getElementById('tabela-funcionarios');
    const formFuncionario = document.getElementById('form-funcionario');
    const formTitle = document.getElementById('form-title-text');
    const btnNovoCadastro = document.getElementById('btn-novo-cadastro');
    const btnCancelarForm = document.getElementById('btn-cancelar-form');
    const inputPesquisa = document.getElementById('input-pesquisa');
    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const modalSucesso = document.getElementById('modal-sucesso');
    const btnModalConfirmar = document.getElementById('btn-modal-confirmar');
    const btnModalCancelar = document.getElementById('btn-modal-cancelar');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLateral = document.getElementById('menuLateral');
    const fecharMenuBtn = document.querySelector('.fechar-menu');

    let funcionariosCache = [];
    let cpfParaAcao = null;
    let modoEdicao = false;

    //  Funções de Interface 
    const toggleMenu = () => menuLateral.classList.toggle('aberto');

    const mostrarViewRegistro = () => {
        viewCadastro.style.display = 'none';
        viewRegistro.style.display = 'block';
        formFuncionario.reset();
        listarFuncionarios();
    };

    const mostrarViewCadastro = (isEdicao = false, dados = null) => {
        viewRegistro.style.display = 'none';
        viewCadastro.style.display = 'block';
        formFuncionario.reset();
        modoEdicao = isEdicao;

        const campoCpf = document.getElementById('cpf');
        const campoRg = document.getElementById('rg');
        const campoDataAdmissao = document.getElementById('dataAdmissao');
        const statusGroup = document.getElementById('status-group');

        if (isEdicao && dados) {
            formTitle.textContent = 'Editar Funcionário';
            statusGroup.style.display = 'flex';
            campoCpf.readOnly = true;
            campoRg.readOnly = true;
            campoDataAdmissao.readOnly = true;

            document.getElementById('nome').value = dados.nome || '';
            campoCpf.value = formatarCpf(dados.cpf || '');
            document.getElementById('cpf-original').value = dados.cpf;
            campoRg.value = dados.rg || '';
            document.getElementById('cep').value = dados.cep || '';
            document.getElementById('cidade').value = dados.cidade || '';
            document.getElementById('endereco').value = dados.endereco || '';
            document.getElementById('telefone').value = formatarTelefone(dados.telefone || '');
            document.getElementById('uf').value = dados.uf || '';
            document.getElementById('cargo').value = dados.especializacao || '';
            document.getElementById('email').value = dados.email || '';
            campoDataAdmissao.value = dados.data_admissao ? dados.data_admissao.split('T')[0] : '';
            document.getElementById('status').value = dados.status || 'Ativo';
        } else {
            formTitle.textContent = 'Cadastro de Funcionário';
            statusGroup.style.display = 'none';
            campoCpf.readOnly = false;
            campoRg.readOnly = false;
            campoDataAdmissao.readOnly = false;
        }
    };
    
    //  Funções de Lógica 
    const listarFuncionarios = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao conectar com o servidor.');
            funcionariosCache = await response.json();
            renderizarTabela(funcionariosCache);
        } catch (error) {
            console.error(error);
            tabelaFuncionarios.innerHTML = `<tr><td colspan="6">Não foi possível carregar os dados.</td></tr>`;
        }
    };

    const renderizarTabela = (dados) => {
        tabelaFuncionarios.innerHTML = '';
        if (!dados || dados.length === 0) {
            tabelaFuncionarios.innerHTML = `<tr><td colspan="6">Nenhum funcionário cadastrado.</td></tr>`;
            return;
        }
        dados.forEach((func, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${func.nome || ''}</td>
                <td>${func.cargo || ''}</td>
                <td>${formatarTelefone(func.telefone)}</td>
                <td><i class="fas fa-pencil-alt btn-editar" data-cpf="${func.cpf}" style="cursor: pointer;"></i></td>
                <td><i class="fas fa-trash-alt btn-excluir" data-cpf="${func.cpf}" style="cursor: pointer;"></i></td>
            `;
            tabelaFuncionarios.appendChild(tr);
        });
    };

    const salvarFuncionario = async (event) => {
        event.preventDefault();
        const dados = Object.fromEntries(new FormData(formFuncionario).entries());
        dados.cpf = (dados.cpf || '').replace(/\D/g, '');
        dados.telefone = (dados.telefone || '').replace(/\D/g, '');

        const url = modoEdicao ? `${API_URL}/${document.getElementById('cpf-original').value}` : API_URL;
        const method = modoEdicao ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || 'Erro ao salvar.');
            }
            mostrarModalSucesso(modoEdicao ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
            setTimeout(() => { fecharModalSucesso(); mostrarViewRegistro(); }, 2000);
        } catch (error) {
            alert(error.message);
        }
    };
    
    // Esta função busca OS DADOS COMPLETOS de um único funcionário
    const carregarDadosParaEdicao = async (cpf) => {
        try {
            const response = await fetch(`${API_URL}/${cpf}`);
            if (!response.ok) throw new Error('Funcionário não encontrado.');
            const funcionario = await response.json();
            mostrarViewCadastro(true, funcionario); // Passa os dados completos para o formulário
        } catch(error) {
            alert(error.message);
        }
    };

    const confirmarExclusao = async () => {
        try {
            const response = await fetch(`${API_URL}/${cpfParaAcao}`, { method: 'DELETE' });
            if (response.status !== 204) {
                 const erro = await response.json();
                 throw new Error(erro.error || 'Erro ao excluir.');
            }
            mostrarModalSucesso('Excluído com sucesso!');
            setTimeout(() => { fecharModalSucesso(); listarFuncionarios(); }, 2000);
        } catch (error) {
            alert(error.message);
        } finally {
            fecharModalConfirmacao();
        }
    };

    //  Funções Auxiliares 
    const abrirModalConfirmacao = (cpf) => { cpfParaAcao = cpf; modalConfirmacao.style.display = 'flex'; };
    const fecharModalConfirmacao = () => modalConfirmacao.style.display = 'none';
    const mostrarModalSucesso = (msg) => { document.getElementById('sucesso-msg').textContent = msg; modalSucesso.style.display = 'flex'; };
    const fecharModalSucesso = () => modalSucesso.style.display = 'none';
    const formatarCpf = (cpf) => {
        if (!cpf) return '';
        let digitos = cpf.replace(/\D/g, '').substring(0, 11);
        if (digitos.length > 9) return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        if (digitos.length > 6) return digitos.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        if (digitos.length > 3) return digitos.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        return digitos;
    };

    const formatarCep = (cep) => {
    if (!cep) return '';
    let digitos = cep.replace(/\D/g, '').substring(0, 8);
    if (digitos.length > 5) {
        return digitos.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return digitos;
};
    const formatarTelefone = (tel) => {
        const digitos = (tel || '').replace(/\D/g, '');
        if (digitos.length === 11) return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (digitos.length === 10) return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        return tel;
    };
    const aplicarMascaras = () => {
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');

    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => { e.target.value = formatarCpf(e.target.value); });
    }
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => { e.target.value = formatarTelefone(e.target.value); });
    }
    if (cepInput) {
        cepInput.addEventListener('input', (e) => { e.target.value = formatarCep(e.target.value); });
    }
};

    //  Vinculação de Eventos 
    btnNovoCadastro.addEventListener('click', () => mostrarViewCadastro(false));
    btnCancelarForm.addEventListener('click', mostrarViewRegistro);
    menuToggle.addEventListener('click', toggleMenu);
    fecharMenuBtn.addEventListener('click', toggleMenu);
    formFuncionario.addEventListener('submit', salvarFuncionario);
    btnModalConfirmar.addEventListener('click', confirmarExclusao);
    btnModalCancelar.addEventListener('click', fecharModalConfirmacao);
    inputPesquisa.addEventListener('keyup', () => renderizarTabela(
        funcionariosCache.filter(f => (f.nome || '').toLowerCase().includes(inputPesquisa.value.toLowerCase()))
    ));
    
    
    tabelaFuncionarios.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-editar')) {
            carregarDadosParaEdicao(target.dataset.cpf);
        }
        if (target.classList.contains('btn-excluir')) {
            abrirModalConfirmacao(target.dataset.cpf);
        }
    });

    //  Inicialização 
    mostrarViewRegistro();
    aplicarMascaras();
});