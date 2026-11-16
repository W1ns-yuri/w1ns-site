import { TransitionLink } from './PageTransition.jsx';

// Низ внутренней страницы: огромная ссылка «дальше» на следующую страницу.
// Так с любой страницы можно пройти сайт по кругу, не возвращаясь в меню.
export default function NextPage({ to, title, hint }) {
  return (
    <footer className="next">
      <TransitionLink to={to} label={title} className="next__link" data-cursor="ДАЛЬШЕ">
        <span className="next__hint">{hint}</span>
        <span className="next__title">
          <span className="next__title-in">{title}</span>
          <svg className="next__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M5 19L19 5M8 5h11v11" />
          </svg>
        </span>
      </TransitionLink>
      <div className="next__meta">
        <TransitionLink to="/" label="W1NS">← НА ГЛАВНУЮ</TransitionLink>
        <span>© 2026 W1NS · ALL BEATS COLD</span>
      </div>
    </footer>
  );
}
