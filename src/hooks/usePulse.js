import { useEffect } from 'react';
import { readLevels } from '../audio/engine.js';

// usePulse — «пульс» страницы под звук.
// Каждый кадр спрашивает у анализатора громкость баса, середины и верха
// и пишет их в CSS-переменные --bass, --mid, --high на элементе ref.
// Дальше любой CSS внутри может написать, например:
//   scale: calc(1 + var(--bass) * 0.1);
// и элемент начнёт качаться под кик. React при этом ничего не перерисовывает.
export function usePulse(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame;
    let bass = 0, mid = 0, high = 0;
    let prev = 0;   // бас на прошлом кадре
    let floor = 0;  // «обычный» уровень баса за последние пару секунд
    let written = false;

    function tick() {
      frame = requestAnimationFrame(tick);
      const now = readLevels();
      if (!now) return; // звук ещё ни разу не включали

      // В плотном бите бас звучит почти всё время, и по одной громкости удар не поймать.
      // Поэтому смотрим на две вещи:
      //   rise  — насколько бас ВЫРОС с прошлого кадра (резкий скачок = кик);
      //   above — насколько он выше своего обычного уровня (floor).
      const rise = Math.max(0, now.bass - prev);
      prev = now.bass;
      floor += (now.bass - floor) * 0.03;
      const above = Math.max(0, now.bass - floor);
      const punch = Math.min(1, rise * 7 + above * 2.5);

      // Огибающая: вверх прыгаем мгновенно (удар), вниз спадаем плавно (хвост).
      bass = punch > bass ? punch : bass * 0.86;
      mid = now.mid > mid ? now.mid : mid * 0.9;
      high = now.high > high ? now.high : high * 0.85;

      // В тишине перестаём писать в DOM, чтобы не грузить браузер зря.
      const silent = bass < 0.002 && mid < 0.002 && high < 0.002;
      if (silent && !written) return;
      el.style.setProperty('--bass', silent ? 0 : bass.toFixed(3));
      el.style.setProperty('--mid', silent ? 0 : mid.toFixed(3));
      el.style.setProperty('--high', silent ? 0 : high.toFixed(3));
      written = !silent;
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ref]);
}
