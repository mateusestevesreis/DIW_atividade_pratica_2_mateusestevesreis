document.addEventListener('DOMContentLoaded', function() {
    // Obter ID do destino da URL
    const urlParams = new URLSearchParams(window.location.search);
    const destinationId = urlParams.get('id');
    
    if (destinationId) {
        loadDestinationDetails(destinationId);
    } else {
        window.location.href = 'index.html';
    }
    
    // Configurar favoritos
    setupFavoriteButton();
    
    // Configurar avaliações
    setupReviewForm();
});

function loadDestinationDetails(destinationId) {
    fetch(`http://localhost:3000/destinos/${destinationId}`)
        .then(response => response.json())
        .then(destination => {
            displayDestinationDetails(destination);
            displayReviews(destination.avaliacoes || []);
            
            // Carregar outros destinos para o gráfico
            return fetch('http://localhost:3000/destinos');
        })
        .then(response => response.json())
        .then(destinations => {
            initRatingsChart(destinations);
        })
        .catch(error => {
            console.error('Erro ao carregar detalhes:', error);
            window.location.href = 'index.html';
        });
}

function displayDestinationDetails(destination) {
    document.getElementById('destination-title').textContent = destination.nome;
    document.getElementById('destination-location').innerHTML = 
        `<i class="fas fa-map-marker-alt"></i> ${destination.cidade}, ${destination.pais}`;
    document.getElementById('destination-price').innerHTML = 
        `<i class="fas fa-tag"></i> R$ ${destination.preco.toFixed(2).replace('.', ',')}`;
    
    // Calcular avaliação média
    const avgRating = destination.avaliacoes && destination.avaliacoes.length > 0 ? 
        destination.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0) / destination.avaliacoes.length : 
        0;
    
    // Atualizar estrelas de avaliação
    const starsContainer = document.querySelector('.destination-rating .stars');
    starsContainer.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= avgRating ? 'fas fa-star' : 
                         i - 0.5 <= avgRating ? 'fas fa-star-half-alt' : 'far fa-star';
        starsContainer.appendChild(star);
    }
    
    // Adicionar contagem de avaliações
    const ratingCount = document.querySelector('.destination-rating span');
    ratingCount.textContent = ` (${destination.avaliacoes ? destination.avaliacoes.length : 0} avaliações)`;
    
    // Imagem principal
    document.getElementById('destination-main-image').src = `./assets/img/${destination.imagem}`;
    
    // Descrição
    document.getElementById('destination-full-description').textContent = destination.descricao;
    
    // Configurar botão de favorito
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.dataset.id = destination.id;
        
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            fetch(`http://localhost:3000/usuarios/${user.id}`)
                .then(response => response.json())
                .then(userData => {
                    const isFavorite = userData.favoritos && userData.favoritos.includes(parseInt(destination.id));
                    
                    if (isFavorite) {
                        favoriteBtn.classList.add('active');
                    }
                });
        }
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        const reviewHeader = document.createElement('div');
        reviewHeader.className = 'review-header';
        
        const reviewAuthor = document.createElement('div');
        reviewAuthor.className = 'review-author';
        reviewAuthor.textContent = review.nome;
        
        const reviewDate = document.createElement('div');
        reviewDate.className = 'review-date';
        reviewDate.textContent = new Date(review.data).toLocaleDateString('pt-BR');
        
        reviewHeader.appendChild(reviewAuthor);
        reviewHeader.appendChild(reviewDate);
        
        const reviewStars = document.createElement('div');
        reviewStars.className = 'review-stars';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.className = i <= review.rating ? 'fas fa-star' : 'far fa-star';
            reviewStars.appendChild(star);
        }
        
        const reviewComment = document.createElement('div');
        reviewComment.className = 'review-comment';
        reviewComment.textContent = review.comentario;
        
        reviewItem.appendChild(reviewHeader);
        reviewItem.appendChild(reviewStars);
        reviewItem.appendChild(reviewComment);
        
        reviewsList.appendChild(reviewItem);
    });
}

