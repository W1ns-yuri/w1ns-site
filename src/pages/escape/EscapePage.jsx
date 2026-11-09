import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { scenes, morseWord } from './scenes.js';
import { morseCode } from '../../audio/engine.js';
import './escape.css';

// Экраны фильма: титульник, 5 сцен, поле, гроза, титры.
const FRAMES = ['title', ...scenes.map((s) => s.id), 'field', 'storm', 'credits'];

// Морзе «ESCAPE» как массив точек и тире — для визуальной ленты.
const morseSymbols = morseCode(morseWord).split('');

const previewUrl = (i) => `/audio/escape/${scenes[i].id}.mp3`;

export default function EscapePage() {
  const [frame, setFrame] = useState(0);
  const [soundOn, setSoundOn] = useState(false); // браузер даёт звук только после клика
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [torn, setTorn] = useState(false);
  const scrollerRef = useRef(null);
  const audioRef = useRef(null);

  // Номер трека для текущего экрана: экраны 1–5 — это биты 0–4, остальные без музыки.
  const trackIndex = frame >= 1 && frame <= scenes.length ? frame - 1 : -1;

  function goTo(id) {
    const el = document.getElementById(`esc-${id}`);
    if (el && scrollerRef.current) scrollerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }

  // Главная логика: сменился экран — включаем его бит.
  // Бит закончился — листаем на следующий экран, там включится следующий.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!soundOn || trackIndex < 0) { audio.pause(); return; }
    audio.src = previewUrl(trackIndex);
    audio.currentTime = 0;
    setProgress(0);
    setPaused(false);
    audio.play().catch(() => setSoundOn(false));
  }, [trackIndex, soundOn]);

  function handleEnded() {
    goTo(FRAMES[frame + 1]);
  }

  function handleTime(e) {
    const a = e.currentTarget;
    if (a.duration) setProgress(a.currentTime / a.duration);
  }

  function onScroll(e) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollTop / Math.max(1, el.clientHeight));
    if (i !== frame) setFrame(i);
  }

  function start() {
    setSoundOn(true);
    goTo(FRAMES[1]);
  }

  // Кнопка в нижней полосе: включить звук / пауза / продолжить.
  function toggleSound() {
    const audio = audioRef.current;
    if (!soundOn) { setSoundOn(true); return; }
    if (trackIndex < 0) { setSoundOn(false); return; }
    if (audio.paused) { audio.play(); setPaused(false); } else { audio.pause(); setPaused(true); }
  }

  function openDoor() {
    setDoorOpen(true);
    setTimeout(() => goTo('escape'), 1200);
  }

  function breakThrough() {
    if (!torn) setTorn(true);
    setTimeout(() => goTo('field'), torn ? 0 : 900);
  }

  const sceneIndex = Math.min(Math.max(frame, 1), scenes.length);
  const label = frame === 0 ? 'ПРОЛОГ' : frame <= scenes.length ? `СЦЕНА ${String(sceneIndex).padStart(2, '0')} / 05` : frame === FRAMES.length - 1 ? 'ТИТРЫ' : 'ЭПИЛОГ';

  return (
    <div className="esc">
      {/* Плёнка: зерно и сканлайны поверх всего */}
      <div className="esc-grain" aria-hidden="true" />
      <div className="esc-scan" aria-hidden="true" />

      {/* Киношные полосы сверху и снизу */}
      <header className="esc-bar esc-bar--top">
        <Link to="/" className="esc-back">← W1NS</Link>
        <span className="esc-bar__mid">ESCAPE</span>
        <span className="esc-rec"><span className="esc-rec__dot" aria-hidden="true" />{label}</span>
      </header>
      <audio ref={audioRef} onEnded={handleEnded} onTimeUpdate={handleTime} preload="auto" />
      <footer className="esc-bar esc-bar--bottom">
        <span>W1NS × CASSETTE</span>
        <span className="esc-now" aria-live="polite">
          {trackIndex >= 0 && soundOn ? (
            <>
              <span className="esc-now__title">{scenes[trackIndex].num} · {scenes[trackIndex].title}</span>
              <span className="esc-now__track"><span style={{ transform: `scaleX(${progress})` }} /></span>
            </>
          ) : (
            <span className="esc-morse-tiny">{morseCode(morseWord)}</span>
          )}
        </span>
        <button type="button" className="esc-sound" onClick={toggleSound}>
          {!soundOn ? 'ВКЛЮЧИТЬ ЗВУК' : trackIndex < 0 ? 'ЗВУК ВКЛ' : paused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}
        </button>
      </footer>

      <div className="esc-scroller" ref={scrollerRef} onScroll={onScroll}>

        {/* ---------- ПРОЛОГ ---------- */}
        <section id="esc-title" className="esc-frame esc-title">
          <div className="esc-flare" aria-hidden="true" />
          <div className="esc-title__inner">
            <p className="esc-kicker">W1NS × CASSETTE представляют</p>
            <h1 className="esc-glitch" data-text="ESCAPE">ESCAPE</h1>
            <p className="esc-tagline">фильм, который слушают</p>
            <div className="esc-morse" aria-label="ESCAPE азбукой Морзе">
              {morseSymbols.map((s, i) => (
                <span
                  key={i}
                  className={s === '.' ? 'dot' : s === '-' ? 'dash' : 'gap'}
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
            <button type="button" className="esc-start" onClick={start}>
              <span className="esc-start__ring" aria-hidden="true" />
              СМОТРЕТЬ ФИЛЬМ
            </button>
            <p className="esc-hint">лучше в наушниках · биты листаются сами</p>
          </div>
        </section>

        {/* ---------- 01 Creepy_Night ---------- */}
        <Scene scene={scenes[0]} active={soundOn && trackIndex === 0 && !paused} onPreview={toggleSound} className="esc-night">
          <div className="esc-night__bg" aria-hidden="true" />
          <div className="esc-fireflies" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
          </div>
          <div className="esc-phone" aria-hidden="true">
            <span className="esc-phone__time">03:17</span>
            <span className="esc-phone__msg">НЕТ СЕТИ</span>
            <span className="esc-phone__sub">1 пропущенный · неизвестный</span>
          </div>
        </Scene>

        {/* ---------- 02 Running_From_Fear ---------- */}
        <Scene scene={scenes[1]} active={soundOn && trackIndex === 1 && !paused} onPreview={toggleSound} className="esc-run" shake>
          <div className="esc-siren esc-siren--red" aria-hidden="true" />
          <div className="esc-siren esc-siren--blue" aria-hidden="true" />
          <svg className="esc-ecg" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,100 140,100 170,100 190,40 210,170 230,100 380,100 410,100 430,30 450,180 470,100 600,100 620,100 635,20 650,190 665,100 760,100 775,100 787,15 799,190 811,100 880,100 890,100 898,10 906,195 914,100 960,100 966,10 972,195 978,100 1010,100 1014,5 1018,195 1022,100 1200,100" />
          </svg>
        </Scene>

        {/* ---------- 03 Got_Lost ---------- */}
        <Scene scene={scenes[2]} active={soundOn && trackIndex === 2 && !paused} onPreview={toggleSound} className="esc-lost">
          <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
            <filter id="esc-warp">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3">
                <animate attributeName="baseFrequency" dur="9s" values="0.012 0.04;0.02 0.08;0.012 0.04" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="38" />
            </filter>
          </svg>
          <div className="esc-lost__echoes" aria-hidden="true">
            <span>Creepy_Night</span><span>03:17</span><span>Running_From_Fear</span><span>НЕТ СЕТИ</span><span>[сирена]</span>
          </div>
          <div className="esc-lost__where" aria-hidden="true">ГДЕ Я?</div>
          <div className="esc-compass" aria-hidden="true"><span className="esc-compass__needle" /></div>
        </Scene>

        {/* ---------- 04 Memory ---------- */}
        <Scene scene={scenes[3]} active={soundOn && trackIndex === 3 && !paused} onPreview={toggleSound} className="esc-memory"
          extra={(
            <div className="esc-drop">
              <span className="mono">ДРОП ПЕРЕНЕСЁН НА ВТОРОЙ БАР</span>
              <div className="esc-drop__bars">
                {[0, 1].map((bar) => (
                  <div key={bar} className="esc-drop__bar">
                    {[0, 1, 2, 3].map((b) => (
                      <span key={b} className={bar === 0 && b === 0 ? 'expected' : bar === 1 && b === 0 ? 'real' : ''} />
                    ))}
                  </div>
                ))}
              </div>
              <span className="esc-drop__legend"><i className="expected" /> ждёшь здесь <i className="real" /> приходит здесь</span>
            </div>
          )}
        >
          <div className="esc-memory__glow" aria-hidden="true" />
          <div className="esc-polaroids" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="esc-strings">
            {[164.8, 220, 293.7, 392, 493.9, 659.3].map((f, i) => (
              <span key={f} className="esc-string" aria-hidden="true" />
            ))}
            <span className="esc-strings__hint">проведи по струнам</span>
          </div>
          <button type="button" className={`esc-door ${doorOpen ? 'is-open' : ''}`} onClick={openDoor} aria-label="Открыть дверь дома">
            <span className="esc-door__leaf" />
            <span className="esc-door__light" aria-hidden="true" />
            <span className="esc-door__label">{doorOpen ? 'ВХОД' : 'ОТКРЫТЬ ДВЕРЬ'}</span>
          </button>
        </Scene>

        {/* ---------- 05 Escape: картина ---------- */}
        <section id="esc-escape" className="esc-frame esc-house">
          <div className="esc-house__wall" aria-hidden="true" />
          <div className="esc-house__text">
            <span className="esc-num">05</span>
            <h2 className="esc-scene-title">{scenes[4].title}</h2>
            <p className="esc-lead">{scenes[4].lead}</p>
            <p className="esc-story">{scenes[4].story}</p>
            <div className="esc-drops" aria-hidden="true">
              {[1, 2, 3, 4].map((d) => <span key={d} style={{ '--d': d }}><i /></span>)}
              <em>каждый дроп сильнее</em>
            </div>
            <div className="esc-actions">
              <PreviewButton active={soundOn && trackIndex === 4 && !paused} onClick={toggleSound} />
            </div>
          </div>
          <Subs list={scenes[4].subs} />

          <button type="button" className={`esc-painting ${torn ? 'is-torn' : ''}`} onClick={breakThrough} aria-label="Прорваться сквозь картину">
            <span className="esc-painting__half esc-painting__half--l" />
            <span className="esc-painting__half esc-painting__half--r" />
            <span className="esc-painting__frame" aria-hidden="true" />
            <span className="esc-painting__cta">{torn ? 'ВЫХОД НАЙДЕН →' : 'РАЗБЕЖАТЬСЯ И ПРОРВАТЬСЯ'}</span>
          </button>
        </section>

        {/* ---------- Поле ---------- */}
        <section id="esc-field" className="esc-frame esc-field">
          <div className="esc-field__sky" aria-hidden="true" />
          <div className="esc-field__sun" aria-hidden="true" />
          <div className="esc-field__wheat" aria-hidden="true" />
          <div className="esc-field__birds" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
          </div>
          <div className="esc-field__text">
            <p className="esc-kicker esc-kicker--dark">[поют птицы] · [выдох облегчения]</p>
            <h2 className="esc-field__title">ВЫХОД</h2>
            <p className="esc-field__lead">Он выбрался из кошмара. Пшеничное поле, тишина и снова морзе в левом ухе.</p>
            <p className="esc-morse-line" aria-label="ESCAPE азбукой Морзе">{morseCode(morseWord)}</p>
          </div>
        </section>

        {/* ---------- Гроза ---------- */}
        <section id="esc-storm" className="esc-frame esc-storm is-raining">
          <div className="esc-lightning" aria-hidden="true" />
          <div className="esc-rain" aria-hidden="true">
            {Array.from({ length: 60 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
          </div>
          <div className="esc-storm__text">
            <p className="esc-kicker">[гром] · [дождь]</p>
            <h2 className="esc-storm__title">Буря<br />надвигается</h2>
            <p className="esc-storm__lead">
              От кого он бежал? Что вспоминал? Что это был за дом? Мы не ответим. Финал у каждого свой, и решаешь его ты.
            </p>
            <a href="#esc-credits" className="esc-ghost-btn" onClick={(e) => { e.preventDefault(); goTo('credits'); }}>К ТИТРАМ ↓</a>
          </div>
        </section>

        {/* ---------- Титры ---------- */}
        <section id="esc-credits" className="esc-frame esc-credits">
          <div className="esc-credits__roll">
            <p className="esc-credits__big">ESCAPE</p>
            <dl>
              <dt>Музыка</dt><dd>W1NS · CASSETTE</dd>
              <dt>Концепция</dt><dd>W1NS × CASSETTE</dd>
              <dt>Главный герой</dt><dd>ты</dd>
            </dl>
            <ol className="esc-credits__tracks">
              {scenes.map((s) => <li key={s.id}><span>{s.num}</span>{s.title}</li>)}
            </ol>
            <p className="esc-credits__note">Слушать альбом: [ссылки на площадки]</p>
            <Link to="/" className="esc-ghost-btn">← ВЕРНУТЬСЯ НА W1NS</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Одна сцена-трек: фон и эффекты приходят через children, текст общий.
function Scene({ scene, active, onPreview, className, children, extra, shake }) {
  return (
    <section id={`esc-${scene.id}`} className={`esc-frame esc-scene ${className}`}>
      {children}
      <div className="esc-scene__text">
        <span className="esc-num">{scene.num}</span>
        <h2 className={`esc-scene-title ${shake ? 'is-shaking' : ''}`}>{scene.title}</h2>
        <p className="esc-lead">{scene.lead}</p>
        <p className="esc-story">{scene.story}</p>
        <ul className="esc-tags">{scene.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        {extra}
        <div className="esc-actions">
          <PreviewButton active={active} onClick={onPreview} />
        </div>
      </div>
      <Subs list={scene.subs} />
    </section>
  );
}

function PreviewButton({ active, onClick }) {
  return (
    <button type="button" className={`esc-preview ${active ? 'is-on' : ''}`} onClick={onClick}>
      <svg className="esc-preview__icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {active ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5l12 7-12 7z" />}
      </svg>
      {active ? 'ПАУЗА' : 'СЛУШАТЬ'}
    </button>
  );
}

// Субтитры звуков появляются по очереди.
function Subs({ list }) {
  return (
    <div className="esc-subs" aria-label="Звуки сцены">
      {list.map((s, i) => <span key={s} style={{ animationDelay: `${i * 1.6}s` }}>{s}</span>)}
    </div>
  );
}
