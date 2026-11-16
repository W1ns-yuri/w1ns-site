import { useEffect, useRef } from 'react';
import { readBars } from '../audio/engine.js';

// Эквалайзер: пока звука нет, столбики лениво качаются (CSS-анимация).
// Когда live === true, анимация выключается и высоту столбиков задаёт настоящий звук.
export default function LiveEq({ live, count = 12, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!live) return;
    const bars = ref.current.children;
    let frame;
    function tick() {
      frame = requestAnimationFrame(tick);
      const levels = readBars(count);
      if (!levels) return;
      for (let i = 0; i < count; i++) bars[i].style.transform = `scaleY(${Math.max(0.08, levels[i]).toFixed(3)})`;
    }
    tick();
    return () => {
      cancelAnimationFrame(frame);
      for (const b of bars) b.style.transform = ''; // вернуть управление CSS-анимации
    };
  }, [live, count]);

  return (
    <span ref={ref} className={`eq ${live ? 'eq--live' : ''} ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ animationDuration: `${0.5 + ((i * 7) % 8) / 10}s` }} />
      ))}
    </span>
  );
}
