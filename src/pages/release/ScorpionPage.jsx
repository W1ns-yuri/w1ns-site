import { useRef, useState } from 'react';
import SiteNav from '../../components/SiteNav.jsx';
import NextPage from '../../components/NextPage.jsx';
import { usePageMotion } from '../../hooks/usePageMotion.js';
import { kinds, orderLink } from '../../data/content.js';
import '../pages.css';
import './release.css';

const TOTAL = 100;
// Сто сэмплов: тип берём по кругу из списка kinds (808, KICK, MELODY...).
const samples = Array.from({ length: TOTAL }, (_, i) => ({ num: String(i + 1).padStart(3, '0'), kind: kinds[i % kinds.length] }));

// SCORPION: сэмпл-пак как поле из ста клеток. Клетки светятся рядом с курсором («жало»),
// фильтр подсвечивает только нужный тип звука.
export default function ScorpionPage() {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const [kind, setKind] = useState('ВСЕ');

  // Свечение вокруг курсора: для каждой клетки считаем расстояние до мышки
  // и пишем «близость» от 0 до 1 в CSS-переменную --near. Без перерисовок React.
  function glow(e) {
    const cells = gridRef.current.children;
    for (const cell of cells) {
      const r = cell.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      cell.style.setProperty('--near', Math.max(0, 1 - d / 260).toFixed(3));
    }
  }
  function unglow() {
    for (const cell of gridRef.current.children) cell.style.setProperty('--near', 0);
  }

  usePageMotion(rootRef, ({ q, gsap, SplitText }) => {
    // --- Вход: буквы падают сверху, счётчик добегает до 100, обложка «приклеивается» как стикер.
    const split = SplitText.create(q('.scorp-hero__title'), { type: 'chars', mask: 'chars' });
    const counter = { n: 0 };
    const countEl = q('.scorp-hero__count')[0];
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(q('.scorp-hero__bg'), { opacity: 0, scale: 1.15, duration: 2 })
      .from(split.chars, { yPercent: -105, duration: 1.2, stagger: 0.05 }, 0.15)
      .from(q('.scorp-hero__sticker'), { opacity: 0, scale: 1.6, rotate: 30, duration: 1, ease: 'back.out(1.6)' }, 0.7)
      .to(counter, { n: TOTAL, duration: 1.8, ease: 'power2.out', onUpdate: () => { countEl.textContent = String(Math.round(counter.n)).padStart(3, '0'); } }, 0.4)
      .from(q('.scorp-hero__lead'), { opacity: 0, y: 16, duration: 0.9 }, 0.9);

    gsap.to(q('.scorp-hero__bg'), {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: q('.scorp-hero')[0], start: 'top top', end: 'bottom top', scrub: true },
    });

    // --- Поле: клетки проявляются волной от центра сетки.
    gsap.from(q('.cell100'), {
      opacity: 0, scale: 0.3, duration: 0.7, ease: 'back.out(1.8)',
      stagger: { each: 0.035, grid: [10, 10], from: 'center' },
      scrollTrigger: { trigger: q('.field')[0], start: 'top 70%' },
    });
  });

  return (
    <div className="page scorp" ref={rootRef}>
      <SiteNav />

      <section className="scorp-hero">
        <div className="scorp-hero__bg" aria-hidden="true" />
        <img className="scorp-hero__sticker" src="/covers/scorpion.webp" alt="Обложка SCORPION" width="250" height="250" />
        <p className="scorp-hero__lead">
          Сто звуков, которые я сам ставлю в биты: 808, кики, мелодии, хэты, перкуссия, вокал, FX и снейры.
        </p>
        <div className="scorp-hero__bottom">
          <h1 className="scorp-hero__title">SCORPION</h1>
          <p className="scorp-hero__stat"><span className="scorp-hero__count">100</span><span className="data">СЭМПЛОВ В ПАКЕ</span></p>
        </div>
      </section>

      <section className="field" aria-label="Состав пака">
        <div className="field__head">
          <h2 className="field__title">Что внутри</h2>
          <div className="field__filters" role="group" aria-label="Тип звука">
            {['ВСЕ', ...kinds].map((k) => (
              <button key={k} type="button" className={`chip ${kind === k ? 'is-on' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
            ))}
          </div>
        </div>

        <div className="grid100" ref={gridRef} onPointerMove={glow} onPointerLeave={unglow}>
          {samples.map((s) => (
            <div key={s.num} className={`cell100 ${kind !== 'ВСЕ' && s.kind !== kind ? 'is-off' : ''}`}>
              <span className="cell100__num">{s.num}</span>
              <span className="cell100__kind">{s.kind}</span>
            </div>
          ))}
        </div>

        <div className="field__foot">
          <p className="data">ПРЕВЬЮ ЗВУКОВ ДОБАВЛЮ ПОЗЖЕ · ПАК ВЫДАЮ ЛИЧНО</p>
          <a className="btn btn--light" href={orderLink()}>ХОЧУ ЭТОТ ПАК</a>
        </div>
      </section>

      <NextPage to="/about" title="W1NS" hint="КТО ВСЁ ЭТО СДЕЛАЛ" />
    </div>
  );
}
