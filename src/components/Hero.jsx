import { topNav } from '../data/content.js';

// Hero: два размытых фото плавно сменяют друг друга (анимации в CSS),
// сверху навигация, справа виджет нового релиза, снизу огромный W1NS.
export default function Hero() {
  const bars = [0.9, 0.6, 1.1, 0.75, 0.5, 0.95, 0.68, 1.2, 0.55, 0.85, 0.7, 1];

  return (
    <section id="hero" className="section hero" aria-label="W1NS">
      <div className="hero__bg hero__bg--a" aria-hidden="true" />
      <div className="hero__bg hero__bg--b" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__content">
        <header className="hero__top">
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

        <div className="hero__widget-wrap">
          <div className="drop-card">
            <img className="drop-card__cover" src="/covers/escape.webp" alt="" width="88" height="88" />
            <div className="drop-card__info">
              <span className="mono-label">NEW DROP · 5 ТРЕКОВ</span>
              <span className="drop-card__title">ESCAPE</span>
              <span className="eq" aria-hidden="true">
                {bars.map((d, i) => (
                  <span key={i} style={{ animationDuration: `${d}s` }} />
                ))}
              </span>
            </div>
            <a href="#albums" className="drop-card__play" aria-label="Слушать ESCAPE">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5l12 7-12 7z" />
              </svg>
            </a>
          </div>
          <div className="chips">
            <span>3 РЕЛИЗА</span>
            <span>12 ТРЕКОВ</span>
            <span>100 СЭМПЛОВ</span>
          </div>
        </div>

        <div className="hero__bottom">
          <span className="scroll-hint">SCROLL ↓</span>
          <h1 className="hero__title">W1NS</h1>
        </div>
      </div>
    </section>
  );
}
