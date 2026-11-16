import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

// =========================================================
// Плавный скролл (Lenis) + анимации главной от скролла (GSAP ScrollTrigger).
//
// Lenis перехватывает колесо мыши и прокручивает страницу «с инерцией».
// ScrollTrigger следит за скроллом и запускает анимации, когда секция
// доходит до нужного места. scrub: true значит «анимация идёт ровно вместе
// со скроллом»: крутишь назад — она отматывается назад.
//
// Возвращает функцию очистки: её вызывает useLayoutEffect при уходе со страницы.
// =========================================================
export function initHome(root, onSection) {
  // --- 1. Плавный скролл ---
  const lenis = new Lenis({ duration: 1.15, anchors: true });
  // Говорим ScrollTrigger'у «скролл изменился» на каждом шаге Lenis.
  lenis.on('scroll', ScrollTrigger.update);
  // Lenis крутится в том же цикле кадров, что и GSAP: так они не рассинхронятся.
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // gsap.context собирает всё созданное внутри, чтобы потом одной командой откатить.
  const ctx = gsap.context(() => {
    const q = gsap.utils.selector(root);

    // Всё остальное только для тех, кто не просил «меньше движения» в системе.
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      heroOut(q);
      aboutIn(q);
      albumsDeal(q);
      soundIn(q);
      labIn(q);
      footerIn(q);
    });

  }, root);

  // --- Какая секция на экране → подсветка в боковой навигации.
  // Секция активна, если пересекает середину экрана. Работает и с закреплённой Albums.
  const sections = root.querySelectorAll('.section');
  const updateActive = () => {
    const mid = window.innerHeight / 2;
    sections.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) onSection(i);
    });
  };
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  return () => {
    window.removeEventListener('scroll', updateActive);
    ctx.revert();
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}

// Общие настройки «проявиться один раз, когда секция заехала на экран».
const once = (trigger, start = 'top 70%') => ({ trigger, start, toggleActions: 'play none none none' });
const EASE = 'expo.out';

// --- HERO: при скролле вниз буквы W1NS улетают вверх с разной скоростью
// и чуть разъезжаются, интерфейс уходит, экран темнеет.
function heroOut(q) {
  const hero = q('.hero')[0];
  const tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  const spread = [-1.5, -0.5, 0.5, 1.5]; // W и S разъезжаются сильнее, 1 и N меньше
  q('.hero__letter-in').forEach((el, i) => {
    tl.to(el, { yPercent: -35 - i * 12, xPercent: spread[i] * 12, rotate: spread[i] * 3, ease: 'none' }, 0);
  });
  tl.to(q('.hero__top, .hero__widget-wrap'), { y: -120, opacity: 0, ease: 'none' }, 0);
  tl.to(q('.hero__shade'), { opacity: 1, ease: 'none' }, 0);
  // autoAlpha = opacity + visibility. Opacity у подсказки занята мигающей CSS-анимацией,
  // а visibility: hidden прячет её поверх этого.
  tl.to(q('.scroll-hint'), { autoAlpha: 0, duration: 0.1, ease: 'none' }, 0);
}

// --- ABOUT: заголовок проявляется по строкам из-под маски, карточки поднимаются.
function aboutIn(q) {
  const section = q('.about')[0];
  const split = SplitText.create(q('.about__title'), { type: 'lines', mask: 'lines' });
  const tl = gsap.timeline({ scrollTrigger: once(section) });
  tl.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12, ease: EASE })
    .from(q('.about__lead, .about__head .btn-dark'), { opacity: 0, y: 20, duration: 0.8, ease: EASE }, 0.25)
    .from(q('.bento .card'), { opacity: 0, y: 60, duration: 1, stagger: 0.08, ease: EASE }, 0.3);
}

// --- ALBUMS: секция закрепляется, обложки лежат стопкой в центре
// и по мере скролла «раздаются» по местам, как карты.
function albumsDeal(q) {
  const section = q('.albums')[0];
  const covers = q('.cover');
  const wrap = q('.covers')[0];
  const split = SplitText.create(q('.albums .h2'), { type: 'chars', mask: 'chars' });

  // Насколько сдвинуть обложку, чтобы она оказалась в центре ряда.
  const toCenter = (el) => {
    const w = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return w.left + w.width / 2 - (r.left + r.width / 2);
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=90%',
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true, // пересчитать позиции при ресайзе окна
    },
  });
  tl.from(split.chars, { yPercent: 110, stagger: 0.04, duration: 0.5, ease: 'power3.out' }, 0)
    .from(covers, {
      x: (i, el) => toCenter(el),
      y: 80,
      rotate: (i) => [-8, 4, 10][i] ?? 0,
      scale: 0.82,
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.06,
    }, 0)
    .from(q('.albums .hint'), { opacity: 0, duration: 0.3 }, 0.8);
}

// --- SOUND: полосы стекла вырастают снизу, как столбики эквалайзера.
function soundIn(q) {
  const section = q('.sound')[0];
  const split = SplitText.create(q('.sound .h2'), { type: 'chars', mask: 'chars' });
  const tl = gsap.timeline({ scrollTrigger: once(section, 'top 60%') });
  tl.from(split.chars, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: EASE })
    .from(q('.strip'), {
      scaleY: 0,
      transformOrigin: '50% 100%',
      duration: 1.2,
      ease: 'expo.out',
      stagger: { each: 0.07, from: 'random' },
    }, 0.1)
    .from(q('.strip__name, .strip__num'), { opacity: 0, duration: 0.6, stagger: 0.04 }, 0.7);
}

// --- LAB: клетки драм-машины загораются колонками слева направо,
// как будто секвенсор прогоняет первый такт.
function labIn(q) {
  const section = q('.lab')[0];
  const split = SplitText.create(q('.lab .h2'), { type: 'chars', mask: 'chars' });
  const cells = q('.cell');
  const tl = gsap.timeline({ scrollTrigger: once(section, 'top 60%') });
  tl.from(split.chars, { yPercent: 110, duration: 0.9, stagger: 0.05, ease: EASE })
    .from(q('.lab__lead, .lab__controls'), { opacity: 0, y: 16, duration: 0.7, ease: EASE }, 0.2)
    // Только opacity: у клеток в CSS есть transition на transform (отклик на клик),
    // и если GSAP тоже будет двигать transform, они начнут спорить друг с другом.
    .from(cells, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      // Задержка зависит от номера колонки (0–15), а не от порядка в DOM.
      delay: (i) => 0.25 + (i % 16) * 0.04 + Math.floor(i / 16) * 0.02,
    }, 0);
}

// --- FOOTER: контурный W1NS поднимается снизу по буквам, бегущая строка въезжает.
function footerIn(q) {
  const section = q('.footer')[0];
  // Без маски: у огромного контурного текста очень плотная высота строки, маска срезала бы верх букв.
  // Буквы и так прячутся за нижним краем секции (overflow: hidden).
  const split = SplitText.create(q('.footer__giant'), { type: 'chars' });
  const tl = gsap.timeline({ scrollTrigger: once(section, 'top 55%') });
  tl.from(split.chars, { yPercent: 100, duration: 1.4, stagger: 0.08, ease: EASE })
    .from(q('.hud-link'), { opacity: 0, x: -30, duration: 0.8, stagger: 0.06, ease: EASE }, 0.1)
    .from(q('.radar'), { opacity: 0, scale: 0.6, rotate: -90, duration: 1.4, ease: EASE }, 0.1);
}
