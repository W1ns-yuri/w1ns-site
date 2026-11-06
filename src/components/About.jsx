import { timeline, stack } from '../data/content.js';

// «Обо мне» в виде bento-сетки: карточки разного размера на CSS grid.
export default function About() {
  return (
    <section id="about" className="section about" aria-label="Обо мне">
      <div className="about__inner">
        <div className="about__head">
          <div>
            <h2 className="about__title">Заходи в мой<br />холодный мир</h2>
            <p className="about__lead">
              Я Юрий из Туркменистана. Пишу биты с 9 класса: начал со спора, а остался из-за любви к звуку. Шарю за кучу жанров и люблю, когда бит звучит как кино.
            </p>
          </div>
          <a href="#contacts" className="btn-dark">Написать мне</a>
        </div>

        <div className="bento">
          <div className="card card--photo">
            <div className="card--photo__glow" aria-hidden="true" />
            <div className="card--photo__circle" aria-hidden="true" />
            <span className="card--photo__placeholder">[ТВОЁ ФОТО]</span>
            <span className="pill pill--top">Пишу биты с 9 класса</span>
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
            <span className="pill">Как всё началось</span>
            <p>Друг хвастался, что написал бит. Я попросил неделю, чтобы сделать лучше. Хватило трёх дней.</p>
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
