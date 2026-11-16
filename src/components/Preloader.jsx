import { useEffect, useRef, useState } from 'react';
import { preloader } from '../data/content.js';

const MIN_MS = 900;   // прелоадер живёт минимум столько, даже если всё загрузилось мгновенно
const MAX_WAIT = 3500; // а дольше этого не ждём никого: лучше показать сайт, чем висеть

// Ждём картинку: Promise выполнится, когда она загрузится (или не загрузится — нам всё равно).
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  });
}

// Прелоадер: счётчик 000 → 100, потом экран раскрывается как кинокадр (две половины разъезжаются).
// Он не декорация: пока он на экране, догружаются шрифты и фон hero, поэтому интро
// не дёргается и буквы W1NS не мелькают запасным шрифтом.
// Когда всё готово, вешаем на <html> класс is-ready — по нему CSS запускает анимации hero.
export default function Preloader() {
  // 'loading' → 'opening' (половины разъезжаются) → 'done' (убираем из DOM)
  const [phase, setPhase] = useState('loading');
  const numRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    // «Меньше движения» — без прелоадера, сайт показывается сразу.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('is-ready');
      setPhase('done');
      return;
    }

    let ready = false; // ресурсы догрузились?
    let frame, timer;
    const waits = [document.fonts.ready];
    if (window.location.pathname === '/') waits.push(loadImage('/bg/bg10.webp'));
    const limit = new Promise((resolve) => { timer = setTimeout(resolve, MAX_WAIT); });
    Promise.race([Promise.all(waits), limit]).then(() => { ready = true; });

    const start = performance.now();
    function tick(now) {
      // Счётчик идёт по времени, но выше 90 не поднимается, пока ресурсы не готовы.
      const byTime = Math.min(1, (now - start) / MIN_MS);
      const p = ready ? byTime : Math.min(byTime, 0.9);
      // Пишем прямо в DOM, без setState: иначе React перерисовывал бы компонент 60 раз в секунду.
      numRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0');
      lineRef.current.style.transform = `scaleX(${p})`;
      if (p < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      root.classList.add('is-ready'); // hero начинает своё интро под раскрывающимся экраном
      setPhase('opening');
      timer = setTimeout(() => setPhase('done'), 900);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`preloader is-${phase}`} aria-hidden="true">
      <span className="preloader__half preloader__half--top" />
      <span className="preloader__half preloader__half--bottom" />
      <div className="preloader__ui">
        <span className="preloader__label">{preloader.label}</span>
        <span className="preloader__line"><i ref={lineRef} /></span>
        <span className="preloader__num" ref={numRef}>000</span>
      </div>
    </div>
  );
}
