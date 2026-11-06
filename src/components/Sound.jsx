import { useState } from 'react';
import { genres } from '../data/content.js';

// Жанры: 4 полосы стекла. Наведённая растягивается и становится прозрачнее.
export default function Sound() {
  const [active, setActive] = useState(1);

  return (
    <section id="sound" className="section sound" aria-label="Жанры">
      <div className="sound__head">
        <h2 className="h2">SOUND</h2>
        <span className="hint hint--light">наведи на стекло</span>
      </div>

      <div className="strips">
        {genres.map((g, i) => {
          const on = i === active;
          return (
            <div
              key={g.name}
              className={`strip ${on ? 'is-on' : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
            >
              <span className="strip__blob strip__blob--a" style={{ background: g.a }} aria-hidden="true" />
              <span className="strip__blob strip__blob--b" style={{ background: g.b }} aria-hidden="true" />
              <span className="strip__glass" aria-hidden="true" />
              <span className="strip__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="strip__name">{g.name}</span>
              <span className="strip__info">
                <span className="mono-label">{g.bpm}</span>
                <span>{g.desc}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
