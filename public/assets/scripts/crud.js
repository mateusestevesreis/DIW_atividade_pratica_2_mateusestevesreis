document.addEventListener('DOMContentLoaded', function() {
    // Configurar formulário CRUD
    const crudForm = document.getElementById('crud-form');
    if (crudForm) {
        crudForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('destination-id').value;
            const name = document.getElementById('destination-name').value;
            const city = document.getElementById('destination-city').value;
            const state = document.getElementById('destination-state').value;
            const country = document.getElementById('destination-country').value;
            const price = document.getElementById('destination-price').value;
            const description = document.getElementById('destination-description').value;
            const highlight = document.getElementById('destination-highlight').value === 'true';
            
            // Validações
            if (!name || !city || !country || !price || !description) {
                showMessage('warning', 'Por favor, preencha todos os campos obrigatórios');
                return;
            }
            
            const destinationData = {
                nome: name,
                cidade: city,
                estado: state,
                pais: country,
                preco: parseFloat(price),
                descricao: description,
                destaque: highlight,
                visitado: false,
                avaliacoes: []
            };
            
            // Processar imagem (se existir)
            const imageInput = document.getElementById('destination-image');
            if (imageInput.files.length > 0) {
                const file = imageInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    destinationData.imagem = file.name;
                    saveDestination(id, destinationData);
                };
                
                reader.readAsDataURL(file);
            } else {
                if (!id) {
                    showMessage('warning', 'Por favor, selecione uma imagem para o destino');
                    return;
                }
                
                // Manter imagem existente se estiver editando e não selecionou nova imagem
                fetch(`http://localhost:3000/destinos/${id}`)
                    .then(response => response.json())
                    .then(existingDestination => {
                        destinationData.imagem = existingDestination.imagem;
                        saveDestination(id, destinationData);
                    });
            }
        });
    }
    
    // Configurar botão de excluir
    const deleteBtn = document.getElementById('delete-destination');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const id = document.getElementById('destination-id').value;
            if (id) {
                confirmDelete(id);
            }
        });
    }
});

function saveDestination(id, destinationData) {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/destinos/${id}` : 'http://localhost:3000/destinos';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(destinationData)
    })
    .then(response => response.json())
    .then(destination => {
        showMessage('success', `Destino ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
        
        // Limpar formulário e recarregar tabela
        resetForm();
        document.getElementById('destination-form').style.display = 'none';
        loadDestinationsTable();
    })
    .catch(error => {
        console.error(`Erro ao ${id ? 'atualizar' : 'cadastrar'} destino:`, error);
        showMessage('danger', `Erro ao ${id ? 'atualizar' : 'cadastrar'} destino`);
    });
}