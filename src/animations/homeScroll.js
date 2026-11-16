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
      soundRise(q);
      soundIn(q);
      handoffLine(q);
      labIn(q);
      labOut(q);
      footerIn(q);
      // marqueeSpeed возвращает функцию-уборку; matchMedia вызовет её сам при уходе со страницы.
      return marqueeSpeed(q);
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

// --- HERO → ABOUT: hero замирает на месте (pin), а About наезжает на него снизу, как следующий кадр.
// Пока он наезжает: буквы W1NS разлетаются вверх, интерфейс уходит,
// фон приближается (камера «наезжает» на имя) и темнеет.
function heroOut(q) {
  const hero = q('.hero')[0];
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      pin: true,
      pinSpacing: false, // не добавлять пустое место: следующая секция едет поверх закреплённой
      // Когда About накрыл hero целиком, прячем hero, чтобы браузер не тратил силы на невидимое.
      onLeave: () => hero.classList.add('is-away'),
      onEnterBack: () => hero.classList.remove('is-away'),
    },
  });
  const spread = [-1.5, -0.5, 0.5, 1.5]; // W и S разъезжаются сильнее, 1 и N меньше
  // ВАЖНО: везде fromTo с явным стартом, а не просто to().
  // to() берёт стартовое значение «какое сейчас у элемента». Но при загрузке у hero идёт CSS-интро:
  // буквы ещё внизу, интерфейс ещё прозрачный. Если GSAP замерит их в этот момент,
  // он запомнит «старт = спрятано», и после интро всё пропадёт. Явный старт от этого защищает.

  // Буквы стоят внизу экрана, а About наезжает как раз снизу. Чтобы он их не «съел»,
  // буквы убегают вверх быстрее его края (больше высоты экрана), каждая со своей скоростью.
  q('.hero__letter-in').forEach((el, i) => {
    tl.fromTo(el,
      { y: 0, xPercent: 0, rotate: 0 },
      { y: () => -window.innerHeight * (1.08 + i * 0.14), xPercent: spread[i] * 12, rotate: spread[i] * 4, ease: 'none' }, 0);
  });
  tl.fromTo(q('.hero__top, .hero__mid'), { y: 0, opacity: 1 }, { y: -120, opacity: 0, ease: 'none', duration: 0.3 }, 0);
  // GSAP умеет анимировать и CSS-переменные. --zoom читает .hero__bg-wrap (scale: var(--zoom)).
  tl.fromTo(hero, { '--zoom': 1 }, { '--zoom': 1.35, ease: 'none' }, 0);
  tl.fromTo(q('.hero__shade'), { opacity: 0 }, { opacity: 1, ease: 'power1.in' }, 0);
  // autoAlpha = opacity + visibility. Opacity у подсказки занята мигающей CSS-анимацией,
  // а visibility: hidden прячет её поверх этого.
  tl.fromTo(q('.scroll-hint'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1, ease: 'none' }, 0);
}

// --- ABOUT: секция закрепляется, слова абзаца «зажигаются» по мере скролла,
// портрет открывается шторкой снизу вверх.
function aboutIn(q) {
  const section = q('.about')[0];
  const words = SplitText.create(q('.about__text'), { type: 'words' }).words;
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top top', end: '+=90%', pin: true, scrub: 0.4 },
  });
  tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.08 }, 0)
    .fromTo(q('.inpill img'), { opacity: 0.25 }, { opacity: 1, ease: 'none', stagger: 0.3 }, 0.8)
    .from(q('.about__photo'), { clipPath: 'inset(100% 0% 0% 0%)', ease: 'power2.out', duration: 1.2 }, 0)
    .from(q('.about__photo img'), { scale: 1.25, ease: 'none', duration: 2.6 }, 0)
    .from(q('.about__foot'), { opacity: 0, y: 20, duration: 0.5 }, '>-0.4');
}

