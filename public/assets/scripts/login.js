document.addEventListener('DOMContentLoaded', function() {
    // Verificar se usuário já está logado
    const user = sessionStorage.getItem('user');
    if (user) {
        window.location.href = 'index.html';
    }
    
    // Configurar formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                showMessage('warning', 'Por favor, preencha todos os campos');
                return;
            }
            
            // Buscar usuário no JSON Server
            fetch('http://localhost:3000/usuarios')
                .then(response => response.json())
                .then(users => {
                    const user = users.find(u => 
                        (u.email === email || u.login === email) && u.senha === password
                    );
                    
                    if (user) {
                        // Salvar usuário na sessionStorage
                        sessionStorage.setItem('user', JSON.stringify(user));
                        showMessage('success', 'Login realizado com sucesso!');
                        
                        // Redirecionar após breve delay
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    } else {
                        showMessage('danger', 'E-mail ou senha incorretos');
                    }
                })
                .catch(error => {
                    console.error('Erro ao fazer login:', error);
                    showMessage('danger', 'Erro ao fazer login');
                });
        });
    }
    
    // Configurar link "Esqueceu a senha"
    const forgotPassword = document.getElementById('forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('info', 'Entre em contato com o suporte para redefinir sua senha');
        });
    }
    
    // Configurar login social (apenas visual)
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('info', 'Login com redes sociais não implementado nesta versão');
        });
    });
});