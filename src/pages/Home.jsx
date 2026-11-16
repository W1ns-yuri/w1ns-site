import { useLayoutEffect, useRef, useState } from 'react';
import SideNav from '../components/SideNav.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Albums from '../components/Albums.jsx';
import Sound from '../components/Sound.jsx';
import Lab from '../components/Lab.jsx';
import Footer from '../components/Footer.jsx';
import { initHome } from '../animations/homeScroll.js';

// Home — главная страница: 6 секций по 100% высоты экрана.
// Плавный скролл и все анимации от скролла живут в src/animations/homeScroll.js.
export default function Home() {
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);

  // useLayoutEffect, а не useEffect: запускается до того, как браузер нарисует кадр,
  // поэтому GSAP успевает спрятать элементы и они не «мигают» перед анимацией.
  // Возвращаемая функция — уборка: при уходе со страницы всё откатывается.
  useLayoutEffect(() => initHome(rootRef.current, setActive), []);

  return (
    <div className="home" ref={rootRef}>
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