// --- ABOUT → ALBUMS: секция въезжает тёмной (как About), на ней лежит стопка обложек.
// Когда секция закрепилась, из-за стопки кругом «вырывается» ледяной свет,
// и только потом обложки раздаются по местам, как карты.
function albumsDeal(q) {
  const section = q('.albums')[0];
  const covers = q('.cover');
  const wrap = q('.covers')[0];
  const ice = q('.albums__ice')[0];
  const split = SplitText.create(q('.albums .h2'), { type: 'chars', mask: 'chars' });

  // Насколько сдвинуть обложку, чтобы она оказалась в центре ряда.
  const toCenter = (el) => {
    const w = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return w.left + w.width / 2 - (r.left + r.width / 2);
  };

  // Круг света: центр — середина ряда обложек (там лежит стопка).
  // open = false → радиус 0 (света нет), open = true → радиус до самого дальнего угла секции.
  const iris = (open) => {
    const s = section.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const cx = w.left + w.width / 2 - s.left;
    const cy = w.top + w.height / 2 - s.top;
    const r = open ? Math.hypot(Math.max(cx, s.width - cx), Math.max(cy, s.height - cy)) : 0;
    return `circle(${Math.ceil(r)}px at ${Math.round(cx)}px ${Math.round(cy)}px)`;
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=150%',
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true, // пересчитать позиции при ресайзе окна
    },
  });
  tl.fromTo(ice, { clipPath: () => iris(false) }, { clipPath: () => iris(true), duration: 0.9, ease: 'power2.in' }, 0)
    .from(covers, {
      x: (i, el) => toCenter(el),
      y: 80,
      rotate: (i) => [-8, 4, 10][i] ?? 0,
      scale: 0.82,
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.06,
    }, 0.55)
    .from(split.chars, { yPercent: 110, stagger: 0.04, duration: 0.5, ease: 'power3.out' }, 0.75)
    .from(q('.albums .hint'), { opacity: 0, duration: 0.3 }, 1.4)
    // Пустой отрезок в конце: обложки уже на местах, а секция ещё закреплена.
    // Без него раздача заканчивалась бы ровно в момент, когда секция уезжает, и альбомы некогда было бы рассмотреть.
    .to({}, { duration: 0.6 });
}

// --- ALBUMS → SOUND: пока Albums уезжает вверх, по льду снизу поднимаются тёмные столбики
// разной высоты, как эквалайзер, и смыкаются в сплошную тьму секции Sound.
function soundRise(q) {
  const bars = q('.eqrise span');
  // Задержки подобраны вручную, чтобы соседние столбики были разной высоты (не лесенкой).
  const delays = [0.3, 0.05, 0.42, 0.18, 0.5, 0.1, 0.36, 0, 0.26, 0.46, 0.14, 0.4, 0.04, 0.3, 0.2, 0.5, 0.08, 0.38, 0.16, 0.28];
  const tl = gsap.timeline({
    scrollTrigger: { trigger: q('.sound')[0], start: 'top bottom', end: 'top 28%', scrub: 0.3 },
  });
  bars.forEach((bar, i) => {
    tl.to(bar, { scaleY: 1, duration: 0.5, ease: 'power1.in' }, delays[i % delays.length]);
  });
}

// --- SOUND: полосы стекла вырастают снизу, как столбики эквалайзера.
function soundIn(q) {
  const section = q('.sound')[0];
  const split = SplitText.create(q('.sound .h2'), { type: 'chars', mask: 'chars' });
  const tl = gsap.timeline({ scrollTrigger: once(section, 'top 60%') });
  tl.from(split.chars, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: EASE })
    .from(q('.sound .hint'), { opacity: 0, duration: 0.6 }, 0.3)
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

// --- SOUND → LAB: строка «теперь твоя очередь» едет справа налево вместе со скроллом
// и заливается цветом. Передаём инструмент гостю.
function handoffLine(q) {
  const box = q('.handoff')[0];
  const line = q('.handoff__line')[0];
  const tl = gsap.timeline({
    scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: 0.4, invalidateOnRefresh: true },
  });
  tl.fromTo(line,
    { x: () => window.innerWidth * 0.35 },
    // Конец пути: правый край строки останавливается на 70% ширины экрана.
    { x: () => -(line.offsetWidth - window.innerWidth * 0.7), ease: 'none', duration: 1 }, 0)
    .fromTo(line, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', duration: 0.55 }, 0.2);
}

// --- LAB → FOOTER: Lab замирает, чуть уменьшается и гаснет, а чёрный футер наезжает на него, как финальные титры.
function labOut(q) {
  const section = q('.lab')[0];
  gsap.to(q('.lab__inner'), {
    scale: 0.92,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true, pin: true, pinSpacing: false },
  });
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

// --- Бегущая строка в футере: чем быстрее скроллишь, тем быстрее она едет и сильнее наклоняется.
// getAnimations() отдаёт CSS-анимацию элемента как объект, у которого можно менять скорость (playbackRate).
function marqueeSpeed(q) {
  const track = q('.marquee__track')[0];
  const anim = track.getAnimations()[0];
  if (!anim) return;
  const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3.out' });
  let rate = 1;
  ScrollTrigger.create({
    trigger: q('.footer')[0],
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity(); // пикселей в секунду, со знаком
      rate = 1 + Math.min(6, Math.abs(v) / 250);
      skewTo(gsap.utils.clamp(-18, 18, v / -90));
    },
  });
  // Скорость плавно возвращается к обычной, когда скролл остановился.
  const settle = () => {
    rate += (1 - rate) * 0.06;
    anim.playbackRate = rate;
    if (Math.abs(rate - 1) < 0.02) skewTo(0);
  };
  gsap.ticker.add(settle);
  return () => gsap.ticker.remove(settle);
}
