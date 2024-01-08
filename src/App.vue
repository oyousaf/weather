<template>
  <div id="app" :class="{ warm: isWarm }">
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
        class="text-center text-white"
        v-if="weather.main"
      >
        <!-- Location -->
          <div class="text-3xl font-medium drop-shadow-md">
            {{ weather.name }}, {{ weather.sys.country }}
          </div>
          <div class="text-2xl font-light italic">{{ dateBuilder() }}</div>

        <!-- Temp -->
          <div
            class="inline-block items-center justify-center p-4 text-9xl font-bold drop-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
          >
            {{ Math.round(weather.main.temp) }}°C
          </div>
          <div class="text-7xl font-bold italic drop-shadow-lg">
            {{ weather.weather[0].main }}
          </div>
        <br />

        <!-- Feels like -->
        <div class="text-2xl font-bold italic drop-shadow-lg">Feels like</div>
        <div
          class="inline-block items-center justify-center p-4 text-5xl font-extrabold drop-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
        >
          {{ weather.main.feels_like.toFixed(0) }}°C
        </div>

        <!-- Humidity -->
        <div class="text-2xl font-bold italic drop-shadow-lg">Humidity</div>
        <p
          class="inline-block w-32 text-center items-center justify-center p-2 text-5xl font-extrabold drop-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
        >
          {{ weather.main.humidity }}%
        </p>

        <!-- Winds -->
        <div class="text-2xl font-bold italic drop-shadow-lg">Winds</div>
        <div
          class="inline-block items-center justify-center p-4 text-5xl font-extrabold drop-shadow-lg bg-white/25 rounded-2xl my-8 shadow-lg"
        >
          {{ weather.wind.speed.toFixed(0) }} MPH
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./script.js"></script>
