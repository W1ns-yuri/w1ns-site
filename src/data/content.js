// Все тексты и данные сайта в одном месте.
// Хочешь поменять название трека или текст — меняй здесь, компоненты трогать не нужно.

export const sections = [
  { id: 'hero', label: 'HERO' },
  { id: 'about', label: 'ABOUT' },
  { id: 'albums', label: 'ALBUMS' },
  { id: 'sound', label: 'SOUND' },
  { id: 'lab', label: 'LAB' },
  { id: 'contacts', label: 'END' },
];

export const topNav = [
  { href: '#albums', label: 'РЕЛИЗЫ' },
  { href: '#about', label: 'ОБО МНЕ' },
  { href: '#sound', label: 'ЗВУК' },
  { href: '#lab', label: 'LAB' },
  { href: '#contacts', label: 'КОНТАКТЫ' },
];

export const releases = [
  {
    id: 'escape',
    title: 'ESCAPE',
    code: 'W1-001',
    type: 'album',
    meta: 'АЛЬБОМ · 5 ТРЕКОВ',
    cover: '/covers/escape.webp',
    page: '/escape',
    tracks: ['Creepy_Night', 'Running_From_Fear', 'Got_Lost', 'Memory', 'Escape'],
  },
  {
    id: 'velvet',
    title: 'VELVET',
    code: 'W1-002',
    type: 'album',
    meta: 'АЛЬБОМ · 7 ТРЕКОВ',
    cover: '/covers/velvet.webp',
    tracks: ['[Трек 1]', '[Трек 2]', '[Трек 3]', '[Трек 4]', '[Трек 5]', '[Трек 6]', '[Трек 7]'],
  },
  {
    id: 'scorpion',
    title: 'SCORPION',
    code: 'W1-003',
    type: 'pack',
    meta: 'SAMPLE PACK · 100',
    cover: '/covers/scorpion.webp',
    totalSamples: 100,
  },
];

// Для сэмпл-пака показываем часть сэмплов, остальное — плиткой «+N».
const kinds = ['808', 'KICK', 'MELODY', 'HI-HAT', 'PERC', 'VOX', 'FX', 'SNARE'];
export const packPreview = Array.from({ length: 23 }, (_, i) =>
  `${kinds[i % kinds.length]} · ${String(i + 1).padStart(3, '0')}`
);

export const timeline = [
  { year: '9 класс', what: 'Спор с другом: первый бит за 3 дня' },
  { year: 'потом', what: 'Переход с Ableton на FL Studio' },
  { year: 'сейчас', what: 'React днём, биты по вечерам' },
];

export const stack = ['FL STUDIO', 'REACT', 'JS', 'SUPABASE', '808', 'SERUM'];

export const genres = [
  { name: 'TRAP', bpm: '130–150 BPM', desc: 'База: тяжёлый 808, хэты с роллами, мрачные мелодии.', a: '#1D4F86', b: '#5B9BD5' },
  { name: 'SUPERTRAP', bpm: '140–160 BPM', desc: 'Плотнее и быстрее трапа: больше слоёв и энергии.', a: '#5B9BD5', b: '#A8E6CF' },
  { name: 'LOVE MUSIC', bpm: 'медленно', desc: 'Мягкие аккорды и тёплый бас, когда хочется чувств, а не агрессии.', a: '#7DF9D4', b: '#1D4F86' },
  { name: 'AMBIENT', bpm: '60–90 BPM', desc: 'Воздух, пэды и тишина между ударами.', a: '#A8E6CF', b: '#EAF3F6' },
  { name: 'DNB', bpm: '170–175 BPM', desc: 'Быстрые брейки и рычащий бас, чтобы разогнать пульс.', a: '#0A2FB8', b: '#00C2FF' },
  { name: 'EXPERIMENTAL', bpm: 'без правил', desc: 'Этника, оркестр, странные паттерны. Бит как кино или шоу.', a: '#04145C', b: '#7DF9D4' },
];

export const channels = [
  { label: 'YOUTUBE', num: 'CH.01', href: '#' },
  { label: 'SOUNDCLOUD', num: 'CH.02', href: '#' },
  { label: 'TELEGRAM', num: 'CH.03', href: '#' },
  { label: 'INSTAGRAM', num: 'CH.04', href: '#' },
];

// Стартовый паттерн драм-машины: номера шагов (0–15), где звучит инструмент.
export const drumRows = [
  { name: 'KICK', steps: [0, 7, 10] },
  { name: 'CLAP', steps: [4, 12] },
  { name: 'HI-HAT', steps: [0, 2, 4, 6, 8, 10, 12, 13, 14, 15] },
  { name: '808', steps: [0, 3, 7, 10, 11] },
];
