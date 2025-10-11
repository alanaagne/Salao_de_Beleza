// Carregar ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada');
    
    // Event listener para o menu hambúrguer
    const menuIcon = document.getElementById('menuIcon');
    if (menuIcon) {
        menuIcon.addEventListener('click', toggleMenu);
        console.log('Menu hambúrguer configurado e clicável');
    } else {
        console.error('Menu não encontrado!');
    }

    // Botão de fechar menu lateral
    const fecharMenu = document.getElementById('fecharMenu');
    if (fecharMenu) {
        fecharMenu.addEventListener('click', toggleMenu);
        console.log('Botão de fechar menu configurado');
    }

    // Overlay para fechar menu
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
        console.log('Overlay configurado');
    }
});

// Função para abrir/fechar menu lateral
function toggleMenu() {
    const menuLateral = document.getElementById('menuLateral');
    const overlay = document.getElementById('overlay');
    
    if (menuLateral && overlay) {
        menuLateral.classList.toggle('aberto');
        overlay.classList.toggle('active');
        console.log('Menu lateral', menuLateral.classList.contains('aberto') ? 'aberto' : 'fechado');
    }
}