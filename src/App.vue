<template>
  <div
    id="app"
    :class="
      typeof weather.main != 'undefined' && weather.main.temp > 16 ? 'warm' : ''
    "
  >
    <main>
      <div class="search-box">
        <input
          type="text"
          class="search-bar"
          placeholder="Enter location..."
          v-model="query"
          @input="fetchPlaceSuggestions"
          @keypress="fetchWeather"
        />
        <ul class="suggestion-list" v-if="suggestions.length > 0">
          <li
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion.name }}, {{ suggestion.sys.country }}
          </li>
        </ul>
      </div>

      <div class="weather-wrap" v-if="typeof weather.main != 'undefined'">
        <div class="location-box">
          <div class="location">
            {{ weather.name }}, {{ weather.sys.country }}
          </div>
          <div class="date">{{ dateBuilder() }}</div>
        </div>

        <div class="weather-box">
          <div class="temp">{{ Math.round(weather.main.temp) }}°C</div>
          <div class="weather">{{ weather.weather[0].main }}</div>
        </div>
        <br />
        <div class="weather-box">
          <p class="weather2">Feels like</p>
          <p class="temp2">{{ weather.main.feels_like.toFixed(0) }}°C</p>
          <p class="weather2">Humidity</p>
          <p class="temp2">{{ weather.main.humidity }}%</p>
          <p class="weather2">Winds</p>
          <p class="temp2">{{ weather.wind.speed.toFixed(0) }} MPH</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      api_key: process.env.VUE_APP_WEATHER_API_KEY,
      url_base: "https://api.openweathermap.org/data/2.5/",
      query: "",
      weather: {},
      suggestions: [],
    };
  },
  methods: {
    fetchWeather(e) {
      if (e.key == "Enter") {
        fetch(
          `${this.url_base}weather?q=${this.query}&units=metric&APPID=${this.api_key}`
        )
          .then((res) => {
            return res.json();
          })
          .then(this.setResults);
      }
    },
    setResults(results) {
      this.weather = results;
    },
    dateBuilder() {
      let d = new Date();
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let day = days[d.getDay()];
      let date = d.getDate();
      let month = months[d.getMonth()];
      let year = d.getFullYear();

      return `${day} ${date} ${month} ${year}`;
    },
    fetchPlaceSuggestions() {
      if (this.query.trim() === "") {
        // If the query is empty, clear any previous suggestions.
        this.suggestions = [];
        return;
      }

      fetch(
        `${this.url_base}find?q=${this.query}&type=like&sort=population&cnt=5&APPID=${this.api_key}`
      )
        .then((res) => res.json())
        .then((data) => {
          this.suggestions = data.list;
        })
        .catch((error) => {
          console.error("Error fetching place suggestions:", error);
        });
    },
    async selectSuggestion(suggestion) {
      this.query = `${suggestion.name}, ${suggestion.sys.country}`;
      this.suggestions = []; // Clear the suggestions list

      // Fetch weather information based on the selected suggestion
      try {
        const response = await fetch(
          `${this.url_base}weather?q=${suggestion.name},${suggestion.sys.country}&units=metric&APPID=${this.api_key}`
        );
        const weatherData = await response.json();

        // Update the weather data
        this.weather = weatherData;
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Lora");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Lora", sans-serif;
}

#app {
  background-image: url("./assets/cold-bg.jpg");
  background-size: cover;
  background-position: bottom;
  transition: 0.4s;
}

#app.warm {
  background-image: url("./assets/warm-bg.jpg");
}

main {
  min-height: 100vh;
  padding: 25px;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25),
    rgba(0, 0, 0, 0.75)
  );
}

.search-box {
  width: 100%;
  margin-bottom: 30px;
}

.search-box .search-bar {
  display: block;
  width: 100%;
  padding: 15px;
  color: #313131;
  font-size: 20px;

  appearance: none;
  border: none;
  outline: none;
  background: none;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 0px 16px 0px 16px;
  transition: 0.4s;
}

.search-box .search-bar:focus {
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px 0px 16px 0px;
}

.suggestion-list {
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px 0px 16px 0px;
}

.location-box .location {
  color: white;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}

.location-box .date {
  color: white;
  font-size: 20px;
  font-weight: 300;
  font-style: italic;
  text-align: center;
}

.weather-box {
  text-align: center;
}

.weather-box .temp {
  display: inline-block;
  padding: 10px 25px;
  color: white;
  font-size: 102px;
  font-weight: 900;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  margin: 30px 0px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}

.weather-box .temp2 {
  display: inline-block;
  padding: 10px 25px;
  color: white;
  font-size: 51px;
  font-weight: 900;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  margin: 30px 0px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}

.weather-box .weather {
  color: white;
  font-size: 48px;
  font-weight: bold;
  font-style: italic;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}

.weather-box .weather2 {
  color: white;
  font-size: 22px;
  font-weight: bold;
  font-style: italic;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}

.suggestion-list {
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.suggestion-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestion-list li:hover {
  background-color: #f5f5f5;
}
</style>
