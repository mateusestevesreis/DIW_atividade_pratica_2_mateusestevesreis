document.addEventListener('DOMContentLoaded', function() {
    // Verificar se usuário é admin
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user.admin) {
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar destinos para a tabela
    loadDestinationsTable();
    
    // Configurar botão de adicionar destino
    const addDestinationBtn = document.getElementById('add-destination');
    if (addDestinationBtn) {
        addDestinationBtn.addEventListener('click', function() {
            resetForm();
            document.getElementById('destination-form').style.display = 'block';
        });
    }
    
    // Configurar pesquisa admin
    const searchAdmin = document.getElementById('search-admin');
    if (searchAdmin) {
        searchAdmin.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#destinations-table tr');
            
            rows.forEach(row => {
                const name = row.cells[0].textContent.toLowerCase();
                const location = row.cells[1].textContent.toLowerCase();
                
                if (name.includes(searchTerm) || location.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Configurar botão de cancelar
    const cancelEdit = document.getElementById('cancel-edit');
    if (cancelEdit) {
        cancelEdit.addEventListener('click', function() {
            resetForm();
            document.getElementById('destination-form').style.display = 'none';
        });
    }
});

function loadDestinationsTable() {
    fetch('http://localhost:3000/destinos')
        .then(response => response.json())
        .then(destinations => {
            const tableBody = document.getElementById('destinations-table');
            tableBody.innerHTML = '';
            
            destinations.forEach(destination => {
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = destination.nome;
                
                const locationCell = document.createElement('td');
                locationCell.textContent = `${destination.cidade}, ${destination.pais}`;
                
                const priceCell = document.createElement('td');
                priceCell.textContent = `R$ ${destination.preco.toFixed(2).replace('.', ',')}`;
                
                const actionsCell = document.createElement('td');
                
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-sm btn-primary mr-2';
                editBtn.textContent = 'Editar';
                editBtn.addEventListener('click', () => editDestination(destination));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-danger';
                deleteBtn.textContent = 'Excluir';
                deleteBtn.addEventListener('click', () => confirmDelete(destination.id));
                
                actionsCell.appendChild(editBtn);
                actionsCell.appendChild(deleteBtn);
                
                row.appendChild(nameCell);
                row.appendChild(locationCell);
                row.appendChild(priceCell);
                row.appendChild(actionsCell);
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar destinos:', error);
            showMessage('danger', 'Erro ao carregar destinos');
        });
}

function editDestination(destination) {
    document.getElementById('destination-id').value = destination.id;
    document.getElementById('destination-name').value = destination.nome;
    document.getElementById('destination-city').value = destination.cidade;
    document.getElementById('destination-state').value = destination.estado || '';
    document.getElementById('destination-country').value = destination.pais;
    document.getElementById('destination-price').value = destination.preco;
    document.getElementById('destination-description').value = destination.descricao;
    document.getElementById('destination-highlight').value = destination.destaque ? 'true' : 'false';
    
    document.getElementById('destination-form').style.display = 'block';
    document.getElementById('delete-destination').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function confirmDelete(destinationId) {
    if (confirm('Tem certeza que deseja excluir este destino? Esta ação não pode ser desfeita.')) {
        deleteDestination(destinationId);
    }
}

function deleteDestination(destinationId) {
    fetch(`http://localhost:3000/destinos/${destinationId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            showMessage('success', 'Destino excluído com sucesso!');
            loadDestinationsTable();
            resetForm();
            document.getElementById('destination-form').style.display = 'none';
        } else {
            throw new Error('Erro ao excluir destino');
        }
    })
    .catch(error => {
        console.error('Erro ao excluir destino:', error);
        showMessage('danger', 'Erro ao excluir destino');
    });
}

function resetForm() {
    document.getElementById('crud-form').reset();
    document.getElementById('destination-id').value = '';
    document.getElementById('delete-destination').style.display = 'none';
}