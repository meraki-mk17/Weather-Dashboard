const API_KEY = "87f3c9933d81b545e403283ca819be55";

const searchInput = document.querySelector(".search-bar input");
const searchBtn = document.querySelector(".search-bar button");

const cityName = document.querySelector(".weather-info h2");
const condition = document.querySelector(".condition");
const temperature = document.querySelector(".temp");
const details = document.querySelector(".details");
const weatherIcon = document.querySelector(".weather-icon");
const favBtn = document.querySelector(".fav-btn");

const forecastContainer = document.querySelector(".forecast-cards");
const favoritesContainer = document.querySelector(".favorites");

let currentCity = "";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Weather Emoji Mapper
function getweatherEmoji(weather){
    switch(weather){
        case "Clear":
            return "☀️";
        case "Clouds":
            return "☁️";
        case "Rain":
            return "🌧️";
        case "Drizzle":
            return "🌦️";
        case "Thunderstorm":
            return "⛈️";
        case "Snow":
            return "❄️";
        default:
            return "❓";
    }
}

// Current Weather using async/await & try...catch
async function getWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "City not found");
        }

        const data = await response.json();
        currentCity = data.name;

        cityName.textContent = data.name;
        if(condition) condition.textContent = data.weather[0].description;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;

        details.innerHTML = `
            <span>💧 ${data.main.humidity}%</span>
            <span>🏎️ ${Math.round(data.wind.speed)} km/h</span>
        `;

        weatherIcon.textContent = getweatherEmoji(data.weather[0].main);
        getForecast(city);

    } catch(error) {
        alert(error.message);
    }
}

// 5-Day Forecast using async/await & Array methods (.filter, .slice, .forEach)
async function getForecast(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Forecast failed to load");

        const data = await response.json();
        forecastContainer.innerHTML = "";

        const forecastDays = data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );

        forecastDays.slice(0, 5).forEach(day => {
            const card = document.createElement("div");
            card.classList.add("forecast-card");

            card.innerHTML = `
                <h3>
                    ${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
                </h3>
                <div>
                    ${getweatherEmoji(day.weather[0].main)}
                </div>
                <p>${Math.round(day.main.temp)}°C</p>
            `;

            forecastContainer.appendChild(card);
        }); // <-- Fixed closing bracket here!

    } catch(error) {
        console.log(error);
    }
}

// Favorites Management
function renderFavorites() {
    favoritesContainer.innerHTML = "";
    favorites.forEach(city => {
        const tag = document.createElement("span");
        tag.className = "fav-tag";
        tag.textContent = city;
        tag.addEventListener("click", () => {
            searchInput.value = city;
            getWeather(city);
        });
        favoritesContainer.appendChild(tag);
    });
}

if(favBtn) {
    favBtn.addEventListener("click", () => {
        if (currentCity && !favorites.includes(currentCity)) {
            favorites.push(currentCity);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            renderFavorites();
        }
    });
}

// Event Listeners for Search
searchBtn.addEventListener("click", () => {
    let city = searchInput.value.trim();
    if (city !== "") {
        getWeather(city);
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        let city = searchInput.value.trim();
        if (city !== "") {
            getWeather(city);
        }
    }
});

// Initial startup
renderFavorites();
getWeather("Kozhikode");