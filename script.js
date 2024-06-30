// API Key for OMDB API
let APIKey = "745e9cfd";

// DOM elements
let searchInput = document.getElementById("searchInput"); // Get the search input element
let searchBtn = document.getElementById("searchBtn"); // Get the search button element
let movieGrid = document.getElementById("movieGrid"); // Get the movie grid element
let favoriteGrid = document.getElementById("favoriteGrid"); // Get the favorite grid element
let autocompleteList = document.getElementById("autocompleteList"); // Get the autocomplete list element

// Initialize favorites from local storage or create an empty set if not present
let favorites = new Set(JSON.parse(localStorage.getItem("favorites")) || []);

// Function to fetch movie data from OMDB API
const getData = async (movie) => {
    try {
        // Fetch data from OMDB API based on movie search query
        let fetchData = await fetch(
            `http://www.omdbapi.com/?apikey=${APIKey}&s=${movie}`
        );
        // Parse response to JSON format
        let jsonData = await fetchData.json();

        // Clear previous search results and autocomplete suggestions
        movieGrid.innerHTML = "";
        autocompleteList.innerHTML = "";
        searchInput.value = "";

        // Display search results
        if (jsonData.Search) {
            // Iterate through each movie in the search results
            jsonData.Search.forEach((movie) => {
                // Create a div element for each movie card
                let div = document.createElement("div");
                div.classList.add("movieCard");
                // Populate the movie card HTML with movie details
                div.innerHTML = `
                    <img src=${movie.Poster} alt="">
                    <div class="cardText">
                        <h1>${movie.Title}</h1>
                        <p>Year: <span>${movie.Year}</span></p>
                        <button class="favoriteBtn">Add to Favorites</button>
                    </div>`;
                movieGrid.appendChild(div);

                // Event listener for adding movie to favorites when button is clicked
                div.querySelector(".favoriteBtn").addEventListener("click", () => {
                    addToFavorites(movie);
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
        // Add movie ID to favorites set
        favorites.add(movie.imdbID);
        saveFavorites(); // Save updated favorites to local storage

        // Create a div element for the favorite movie card
        let div = document.createElement("div");
        div.classList.add("favoriteCard");
        // Populate the favorite movie card HTML with movie details
        div.innerHTML = `
            <img src=${movie.Poster} alt="">
            <div class="cardText">
                <h1>${movie.Title}</h1>
                <button class="deleteBtn">Delete</button>
            </div>`;
        favoriteGrid.appendChild(div);

        // Event listener for deleting movie from favorites when button is clicked
        div.querySelector(".deleteBtn").addEventListener("click", () => {
            favoriteGrid.removeChild(div); // Remove favorite movie card from grid
            favorites.delete(movie.imdbID); // Delete movie ID from favorites set
            saveFavorites(); // Save updated favorites to local storage
        });
    }
};

// Function to save favorites to local storage
const saveFavorites = () => {
    localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
};

// Function to load favorites from local storage and display them
const loadFavorites = async () => {
    // Clear current contents of the favorite grid
    favoriteGrid.innerHTML = "";

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
            
            // Add favorite movie to favorite grid
            let div = document.createElement("div");
            div.classList.add("favoriteCard");
            // Populate the favorite movie card HTML with movie details
            div.innerHTML = `
                <img src=${movie.Poster} alt="">
                <div class="cardText">
                    <h1>${movie.Title}</h1>
                    <button class="deleteBtn">Delete</button>
                </div>`;
            favoriteGrid.appendChild(div);

            // Event listener for deleting movie from favorites when button is clicked
            div.querySelector(".deleteBtn").addEventListener("click", () => {
                favoriteGrid.removeChild(div); // Remove favorite movie card from grid
                favorites.delete(movie.imdbID); // Delete movie ID from favorites set
                saveFavorites(); // Save updated favorites to local storage
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
        movieGrid.innerHTML = "<h1>Search Movie</h1>";
    }
});

// Event listener for pressing Enter in search input
searchInput.addEventListener("keypress", function(e){
    if (e.key === "Enter") {
        let movieName = searchInput.value;
        if (movieName != "") {
            getData(movieName); // Fetch movie data based on search input
        } else {
            movieGrid.innerHTML = "<h1>Search Movie</h1>";
        }
    }
});

// Event listener for input change in search input for autocomplete
searchInput.addEventListener("input", async function(){
    let query = searchInput.value;
    if (query.length > 2) {
        try {
            // Fetch autocomplete suggestions from OMDB API
            let fetchData = await fetch(
                `http://www.omdbapi.com/?apikey=${APIKey}&s=${query}`
            );
            // Parse response to JSON format
            let jsonData = await fetchData.json();

            // Clear previous autocomplete suggestions
            autocompleteList.innerHTML = "";

            // Display autocomplete suggestions
            if (jsonData.Search) {
                jsonData.Search.forEach((movie) => {
                    // Create an item for each autocomplete suggestion
                    let item = document.createElement("div");
                    item.classList.add("autocomplete-item");
                    item.innerText = movie.Title;
                    // Event listener for selecting autocomplete suggestion
                    item.addEventListener("click", () => {
                        searchInput.value = movie.Title;
                        autocompleteList.innerHTML = "";
                        getData(movie.Title); // Fetch movie data based on selected suggestion
                    });
                    autocompleteList.appendChild(item);
                });
            }
        } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error);
        }
    } else {
        autocompleteList.innerHTML = "";
    }
});

// Load favorites from local storage when the page finishes loading
window.onload = loadFavorites;
