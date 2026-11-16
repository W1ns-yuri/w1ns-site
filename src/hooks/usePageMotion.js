import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Общий хук для внутренних страниц: включает плавный скролл (Lenis)
// и запускает анимации страницы (GSAP).
//
// Использование:
//   const ref = useRef(null);
//   usePageMotion(ref, ({ q, gsap, SplitText }) => { ...анимации... });
//
// q('.класс') ищет элементы только внутри этой страницы.
// Анимации не запускаются, если в системе включено «уменьшить движение».
// При уходе со страницы всё само откатывается (ctx.revert).
export function usePageMotion(ref, animate) {
  useLayoutEffect(() => {
    const lenis = new Lenis({ duration: 1.15, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        animate({ q: gsap.utils.selector(ref.current), gsap, SplitText, ScrollTrigger });
      });
    }, ref);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
    // Анимации настраиваются один раз при появлении страницы.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
