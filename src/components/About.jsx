import { releases, contacts } from '../data/content.js';
import { TransitionLink } from './PageTransition.jsx';

// Маленькая обложка-«пилюля» прямо внутри текста. Ведёт на страницу релиза.
function Pill({ id }) {
  const r = releases.find((x) => x.id === id);
  return (
    <TransitionLink to={r.page} label={r.title} className="inpill" data-cursor="ОТКРЫТЬ">
      <img src={r.cover} alt="" />
      {r.title}
    </TransitionLink>
  );
}

// «Обо мне» на главной: один крупный абзац вместо сетки карточек.
// Слова «зажигаются» по мере скролла (анимация в src/animations/homeScroll.js),
// обложки релизов стоят прямо в тексте. Полная история — на странице /about.
export default function About() {
  return (
    <section id="about" className="section about" aria-label="Обо мне">
      <div className="about__inner">
        <div className="about__main">
          <p className="about__text">
            Я W1NS. Пишу trap, supertrap, ambient и всё, что не влезает в жанр. Выпустил <Pill id="escape" />, <Pill id="moon" /> и пак <Pill id="scorpion" />. Каждый бит собираю как сцену из фильма.
          </p>
          <div className="about__foot">
            <TransitionLink to="/about" label="W1NS" className="about__btn about__btn--solid" data-magnetic>ВСЯ ИСТОРИЯ</TransitionLink>
            <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="about__btn">НАПИСАТЬ В TELEGRAM</a>
          </div>
        </div>
        <TransitionLink to="/about" label="W1NS" className="about__photo duotone" data-cursor="КТО Я" aria-label="Обо мне">
          <img src="/img/w1ns-portrait.webp" alt="W1NS" />
        </TransitionLink>
      </div>
    </section>
  );
}
