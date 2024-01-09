<template>
  <div id="app" :class="{ warm: isWarm }">
    <main>
      <div class="w-full mb-8">
        <input
          type="text"
          class="w-full p-4 text-gray-700 text-xl outline-none bg-white/70 focus:bg-white transition-all duration-300 shadow-md rounded-full focus:ring-4 focus:ring-teal-600 focus:border-transparent"
          placeholder="Enter location..."
          v-model="query"
          @keypress="handleKeyPress"
          @input="handleInput"
        />
      </div>

      <div v-if="weather.main" class="text-center text-white">
        <!-- Location -->
        <div class="text-3xl font-medium drop-shadow-md">
          {{ `${weather.name}, ${weather.sys.country}` }}
        </div>
        <div class="text-2xl font-light italic drop-shadow-lg">
          {{ dateBuilder() }}
        </div>

        <!-- Temp -->
        <div
          class="inline-block items-center justify-center p-4 text-9xl font-bold drop-shadow-lg shadow-teal-500 bg-white/25 rounded-2xl my-8 shadow-lg"
        >
          {{ formatTemperature(weather.main.temp) }}
        </div>

        <!-- Toggle Units Button -->
        <button
          @click="toggleUnits"
          class="flex uppercase mx-auto m-4 p-2 font-bold bg-teal-500 shadow-teal-500 rounded-md hover:bg-teal-600 transition-all duration-300"
        >
          {{ temperatureUnit === "Celsius" ? "Imperial" : "Metric" }}
        </button>

        <!-- Weather Details -->
        <div class="p-2 text-7xl font-bold italic drop-shadow-lg">
          {{ weather.weather[0].main }}
          <div
            v-if="
              weather.weather[0].main === 'Rain' ||
              weather.weather[0].main === 'Snow' ||
              weather.weather[0].main === 'Clouds'
            "
            :class="[weather.weather[0].main.toLowerCase() + '-animation']"
          >
            <div
              class="text-3xl font-extrabold drop-shadow-lg rounded-2xl text-teal-400"
            >
              {{ getWeatherDetails() }}
            </div>
          </div>
        </div>

        <!-- Additional Details -->
        <div class="flex flex-col items-center space-x-4">
          <div
            v-for="(detail, label) in additionalDetails"
            :key="label"
            class="inline-block items-center justify-center p-4 text-5xl font-extrabold drop-shadow-lg shadow-teal-500 bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            <div class="text-xl text-teal-400 font-bold italic drop-shadow-lg">
              {{ label }}
            </div>
            {{ detail }}
          </div>
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
      temperatureUnit: "Celsius",
      debounceTimer: null,
      loading: false,
    };
  },
  computed: {
    isWarm() {
      return (
        typeof this.weather.main !== "undefined" && this.weather.main.temp > 16
      );
    },
    additionalDetails() {
      return {
        "Feels like": this.formatTemperature(this.weather.main.feels_like),
        Humidity: `${this.weather.main.humidity}%`,
        Winds: `${this.weather.wind.speed.toFixed(0)} MPH`,
      };
    },
  },
  methods: {
    fetchWeather() {
      if (this.query.trim() === "") {
        return;
      }

      fetch(
        `${this.url_base}weather?q=${this.query}&units=metric&APPID=${this.api_key}`
      )
        .then((res) => res.json())
        .then(this.setResults)
        .catch((error) => {
          console.error("Error fetching weather data:", error);
        });
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
    formatTemperature(value) {
      if (this.temperatureUnit === "Celsius") {
        return `${Math.round(value)}°C`;
      } else {
        return `${((value * 9) / 5 + 32).toFixed(0)}°F`;
      }
    },
    toggleUnits() {
      this.temperatureUnit =
        this.temperatureUnit === "Celsius" ? "Fahrenheit" : "Celsius";
      this.fetchWeather();
    },
    handleInput() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.fetchWeather();
      }, 1500);
    },
    handleKeyPress(event) {
      if (event.key === "Enter") {
        clearTimeout(this.debounceTimer);
        this.fetchWeather();
      }
    },
    getWeatherDetails() {
      switch (this.weather.weather[0].main) {
        case "Rain":
          return this.weather.rain ? `${this.weather.rain["1h"]} mm` : "N/A";
        case "Snow":
          return this.weather.snow ? `${this.weather.snow["1h"]} mm` : "N/A";
        case "Clouds":
          return `${this.weather.clouds.all}%`;
        default:
          return "";
      }
    },
  },
};
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

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
</style>
