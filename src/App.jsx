import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EscapePage from './pages/escape/EscapePage.jsx';
import BeatsPage from './pages/beats/BeatsPage.jsx';
import AboutPage from './pages/about/AboutPage.jsx';
import MoonPage from './pages/release/MoonPage.jsx';
import ScorpionPage from './pages/release/ScorpionPage.jsx';

// Роутер: каждому адресу — своя страница.
// Новую страницу добавляем одной строкой <Route>.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/beats" element={<BeatsPage />} />
      <Route path="/escape" element={<EscapePage />} />
      <Route path="/moon" element={<MoonPage />} />
      <Route path="/scorpion" element={<ScorpionPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
