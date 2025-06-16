// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    // Verificar tema preferido do usuário
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode || localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Verificar se usuário está logado
    checkLoginStatus();

    // Configurar botão de dark mode
    setupDarkModeToggle();

    // Configurar botão de acessibilidade
    setupAccessibilityToggle();
});

// Verificar status do login
function checkLoginStatus() {
    const user = sessionStorage.getItem('user');
    const loginNav = document.getElementById('login-nav');
    const perfilNav = document.getElementById('perfil-nav');
    const favoritosNav = document.getElementById('favoritos-nav');
    const cadastroNav = document.getElementById('cadastro-nav');

    if (user) {
        const userObj = JSON.parse(user);
        
        // Mostrar elementos para usuário logado
        if (loginNav) loginNav.classList.add('d-none');
        if (perfilNav) perfilNav.classList.remove('d-none');
        if (favoritosNav) favoritosNav.classList.remove('d-none');
        
        // Mostrar cadastro apenas para admin
        if (userObj.admin && cadastroNav) {
            cadastroNav.classList.remove('d-none');
        } else if (cadastroNav) {
            cadastroNav.classList.add('d-none');
        }
        
        // Atualizar nome do usuário
        const usernameNav = document.getElementById('username-nav');
        if (usernameNav) usernameNav.textContent = userObj.nome.split(' ')[0];
    } else {
        // Mostrar elementos para usuário não logado
        if (loginNav) loginNav.classList.remove('d-none');
        if (perfilNav) perfilNav.classList.add('d-none');
        if (favoritosNav) favoritosNav.classList.add('d-none');
        if (cadastroNav) cadastroNav.classList.add('d-none');
    }
}

// Configurar botão de dark mode
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                this.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                this.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }
}

// Configurar botão de acessibilidade
function setupAccessibilityToggle() {
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (accessibilityBtn) {
        accessibilityBtn.addEventListener('click', function() {
            document.body.classList.toggle('accessibility-mode');
        });
    }
}

// Logout
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'logout-btn') {
        e.preventDefault();
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});

// Função para mostrar mensagens para o usuário
function showMessage(type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type} fixed-top text-center`;
    messageDiv.style.marginTop = '70px';
    messageDiv.style.zIndex = '1000';
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}