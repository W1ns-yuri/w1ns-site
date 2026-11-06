import { sections } from '../data/content.js';

// Боковая навигация 01–06. mix-blend-mode: difference (в CSS)
// делает её читаемой и на светлых, и на тёмных секциях.
export default function SideNav({ active }) {
  return (
    <nav className="sidenav" aria-label="Секции">
      {sections.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} className={i === active ? 'is-active' : ''}>
          <span className="sidenav__line" />
          {String(i + 1).padStart(2, '0')} {s.label}
        </a>
      ))}
    </nav>
  );
}
