import { useState } from 'react';
import { TransitionLink } from './PageTransition.jsx';
import { releases, packPreview } from '../data/content.js';
import { getAudio, startPreview, stopPreview, playFile } from '../audio/engine.js';

// Наклон обложки за мышкой. Пишем положение курсора на обложке (от -1 до 1)
// в CSS-переменные --tx и --ty, а CSS сам поворачивает её в 3D и двигает блик.
// React при этом ничего не перерисовывает: мы меняем только стиль элемента.
function tilt(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
  e.currentTarget.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
}
function untilt(e) {
  e.currentTarget.style.setProperty('--tx', 0);
  e.currentTarget.style.setProperty('--ty', 0);
}

// Столбики, которыми тьма секции Sound «поднимается» по льду, как эквалайзер.
const RISE_BARS = Array.from({ length: 20 }, (_, i) => i);

// Альбомы: клик по обложке открывает треклист, наведение на трек играет превью.
export default function Albums() {
  const [openId, setOpenId] = useState(null);
  const [hovered, setHovered] = useState(-1);

  const openIndex = releases.findIndex((r) => r.id === openId);
  const open = releases[openIndex];

  function toggle(id) {
    getAudio(); // клик — разрешение браузера на звук
    stopPreview();
    setHovered(-1);
    setOpenId(openId === id ? null : id);
  }

  function enter(i) {
    setHovered(i);
    if (open.previews?.[i]) playFile(open.previews[i]); // настоящий бит
    else startPreview(openIndex * 7 + i);               // пока заглушка
  }

  function leave() {
    setHovered(-1);
    stopPreview();
  }

  return (
    <section id="albums" className="section albums" aria-label="Альбомы">
      {/* Ледяной слой. При скролле GSAP раскрывает его кругом из-за стопки обложек:
          секция въезжает тёмной, а свет «вырывается» из релизов. */}
      <div className="albums__ice" aria-hidden="true">
        <div className="albums__glow albums__glow--a" />
        <div className="albums__glow albums__glow--b" />
      </div>

      <div className="albums__inner">
        <div className="section-head">
          <h2 className="h2">ALBUMS</h2>
          <p className="hint">{open ? 'наведи на трек — заиграет превью' : 'нажми на альбом — откроются треки'}</p>
        </div>

        <div className={`covers ${open ? 'covers--small' : ''}`}>
          {releases.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`cover ${openId === r.id ? 'is-open' : ''} ${open && openId !== r.id ? 'is-dim' : ''}`}
              onClick={() => toggle(r.id)}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              aria-pressed={openId === r.id}
              aria-label={`Открыть ${r.title}`}
              data-cursor={openId === r.id ? 'ЗАКРЫТЬ' : 'ТРЕКИ'}
            >
              {/* Кнопку двигает GSAP (раздача карт), а наклон за мышкой делает внутренний слой:
                  у одного элемента не может быть два разных transform. */}
              <span className="cover__face" style={{ backgroundImage: `url(${r.cover})` }}>
                <span className="cover__shade" aria-hidden="true" />
                <span className="cover__glare" aria-hidden="true" />
                <span className="cover__code">{r.code}</span>
                <span className="cover__text">
                  <span className="cover__title">{r.title}</span>
                  <span className="cover__meta">{r.meta}</span>
                </span>
              </span>
            </button>
          ))}
        </div>

        {open && (
          <div className="tracklist">
            <div className="tracklist__head">
              <span>{open.type === 'pack' ? `${open.title} — SAMPLE PACK · ${open.totalSamples}` : `${open.title} — TRACKLIST`}</span>
              {open.page ? <TransitionLink to={open.page} label={open.title} className="tracklist__link">{open.pageLabel}</TransitionLink> : <span>HOVER = PREVIEW</span>}
            </div>

            {open.type === 'pack' ? (
              <div className="samples">
                {packPreview.map((name, i) => (
                  <div
                    key={name}
                    className={`sample ${hovered === i ? 'is-on' : ''}`}
                    onMouseEnter={() => enter(i)}
                    onMouseLeave={leave}
                  >
                    {name}
                  </div>
                ))}
                <div className="sample sample--more">+{open.totalSamples - packPreview.length} сэмплов</div>
              </div>
            ) : (
              <div className="tracks">
                {open.tracks.map((title, i) => (
                  <div
                    key={i}
                    className={`track ${hovered === i ? 'is-on' : ''}`}
                    data-cursor="ПРЕВЬЮ"
                    onMouseEnter={() => enter(i)}
                    onMouseLeave={leave}
                  >
                    <span className="track__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="track__title">{title}</span>
                    <span className="eq eq--dark" aria-hidden="true">
                      <span style={{ animationDuration: '0.5s' }} />
                      <span style={{ animationDuration: '0.7s' }} />
                      <span style={{ animationDuration: '0.45s' }} />
                      <span style={{ animationDuration: '0.62s' }} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="eqrise" aria-hidden="true">
        {RISE_BARS.map((i) => <span key={i} />)}
      </div>
    </section>
  );
}
