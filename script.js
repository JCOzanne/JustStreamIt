document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const categorySelect = document.getElementById('category-select');
    const freeCategoryMovies = document.getElementById('free-category-movies');
    const bestMovieCard = document.getElementById('best-movie-card');
    const topRatedMoviesList = document.getElementById('top-rated-movies-list');
    const historyMovies = document.getElementById('history-movies');
    const documentaryMovies = document.getElementById('documentary-movies');

    const apiBaseUrl = 'http://localhost:8000/api/v1/titles/';
    const genresUrl = 'http://localhost:8000/api/v1/genres/';

    let topRatedPage = 1;
    let historyPage = 1;
    let documentaryPage = 1;
    let freeCategoryPage = 1;

    // Fonction pour récupérer les genres disponibles
    const fetchGenres = async () => {
        let allGenres = [];
        let page = 1;

        while (true) {
            try {
                const response = await fetch(`${genresUrl}?page=${page}`);
                const data = await response.json();
                if (data.results.length === 0) break;
                allGenres = allGenres.concat(data.results);
                page++;
            } catch (error) {
                console.error('Erreur lors de la récupération des genres:', error);
                break;
            }
        }

        allGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            categorySelect.appendChild(option);
        });
    };

    // Fonction pour récupérer les films les mieux notés
    const fetchTopRatedMovies = async (page = 1) => {
        let allMovies = [];
        let currentPage = page;

        while (allMovies.length < 6) {
            try {
                const response = await fetch(`${apiBaseUrl}?sort_by=-imdb_score&page=${currentPage}`);
                const data = await response.json();
                allMovies = allMovies.concat(data.results);
                currentPage++;
            } catch (error) {
                console.error('Erreur lors de la récupération des films les mieux notés:', error);
                break;
            }
        }

        displayMovies(allMovies, topRatedMoviesList);
        if (allMovies.length > 0) {
            displayBestMovie(allMovies[0]);
        }
    };

    // Fonction pour afficher les films d'une catégorie
    const fetchMoviesByGenre = async (genre, page = 1) => {
        let allMovies = [];
        let currentPage = page;

        while (allMovies.length < 6) {
            try {
                const response = await fetch(`${apiBaseUrl}?genre=${genre}&sort_by=-imdb_score&page=${currentPage}`);
                const data = await response.json();
                allMovies = allMovies.concat(data.results);
                currentPage++;
            } catch (error) {
                console.error('Erreur lors de la récupération des films par genre:', error);
                break;
            }
        }

        displayMovies(allMovies, freeCategoryMovies);
    };

    // Fonction pour afficher les films d'une catégorie spécifique
    const fetchMoviesByCategory = async (category, element, page = 1) => {
        let allMovies = [];
        let currentPage = page;

        while (allMovies.length < 6) {
            try {
                const response = await fetch(`${apiBaseUrl}?genre=${category}&sort_by=-imdb_score&page=${currentPage}`);
                const data = await response.json();
                allMovies = allMovies.concat(data.results);
                currentPage++;
            } catch (error) {
                console.error('Erreur lors de la récupération des films par catégorie:', error);
                break;
            }
        }

        displayMovies(allMovies, element);
    };

    // Fonction pour afficher les films
    const displayMovies = (movies, element) => {
        element.innerHTML = '';
        movies.forEach((movie, index) => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            if (index >= getVisibleMoviesCount()) movieCard.classList.add('hidden');
            movieCard.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title}" onerror="this.onerror=null;this.src='default-image.jpg';">
                <h3>${movie.title}</h3>
                <button class="details-btn" data-id="${movie.id}">Détails</button>
            `;
            element.appendChild(movieCard);
        });
    };


// Fonction pour afficher le meilleur film
const displayBestMovie = (movie) => {
    bestMovieCard.innerHTML = `
        <img src="${movie.image_url}" alt="${movie.title}" onerror="this.onerror=null;this.src='default-image.jpg';">
        <h3>${movie.title}</h3>
        <p id="best-movie-description">A young violinist with leukemia brings hope and life into a desolate Russian hospital for children.</p>
        <button class="details-btn" data-id="${movie.id}">Détails</button>
    `;
};


    // Fonction pour afficher les détails d'un film dans la fenêtre modale
    const displayMovieDetails = async (movieId) => {

    try {
        const response = await fetch(`${apiBaseUrl}${movieId}`);
        const data = await response.json();

        // Remplissage des informations du film dans le modal
        document.getElementById('modal-img').src = data.image_url;
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-genre').textContent = `Genre: ${data.genres.join(', ')}`;
        document.getElementById('modal-release-date').textContent = `Date de sortie: ${data.year}`;
        document.getElementById('modal-rating').textContent = `Classification: ${data.rated}`;
        const rating = data.rated && data.rated !== "Not rated or unkown rating" ? data.rated : "Classement non disponible";
        document.getElementById('modal-rating').textContent = `Classification: ${rating}`;

        document.getElementById('modal-director').textContent = `Réalisateur: ${data.directors.join(', ')}`;
        document.getElementById('modal-actors').textContent = `Acteurs: ${data.actors.join(', ')}`;
        document.getElementById('modal-duration').textContent = `Durée: ${data.duration} minutes`;
        document.getElementById('modal-country').textContent = `Pays d'origine: ${data.countries.join(', ')}`;
        document.getElementById('modal-box-office').textContent = `Recettes au box-office: ${data.worldwide_gross_income}`;
        document.getElementById('modal-summary').textContent = `Description : ${data.description}`;


        // Affichage de la modale
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du film :', error);
    }
};



    // Écouter les changements de sélection de catégorie
    categorySelect.addEventListener('change', (event) => {
        const selectedCategory = event.target.value;
        if (selectedCategory) {
            freeCategoryMovies.innerHTML = '';
            freeCategoryPage = 1;
            fetchMoviesByGenre(selectedCategory, freeCategoryPage);
        }
    });

