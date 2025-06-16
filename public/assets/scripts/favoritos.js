document.addEventListener('DOMContentLoaded', function() {
    // Verificar se usuário está logado
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Carregar favoritos
    loadFavorites();
    
    // Configurar filtros
    setupFilters();
});

function loadFavorites() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    fetch(`http://localhost:3000/usuarios/${user.id}`)
        .then(response => response.json())
        .then(userData => {
            const favoriteIds = userData.favoritos || [];
            
            if (favoriteIds.length === 0) {
                document.getElementById('no-favorites').classList.remove('d-none');
                document.getElementById('favorites-container').innerHTML = '';
                return;
            }
            
            // Buscar todos os destinos
            return fetch('http://localhost:3000/destinos')
                .then(response => response.json())
                .then(destinations => {
                    const favorites = destinations.filter(dest => favoriteIds.includes(dest.id));
                    displayFavorites(favorites);
                });
        })
        .catch(error => {
            console.error('Erro ao carregar favoritos:', error);
            showMessage('danger', 'Erro ao carregar favoritos');
        });
}

function displayFavorites(favorites) {
    const container = document.getElementById('favorites-container');
    container.innerHTML = '';
    
    if (favorites.length === 0) {
        document.getElementById('no-favorites').classList.remove('d-none');
        return;
    }
    
    document.getElementById('no-favorites').classList.add('d-none');
    
    favorites.forEach(destination => {
        const card = createFavoriteCard(destination);
        container.appendChild(card);
    });
}

function createFavoriteCard(destination) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.dataset.visited = destination.visitado ? 'true' : 'false';
    
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.dataset.id = destination.id;
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'position-relative';
    
    const img = document.createElement('img');
    img.src = `./assets/img/${destination.imagem}`;
    img.alt = destination.nome;
    img.className = 'destination-img';
    
    const favoriteBtn = document.createElement('div');
    favoriteBtn.className = 'favorite-btn active';
    favoriteBtn.innerHTML = '<i class="far fa-heart d-none"></i><i class="fas fa-heart"></i>';
    favoriteBtn.dataset.id = destination.id;
    favoriteBtn.title = 'Remover dos favoritos';
    
    const visitedBadge = document.createElement('div');
    visitedBadge.className = `visited-badge ${destination.visitado ? 'bg-success' : 'bg-warning'}`;
    visitedBadge.textContent = destination.visitado ? 'Visitado' : 'Planejado';
    
    imgContainer.appendChild(img);
    imgContainer.appendChild(favoriteBtn);
    imgContainer.appendChild(visitedBadge);
    
    const body = document.createElement('div');
    body.className = 'destination-body';
    
    const title = document.createElement('h3');
    title.className = 'destination-title';
    title.textContent = destination.nome;
    
    const location = document.createElement('div');
    location.className = 'destination-location';
    location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${destination.cidade}, ${destination.pais}`;
    
    const price = document.createElement('div');
    price.className = 'destination-price';
    price.textContent = `R$ ${destination.preco.toFixed(2).replace('.', ',')}`;
    
    const rating = document.createElement('div');
    rating.className = 'destination-rating';
    
    const stars = document.createElement('div');
    stars.className = 'stars';
    
    // Calcular avaliação média
    const avgRating = destination.avaliacoes && destination.avaliacoes.length > 0 ? 
        destination.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0) / destination.avaliacoes.length : 
        0;
    
    // Adicionar estrelas
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= avgRating ? 'fas fa-star' : 
                        i - 0.5 <= avgRating ? 'fas fa-star-half-alt' : 'far fa-star';
        stars.appendChild(star);
    }
    
    const ratingCount = document.createElement('span');
    ratingCount.textContent = ` (${destination.avaliacoes ? destination.avaliacoes.length : 0})`;
    
    rating.appendChild(stars);
    rating.appendChild(ratingCount);
    
    const detailsBtn = document.createElement('a');
    detailsBtn.href = `detalhes.html?id=${destination.id}`;
    detailsBtn.className = 'btn btn-outline-primary btn-sm mt-2';
    detailsBtn.textContent = 'Detalhes';
    
    const toggleVisitedBtn = document.createElement('button');
    toggleVisitedBtn.className = 'btn btn-sm mt-2 ml-2';
    toggleVisitedBtn.classList.add(destination.visitado ? 'btn-warning' : 'btn-success');
    toggleVisitedBtn.textContent = destination.visitado ? 'Marcar como Planejado' : 'Marcar como Visitado';
    toggleVisitedBtn.addEventListener('click', () => toggleVisitedStatus(destination.id));
    
    body.appendChild(title);
    body.appendChild(location);
    body.appendChild(price);
    body.appendChild(rating);
    body.appendChild(detailsBtn);
    body.appendChild(toggleVisitedBtn);
    
    card.appendChild(imgContainer);
    card.appendChild(body);
    col.appendChild(card);
    
    // Configurar evento de clique no botão de favorito
    favoriteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (confirm('Tem certeza que deseja remover este destino dos seus favoritos?')) {
            const destinationId = this.dataset.id;
            removeFavorite(destinationId, col);
        }
    });
    
    return col;
}

function removeFavorite(destinationId, cardElement) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    fetch(`http://localhost:3000/usuarios/${user.id}`)
        .then(response => response.json())
        .then(userData => {
            const updatedFavorites = (userData.favoritos || []).filter(id => id !== parseInt(destinationId));
            
            return fetch(`http://localhost:3000/usuarios/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    favoritos: updatedFavorites
                })
            });
        })
        .then(response => response.json())
        .then(updatedUser => {
            // Atualizar sessionStorage
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Remover card da tela
            cardElement.remove();
            
            // Verificar se ainda há favoritos
            const container = document.getElementById('favorites-container');
            if (container.children.length === 0) {
                document.getElementById('no-favorites').classList.remove('d-none');
            }
            
            showMessage('success', 'Destino removido dos favoritos!');
        })
        .catch(error => {
            console.error('Erro ao remover favorito:', error);
            showMessage('danger', 'Erro ao remover favorito');
        });
}

function toggleVisitedStatus(destinationId) {
    fetch(`http://localhost:3000/destinos/${destinationId}`)
        .then(response => response.json())
        .then(destination => {
            const updatedVisited = !destination.visitado;
            
            return fetch(`http://localhost:3000/destinos/${destinationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visitado: updatedVisited
                })
            });
        })
        .then(response => response.json())
        .then(updatedDestination => {
            // Recarregar favoritos para atualizar a exibição
            loadFavorites();
            showMessage('success', `Destino marcado como ${updatedDestination.visitado ? 'Visitado' : 'Planejado'}!`);
        })
        .catch(error => {
            console.error('Erro ao atualizar status:', error);
            showMessage('danger', 'Erro ao atualizar status');
        });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.favorites-filter .btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Ativar/desativar botão
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Aplicar filtro
            const filter = this.dataset.filter;
            const cards = document.querySelectorAll('#favorites-container .col-md-4');
            
            cards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    const isVisited = card.dataset.visited === 'true';
                    if ((filter === 'visited' && isVisited) || (filter === 'planned' && !isVisited)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}