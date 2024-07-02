// API Key for OMDB API
let APIKey = "745e9cfd";

// DOM elements retrieval
let searchInput = document.getElementById("searchInput"); // Input field for movie search
let searchBtn = document.getElementById("searchBtn"); // Search button
let movieGrid = document.getElementById("movieGrid"); // Container for search results
let favoriteGrid = document.getElementById("favoriteGrid"); // Container for favorite movies
let autocompleteList = document.getElementById("autocompleteList"); // Container for autocomplete suggestions
let modal = document.getElementById("modal"); // Modal container for displaying movie details

// Initialize favorites from local storage or create an empty set if not present
let favorites = new Set(JSON.parse(localStorage.getItem("favorites")) || []);

// Function to fetch detailed movie data from OMDB API by IMDb ID
const getMovieDetails = async (imdbID) => {
    try {
        // Fetch detailed movie data from OMDB API using IMDb ID
        let fetchData = await fetch(
            `http://www.omdbapi.com/?apikey=${APIKey}&i=${imdbID}`
        );
        // Parse response to JSON format
        let movie = await fetchData.json();
        return movie; // Return movie details object
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null; // Return null if fetch fails
    }
};

// Function to display movie details in modal popup
const displayMovieDetails = async (imdbID) => {
    let movie = await getMovieDetails(imdbID); // Fetch movie details using IMDb ID
    if (movie) {
        // Populate modal with movie details
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <img src="${movie.Poster}" alt="">
                <div class="modal-text">
                    <h1>${movie.Title}</h1>
                    <p><strong>Year:</strong> ${movie.Year}</p>
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p><strong>Plot:</strong> ${movie.Plot}</p>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Actors:</strong> ${movie.Actors}</p>
                </div>
            </div>`;
        modal.style.display = "block"; // Display modal

        // Event listener for closing modal when close button is clicked
        let closeBtn = modal.querySelector(".close");
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none"; // Hide modal
        });

        // Event listener for closing modal when clicking outside modal area
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none"; // Hide modal
            }
        };
    }
};

// Function to fetch movie data from OMDB API based on search query
const getData = async (movie) => {
    try {
        // Fetch movie data from OMDB API using search query
        let fetchData = await fetch(
            `http://www.omdbapi.com/?apikey=${APIKey}&s=${movie}`
        );
        // Parse response to JSON format
        let jsonData = await fetchData.json();

        // Clear previous search results and autocomplete suggestions
        movieGrid.innerHTML = "";
        autocompleteList.innerHTML = "";
        searchInput.value = "";

        // Display search results if movies are found
        if (jsonData.Search) {
            // Iterate through each movie in the search results
            jsonData.Search.forEach((movie) => {
                // Create a div element for each movie card
                let div = document.createElement("div");
                div.classList.add("movieCard"); // Add class for styling
                // Populate movie card HTML with movie details
                div.innerHTML = `
                    <img src=${movie.Poster} alt="">
                    <div class="cardText">
                        <h1>${movie.Title}</h1>
                        <p>Year: <span>${movie.Year}</span></p>
                        <button class="favoriteBtn">Add to Favorites</button>
                    </div>`;
                movieGrid.appendChild(div); // Append movie card to movieGrid container

                // Event listener for adding movie to favorites when button is clicked
                div.querySelector(".favoriteBtn").addEventListener("click", () => {
                    addToFavorites(movie); // Call addToFavorites function
                });

                // Event listener for displaying movie details in modal when movie card is clicked
                div.addEventListener("click", () => {
                    displayMovieDetails(movie.imdbID); // Call displayMovieDetails function
                });
            });
        } else {
            // Display message if no movies found
            movieGrid.innerHTML = "<h1>No Movies Found</h1>";
        }
    } catch (error) {
        // Display error message if fetch fails
        movieGrid.innerHTML = "<h1>Wrong Input</h1>";
    }
};

