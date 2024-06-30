let APIKey = "745e9cfd";
let searchInput = document.getElementById("searchInput");
let searchBtn = document.getElementById("searchBtn");
let movieGrid = document.getElementById("movieGrid");
let favoriteGrid = document.getElementById("favoriteGrid");
let autocompleteList = document.getElementById("autocompleteList");
let favorites = new Set(JSON.parse(localStorage.getItem("favorites")) || []);

const getData = async (movie) => {
  try {
    let fetchData = await fetch(
      `http://www.omdbapi.com/?apikey=${APIKey}&s=${movie}`
    );
    let jsonData = await fetchData.json();

    console.log(jsonData);
    movieGrid.innerHTML = "";
    autocompleteList.innerHTML = ""; // Remove suggestions
    searchInput.value = "";

    if (jsonData.Search) {
      jsonData.Search.forEach((movie) => {
        let div = document.createElement("div");
        div.classList.add("movieCard");
        div.innerHTML = `
          <img src=${movie.Poster} alt="">
          <div class="cardText">
              <h1>${movie.Title}</h1>
              <p>Year: <span>${movie.Year}</span></p>
              <button class="favoriteBtn">Add to Favorites</button>
          </div>`;
        movieGrid.appendChild(div);

        div.querySelector(".favoriteBtn").addEventListener("click", () => {
          addToFavorites(movie);
        });
      });
    } else {
      movieGrid.innerHTML = "<h1>No Movies Found</h1>";
    }
  } catch (error) {
    movieGrid.innerHTML = "<h1>Wrong Input</h1>";
  }
};

const addToFavorites = (movie) => {
  if (!favorites.has(movie.imdbID)) {
    favorites.add(movie.imdbID);
    saveFavorites();
    let div = document.createElement("div");
    div.classList.add("favoriteCard");
    div.innerHTML = `
      <img src=${movie.Poster} alt="">
      <div class="cardText">
          <h1>${movie.Title}</h1>
          <button class="deleteBtn">Delete</button>
      </div>`;
    favoriteGrid.appendChild(div);

    div.querySelector(".deleteBtn").addEventListener("click", () => {
      favoriteGrid.removeChild(div);
      favorites.delete(movie.imdbID);
      saveFavorites();
    });
  }
};

const saveFavorites = () => {
  localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
};

const loadFavorites = async () => {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  for (let id of favs) {
    let fetchData = await fetch(
      `http://www.omdbapi.com/?apikey=${APIKey}&i=${id}`
    );
    let movie = await fetchData.json();
    addToFavorites(movie);
  }
};

searchBtn.addEventListener("click", function(){
    let movieName = searchInput.value;
    if (movieName != "") {
        getData(movieName);
    } else {
        movieGrid.innerHTML = "<h1>Search Movie</h1>";
    }
});

searchInput.addEventListener("keypress", function(e){
  if (e.key === "Enter") {
    let movieName = searchInput.value;
    if (movieName != "") {
        getData(movieName);
    } else {
        movieGrid.innerHTML = "<h1>Search Movie</h1>";
    }
  }
});

searchInput.addEventListener("input", async function(){
  let query = searchInput.value;
  if (query.length > 2) {
    let fetchData = await fetch(
      `http://www.omdbapi.com/?apikey=${APIKey}&s=${query}`
    );
    let jsonData = await fetchData.json();

    autocompleteList.innerHTML = "";
    if (jsonData.Search) {
      jsonData.Search.forEach((movie) => {
        let item = document.createElement("div");
        item.classList.add("autocomplete-item");
        item.innerText = movie.Title;
        item.addEventListener("click", () => {
          searchInput.value = movie.Title;
          autocompleteList.innerHTML = "";
          getData(movie.Title);
        });
        autocompleteList.appendChild(item);
      });
    }
  } else {
    autocompleteList.innerHTML = "";
  }
});

window.onload = loadFavorites;
