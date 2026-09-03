import { computed, onScopeDispose, ref, watch } from "vue";

export function usePointerGlow(elementRef, options = {}) {
  const { enterScale = 1, leaveScale = 0 } = options;
  const x = ref(0);
  const y = ref(0);
  const intensity = ref(0);
  const isInside = ref(false);

  const onMove = (event) => {
    if (!elementRef.value) return;
    const rect = elementRef.value.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    if (px < 0 || py < 0 || px > rect.width || py > rect.height) {
      if (isInside.value) isInside.value = false;
      return;
    }
    x.value = px;
    y.value = py;
    if (!isInside.value) isInside.value = true;
  };

  const onBlur = () => {
    isInside.value = false;
  };

  if (import.meta.client) {
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("blur", onBlur);
    onScopeDispose(() => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("blur", onBlur);
    });
  }

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