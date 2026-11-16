import { useEffect, useRef } from 'react';

// Свой курсор: кружок, который плавно догоняет мышку.
//  • над ссылками и кнопками он вырастает в кольцо;
//  • над элементом с атрибутом data-cursor="ТЕКСТ" превращается в диск с этой подписью;
//  • элемент с атрибутом data-magnetic «притягивается» к курсору.
// Работает только с мышью (на тачскрине курсора нет) и выключается при «уменьшить движение».
export default function Cursor() {
  const ref = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;

    const el = ref.current;
    const root = document.documentElement;
    root.classList.add('has-cursor'); // по этому классу CSS прячет системный курсор

    let x = -100, y = -100, tx = -100, ty = -100; // текущая и целевая позиция
    let magnet = null; // элемент, который сейчас притянут
    let frame;

    function release() {
      if (magnet) magnet.style.translate = '';
      magnet = null;
    }

    // Смотрим, что лежит под курсором, и подстраиваем его вид.
    function inspect(target, cx, cy) {
      // Подпись
      const labelled = target?.closest('[data-cursor]');
      const text = labelled?.dataset.cursor || '';
      if (labelRef.current.textContent !== text) labelRef.current.textContent = text;
      el.classList.toggle('is-label', Boolean(text));
      el.classList.toggle('is-hover', !text && Boolean(target?.closest('a, button, [role="button"], [tabindex="0"]')));

      // Магнит: сдвигаем элемент на 30% расстояния от его центра до курсора.
      const m = target?.closest('[data-magnetic]') || null;
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = cx - (r.left + r.width / 2);
        const dy = cy - (r.top + r.height / 2);
        m.style.translate = `${(dx * 0.3).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
      }
    }

    function onMove(e) {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add('is-visible');
      inspect(e.target instanceof Element ? e.target : null, tx, ty);
    }

    // При скролле мышка стоит на месте, а страница под ней уезжает.
    // Событие pointermove при этом не приходит, поэтому сами спрашиваем у браузера,
    // какой элемент теперь под курсором. Иначе подпись «PLAY» ехала бы за тобой по всему сайту.
    function onScroll() {
      if (tx < 0) return; // мышкой ещё не двигали
      inspect(document.elementFromPoint(tx, ty), tx, ty);
    }

    function onLeave() {
      el.classList.remove('is-visible');
      release();
    }

    function tick() {
      // Каждый кадр проходим 22% пути до мышки — получается мягкое «догоняние».
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
      root.classList.remove('has-cursor');
      release();
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor__dot"><span className="cursor__label" ref={labelRef} /></span>
    </div>
  );
}
