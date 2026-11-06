import { useEffect, useRef, useState } from 'react';
import { drumRows } from '../data/content.js';
import { getAudio, hit } from '../audio/engine.js';

const STEPS = 16;
const BPM = 150;

// Превращаем список шагов [0, 7, 10] в массив из 16 true/false.
function toGrid(rows) {
  return rows.map((r) => Array.from({ length: STEPS }, (_, i) => r.steps.includes(i)));
}

// Драм-машина: сетка 4×16, Play запускает цикл.
export default function Lab() {
  const [grid, setGrid] = useState(() => toGrid(drumRows));
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  // useRef хранит актуальную сетку для интервала, не перезапуская его при каждом клике.
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useEffect(() => {
    if (!playing) return;
    const ms = 60000 / BPM / 4; // длительность 1/16 ноты
    let s = -1;
    const timer = setInterval(() => {
      s = (s + 1) % STEPS;
      gridRef.current.forEach((row, i) => { if (row[s]) hit(i); });
      setStep(s);
    }, ms);
    return () => { clearInterval(timer); setStep(-1); }; // очистка при остановке
  }, [playing]);

  function togglePlay() {
    if (!playing && !getAudio()) return;
    setPlaying(!playing);
  }

  function toggleCell(r, c) {
    setGrid((g) => g.map((row, ri) => row.map((on, ci) => (ri === r && ci === c ? !on : on))));
  }

  function clearAll() {
    setGrid((g) => g.map((row) => row.map(() => false)));
  }

  const stepLabel = step < 0 ? '--.--' : `${Math.floor(step / 4) + 1}.${(step % 4) + 1}`;

  return (
    <section id="lab" className="section lab" aria-label="Собери бит">
      <div className="lab__blob lab__blob--a" aria-hidden="true" />
      <div className="lab__blob lab__blob--b" aria-hidden="true" />
      <div className="lab__frost" aria-hidden="true" />

      <div className="lab__inner">
        <div className="section-head">
          <div>
            <h2 className="h2">LAB</h2>
            <p className="lab__lead">Мой паттерн, твои руки. Включи и ломай клетки.</p>
          </div>
          <div className="lab__controls">
            <span className="hint">{BPM} BPM · {stepLabel}</span>
            <button type="button" className="btn-outline" onClick={clearAll}>CLEAR</button>
            <button type="button" className="btn-solid" onClick={togglePlay}>{playing ? 'STOP' : 'PLAY'}</button>
          </div>
        </div>

        <div className="seq">
          {grid.map((row, r) => (
            <div key={drumRows[r].name} className="seq__row">
              <span className="seq__name">{drumRows[r].name}</span>
              <div className="seq__cells">
                {row.map((on, c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cell ${on ? 'is-on' : ''} ${c === step ? 'is-now' : ''} ${c % 4 === 0 ? 'is-beat' : ''}`}
                    onClick={() => toggleCell(r, c)}
                    aria-pressed={on}
                    aria-label={`${drumRows[r].name}, шаг ${c + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
