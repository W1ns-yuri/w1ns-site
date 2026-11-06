import { useState } from 'react';
import { Link } from 'react-router-dom';
import { releases, packPreview } from '../data/content.js';
import { getAudio, startPreview, stopPreview, playFile } from '../audio/engine.js';

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
      <div className="albums__glow albums__glow--a" aria-hidden="true" />
      <div className="albums__glow albums__glow--b" aria-hidden="true" />

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
              style={{ backgroundImage: `url(${r.cover})` }}
              onClick={() => toggle(r.id)}
              aria-pressed={openId === r.id}
              aria-label={`Открыть ${r.title}`}
            >
              <span className="cover__shade" aria-hidden="true" />
              <span className="cover__code">{r.code}</span>
              <span className="cover__text">
                <span className="cover__title">{r.title}</span>
                <span className="cover__meta">{r.meta}</span>
              </span>
            </button>
          ))}
        </div>

        {open && (
          <div className="tracklist">
            <div className="tracklist__head">
              <span>{open.type === 'pack' ? `${open.title} — SAMPLE PACK · ${open.totalSamples}` : `${open.title} — TRACKLIST`}</span>
              {open.page ? <Link to={open.page} className="tracklist__link">ОТКРЫТЬ ФИЛЬМ-АЛЬБОМ →</Link> : <span>HOVER = PREVIEW</span>}
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
                    <span className="track__meta">[BPM] · [тон]</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
