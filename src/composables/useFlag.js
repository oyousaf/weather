import { ref, watchEffect } from "vue";
import { flagMap } from "../constants/flagMap";

const cache = new Map();

export function useFlag(countryCodeRef) {
  const svgFlag = ref("");

  const fallback = `
    <div class="w-full h-full flex items-center justify-center">
      <svg class="animate-spin text-white/50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>
  `;

  const encodeSVG = (svg) => btoa(unescape(encodeURIComponent(svg)));

  const setFlag = (rawCode) => {
    const code = rawCode?.trim()?.toUpperCase();
    if (!code) {
      svgFlag.value = fallback;
      return;
    }

    if (cache.has(code)) {
      svgFlag.value = cache.get(code);
      return;
    }

    const svg = flagMap[code];
    if (svg) {
      const html = `<img src="data:image/svg+xml;base64,${encodeSVG(
        svg
      )}" alt="${code} flag" class="w-full h-full object-cover" />`;
      cache.set(code, html);
      svgFlag.value = html;
    } else {
      svgFlag.value = fallback;
    }
  };

  watchEffect(() => {
    setFlag(countryCodeRef.value);
  });

  return {
    svgFlag,
    setFlag,
  };
}
