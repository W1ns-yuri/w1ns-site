import { useEffect, useMemo, useRef, useState } from 'react';
import SiteNav from '../../components/SiteNav.jsx';
import NextPage from '../../components/NextPage.jsx';
import { usePageMotion } from '../../hooks/usePageMotion.js';
import { beats, licenses, orderLink } from '../../data/content.js';
import '../pages.css';
import './beats.css';

// Секунды → «0:07»
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Все теги из каталога без повторов — из них строятся кнопки фильтра.
const allTags = [...new Set(beats.flatMap((b) => b.tags))];

export default function BeatsPage() {
  const rootRef = useRef(null);
  const audioRef = useRef(null); // один <audio> на всю страницу

  const [tag, setTag] = useState('ВСЕ');
  const [currentId, setCurrentId] = useState(null); // какой бит выбран
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  // useMemo: список пересчитывается только когда меняется фильтр.
  const visible = useMemo(() => (tag === 'ВСЕ' ? beats : beats.filter((b) => b.tags.includes(tag))), [tag]);
  const current = beats.find((b) => b.id === currentId);

  // Уходим со страницы — останавливаем звук.
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio.pause();
  }, []);

  function toggle(beat) {
    const audio = audioRef.current;
    if (beat.id !== currentId) {
      // Новый бит: меняем файл и играем с начала.
      audio.src = beat.src;
      audio.currentTime = 0;
      setTime(0);
      setCurrentId(beat.id);
      audio.play().catch(() => {});
    } else if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  // Клик по волне — перемотка в это место.
  function seek(beat, e) {
    const audio = audioRef.current;
    const box = e.currentTarget.getBoundingClientRect();
    const part = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    if (beat.id !== currentId) toggle(beat);
    audio.currentTime = part * beat.duration;
    setTime(part * beat.duration);
  }

  function playNext() {
    const i = visible.findIndex((b) => b.id === currentId);
    const next = visible[i + 1];
    if (next) toggle(next);
    else setPlaying(false);
  }

  usePageMotion(rootRef, ({ q, gsap, SplitText }) => {
    // Вход: буквы BEATS поднимаются из-под маски, фон проявляется.
    const split = SplitText.create(q('.beats-hero__title'), { type: 'chars', mask: 'chars' });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(q('.beats-hero__bg'), { opacity: 0, scale: 1.2, duration: 2 })
      .from(split.chars, { yPercent: 105, duration: 1.3, stagger: 0.07 }, 0.15)
      .from(q('.beats-hero__side > *'), { opacity: 0, y: 20, duration: 0.9, stagger: 0.08 }, 0.6);

    // Скролл: заголовок уезжает медленнее страницы (параллакс), фон темнеет.
    gsap.timeline({ scrollTrigger: { trigger: q('.beats-hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
      .to(q('.beats-hero__title'), { yPercent: 35, ease: 'none' }, 0)
      .to(q('.beats-hero__bg'), { opacity: 0.25, ease: 'none' }, 0);

    // Строки каталога выезжают по очереди.
    gsap.from(q('.beat'), {
      opacity: 0, y: 40, duration: 0.9, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: q('.catalog')[0], start: 'top 75%' },
    });

    // Лицензии: линии «прочерчиваются», колонки поднимаются.
    gsap.timeline({ scrollTrigger: { trigger: q('.licenses')[0], start: 'top 70%' }, defaults: { ease: 'expo.out' } })
      .from(q('.licenses__title'), { opacity: 0, y: 40, duration: 1 })
      .from(q('.license'), { opacity: 0, y: 50, duration: 1, stagger: 0.1 }, 0.15);
  });

  const progress = current ? time / current.duration : 0;

  return (
    <div className="page beats-page" ref={rootRef}>
      <SiteNav />
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={playNext}
      />

      <section className="beats-hero">
        <div className="beats-hero__bg" aria-hidden="true" />
        <div className="beats-hero__side">
          <p className="beats-hero__lead">
            Биты, которые можно забрать себе. Слушай превью, выбирай лицензию и пиши мне напрямую.
          </p>
          <p className="data">{String(beats.length).padStart(2, '0')} В КАТАЛОГЕ · MOON НА ПОДХОДЕ</p>
        </div>
        <h1 className="beats-hero__title">BEATS</h1>
      </section>

      <section className="catalog" aria-label="Каталог битов">
        <div className="filters" role="group" aria-label="Фильтр по стилю">
          {['ВСЕ', ...allTags].map((t) => (
            <button key={t} type="button" className={`chip ${tag === t ? 'is-on' : ''}`} aria-pressed={tag === t} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
          <span className="data filters__count">{String(visible.length).padStart(2, '0')} / {String(beats.length).padStart(2, '0')}</span>
        </div>

        <ol className="beat-list">
          {visible.map((beat) => {
            const isCurrent = beat.id === currentId;
            const isPlaying = isCurrent && playing;
            return (
              <li key={beat.id} className={`beat ${isCurrent ? 'is-current' : ''}`}>
                <button type="button" className="beat__play" onClick={() => toggle(beat)} aria-label={`${isPlaying ? 'Пауза' : 'Слушать'}: ${beat.title}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    {isPlaying ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5l12 7-12 7z" />}
                  </svg>
                </button>

                <div className="beat__main">
                  <h2 className="beat__title">{beat.title}</h2>
                  <p className="beat__desc">{beat.desc}</p>
                </div>

                <div className="beat__tags data">
                  {beat.tags.join(' · ')}
                  {beat.bpm && <span> · {beat.bpm} BPM</span>}
                  {beat.key && <span> · {beat.key}</span>}
                </div>

                {/* Волна — настоящая громкость превью. Клик перематывает. */}
                <div className="wave" onClick={(e) => seek(beat, e)} role="presentation">
                  {beat.peaks.map((p, i) => (
                    <span
                      key={i}
                      className={isCurrent && i / beat.peaks.length < progress ? 'is-played' : ''}
                      style={{ height: `${Math.max(6, p * 100)}%` }}
                    />
                  ))}
                </div>

                <span className="data beat__time">{isCurrent ? fmt(time) : fmt(beat.duration)}</span>
                <a className="btn btn--ghost beat__buy" href={orderLink()}>ХОЧУ ЭТОТ БИТ</a>
              </li>
            );
          })}
        </ol>
        <p className="catalog__note data">ПРЕВЬЮ ПО 30 СЕКУНД · ПОЛНЫЕ ВЕРСИИ ПОСЛЕ ПОКУПКИ</p>
      </section>

      <section className="licenses" aria-label="Лицензии">
        <h2 className="licenses__title">Три способа<br />забрать бит</h2>
        <div className="licenses__grid">
          {licenses.map((l) => (
            <article key={l.id} className="license">
              <h3 className="license__name">{l.name}</h3>
              <p className="license__price">{l.price ?? 'цена по запросу'}</p>
              <ul className="license__points">
                {l.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <a className="btn btn--light" href={orderLink()}>НАПИСАТЬ И ДОГОВОРИТЬСЯ</a>
      </section>

      <NextPage to="/escape" title="ESCAPE" hint="ЭТИ БИТЫ — САУНДТРЕК К ФИЛЬМУ. СМОТРЕТЬ" />

      {/* Плеер внизу: появляется, когда выбран бит */}
      <div className={`dock ${current ? 'is-open' : ''}`} aria-hidden={!current}>
        {current && (
          <>
            <button type="button" className="dock__play" onClick={() => toggle(current)} aria-label={playing ? 'Пауза' : 'Играть'}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5l12 7-12 7z" />}
              </svg>
            </button>
            <div className="dock__info">
              <span className="dock__title">{current.title}</span>
              <span className="data">{current.release} · {fmt(time)} / {fmt(current.duration)}</span>
            </div>
            <div className="dock__bar" onClick={(e) => seek(current, e)} role="presentation">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <a className="btn btn--light" href={orderLink()}>ХОЧУ ЭТОТ БИТ</a>
          </>
        )}
      </div>
    </div>
  );
}
