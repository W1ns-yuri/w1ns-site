// Простой звуковой движок на Web Audio API — без библиотек.
// Все звуки синтезируются кодом, файлов нет. Позже заменим превью на настоящие mp3.

let ctx = null;

// Браузер разрешает звук только после клика пользователя,
// поэтому AudioContext создаём лениво — при первом вызове.
export function getAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noise(dur) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

// row: 0 — kick, 1 — clap, 2 — hi-hat, 3 — 808
export function hit(row) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.connect(ctx.destination);

  if (row === 0) {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.34);
  } else if (row === 3) {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(72, t);
    o.frequency.exponentialRampToValueAtTime(49, t + 0.08);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.92);
  } else {
    const n = noise(row === 1 ? 0.2 : 0.05);
    const f = ctx.createBiquadFilter();
    if (row === 1) {
      f.type = 'bandpass';
      f.frequency.value = 1500;
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else {
      f.type = 'highpass';
      f.frequency.value = 7500;
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    }
    n.connect(f);
    f.connect(g);
    n.start(t);
  }
}

function pluck(freq) {
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.value = freq;
  f.type = 'lowpass';
  f.frequency.setValueAtTime(2400, t);
  f.frequency.exponentialRampToValueAtTime(400, t + 0.3);
  g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.37);
}

// Превью-заглушка трека: короткая мелодия + 808. seed меняет тональность.
let stubTimer = null;
export function startPreview(seed) {
  if (!ctx) return;
  stopPreview();
  const root = 110 * Math.pow(2, ((seed * 5) % 12) / 12);
  const seq = [0, 3, 7, 10, 12, 10, 7, 3];
  let k = 0;
  const tick = () => {
    if (k % 4 === 0) hit(3);
    pluck(root * 2 * Math.pow(2, seq[k % 8] / 12));
    k++;
  };
  tick();
  stubTimer = setInterval(tick, 190);
}

export function stopPreview() {
  if (stubTimer) clearInterval(stubTimer);
  stubTimer = null;
}

// ---------------------------------------------------------
// Звуки для страницы ESCAPE
// ---------------------------------------------------------

const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

export function morseCode(word) {
  return word.toUpperCase().split('').map((ch) => MORSE[ch] || '').join(' ');
}

// Морзе в левом ухе (pan = -1), как в начале Creepy_Night.
export function playMorse(word, pan = -1) {
  if (!ctx) return 0;
  const unit = 0.085;
  const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const out = ctx.createGain();
  out.gain.value = 0.18;
  if (panner) { panner.pan.value = pan; out.connect(panner); panner.connect(ctx.destination); }
  else out.connect(ctx.destination);

  let t = ctx.currentTime + 0.05;
  for (const ch of word.toUpperCase()) {
    for (const sym of MORSE[ch] || '') {
      const len = sym === '.' ? unit : unit * 3;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 680;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.005);
      g.gain.setValueAtTime(1, t + len - 0.005);
      g.gain.linearRampToValueAtTime(0, t + len);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + len + 0.01);
      t += len + unit;
    }
    t += unit * 2;
  }
  return t - ctx.currentTime;
}

export function pluckNote(freq) { if (ctx) pluck(freq); }

// Скрип двери: пила через узкий фильтр, частота «гуляет».
export function creak() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(70, t);
  o.frequency.linearRampToValueAtTime(110, t + 0.5);
  o.frequency.linearRampToValueAtTime(60, t + 1.3);
  f.type = 'bandpass'; f.Q.value = 12;
  f.frequency.setValueAtTime(900, t);
  f.frequency.linearRampToValueAtTime(1600, t + 0.6);
  f.frequency.linearRampToValueAtTime(700, t + 1.3);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.35, t + 0.1);
  g.gain.linearRampToValueAtTime(0.001, t + 1.4);
  o.connect(f); f.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 1.45);
}

// Звук разрыва холста.
export function tear() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const n = noise(0.7);
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  f.type = 'bandpass'; f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(600, t + 0.6);
  g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(t);
}

// Птицы в поле: короткие свисты вверх.
export function birds() {
  if (!ctx) return;
  for (let i = 0; i < 7; i++) {
    const t = ctx.currentTime + i * 0.28 + Math.random() * 0.15;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const base = 2200 + Math.random() * 1200;
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.09);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.14);
  }
}

// Дождь (пока включён) и гром.
let rainNodes = null;
export function rain(on) {
  if (!ctx) return;
  if (!on) { if (rainNodes) { rainNodes.src.stop(); rainNodes = null; } return; }
  if (rainNodes) return;
  const src = noise(4);
  src.loop = true;
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  f.type = 'lowpass'; f.frequency.value = 1400;
  g.gain.value = 0.12;
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start();
  rainNodes = { src };
}

export function thunder() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const n = noise(3);
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(80, t + 2.8);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.9, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, t + 3);
  n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(t);
}

// Сверчки ночного леса: высокий тон, который «стрекочет» через модуляцию громкости.
let crickets = null;
export function forest(on) {
  if (!ctx) return;
  if (!on) { if (crickets) { crickets.forEach((n) => n.stop()); crickets = null; } return; }
  if (crickets) return;
  const tone = ctx.createOscillator();
  const amp = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  tone.frequency.value = 4300;
  amp.gain.value = 0;
  lfo.type = 'square'; lfo.frequency.value = 28;
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain); lfoGain.connect(amp.gain);
  tone.connect(amp); amp.connect(ctx.destination);
  tone.start(); lfo.start();
  crickets = [tone, lfo];
}
