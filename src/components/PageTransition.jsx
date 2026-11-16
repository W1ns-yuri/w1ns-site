import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Киношный переход между страницами.
// Идея: при клике чёрные полосы (как в кино) съезжаются сверху и снизу,
// закрывают экран, мы меняем страницу, и полосы разъезжаются обратно.
//
// Как устроено:
// 1. TransitionProvider оборачивает всё приложение и рисует «шторку» поверх всех страниц.
// 2. useContext даёт любому компоненту функцию go(to, label) — «уйти на страницу с переходом».
// 3. TransitionLink — обычная ссылка <Link>, но клик идёт через go().

const TransitionContext = createContext(null);

const CLOSE_MS = 700; // столько полосы съезжаются (совпадает с CSS)

export function TransitionProvider({ children }) {
  const [closed, setClosed] = useState(false);
  const [label, setLabel] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const busy = useRef(false); // защита от двойного клика

  function go(to, nextLabel = '') {
    if (busy.current || to === pathname) return;
    // Если человек просит меньше анимаций — просто переходим.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(to);
      return;
    }
    busy.current = true;
    setLabel(nextLabel);
    setClosed(true);
    setTimeout(() => navigate(to), CLOSE_MS);
  }

  // Адрес поменялся → новая страница уже нарисована под шторкой → открываем.
  useEffect(() => {
    if (!busy.current) return;
    const t = setTimeout(() => {
      setClosed(false);
      busy.current = false;
    }, 250);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <TransitionContext.Provider value={go}>
      {children}
      <div className={`curtain ${closed ? 'is-closed' : ''}`} aria-hidden="true">
        <span className="curtain__bar curtain__bar--top" />
        <span className="curtain__bar curtain__bar--bottom" />
        <span className="curtain__label">{label}</span>
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransitionNavigate() {
  return useContext(TransitionContext);
}

// Ссылка с переходом. Ctrl/Cmd+клик по-прежнему открывает новую вкладку.
export function TransitionLink({ to, label, onClick, ...rest }) {
  const go = useTransitionNavigate();
  function handleClick(e) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(to, label);
  }
  return <Link to={to} onClick={handleClick} {...rest} />;
}