function setupFavoriteButton() {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;
    
    favoriteBtn.addEventListener('click', function() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        
        if (!user) {
            showMessage('warning', 'Por favor, faça login para adicionar aos favoritos');
            return;
        }
        
        const destinationId = this.dataset.id;
        toggleFavorite(destinationId, this);
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
            
            // Atualizar botão
            const isFavorite = updatedUser.favoritos && updatedUser.favoritos.includes(parseInt(destinationId));
            btn.classList.toggle('active', isFavorite);
            
            showMessage('success', isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
        })
        .catch(error => {
            console.error('Erro ao atualizar favoritos:', error);
            showMessage('danger', 'Erro ao atualizar favoritos');
        });
}

function setupReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    // Configurar estrelas de avaliação
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            document.getElementById('review-rating').value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });
    
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            showMessage('warning', 'Por favor, faça login para enviar uma avaliação');
            return;
        }
        
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;
        
        if (!rating) {
            showMessage('warning', 'Por favor, selecione uma avaliação');
            return;
        }
        
        if (!comment.trim()) {
            showMessage('warning', 'Por favor, escreva um comentário');
            return;
        }
        
        // Obter ID do destino da URL
        const urlParams = new URLSearchParams(window.location.search);
        const destinationId = urlParams.get('id');
        
        // Criar nova avaliação
        const newReview = {
            nome: user.nome.split(' ')[0],
            rating: parseInt(rating),
            comentario: comment,
            data: new Date().toISOString()
        };
        
        // Adicionar avaliação ao destino
        fetch(`http://localhost:3000/destinos/${destinationId}`)
            .then(response => response.json())
            .then(destination => {
                const updatedReviews = destination.avaliacoes ? [...destination.avaliacoes, newReview] : [newReview];
                
                return fetch(`http://localhost:3000/destinos/${destinationId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        avaliacoes: updatedReviews
                    })
                });
            })
            .then(response => response.json())
            .then(updatedDestination => {
                showMessage('success', 'Avaliação enviada com sucesso!');
                document.getElementById('review-comment').value = '';
                stars.forEach(star => {
                    star.classList.remove('fas');
                    star.classList.add('far');
                });
                document.getElementById('review-rating').value = '';
                
                // Atualizar exibição das avaliações
                displayReviews(updatedDestination.avaliacoes);
                
                // Atualizar avaliação média
                const avgRating = updatedDestination.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0) / updatedDestination.avaliacoes.length;
                const starsContainer = document.querySelector('.destination-rating .stars');
                starsContainer.innerHTML = '';
                
                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement('i');
                    star.className = i <= avgRating ? 'fas fa-star' : 
                                     i - 0.5 <= avgRating ? 'fas fa-star-half-alt' : 'far fa-star';
                    starsContainer.appendChild(star);
                }
                
                // Atualizar contagem de avaliações
                const ratingCount = document.querySelector('.destination-rating span');
                ratingCount.textContent = ` (${updatedDestination.avaliacoes.length} avaliações)`;
            })
            .catch(error => {
                console.error('Erro ao enviar avaliação:', error);
                showMessage('danger', 'Erro ao enviar avaliação');
            });
    });
}

function initRatingsChart(destinations) {
    const ctx = document.getElementById('ratingsChart').getContext('2d');
    
    // Filtrar destinos com avaliações
    const ratedDestinations = destinations.filter(dest => dest.avaliacoes && dest.avaliacoes.length > 0);
    
    if (ratedDestinations.length === 0) {
        document.querySelector('.ratings-section').style.display = 'none';
        return;
    }
    
    // Ordenar por avaliação média (maior primeiro)
    ratedDestinations.sort((a, b) => {
        const avgA = a.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0) / a.avaliacoes.length;
        const avgB = b.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0) / b.avaliacoes.length;
        return avgB - avgA;
    });
    
    // Pegar os 5 melhores
    const topDestinations = ratedDestinations.slice(0, 5);
    
    const labels = topDestinations.map(dest => dest.nome);
    const ratingsData = topDestinations.map(dest => {
        const sum = dest.avaliacoes.reduce((acc, curr) => acc + curr.rating, 0);
        return sum / dest.avaliacoes.length;
    });
    
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