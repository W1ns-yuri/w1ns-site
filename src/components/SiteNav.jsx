import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { siteNav } from '../data/content.js';
import { TransitionLink } from './PageTransition.jsx';

// Шапка внутренних страниц: логотип ведёт на главную, справа меню.
// useLocation говорит, на какой мы странице, чтобы подсветить её пункт.
export default function SiteNav() {
  const { pathname } = useLocation();

  // Логотип виден только в самом верху страницы: ниже он наезжал бы на контент.
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header>
      <TransitionLink to="/" label="W1NS" className={`logo sitenav-logo ${atTop ? '' : 'is-hidden'}`}>
        <span className="logo__name">W1NS®</span>
        <span className="logo__sub">BEATMAKER / FL STUDIO</span>
      </TransitionLink>
      <nav className="topnav sitenav-menu" aria-label="Навигация по сайту">
        {siteNav.map((item) => (
          <TransitionLink
            key={item.href}
            to={item.href}
            label={item.label}
            className={pathname === item.href ? 'is-current' : ''}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            {item.label}
          </TransitionLink>
        ))}
      </nav>
    </header>
  );
}
