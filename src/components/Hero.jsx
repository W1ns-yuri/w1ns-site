import { useEffect, useRef } from 'react';
import { topNav } from '../data/content.js';
import { TransitionLink } from './PageTransition.jsx';
import LiveEq from './LiveEq.jsx';

// Буквы большого W1NS и их «глубина» для параллакса:
// чем больше depth, тем сильнее буква едет за мышкой (кажется ближе к тебе).
// punch — насколько буква «подпрыгивает» на бас, когда играет бит.
const LETTERS = [
  { ch: 'W', depth: 10, punch: 0.1 },
  { ch: '1', depth: 22, punch: 0.2 },
  { ch: 'N', depth: 14, punch: 0.13 },
  { ch: 'S', depth: 26, punch: 0.17 },
];

// Hero: при загрузке фон «наводит фокус», буквы W1NS выезжают снизу по очереди,
// потом появляется интерфейс. Мышка двигает слои с разной скоростью (параллакс).
// sound / onToggleSound приходят из Home: там хранится, играет ли бит.
export default function Hero({ sound, onToggleSound }) {
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
      {/* Вспышка света: её яркость = громкость баса (переменная --bass из usePulse) */}
      <div className="hero__flash" aria-hidden="true" />
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
            {topNav.map((item) =>
              // Ссылка на страницу идёт через киношный переход, ссылка-якорь — обычная прокрутка.
              item.href.startsWith('/') ? (
                <TransitionLink key={item.href} to={item.href} label={item.label}>{item.label}</TransitionLink>
              ) : (
                <a key={item.href} href={item.href}>{item.label}</a>
              )
            )}
          </nav>

          <a href="#contacts" className="btn-collab" data-magnetic>
            <span className="dot" aria-hidden="true" />
            ОТКРЫТ ДЛЯ КОЛЛАБОВ
          </a>
        </header>

        <div className="hero__mid intro intro--2">
          {/* Главная кнопка сайта: включает бит, и вся страница начинает качать под него */}
          <button
            type="button"
            className={`soundbtn ${sound ? 'is-on' : ''}`}
            onClick={onToggleSound}
            aria-pressed={sound}
            data-cursor={sound ? 'СТОП' : 'PLAY'}
          >
            <span className="soundbtn__disc">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {sound ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5l12 7-12 7z" />}
              </svg>
            </span>
            <span className="soundbtn__text">
              <span className="soundbtn__title">{sound ? 'Играет Escape' : 'Включи бит'}</span>
              <span className="soundbtn__sub">{sound ? 'W1NS × CASSETTE · превью по кругу' : 'и сайт начнёт качать под него'}</span>
            </span>
          </button>

          <div className="hero__widget-wrap">
            <div className="drop-card">
              <img className="drop-card__cover" src="/covers/escape.webp" alt="" width="88" height="88" />
              <div className="drop-card__info">
                <span className="mono-label">ФИЛЬМ В 5 БИТАХ · W1NS × CASSETTE</span>
                <span className="drop-card__title">ESCAPE</span>
                <LiveEq live={sound} />
              </div>
              <TransitionLink to="/escape" label="ESCAPE" className="drop-card__play" aria-label="Смотреть фильм-альбом ESCAPE" data-cursor="ФИЛЬМ" data-magnetic>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M5 19L19 5M8 5h11v11" />
                </svg>
              </TransitionLink>
            </div>
            <div className="chips">
              <span>3 РЕЛИЗА</span>
              <span>11 ТРЕКОВ</span>
              <span>100 СЭМПЛОВ</span>
            </div>
          </div>
        </div>

        <div className="hero__bottom">
          <span className="scroll-hint intro intro--3">SCROLL ↓</span>
          {/* Каждая буква — два span: внешний двигает параллакс, внутренний — выезд при загрузке.
              Разные элементы, потому что у одного элемента может быть только один transform. */}
          <h1 className="hero__title" aria-label="W1NS">
            {LETTERS.map((l, i) => (
              <span key={l.ch} className="hero__letter" style={{ '--depth': l.depth, '--punch': l.punch }} aria-hidden="true">
                <span className="hero__letter-in" style={{ animationDelay: `${0.35 + i * 0.09}s` }}>{l.ch}</span>
              </span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
