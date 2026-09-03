<script setup>
import { ref } from "vue";

const {
  query,
  suggestions,
  showSuggestions,
  highlightedIndex,
  isLoading,
  errorMessage,
  weatherData,
  condition,
  description,
  location,
  flag,
  theme,
  tempStyle,
  isDay,
  iconUrl,
  temperature,
  wind,
  details,
  unit,
  onInput,
  selectCity,
  handleKeydown,
  search,
  locate,
} = useWeather();

const searchWrapRef = ref(null);
const unitCButtonRef = ref(null);
const unitFButtonRef = ref(null);

const searchGlow = usePointerGlow(searchWrapRef);
const unitCGlow = usePointerGlow(unitCButtonRef);
const unitFGlow = usePointerGlow(unitFButtonRef);

onMounted(locate);

useSeoMeta({
  title: "Weatherly — Weather with personality",
  description:
    "A beautifully simple, real-time weather app with a forecast that feels alive.",
  ogTitle: "Weatherly — Weather with personality",
  ogDescription: "Real-time weather, beautifully presented.",
  themeColor: "#101827",
});
</script>

<template>
  <main
    class="weather-app"
    :class="[`theme-${theme}`, { night: !isDay }]"
    :style="tempStyle"
  >
    <div class="atmosphere" aria-hidden="true">
      <span class="orb orb-one" /><span class="orb orb-two" /><span
        class="rain-lines"
      />
    </div>
    <header class="topbar">
      <NuxtLink to="/" class="brand" aria-label="Weatherly home"
        ><span class="brand-mark">✦</span> weatherly</NuxtLink
      >
      <button class="location-button" type="button" @click="locate">
        <span>⌖</span> Use my location
      </button>
    </header>

    <section class="hero">
      <p class="eyebrow">THE FORECAST, BUT MAKE IT FUN</p>
      <h1>How's the sky<br /><em>feeling today?</em></h1>
      <p class="intro">
        A tiny window into the world outside. Search a place and let the
        atmosphere set the mood.
      </p>
      <form
        ref="searchWrapRef"
        class="search-wrap"
        role="search"
        :style="searchGlow.style"
        @submit.prevent="search"
      >
        <span class="search-icon" aria-hidden="true">⌕</span>
        <label for="city-search" class="sr-only">Search for a city</label>
        <input
          id="city-search"
          v-model="query"
          type="search"
          autocomplete="off"
          placeholder="Search city or town..."
          @input="onInput"
          @keydown="handleKeydown"
          @focus="showSuggestions = suggestions.length > 0"
        />
        <button class="search-submit" type="submit" aria-label="Search">
          ↗
        </button>
        <Transition name="suggestions">
          <ul
            v-if="showSuggestions && suggestions.length"
            class="suggestions"
            role="listbox"
          >
            <li
              v-for="(city, index) in suggestions"
              :key="`${city.lat}-${city.lon}`"
              :class="{ active: index === highlightedIndex }"
              role="option"
              @mousedown.prevent="selectCity(city)"
            >
              <span class="suggestion-pin">⌖</span
              ><span
                >{{ city.name
                }}<small
                  >{{ city.state ? `${city.state}, ` : ""
                  }}{{ city.country }}</small
                ></span
              >
            </li>
          </ul>
        </Transition>
      </form>
    </section>

    <Transition name="notice" mode="out-in">
      <p v-if="errorMessage" key="error" class="alert" role="alert">
        {{ errorMessage }}
      </p>
      <section
        v-else-if="isLoading"
        key="loading"
        class="loading-card"
        aria-live="polite"
      >
        <span class="loader" /> Reading the sky...
      </section>
    </Transition>

    <Transition name="forecast" mode="out-in">
      <section
        v-if="!isLoading && condition"
        :key="`${location}-${weatherData.dt}`"
        class="forecast-card"
        aria-live="polite"
      >
        <div class="forecast-heading">
          <div>
            <p class="card-label">RIGHT NOW</p>
            <h2>
              {{ location }}
              <span class="flag" :aria-label="`${country} flag`">{{
                flag
              }}</span>
            </h2>
            <p class="local-date">
              {{
                new Date(
                  (weatherData.dt + (weatherData.timezone || 0)) * 1000,
                ).toLocaleString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </div>
          <div class="unit-toggle" role="group" aria-label="Temperature unit" :data-unit="unit">
            <button
              ref="unitCButtonRef"
              :class="{ selected: unit === 'C' }"
              :style="unitCGlow.style"
              @click="unit = 'C'"
            >
              °C
            </button><button
              ref="unitFButtonRef"
              :class="{ selected: unit === 'F' }"
              :style="unitFGlow.style"
              @click="unit = 'F'"
            >
              °F
            </button>
          </div>
        </div>
        <div class="current-weather">
          <div>
            <p class="temperature">
              <span class="temp-slot">
                <Transition name="unit-swap">
                  <span :key="unit" class="temp-value">{{
                    temperature(weatherData.main?.temp)
                  }}</span>
                </Transition>
              </span>
            </p>
            <p class="condition">
              {{ condition }} <span>·</span> {{ description }}
            </p>
            <p class="feels">
              Feels like
              <span class="temp-slot temp-slot-inline">
                <Transition name="unit-swap">
                  <span :key="`feels-${unit}`" class="temp-value">{{
                    temperature(weatherData.main?.feels_like)
                  }}</span>
                </Transition>
              </span>
              · Wind {{ wind }}
            </p>
          </div>
          <img
            v-if="iconUrl"
            :src="iconUrl"
            :alt="description"
            class="weather-icon"
            width="120"
            height="120"
          />
        </div>
        <div class="details-grid">
          <article v-for="detail in details" :key="detail[0]" class="detail">
            <span class="detail-icon">{{ detail[2] }}</span>
            <p>{{ detail[0] }}</p>
            <strong>{{ detail[1] }}</strong>
          </article>
        </div>
      </section>
    </Transition>
    <footer>
      <span>Weatherly</span><span>Powered by OpenWeather</span
      ><span>Made for curious humans ✦</span>
    </footer>
  </main>
</template>
