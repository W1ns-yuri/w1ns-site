import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SideNav from '../components/SideNav.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Albums from '../components/Albums.jsx';
import Sound from '../components/Sound.jsx';
import Handoff from '../components/Handoff.jsx';
import Lab from '../components/Lab.jsx';
import Footer from '../components/Footer.jsx';
import LiveEq from '../components/LiveEq.jsx';
import { initHome } from '../animations/homeScroll.js';
import { usePulse } from '../hooks/usePulse.js';
import { playFile, stopFile } from '../audio/engine.js';
import { releases } from '../data/content.js';

const HERO_TRACK = '/audio/escape/escape.mp3';

// Home — главная страница: 6 секций по 100% высоты экрана.
// Плавный скролл и все анимации от скролла живут в src/animations/homeScroll.js.
export default function Home() {
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);

  // useLayoutEffect, а не useEffect: запускается до того, как браузер нарисует кадр,
  // поэтому GSAP успевает спрятать элементы и они не «мигают» перед анимацией.
  // Возвращаемая функция — уборка: при уходе со страницы всё откатывается.
  useLayoutEffect(() => initHome(rootRef.current, setActive), []);

  // Пишет громкость баса/середины/верха в CSS-переменные на корне страницы.
  usePulse(rootRef);

  // Играет ли бит из hero. Плеер на сайте один: если его остановит что-то ещё
  // (например, превью трека в Albums), сработает onStop и кнопка вернётся в «выкл».
  const [sound, setSound] = useState(false);
  function toggleSound() {
    if (sound) {
      stopFile();
    } else {
      playFile(HERO_TRACK, null, { loop: true, onStop: () => setSound(false) });
      setSound(true);
    }
  }
  // Ушли с главной — выключаем звук.
  useEffect(() => stopFile, []);

  return (
    <div className="home" ref={rootRef}>
      <SideNav active={active} />
      <Hero sound={sound} onToggleSound={toggleSound} />
      <About />
      <Albums />
      <Sound />
      <Handoff />
      <Lab heroPlaying={sound} />
      <Footer />

      {/* «Летуны»: копии обложек, которые при скролле вылетают из текста About и ложатся стопкой в Albums.
          Они висят поверх страницы (position: fixed), а двигает их pillsFly в homeScroll.js. */}
      <div className="flyers" aria-hidden="true">
        {releases.map((r) => (
          <span key={r.id} className="flyer" style={{ backgroundImage: `url(${r.cover})` }} />
        ))}
      </div>

      {/* Плашка звука: видна, пока играет бит, чтобы его можно было выключить с любого места страницы */}
      <button type="button" className={`soundpill ${sound ? 'is-on' : ''}`} onClick={toggleSound} tabIndex={sound ? 0 : -1} aria-label="Выключить бит" data-cursor="СТОП">
        <LiveEq live={sound} count={5} />
        <span>ESCAPE</span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
      </button>
    </div>
  );
}
