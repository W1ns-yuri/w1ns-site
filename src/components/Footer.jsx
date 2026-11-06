import { channels } from '../data/content.js';

const marquee = 'TRAP / SUPERTRAP / LOVE MUSIC / AMBIENT / DNB / EXPERIMENTAL / W1NS / '.repeat(2);

// Футер на весь экран в стиле HUD: бегущая строка, кнопки со срезанными углами, радар.
export default function Footer() {
  return (
    <footer id="contacts" className="section footer">
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          <span>{marquee}</span>
          <span>{marquee}</span>
        </div>
      </div>

      <div className="footer__grid">
        <div className="footer__left">
          <div className="footer__status">
            <span>// CONTACT.SYS</span>
            <span>SIGNAL <span className="blink-accent">● ONLINE</span></span>
          </div>
          <div className="hud-links">
            {channels.map((ch) => (
              <a key={ch.label} href={ch.href} className="hud-link">
                <span>{ch.label}</span>
                <span className="hud-link__num">{ch.num} →</span>
              </a>
            ))}
          </div>
          <div className="footer__booking">
            <div className="booking">
              <span className="booking__label">BOOKING / КОЛЛАБЫ</span>
              <span>[твой email или telegram]</span>
            </div>
            <div className="barcode-box">
              <span className="barcode" aria-hidden="true" />
              W1-EOF
            </div>
          </div>
        </div>

        <div className="footer__right">
          <div className="footer__meta">
            <span>SCAN</span>
            <span>FREQ 49 Hz</span>
            <span>808 / SUB</span>
            <span className="footer__kanji" aria-hidden="true">冷</span>
          </div>
          <div className="radar" aria-hidden="true">
            <span className="radar__ring radar__ring--1" />
            <span className="radar__ring radar__ring--2" />
            <span className="radar__cross radar__cross--v" />
            <span className="radar__cross radar__cross--h" />
            <span className="radar__sweep" />
            <span className="radar__dot radar__dot--1" />
            <span className="radar__dot radar__dot--2" />
          </div>
        </div>

        <div className="footer__bottom">
          <a href="#hero" className="back-top">↑ BACK TO TOP</a>
          <span className="copyright">© 2026 W1NS · ALL BEATS COLD</span>
          <span className="footer__giant" aria-hidden="true">W1NS</span>
        </div>
      </div>
    </footer>
  );
}
