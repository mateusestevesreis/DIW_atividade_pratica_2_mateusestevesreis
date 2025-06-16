document.addEventListener('DOMContentLoaded', function() {
    // Carregar destinos
    loadDestinations();
    
    // Configurar pesquisa
    setupSearch();
    
    // Configurar favoritos
    setupFavorites();
});

let allDestinations = [];
let currentPage = 1;
const destinationsPerPage = 9;

function loadDestinations() {
    fetch('http://localhost:3000/destinos')
        .then(response => response.json())
        .then(data => {
            allDestinations = data;
            displayDestinations(allDestinations);
            setupPagination(allDestinations.length);
        })
        .catch(error => console.error('Erro ao carregar destinos:', error));
}

function displayDestinations(destinations) {
    const container = document.getElementById('destinations-container');
    container.innerHTML = '';
    
    const start = (currentPage - 1) * destinationsPerPage;
    const end = start + destinationsPerPage;
    const paginatedDestinations = destinations.slice(start, end);
    
    if (paginatedDestinations.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>Nenhum destino encontrado.</p></div>';
        return;
    }
    
    paginatedDestinations.forEach(destination => {
        const card = createDestinationCard(destination);
        container.appendChild(card);
    });
    
    // Atualizar favoritos após carregar os cards
    updateFavoritesStatus();
}

function createDestinationCard(destination) {
    const user = JSON.parse(sessionStorage.getItem('user')) || null;
    
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
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
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = '<i class="far fa-heart"></i><i class="fas fa-heart d-none"></i>';
    favoriteBtn.dataset.id = destination.id;
    
    imgContainer.appendChild(img);
    imgContainer.appendChild(favoriteBtn);
    
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
    
    body.appendChild(title);
    body.appendChild(location);
    body.appendChild(price);
    body.appendChild(rating);
    body.appendChild(detailsBtn);
    
    card.appendChild(imgContainer);
    card.appendChild(body);
    col.appendChild(card);
    
    return col;
}

function setupPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const pageCount = Math.ceil(totalItems / destinationsPerPage);
    
    if (pageCount <= 1) return;
    
    // Botão Anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.textContent = 'Anterior';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayDestinations(allDestinations);
            window.scrollTo({ top: 600, behavior: 'smooth' });
        }
    });
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);
    
    // Números das páginas
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = i;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displayDestinations(allDestinations);
            window.scrollTo({ top: 600, behavior: 'smooth' });
        });
        li.appendChild(link);
        pagination.appendChild(li);
    }
    
    // Botão Próximo
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.textContent = 'Próximo';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < pageCount) {
            currentPage++;
            displayDestinations(allDestinations);
            window.scrollTo({ top: 600, behavior: 'smooth' });
        }
    });
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm === '') {
            displayDestinations(allDestinations);
            setupPagination(allDestinations.length);
            return;
        }
        
        const filtered = allDestinations.filter(dest => 
            dest.nome.toLowerCase().includes(searchTerm) || 
            dest.descricao.toLowerCase().includes(searchTerm) ||
            dest.cidade.toLowerCase().includes(searchTerm) ||
            dest.pais.toLowerCase().includes(searchTerm)
        );
        
        currentPage = 1;
        displayDestinations(filtered);
        setupPagination(filtered.length);
    };
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function setupFavorites() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.favorite-btn')) {
            e.preventDefault();
            const user = JSON.parse(sessionStorage.getItem('user'));
            
            if (!user) {
                showMessage('warning', 'Por favor, faça login para adicionar aos favoritos');
                return;
            }
            
            const btn = e.target.closest('.favorite-btn');
            const destinationId = btn.dataset.id;
            toggleFavorite(destinationId, btn);
        }
    });
}

function toggleFavorite(destinationId, btn) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    fetch(`http://localhost:3000/usuarios/${user.id}`)
        .then(response => response.json())
        .then(userData => {
            const isFavorite = userData.favoritos && userData.favoritos.includes(parseInt(destinationId));
            
            let updatedFavorites = userData.favoritos || [];
            if (isFavorite) {
                updatedFavorites = updatedFavorites.filter(id => id !== parseInt(destinationId));
            } else {
                updatedFavorites.push(parseInt(destinationId));
            }
            
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
            
            // Atualizar ícone do botão
            const isFavorite = updatedUser.favoritos && updatedUser.favoritos.includes(parseInt(destinationId));
            const iconFar = btn.querySelector('.fa-heart:not(.d-none)');
            const iconFas = btn.querySelector('.fa-heart.d-none');
            
            if (isFavorite) {
                iconFar.classList.add('d-none');
                iconFas.classList.remove('d-none');
            } else {
                iconFar.classList.remove('d-none');
                iconFas.classList.add('d-none');
            }
            
            showMessage('success', isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
        })
        .catch(error => {
            console.error('Erro ao atualizar favoritos:', error);
            showMessage('danger', 'Erro ao atualizar favoritos');
        });
}

function updateFavoritesStatus() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) return;
    
    fetch(`http://localhost:3000/usuarios/${user.id}`)
        .then(response => response.json())
        .then(userData => {
            const favorites = userData.favoritos || [];
            
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                const destinationId = btn.dataset.id;
                const isFavorite = favorites.includes(parseInt(destinationId));
                
                const iconFar = btn.querySelector('.fa-heart:not(.d-none)');
                const iconFas = btn.querySelector('.fa-heart.d-none');
                
                if (isFavorite) {
                    iconFar.classList.add('d-none');
                    iconFas.classList.remove('d-none');
                } else {
                    iconFar.classList.remove('d-none');
                    iconFas.classList.add('d-none');
                }
            });
        })
        .catch(error => console.error('Erro ao verificar favoritos:', error));
}

// Inicializar gráfico de avaliações
function initRatingsChart(destinations) {
    const ctx = document.getElementById('ratingsChart').getContext('2d');
    
    // Agrupar avaliações por destino
    const ratingsData = destinations.map(dest => {
        if (!dest.avaliacoes || dest.avaliacoes.length === 0) return 0;
        const sum = dest.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0);
        return sum / dest.avaliacoes.length;
    });
    
    const labels = destinations.map(dest => dest.nome);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avaliação Média',
                data: ratingsData,
                backgroundColor: 'rgba(38, 82, 137, 0.7)',
                borderColor: 'rgba(38, 82, 137, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}