import { timeline, stack, styles } from '../data/content.js';

// «Обо мне» в виде bento-сетки: карточки разного размера на CSS grid.
export default function About() {
  return (
    <section id="about" className="section about" aria-label="Обо мне">
      <div className="about__inner">
        <div className="about__head">
          <div>
            <h2 className="about__title">Заходи в мой<br />холодный мир</h2>
            <p className="about__lead">
              W1NS — битмейкер со стажем. Пишу в FL Studio trap, supertrap, love music, ambient, DnB и экспериментальные биты. Уже вышли альбомы ESCAPE и MOON и сэмпл-пак SCORPION.
            </p>
          </div>
          <a href="#contacts" className="btn-dark">Написать мне</a>
        </div>

        <div className="bento">
          <div className="card card--photo">
            <div className="card--photo__glow" aria-hidden="true" />
            <div className="card--photo__circle" aria-hidden="true" />
            <span className="card--photo__placeholder">[ТВОЁ ФОТО]</span>
            <span className="pill pill--top">Битмейкер · FL Studio</span>
            <div className="timeline">
              {timeline.map((t) => (
                <div key={t.what} className="timeline__row">
                  <span className="mono-label">{t.year}</span>
                  <span>{t.what}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card--stack">
            <div className="card--stack__keys" aria-hidden="true" />
            <span className="pill pill--top">Мой сетап</span>
            <div className="stack">
              {stack.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>

          <div className="card card--quote">
            <span className="pill">Стили</span>
            <div className="styles-list">
              {styles.map((st) => <span key={st}>{st}</span>)}
            </div>
            <div className="card--quote__sign"><b>W1NS</b><span>битмейкер</span></div>
          </div>

          <div className="card card--contact">
            <div className="planet" aria-hidden="true" />
            <span className="pill">Связь</span>
            <div className="card--contact__links">
              <span>[telegram]</span>
              <span>[email]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
