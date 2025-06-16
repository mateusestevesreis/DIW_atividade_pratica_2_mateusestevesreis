document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrossel
    $('#carouselExample').carousel({
        interval: 10000 // Troca a cada 10 segundos
    });

    // Carregar destaque do JSON Server
    loadHighlights();
});

function loadHighlights() {
    fetch('http://localhost:3000/destinos?destaque=true')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                updateCarousel(data);
            }
        })
        .catch(error => console.error('Erro ao carregar destaques:', error));
}

function updateCarousel(destinations) {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    
    // Limpar carrossel existente
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    // Adicionar novos itens
    destinations.forEach((destination, index) => {
        // Criar indicador
        const indicator = document.createElement('li');
        indicator.setAttribute('data-target', '#carouselExample');
        indicator.setAttribute('data-slide-to', index.toString());
        if (index === 0) indicator.classList.add('active');
        carouselIndicators.appendChild(indicator);
        
        // Criar item do carrossel
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active');
        
        const img = document.createElement('img');
        img.src = `./assets/img/${destination.imagem}`;
        img.alt = destination.nome;
        img.classList.add('d-block', 'w-100');
        img.style.height = '400px';
        img.style.objectFit = 'cover';
        
        const caption = document.createElement('div');
        caption.classList.add('carousel-caption', 'd-none', 'd-md-block');
        
        const title = document.createElement('h5');
        title.textContent = destination.nome;
        
        const description = document.createElement('p');
        description.textContent = destination.descricaoCurta;
        
        caption.appendChild(title);
        caption.appendChild(description);
        
        carouselItem.appendChild(img);
        carouselItem.appendChild(caption);
        
        carouselInner.appendChild(carouselItem);
        
        // Adicionar evento de clique
        carouselItem.addEventListener('click', function() {
            window.location.href = `detalhes.html?id=${destination.id}`;
        });
    });
}