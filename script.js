// Oddiy zarracha fizikasi bilan “fountain” (favvora) effekti
const stage   = document.querySelector('.stage');
const heart   = document.getElementById('heart');
const emitter = document.getElementById('emitter');

// Sozlamalar
const CFG = {
  rate: 14,          // sekundiga nechta zarracha (taxminiy)
  spreadDeg: 80,     // otilish burchagi tarqalishi (gradus)
  baseAngleDeg: -90, // asosiy yo‘nalish: yuqoriga
  speedMin: 2.2,     // boshlang'ich tezlik (px/frame)
  speedMax: 5.0,
  gravity: 0.18,     // pastga tortish (px/frame^2)
  lifeMin: 700,      // umr (ms)
  lifeMax: 1400,
  sizeMin: 6,        // mini yurak o‘lchami (px)
  sizeMax: 14,
  opacityStart: 1,
  opacityEnd: 0,     // asta so‘nib yo‘qoladi
};

// Emitter koordinatasini olish (stage ga nisbatan)
function getEmitterPos() {
  const sRect = stage.getBoundingClientRect();
  const eRect = emitter.getBoundingClientRect();
  return {
    x: eRect.left - sRect.left + eRect.width / 2,
    y: eRect.top  - sRect.top  + eRect.height / 2,
  };
}

// Foydali random funksiyalar
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// Zarrachani yaratish
function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';

  // Mini-yurak nodi (visual)
  const heartNode = document.createElement('div');
  heartNode.className = 'mini-heart';
  const size = randInt(CFG.sizeMin, CFG.sizeMax);
  heartNode.style.setProperty('--s', size + 'px');

  // Rang turlicha bo‘lsin: asosiy rang atrofida gradientli effekt
  // oddiy: bir xil rangdan 2-3 soya
  const tint = ['#e63946','#ff4d6d','#d7263d','#ff2d55'][randInt(0,3)];
  heartNode.style.setProperty('--c', tint);

  p.appendChild(heartNode);
  stage.appendChild(p);

  const origin = getEmitterPos();

  // Boshlang'ich holat
  let x = origin.x, y = origin.y;

  // Burchak: -90° (yuqoriga) atrofida tarqalish
  const half = CFG.spreadDeg / 2;
  const angleDeg = CFG.baseAngleDeg + rand(-half, half);
  const angle = angleDeg * Math.PI / 180;

  // Tezlik
  const speed = rand(CFG.speedMin, CFG.speedMax);
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed; // yuqoriga salbiy bo‘lishi mumkin, ammo biz y+ pastga, shuning uchun bu mos

  // Umr va opasiti
  const life = rand(CFG.lifeMin, CFG.lifeMax);
  const born = performance.now();

  function frame(t) {
    const age = t - born;
    if (age >= life) {
      p.remove();
      return;
    }

    // Harakat (oddiy fizika)
    vy += CFG.gravity; // pastga tortish
    x += vx;
    y += vy;

    // Opasiti interpolyatsiya
    const k = age / life;
    const opacity = CFG.opacityStart + (CFG.opacityEnd - CFG.opacityStart) * k;

    p.style.transform = `translate(${x}px, ${y}px) rotate(${angleDeg + k*180}deg)`;
    p.style.opacity = opacity;

    requestAnimationFrame(frame);
  }

  // Boshlang'ich joylashuv
  p.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(frame);
}

// Avtomatik generator (interval emas — barqarorlik uchun rAF + akkumul.)
let lastTime = 0;
let acc = 0; // accumulator
function loop(t) {
  if (!lastTime) lastTime = t;
  const dt = (t - lastTime) / 1000; // sekund
  lastTime = t;

  acc += dt * CFG.rate; // sekundiga CFG.rate dona
  while (acc >= 1) {
    createParticle();
    acc -= 1;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Qo‘shimcha: click qilganda “burst” (ko‘proq yurakcha) chiqarish
heart.addEventListener('click', () => {
  for (let i = 0; i < 30; i++) {
    setTimeout(createParticle, i * 8);
  }
});
