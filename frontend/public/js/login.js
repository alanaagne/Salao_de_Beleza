// Configuração da API
const API_BASE_URL = 'http://127.0.0.1:3000/api';
console.log('API_BASE_URL configurada:', API_BASE_URL);

// Estado da aplicação
let currentUser = null;
let authToken = null;

// Elementos DOM
const screens = {
    inicial: document.getElementById('tela-inicial'),
    login: document.getElementById('tela-login'),
    cadastro: document.getElementById('tela-cadastro'),
};

const forms = {
    login: document.getElementById('login-form'),
    signup: document.getElementById('signup-form')
};

const loading = document.getElementById('loading');
const messageModal = document.getElementById('message-modal');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Verificar se há token salvo
    const savedToken = sessionStorage.getItem('authToken');
    
    if (savedToken) {
        // Se já existe um token, redireciona direto para a home
        // (Use o mesmo caminho que você usou no handleLogin)
        window.location.href = '/frontend/public/home.html'; 
    } else {
        // Se não tem token, mostra a tela inicial (login/cadastro)
        showScreen('inicial');
    }
}

function setupEventListeners() {
    // Formulário de login
    if (forms.login) {
        forms.login.addEventListener('submit', handleLogin);
    }
    
    // Formulário de cadastro
    if (forms.signup) {
        forms.signup.addEventListener('submit', handleSignup);
    }
    
    // Tecla Enter para fechar mensagens
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMessage();
        }
    });
}

// Navegação entre telas
function showScreen(screenName) {
    // Esconder todas as telas
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    // Mostrar tela específica
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
}

function showLoginScreen() {
    showScreen('login');
    resetLoginForm();
}

function showLogin() {
    showScreen('login');
    resetLoginForm();
    
    // Atualizar tabs
    updateTabs('login');
}

function showSignup() {
    showScreen('cadastro');
    resetSignupForm();
    
    // Atualizar tabs
    updateTabs('signup');
}

function updateTabs(activeTab) {
    // Reset todos os tabs
    const allTabs = document.querySelectorAll('.tab-btn');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    if (activeTab === 'login') {
        const loginTabs = document.querySelectorAll('#login-tab, #signup-login-tab');
        loginTabs.forEach(tab => {
            if (tab) tab.classList.add('active');
        });
    } else if (activeTab === 'signup') {
        const signupTabs = document.querySelectorAll('#signup-tab, #signup-signup-tab');
        signupTabs.forEach(tab => {
            if (tab) tab.classList.add('active');
        });
    }
}

// Funções de autenticação
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;
    
    if (!email || !senha) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, insira um email válido.', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salvar dados do usuário
            currentUser = data.data.user;
            authToken = data.data.token;
            
            sessionStorage.setItem('authToken', authToken);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirecionar para dashboard após um breve delay
            setTimeout(() => {
                window.location.href = '/frontend/public/home.html';
            }, 1500);
            
        } else {
            showMessage(data.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        let errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet ou se o servidor está ativo.';
        } else if (error.message && error.message.includes('JSON.parse')) {
            errorMessage = 'Resposta inválida do servidor. Verifique o console para mais detalhes.';
        }
        showMessage(errorMessage, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const nome = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const senha = document.getElementById('signup-password').value;
    const confirmarSenha = document.getElementById('signup-confirm-password').value;
    
    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (nome.length < 2) {
        showMessage('Nome deve ter pelo menos 2 caracteres.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, insira um email válido.', 'error');
        return;
    }
    
    if (senha.length < 6) {
        showMessage('Senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }
    
    if (senha !== confirmarSenha) {
        showMessage('As senhas não coincidem.', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salvar dados do usuário
            currentUser = data.data.user;
            authToken = data.data.token;
            
            sessionStorage.setItem('authToken', authToken);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('Cadastro realizado com sucesso!', 'success');
            
            // Redirecionar para dashboard após um breve delay
            setTimeout(() => {
                window.location.href = '/frontend/public/home.html';
            }, 1500);
            
        } else {
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(error => error.msg).join('\n');
                showMessage(errorMessages, 'error');
            } else {
                showMessage(data.message || 'Erro ao criar conta.', 'error');
            }
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        let errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet ou se o servidor está ativo.';
        } else if (error.message && error.message.includes('JSON.parse')) {
            errorMessage = 'Resposta inválida do servidor. Verifique o console para mais detalhes.';
        }
        showMessage(errorMessage, 'error');
    } finally {
        showLoading(false);
    }
}

async function verifyToken() {
    if (!authToken) {
        showScreen('inicial');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
           window.location.href = '/frontend/public/home.html';
        } else {
            // Token inválido, limpar dados
            logout();
        }
        
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        logout();
    }
}

async function showDashboard() {
    try {
        showLoading(true);
        
        // Buscar dados do dashboard
        const response = await fetch(`${API_BASE_URL}/auth/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualizar informações do usuário
            document.getElementById('user-name').textContent = data.data.user.nome;
            document.getElementById('user-email').textContent = data.data.user.email;
            
            // Carregar serviços
            loadServices(data.data.dashboard.servicos_disponiveis);
            
            showScreen('dashboard');
        } else {
            showMessage('Erro ao carregar dashboard.', 'error');
            logout();
        }
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showMessage('Erro de conexão.', 'error');
        logout();
    } finally {
        showLoading(false);
    }
}

function loadServices(services) {
    const servicesList = document.getElementById('services-list');
    
    if (!servicesList || !services) return;
    
    servicesList.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <h4>${service}</h4>
            <p>Serviço profissional de ${service.toLowerCase()} com produtos de alta qualidade.</p>
        `;
        servicesList.appendChild(serviceCard);
    });
}

function logout() {
    // Limpar dados salvos
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Reset variáveis
    currentUser = null;
    authToken = null;
    
    // Voltar para tela inicial
    showScreen('inicial');
    
    // Reset formulários
    resetLoginForm();
    resetSignupForm();
    
    showMessage('Logout realizado com sucesso!', 'success');
}

// Funções utilitárias
function resetLoginForm() {
    if (forms.login) {
        forms.login.reset();
    }
}

function resetSignupForm() {
    if (forms.signup) {
        forms.signup.reset();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showLoading(show) {
    if (loading) {
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }
}

function showMessage(message, type = 'info') {
    const messageText = document.getElementById('message-text');
    
    if (messageText && messageModal) {
        messageText.textContent = message;
        messageModal.classList.add('show');
        
        // Auto-close após 5 segundos para mensagens de sucesso
        if (type === 'success') {
            setTimeout(() => {
                closeMessage();
            }, 3000);
        }
    }
}

function closeMessage() {
    if (messageModal) {
        messageModal.classList.remove('show');
    }
}

function showForgotPassword() {
    showMessage('Funcionalidade de recuperação de senha será implementada em breve.', 'info');
}

// Funções globais para os botões HTML
window.showLoginScreen = showLoginScreen;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.logout = logout;
window.closeMessage = closeMessage;
window.showForgotPassword = showForgotPassword;

