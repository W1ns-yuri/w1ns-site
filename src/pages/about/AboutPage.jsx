import { useRef } from 'react';
import SiteNav from '../../components/SiteNav.jsx';
import NextPage from '../../components/NextPage.jsx';
import { usePageMotion } from '../../hooks/usePageMotion.js';
import { bio, orderLink } from '../../data/content.js';
import '../pages.css';
import './about.css';

// «Обо мне»: кто я → откуда всё началось (история листается вбок) → как со мной поработать.
// Тексты лежат в src/data/content.js (bio).
export default function AboutPage() {
  const rootRef = useRef(null);

  usePageMotion(rootRef, ({ q, gsap, SplitText }) => {
    // --- Вход: строки заголовка выезжают из-под маски, портрет «открывается» снизу вверх.
    const title = SplitText.create(q('.me-hero__title'), { type: 'lines', mask: 'lines' });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(title.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.1)
      .from(q('.me-hero__photo'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6 }, 0.2)
      .from(q('.me-hero__photo img'), { scale: 1.35, duration: 2 }, 0.2)
      .from(q('.me-hero__name, .me-hero__facts li'), { opacity: 0, y: 16, duration: 0.8, stagger: 0.06 }, 0.8);

    // --- Скролл: портрет едет медленнее страницы.
    gsap.to(q('.me-hero__photo img'), {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: q('.me-hero')[0], start: 'top top', end: 'bottom top', scrub: true },
    });

    // --- Манифест: слова «зажигаются» по мере скролла, как будто читаешь вслух.
    const words = SplitText.create(q('.manifest__text'), { type: 'words' }).words;
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: q('.manifest')[0], start: 'top 65%', end: 'bottom 60%', scrub: true },
    });

    // --- История: секция закрепляется, а главы едут вбок, пока ты скроллишь вниз.
    const track = q('.story__track')[0];
    const distance = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: q('.story')[0], start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 0.5, invalidateOnRefresh: true,
        // Полоска прогресса внизу растёт вместе со скроллом.
        onUpdate: (self) => gsap.set(q('.story__progress span'), { scaleX: self.progress }),
      },
    });

    // --- Сотрудничество: строки поднимаются по очереди.
    gsap.timeline({ scrollTrigger: { trigger: q('.collab')[0], start: 'top 65%' }, defaults: { ease: 'expo.out' } })
      .from(q('.collab__title'), { opacity: 0, y: 50, duration: 1 })
      .from(q('.collab__row'), { opacity: 0, y: 40, duration: 0.9, stagger: 0.1 }, 0.15);
  });

  return (
    <div className="page me" ref={rootRef}>
      <SiteNav />

      <section className="me-hero">
        <div className="me-hero__text">
          <p className="me-hero__name">Юрий, он же W1NS</p>
          <h1 className="me-hero__title">Делаю<br />из битов<br />кино</h1>
          <ul className="me-hero__facts data">
            {bio.facts.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <div className="me-hero__photo">
          <img src="/img/portrait.webp" alt="" />
        </div>
      </section>

      <section className="manifest">
        <p className="manifest__text">{bio.manifest}</p>
      </section>

      <section className="story" aria-label="Как всё началось">
        <div className="story__track">
          <div className="story__intro">
            <h2 className="story__heading">Как всё<br />началось</h2>
          </div>
          {bio.chapters.map((c) => (
            <article key={c.label} className="chapter">
              <span className="chapter__label" aria-hidden="true">{c.label}</span>
              <h3 className="chapter__title">{c.title}</h3>
              <p className="chapter__text">{c.text}</p>
            </article>
          ))}
        </div>
        <div className="story__progress" aria-hidden="true"><span /></div>
      </section>

      <section className="collab" id="collab">
        <h2 className="collab__title">Давай сделаем<br />что-то вместе</h2>
        <ul className="collab__list">
          {bio.collab.map((c) => (
            <li key={c.name}>
              <a className="collab__row" href={orderLink()}>
                <span className="collab__name">{c.name}</span>
                <span className="collab__text">{c.text}</span>
                <svg className="collab__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M5 19L19 5M8 5h11v11" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <NextPage to="/beats" title="BEATS" hint="ПОСЛУШАТЬ, ЧТО Я ДЕЛАЮ" />
    </div>
  );
}
