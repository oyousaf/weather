import { onScopeDispose } from "vue";
import { usePointer, usePreferredReducedMotion } from "@vueuse/core";

export function useOrbRepel(orbRefs, options = {}) {
  const { radius = 250, maxPush = 60, ease = 0.18 } = options;

  const reducedMotion = usePreferredReducedMotion();
  const { x, y, isInside } = usePointer();

  const targets = new Map();
  let raf = null;

  function step() {
    const disabled = reducedMotion.value === "reduce";
    const px = x.value;
    const py = y.value;
    const active = isInside.value && !disabled;
    for (const ref of orbRefs) {
      if (!ref?.value) continue;
      const orb = ref.value;
      const rect = orb.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = 0;
      let dy = 0;
      if (active) {
        const ddx = cx - px;
        const ddy = cy - py;
        const dist = Math.hypot(ddx, ddy);
        if (dist > 0 && dist < radius) {
          const strength = Math.pow(1 - dist / radius, 2);
          const push = maxPush * strength;
          dx = (ddx / dist) * push;
          dy = (ddy / dist) * push;
        }
      }

      const target = targets.get(orb) || { x: 0, y: 0 };
      target.x += (dx - target.x) * ease;
      target.y += (dy - target.y) * ease;
      targets.set(orb, target);
      orb.style.setProperty("--repel-x", `${target.x.toFixed(2)}px`);
      orb.style.setProperty("--repel-y", `${target.y.toFixed(2)}px`);
    }
    raf = requestAnimationFrame(step);
  }

  if (import.meta.client) {
    raf = requestAnimationFrame(step);
  }

  onScopeDispose(() => {
    if (raf) cancelAnimationFrame(raf);
  });

  return { x, y, isInside };
}