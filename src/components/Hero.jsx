import { useEffect, useRef } from 'react';
import { topNav } from '../data/content.js';
import { TransitionLink } from './PageTransition.jsx';

// Буквы большого W1NS и их «глубина» для параллакса:
// чем больше depth, тем сильнее буква едет за мышкой (кажется ближе к тебе).
const LETTERS = [
  { ch: 'W', depth: 10 },
  { ch: '1', depth: 22 },
  { ch: 'N', depth: 14 },
  { ch: 'S', depth: 26 },
];

// Hero: при загрузке фон «наводит фокус», буквы W1NS выезжают снизу по очереди,
// потом появляется интерфейс. Мышка двигает слои с разной скоростью (параллакс).
export default function Hero() {
  const bars = [0.9, 0.6, 1.1, 0.75, 0.5, 0.95, 0.68, 1.2, 0.55, 0.85, 0.7, 1];
  const sectionRef = useRef(null);

  // Параллакс без перерисовок React: пишем позицию мыши в CSS-переменные
  // --mx и --my (от -1 до 1), а CSS сам двигает слои через calc().
  // Плавность — «догоняние» (lerp): каждый кадр проходим 8% пути до цели.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0, targetY = 0, x = 0, y = 0, frame;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width) * 2 - 1;
      targetY = ((e.clientY - r.top) / r.height) * 2 - 1;
    }
    function tick() {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      el.style.setProperty('--mx', x.toFixed(4));
      el.style.setProperty('--my', y.toFixed(4));
      frame = requestAnimationFrame(tick);
    }

    el.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="section hero" aria-label="W1NS">
      <div className="hero__bg-wrap" aria-hidden="true">
        <div className="hero__bg hero__bg--a" />
      </div>
      <div className="hero__vignette" aria-hidden="true" />
      {/* Затемнение, которое GSAP проявляет, пока hero уезжает вверх */}
      <div className="hero__shade" aria-hidden="true" />

      <div className="hero__content">
        <header className="hero__top intro intro--1">
          <a href="#hero" className="logo">
            <span className="logo__name">W1NS®</span>
            <span className="logo__sub">BEATMAKER / FL STUDIO</span>
          </a>

          <nav className="topnav" aria-label="Навигация по сайту">
            {topNav.map((item, i) => (
              <a key={item.href} href={item.href} className={i === 0 ? 'is-current' : ''}>
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#contacts" className="btn-collab">
            <span className="dot" aria-hidden="true" />
            ОТКРЫТ ДЛЯ КОЛЛАБОВ
          </a>
        </header>

        <div className="hero__widget-wrap intro intro--2">
          <div className="drop-card">
            <img className="drop-card__cover" src="/covers/escape.webp" alt="" width="88" height="88" />
            <div className="drop-card__info">
              <span className="mono-label">ФИЛЬМ В 5 БИТАХ · W1NS × CASSETTE</span>
              <span className="drop-card__title">ESCAPE</span>
              <span className="eq" aria-hidden="true">
                {bars.map((d, i) => (
                  <span key={i} style={{ animationDuration: `${d}s` }} />
                ))}
              </span>
            </div>
            <TransitionLink to="/escape" label="ESCAPE" className="drop-card__play" aria-label="Открыть ESCAPE">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5l12 7-12 7z" />
              </svg>
            </TransitionLink>
          </div>
          <div className="chips">
            <span>3 РЕЛИЗА</span>
            <span>11 ТРЕКОВ</span>
            <span>100 СЭМПЛОВ</span>
          </div>
        </div>

        <div className="hero__bottom">
          <span className="scroll-hint intro intro--3">SCROLL ↓</span>
          {/* Каждая буква — два span: внешний двигает параллакс, внутренний — выезд при загрузке.
              Разные элементы, потому что у одного элемента может быть только один transform. */}
          <h1 className="hero__title" aria-label="W1NS">
            {LETTERS.map((l, i) => (
              <span key={l.ch} className="hero__letter" style={{ '--depth': l.depth }} aria-hidden="true">
                <span className="hero__letter-in" style={{ animationDelay: `${0.35 + i * 0.09}s` }}>{l.ch}</span>
              </span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
