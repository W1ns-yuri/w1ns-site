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