// Écouter les clics sur les boutons "Détails"
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('details-btn')) {
        const movieId = event.target.getAttribute('data-id');
        
        displayMovieDetails(movieId);
    }
});


// Fermer la fenêtre modale en cliquant sur le bouton de fermeture
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    
});

// Fermer la fenêtre modale en cliquant en dehors du contenu
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


    // Charger les données initiales
    fetchGenres();
    fetchTopRatedMovies(topRatedPage);
    fetchMoviesByCategory('History', historyMovies, historyPage);
    fetchMoviesByCategory('Documentary', documentaryMovies, documentaryPage);

    // Fonction pour gérer l'affichage des films cachés
    const handleSeeMore = (element) => {
        const hiddenMovies = element.querySelectorAll('.movie-card.hidden');
        hiddenMovies.forEach(movie => {
            movie.classList.remove('hidden');
        });
        element.nextElementSibling.textContent = 'Voir moins';
        element.nextElementSibling.setAttribute('data-action', 'less');
    };

    const handleSeeLess = (element) => {
        const movies = element.querySelectorAll('.movie-card');
        movies.forEach((movie, index) => {
            if (index >= getVisibleMoviesCount()) {
                movie.classList.add('hidden');
            }
        });
        element.nextElementSibling.textContent = 'Voir plus';
        element.nextElementSibling.setAttribute('data-action', 'more');
    };

    // Écouter les clics sur les boutons "Voir plus" et "Voir moins"
    document.querySelectorAll('.see-more-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const action = event.target.getAttribute('data-action');
            const element = event.target.previousElementSibling;
            if (action === 'more') {
                handleSeeMore(element);
            } else {
                handleSeeLess(element);
            }
        });
    });

    // Fonction pour déterminer le nombre de films visibles en fonction de la taille de l'écran
    const getVisibleMoviesCount = () => {
        const width = window.innerWidth;
        if (width < 600) return 2;
        if (width < 900) return 4;
        return 6;
    };

    // Ajuster l'affichage des films lors du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        displayMovies(topRatedMoviesList.querySelectorAll('.movie-card'), topRatedMoviesList);
        displayMovies(historyMovies.querySelectorAll('.movie-card'), historyMovies);
        displayMovies(documentaryMovies.querySelectorAll('.movie-card'), documentaryMovies);
        displayMovies(freeCategoryMovies.querySelectorAll('.movie-card'), freeCategoryMovies);
    });
});
