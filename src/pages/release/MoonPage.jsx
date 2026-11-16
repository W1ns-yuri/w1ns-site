import { useRef, useState } from 'react';
import SiteNav from '../../components/SiteNav.jsx';
import NextPage from '../../components/NextPage.jsx';
import { TransitionLink } from '../../components/PageTransition.jsx';
import { usePageMotion } from '../../hooks/usePageMotion.js';
import { moonTracks, contacts } from '../../data/content.js';
import '../pages.css';
import './release.css';

// MOON: шесть треков = шесть фаз луны.
// Пока скроллишь, тень сходит с луны (от новолуния к полнолунию), а в списке подсвечивается трек этой фазы.
export default function MoonPage() {
  const rootRef = useRef(null);
  const [active, setActive] = useState(0);

  usePageMotion(rootRef, ({ q, gsap, SplitText }) => {
    // --- Вход: луна всплывает из темноты, буквы MOON поднимаются.
    // Заголовков два (белый за луной и контурный перед ней), буквы обоих двигаем одинаково.
    const solid = SplitText.create(q('.moon-hero__title--solid'), { type: 'chars' }).chars;
    const line = SplitText.create(q('.moon-hero__title--line'), { type: 'chars' }).chars;
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(q('.moon-hero__moon'), { opacity: 0, scale: 0.7, yPercent: 20, duration: 2.2 })
      .from(solid, { yPercent: 60, opacity: 0, duration: 1.4, stagger: 0.09 }, 0.3)
      .from(line, { yPercent: 60, opacity: 0, duration: 1.4, stagger: 0.09 }, 0.3)
      .from(q('.moon-hero__meta'), { opacity: 0, y: 16, duration: 0.9 }, 1);

    // --- Скролл в hero: луна растёт и поворачивается, буквы разъезжаются в стороны.
    const tl = gsap.timeline({ scrollTrigger: { trigger: q('.moon-hero')[0], start: 'top top', end: 'bottom top', scrub: true } });
    tl.to(q('.moon-hero__moon'), { scale: 1.7, rotate: 24, ease: 'none' }, 0);
    [solid, line].forEach((chars) => chars.forEach((ch, i) => tl.to(ch, { xPercent: (i - 1.5) * 55, ease: 'none' }, 0)));

    // --- Фазы: секция закреплена на 3 экрана скролла. progress идёт от 0 до 1:
    // его кладём в CSS-переменную --phase (двигает тень) и превращаем в номер трека.
    const phases = q('.phases')[0];
    gsap.to(phases, {
      '--phase': 1, ease: 'none',
      scrollTrigger: {
        trigger: phases, start: 'top top', end: '+=300%', pin: true, scrub: 0.4,
        onUpdate: (self) => setActive(Math.min(moonTracks.length - 1, Math.floor(self.progress * moonTracks.length))),
      },
    });

    // --- Блок про альбом: обложка открывается шторкой.
    gsap.timeline({ scrollTrigger: { trigger: q('.sleeve')[0], start: 'top 65%' }, defaults: { ease: 'expo.out' } })
      .from(q('.sleeve__cover'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.5 })
      .from(q('.sleeve__text > *'), { opacity: 0, y: 30, duration: 1, stagger: 0.1 }, 0.2);
  });

  return (
    <div className="page moon" ref={rootRef}>
      <SiteNav />

      <section className="moon-hero">
        <div className="moon-hero__moon" aria-hidden="true" />
        <h1 className="moon-hero__title moon-hero__title--solid">MOON</h1>
        <span className="moon-hero__title moon-hero__title--line" aria-hidden="true">MOON</span>
        <p className="moon-hero__meta data">АЛЬБОМ · 6 ТРЕКОВ · <a href={contacts.crewYoutube} target="_blank" rel="noopener noreferrer">OLD LINE CREW</a></p>
      </section>

      <section className="phases" aria-label="Треклист">
        <div className="phases__moon" aria-hidden="true">
          <div className="phases__disc" />
          <div className="phases__shadow" />
        </div>
        <ol className="phases__list">
          {moonTracks.map((t, i) => (
            <li key={t.phase} className={`phase ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}>
              <span className="data phase__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="phase__title">{t.title ?? 'Название скоро'}</span>
              <span className="data phase__name">{t.phase}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sleeve">
        <img className="sleeve__cover" src="/covers/moon.webp" alt="Обложка альбома MOON" width="979" height="979" />
        <div className="sleeve__text">
          <h2 className="sleeve__title">Шесть треков,<br />шесть фаз</h2>
          <p>MOON — второй альбом после ESCAPE. Названия треков и превью появятся здесь, как только я их выложу.</p>
          <TransitionLink to="/beats" label="BEATS" className="btn btn--light">ПОКА ПОСЛУШАТЬ БИТЫ</TransitionLink>
        </div>
      </section>

      <NextPage to="/scorpion" title="SCORPION" hint="СЛЕДУЮЩИЙ РЕЛИЗ" />
    </div>
  );
}
