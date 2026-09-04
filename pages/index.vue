<script setup>
import { nextTick, ref } from "vue";
import { useEventListener } from "@vueuse/core";

const {
  query,
  suggestions,
  showSuggestions,
  highlightedIndex,
  isLoading,
  isLocating,
  isFetching,
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
  localDate,
  lastUpdated,
  unit,
  onInput,
  selectCity,
  handleKeydown,
  search,
  locate,
  locateByIp,
} = useWeather();

const searchWrapRef = ref(null);
const searchInputRef = ref(null);
const unitCButtonRef = ref(null);
const unitFButtonRef = ref(null);
const orbOneRef = ref(null);
const orbTwoRef = ref(null);

const PARTICLE_COUNT = 35;
const particles = ref(
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 4 + Math.random() * 6,
    delay: -Math.random() * 12,
  })),
);
const particleRefs = particles.value.map(() => ref(null));

const searchGlow = usePointerGlow(searchWrapRef);
const unitCGlow = usePointerGlow(unitCButtonRef);
const unitFGlow = usePointerGlow(unitFButtonRef);

useOrbRepel([orbOneRef, orbTwoRef], { radius: 250, maxPush: 60 });
useParticles(particleRefs, { radius: 130, maxPush: 45 });

useEventListener(window, "keydown", (event) => {
  const isShortcut =
    (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  const isSlash =
    event.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if ((isShortcut || isSlash) && searchInputRef.value) {
    event.preventDefault();
    nextTick(() => searchInputRef.value.focus());
  }
});

onMounted(locateByIp);

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
      <span ref="orbOneRef" class="orb orb-one" />
      <span ref="orbTwoRef" class="orb orb-two" />
      <span
        v-for="(p, i) in particles"
        :ref="(el) => (particleRefs[i].value = el)"
        :key="p.id"
        :style="{
          left: p.x + '%',
          top: p.y + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          animationDelay: p.delay + 's',
        }"
        class="particle"
        aria-hidden="true"
      />
      <span class="rain-lines" />
    </div>
    <header class="topbar">
      <NuxtLink to="/" class="brand" aria-label="Weatherly home"
        ><span class="brand-mark">✦</span> weatherly</NuxtLink
      >
      <button
        class="location-button"
        type="button"
        @click="locate"
        title="Approximate location from your network. Tap for browser-precise location."
      >
        <span>⌖</span> Use my location
      </button>
    </header>

    <section class="hero">
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
          ref="searchInputRef"
          v-model="query"
          type="search"
          autocomplete="off"
          aria-keyshortcuts="Control+K Meta+K Slash"
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
            v-if="showSuggestions && query.length >= 2"
            class="suggestions"
            role="listbox"
          >
            <li
              v-if="!suggestions.length"
              class="suggestions-empty"
              role="presentation"
            >
              No matches for "{{ query }}"
            </li>
            <li
              v-for="(city, index) in suggestions"
              v-else
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
        <span class="loader" />
        {{ isLocating ? "Finding your location…" : "Reading the sky…" }}
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
            <p class="local-date">{{ localDate }}</p>
            <p v-if="lastUpdated" class="updated-stamp">{{ lastUpdated }}</p>
          </div>
          <div
            class="unit-toggle"
            role="group"
            aria-label="Temperature unit"
            :data-unit="unit"
            aria-live="polite"
          >
            <button
              ref="unitCButtonRef"
              :class="{ selected: unit === 'C' }"
              :style="unitCGlow.style"
              @click="unit = 'C'"
            >
              °C</button
            ><button
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
              <template v-if="wind !== '—'"> · Wind {{ wind }}</template>
            </p>
          </div>
          <img
            v-if="iconUrl"
            :src="iconUrl"
            :alt="description"
            class="weather-icon"
            width="120"
            height="120"
            loading="lazy"
            decoding="async"
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