// Function to add movie to favorites
const addToFavorites = (movie) => {
    if (!favorites.has(movie.imdbID)) {
        favorites.add(movie.imdbID); // Add movie ID to favorites set
        saveFavorites(); // Save updated favorites to local storage

        // Create a div element for the favorite movie card
        let div = document.createElement("div");
        div.classList.add("favoriteCard"); // Add class for styling
        // Populate favorite movie card HTML with movie details
        div.innerHTML = `
            <img src=${movie.Poster} alt="">
            <div class="cardText">
                <h1>${movie.Title}</h1>
                <button class="deleteBtn">Delete</button>
            </div>`;
        favoriteGrid.appendChild(div); // Append favorite movie card to favoriteGrid container

        // Event listener for deleting movie from favorites when button is clicked
        div.querySelector(".deleteBtn").addEventListener("click", () => {
            favoriteGrid.removeChild(div); // Remove favorite movie card from grid
            favorites.delete(movie.imdbID); // Delete movie ID from favorites set
            saveFavorites(); // Save updated favorites to local storage
        });

        // Event listener for displaying movie details in modal when favorite movie card is clicked
        div.addEventListener("click", () => {
            displayMovieDetails(movie.imdbID); // Call displayMovieDetails function
        });
    }
};

// Function to save favorites to local storage
const saveFavorites = () => {
    localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
};

// Function to load favorites from local storage and display them
const loadFavorites = async () => {
    favoriteGrid.innerHTML = ""; // Clear current contents of favoriteGrid

    // Retrieve favorites from local storage
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    // Iterate through each favorite movie ID
    for (let id of favs) {
        try {
            // Fetch movie details by ID from OMDB API
            let fetchData = await fetch(
                `http://www.omdbapi.com/?apikey=${APIKey}&i=${id}`
            );
            // Parse response to JSON format
            let movie = await fetchData.json();

            // Add favorite movie to favoriteGrid
            let div = document.createElement("div");
            div.classList.add("favoriteCard"); // Add class for styling
            // Populate favorite movie card HTML with movie details
            div.innerHTML = `
                <img src=${movie.Poster} alt="">
                <div class="cardText">
                    <h1>${movie.Title}</h1>
                    <button class="deleteBtn">Delete</button>
                </div>`;
            favoriteGrid.appendChild(div); // Append favorite movie card to favoriteGrid container

            // Event listener for deleting movie from favorites when button is clicked
            div.querySelector(".deleteBtn").addEventListener("click", () => {
                favoriteGrid.removeChild(div); // Remove favorite movie card from grid
                favorites.delete(movie.imdbID); // Delete movie ID from favorites set
                saveFavorites(); // Save updated favorites to local storage
            });

            // Event listener for displaying movie details in modal when favorite movie card is clicked
            div.addEventListener("click", () => {
                displayMovieDetails(movie.imdbID); // Call displayMovieDetails function
            });
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    }
};

// Event listener for search button click
searchBtn.addEventListener("click", function(){
    let movieName = searchInput.value;
    if (movieName != "") {
        getData(movieName); // Fetch movie data based on search input
    } else {
        movieGrid.innerHTML = "<h1>Search Movie</h1>"; // Display message if search input is empty
    }
});

// Event listener for pressing Enter in search input
searchInput.addEventListener("keypress", function(e){
    if (e.key === "Enter") {
        let movieName = searchInput.value;
        if (movieName != "") {
            getData(movieName); // Fetch movie data based on search input
        } else {
            movieGrid.innerHTML = "<h1>Search Movie</h1>"; // Display message if search input is empty
        }
    }
});

// Event listener for input change in search input for autocomplete
searchInput.addEventListener("input", async function(){
    let query = searchInput.value;
    if (query.length > 1) {
        try {
            // Fetch autocomplete suggestions from OMDB API
            let fetchData = await fetch(
                `http://www.omdbapi.com/?apikey=${APIKey}&s=${query}`
            );
            // Parse response to JSON format
            let jsonData = await fetchData.json();

            // Clear previous autocomplete suggestions
            autocompleteList.innerHTML = "";

            // Display autocomplete suggestions if movies are found
            if (jsonData.Search) {
                jsonData.Search.forEach((movie) => {
                    // Create an item for each autocomplete suggestion
                    let item = document.createElement("div");
                    item.classList.add("autocomplete-item"); // Add class for styling
                    item.innerText = movie.Title;
                    // Event listener for selecting autocomplete suggestion
                    item.addEventListener("click", () => {
                        searchInput.value = movie.Title;
                        autocompleteList.innerHTML = "";
                        getData(movie.Title); // Fetch movie data based on selected suggestion
                    });
                    autocompleteList.appendChild(item); // Append autocomplete item to autocompleteList container
                });
            }
        } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error);
        }
    } else {
        autocompleteList.innerHTML = ""; // Clear autocomplete suggestions if search query length is less than 3
    }
});

// Load favorites from local storage when the page finishes loading
window.onload = loadFavorites;
