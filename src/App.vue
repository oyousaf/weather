<template>
  <div
    id="app"
    :class="
      typeof weather.main != 'undefined' && weather.main.temp > 16 ? 'warm' : ''
    "
  >
    <main>
      <div class="w-full mb-8">
        <input
          type="text"
          class="w-full p-4 text-gray-700 text-xl outline-none bg-white/70 focus:bg-white transition-all duration-300 shadow-md rounded-full focus:ring-4 focus:ring-teal-600 focus:border-transparent"
          placeholder="Enter location..."
          v-model="query"
          @keypress="fetchWeather"
        />
      </div>

      <div
        class="text-center items-center justify-center content-center text-white"
        v-if="weather.main"
      >
        <div>
          <div class="text-3xl font-medium text-shadow-md">
            {{ weather.name }}, {{ weather.sys.country }}
          </div>
          <div class="text-2xl font-light italic">{{ dateBuilder() }}</div>
        </div>

        <div>
          <div
            class="inline-block items-center justify-center p-4 text-9xl font-bold text-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            {{ Math.round(weather.main.temp) }}°C
          </div>
          <div class="text-7xl font-bold italic text-shadow-lg">
            {{ weather.weather[0].main }}
          </div>
        </div>
        <br />
        <div>
          <p class="text-lg font-bold italic text-shadow-lg">Feels like</p>
          <p
            class="inline-block items-center justify-center p-4 text-5xl font-extrabold text-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            {{ weather.main.feels_like.toFixed(0) }}°C
          </p>
          <p class="text-lg font-bold italic text-shadow-lg">Humidity</p>
          <p
            class="inline-block w-32 text-center items-center justify-center p-4 text-5xl font-extrabold text-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            {{ weather.main.humidity }}%
          </p>
          <p class="text-lg font-bold italic text-shadow-lg">Winds</p>
          <p
            class="inline-block items-center justify-center p-4 text-5xl font-extrabold text-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            {{ weather.wind.speed.toFixed(0) }} MPH
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./script.js"></script>
