const cityInput = document.getElementById("city-input");
const submitBtn = document.getElementById("submit-btn");
const suggestionsDiv = document.getElementById("suggestions");
const weatherResultsDiv = document.getElementById("weather-results");

const weatherApiKey = "3659f227b35cf946519b086e5af1de52";

async function getCitySuggestions(query) {
    if (query.length < 3) {
        suggestionsDiv.innerHTML = '';  
        return [];
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=10&appid=${weatherApiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Erreur dans la récupération des données');
        }

        const data = await response.json();
        
        if (data.list && Array.isArray(data.list)) {
            const citySuggestions = data.list.map(city => city.name);
            console.log("Suggestions de villes:", citySuggestions); 
            return citySuggestions;
        } else {
            console.error("Aucune ville trouvée ou format de données incorrect");
            return [];
        }
    } catch (error) {
        console.error("Erreur dans la requête API:", error);
        return [];
    }
}


function displayCitySuggestions(suggestions) {
    suggestionsDiv.innerHTML = '';  

    if (suggestions.length === 0) {
        suggestionsDiv.innerHTML = '<p>Aucune suggestion trouvée</p>';
    } else {
        suggestions.forEach(city => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.innerHTML = `<p>${city}</p>`;
            suggestionDiv.addEventListener('click', () => {
                cityInput.value = city;
                getWeather(city);
                suggestionsDiv.innerHTML = '';
            });
            suggestionsDiv.appendChild(suggestionDiv);
        });
    }
}


async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=5&appid=${weatherApiKey}`;
    console.log('URL de la requête:', url);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Réponse de l\'API:', data);
                
        if (data.cod === '200' && data.list && Array.isArray(data.list)) {
            const weatherData = data.list.map(day => ({
                date: day.dt_txt,
                temp: day.main.temp,
                description: day.weather[0].description,
            }));
            console.log('Données météo:', weatherData);
            displayWeather(weatherData);
        } else {
            weatherResultsDiv.innerHTML = `<p>Erreur ${data.cod}: ${data.message}</p>`;
        }
    } catch (error) {
        weatherResultsDiv.innerHTML = `<p>Erreur de connexion: ${error.message}</p>`;
    }
}


function displayWeather(weatherData) {
    console.log('Données météo à afficher:', weatherData);  

    weatherResultsDiv.innerHTML = ''; 

    if (weatherData.length === 0) {
        weatherResultsDiv.innerHTML = '<p>Aucune donnée météo disponible.</p>';
    } else {
        weatherData.forEach((day, index) => {
            const dayDiv = document.createElement('div');

            const date = new Date(day.date);
            const formattedDate = date.toLocaleString('fr-FR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
            });

            const temp = `${day.temp.toFixed(1)}°C`;  
            const description = day.description.charAt(0).toUpperCase() + day.description.slice(1); 

            console.log(`Jour ${index + 1}:`, day); 

            dayDiv.innerHTML = `
                <p><strong>${formattedDate}</strong></p>
                <p>Température: ${temp}</p>
                <p>Condition: ${description}</p>
            `;
            console.log('Ajout de l\'élément météo au DOM:', dayDiv);  

            weatherResultsDiv.appendChild(dayDiv);
        });
    }
}




cityInput.addEventListener('input', async () => {
    const query = cityInput.value;
    if (query.length > 2) {
        const suggestions = await getCitySuggestions(query);
        displayCitySuggestions(suggestions);
    } else {
        suggestionsDiv.innerHTML = '';
    }
});

submitBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        submitBtn.click();
    }
});
