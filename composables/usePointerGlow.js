import { computed, ref, watch } from "vue";
import { useElementBounding, useEventListener, usePointer } from "@vueuse/core";

export function usePointerGlow(elementRef, options = {}) {
  const { enterScale = 1, leaveScale = 0 } = options;
  const x = ref(0);
  const y = ref(0);
  const isInside = ref(false);
  const intensity = ref(0);

  const { x: px, y: py } = usePointer({ target: elementRef });
  const { left, top, width, height } = useElementBounding(elementRef);

  watch([px, py, left, top, width, height], ([cxp, cyp, l, t, w, h]) => {
    if (!elementRef.value || w === 0 || h === 0) {
      if (isInside.value) isInside.value = false;
      return;
    }
    const localX = cxp - l;
    const localY = cyp - t;
    if (localX < 0 || localY < 0 || localX > w || localY > h) {
      if (isInside.value) isInside.value = false;
      return;
    }
    x.value = localX;
    y.value = localY;
    if (!isInside.value) isInside.value = true;
  });

  useEventListener(window, "blur", () => {
    isInside.value = false;
  });

  watch(isInside, (inside) => {
    intensity.value = inside ? enterScale : leaveScale;
  });

  const style = computed(() => ({
    "--glow-x": `${x.value}px`,
    "--glow-y": `${y.value}px`,
    "--glow-intensity": intensity.value,
  }));

  return { x, y, intensity, isInside, style };
}