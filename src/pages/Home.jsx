import { useState } from 'react';
import SideNav from '../components/SideNav.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Albums from '../components/Albums.jsx';
import Sound from '../components/Sound.jsx';
import Lab from '../components/Lab.jsx';
import Footer from '../components/Footer.jsx';

// Home — главная страница. Он держит один «скроллер» на весь экран,
// внутри которого 6 секций по 100% высоты. CSS scroll-snap сам доводит скролл.
export default function Home() {
  const [active, setActive] = useState(0);

  // При скролле считаем, какая секция сейчас на экране — для боковой навигации.
  function handleScroll(e) {
    const el = e.currentTarget;
    const index = Math.round(el.scrollTop / Math.max(1, el.clientHeight));
    if (index !== active) setActive(index);
  }

  return (
    <div className="scroller" onScroll={handleScroll}>
      <SideNav active={active} />
      <Hero />
      <About />
      <Albums />
      <Sound />
      <Lab />
      <Footer />
    </div>
  );
}
