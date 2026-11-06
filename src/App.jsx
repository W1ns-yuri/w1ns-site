import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EscapePage from './pages/escape/EscapePage.jsx';

// Роутер: каждому адресу — своя страница.
// Новую страницу добавляем одной строкой <Route>.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/escape" element={<EscapePage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
