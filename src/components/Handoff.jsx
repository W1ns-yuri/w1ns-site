import { handoff } from '../data/content.js';

// Перебивка между Sound и Lab: огромная строка едет вбок вместе со скроллом
// и по пути «заливается» цветом. Смысл: послушал мои жанры — теперь сыграй сам.
// Движение и заливка — в src/animations/homeScroll.js (функция handoffLine).
export default function Handoff() {
  return (
    <div className="handoff">
      <span className="handoff__label">{handoff.label}</span>
      <p className="handoff__line">{handoff.line}</p>
    </div>
  );
}
