document.addEventListener('DOMContentLoaded', function() {
    // Configurar formulário de cadastro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter valores dos campos
            const firstName = document.getElementById('register-firstname').value;
            const lastName = document.getElementById('register-lastname').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const terms = document.getElementById('register-terms').checked;
            
            // Validações
            if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
                showMessage('warning', 'Por favor, preencha todos os campos obrigatórios');
                return;
            }
            
            if (password.length < 8) {
                showMessage('warning', 'A senha deve ter pelo menos 8 caracteres');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('warning', 'As senhas não coincidem');
                return;
            }
            
            if (!terms) {
                showMessage('warning', 'Você deve aceitar os termos de uso e política de privacidade');
                return;
            }
            
            // Verificar se usuário já existe
            fetch('http://localhost:3000/usuarios')
                .then(response => response.json())
                .then(users => {
                    const userExists = users.some(u => u.email === email || u.login === username);
                    
                    if (userExists) {
                        showMessage('warning', 'E-mail ou nome de usuário já cadastrado');
                        return;
                    }
                    
                    // Criar novo usuário
                    const newUser = {
                        id: generateId(),
                        login: username,
                        senha: password,
                        nome: `${firstName} ${lastName}`,
                        email: email,
                        admin: false,
                        favoritos: [],
                        dataCadastro: new Date().toISOString()
                    };
                    
                    // Processar imagem de perfil (se existir)
                    const profilePicInput = document.getElementById('register-profile-pic');
                    if (profilePicInput.files.length > 0) {
                        const file = profilePicInput.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            newUser.fotoPerfil = e.target.result;
                            completeRegistration(newUser);
                        };
                        
                        reader.readAsDataURL(file);
                    } else {
                        completeRegistration(newUser);
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar usuário:', error);
                    showMessage('danger', 'Erro ao verificar usuário');
                });
        });
    }
});

function completeRegistration(newUser) {
    fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    })
    .then(response => response.json())
    .then(user => {
        showMessage('success', 'Cadastro realizado com sucesso!');
        
        // Limpar formulário
        document.getElementById('register-form').reset();
        
        // Redirecionar para login após breve delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    })
    .catch(error => {
        console.error('Erro ao cadastrar usuário:', error);
        showMessage('danger', 'Erro ao cadastrar usuário');
    });
}

function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}