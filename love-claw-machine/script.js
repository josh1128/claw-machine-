// Elina's harder mystery claw machine: gifts and love notes share the same capsules.
const GIFTS = {
  massage: { emoji: '💆‍♀️', name: 'Free Massage', description: 'A relaxing massage from me, whenever you want. You deserve it! 💗', coupon: 'ONE FREE MASSAGE' },
  kiss: { emoji: '💋', name: 'Unlimited Kiss', description: 'All the kisses you want, forever and always. No limits! 💗', coupon: 'UNLIMITED KISSES' },
  dinner: { emoji: '🍜', name: 'Dinner Date', description: 'Pick a restaurant you love. Dinner is on me! 💗', coupon: 'ONE DINNER DATE' },
  boba: { emoji: '🧋', name: 'Bubble Tea', description: 'Your favorite bubble tea, on me! 💗', coupon: 'ONE BUBBLE TEA DATE' }
};

// These are Josh's exact messages transcribed from the screenshots he shared.
// Only his outgoing (blue) messages are included.
const LOVE_MESSAGES = [
  'Obsessed and madly in love',
  'I love how active u are',
  'I love spoiling u with kisses',
  'I love trying new restaurants with u',
  'Just wanted to show u how much I love u',
  'I always love staying up with u',
  'I wanna fall in love with u all over again baby',
  'I love waking up to ur kisses baby'
];


const capsules = [...document.querySelectorAll('[data-capsule]')];
const claw = document.getElementById('claw');
const windowEl = document.getElementById('window');
const statusEl = document.getElementById('status');
const dialog = document.getElementById('win-dialog');
const left = document.getElementById('left');
const right = document.getElementById('right');
const grab = document.getElementById('grab');
let position = 50;
let busy = false;

const deckItems = [
  ...Object.keys(GIFTS).map(key => ({ type: 'gift', key })),
  ...LOVE_MESSAGES.map((_, index) => ({ type: 'message', index }))
];
let deck = [];
function nextSurprise() {
  // Draw without replacement: every gift and message will appear before repeats.
  if (!deck.length) {
    deck = [...deckItems];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  return deck.pop();
}
function move(direction) {
  if (busy || dialog.open) return;
  position = Math.max(10, Math.min(90, position + direction * 4));
  claw.style.left = position + '%';
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function setLocked(value) {
  busy = value;
  [left, right, grab].forEach(button => button.disabled = value);
}
function nearestCapsule() {
  const clawBox = claw.getBoundingClientRect();
  const clawX = clawBox.left + clawBox.width / 2;
  let best = null, distance = Infinity;
  for (const capsule of capsules) {
    const rect = capsule.querySelector('.toy').getBoundingClientRect();
    const d = Math.abs(clawX - (rect.left + rect.width / 2));
    if (d < distance) { distance = d; best = capsule; }
  }
  return { target: best, distance };
}
async function play() {
  if (busy || dialog.open) return;
  setLocked(true);
  // The claw drifts slightly while lowering, so careful timing matters.
  const drift = (Math.random() * 8 - 4);
  const finalPosition = Math.max(10, Math.min(90, position + drift));
  claw.style.left = finalPosition + '%';
  await delay(260);
  const { target, distance } = nearestCapsule();
  const targetWidth = windowEl.clientWidth;
  const perfectTolerance = Math.max(13, targetWidth * .036);
  const maximumTolerance = Math.max(22, targetWidth * .057);
  const aligned = target && distance <= maximumTolerance;
  const chance = distance <= perfectTolerance ? 0.72 : 0.36;
  const caught = aligned && Math.random() < chance;
  const drop = aligned
    ? Math.max(90, target.getBoundingClientRect().top - windowEl.getBoundingClientRect().top - 77)
    : windowEl.clientHeight * .56;
  claw.style.top = (16 + drop) + 'px';
  await delay(770);
  claw.classList.add('closed');
  await delay(310);
  if (caught) target.classList.add('caught');
  claw.style.top = '16px';
  await delay(820);
  claw.classList.remove('closed');
  position = finalPosition;
  if (caught) {
    const prize = nextSurprise();
    if (prize.type === 'gift') showWin(GIFTS[prize.key]);
    else showNote(LOVE_MESSAGES[prize.index]);
    await delay(400);
    target.classList.remove('caught');
  } else {
    // Missed or slipped grabs can be retried for free.
    statusEl.textContent = aligned ? 'It slipped! Try again ♡' : 'Almost! Aim closer and try again ♡';
    windowEl.classList.remove('miss-flash');
    void windowEl.offsetWidth;
    windowEl.classList.add('miss-flash');
    setTimeout(() => windowEl.classList.remove('miss-flash'), 700);
  }
  setLocked(false);
}
function showWin(gift) {
  document.getElementById('modal-top').textContent = '✧ YOU WON! ✧';
  document.getElementById('win-emoji').textContent = gift.emoji;
  document.getElementById('win-title').textContent = gift.name;
  document.getElementById('win-description').textContent = gift.description;
  document.getElementById('win-coupon').textContent = gift.coupon;
  document.getElementById('coupon-label').textContent = 'LOVE COUPON';
  document.getElementById('coupon-footer').textContent = 'Redeem with Josh · No expiration ♡';
  dialog.showModal();
  celebrate();
}
function showNote(message) {
  document.getElementById('modal-top').textContent = '✧ A TEXT FROM JOSH ✧';
  document.getElementById('win-emoji').textContent = '💌';
  document.getElementById('win-title').textContent = 'For you, Elina';
  document.getElementById('win-description').textContent = 'Something I really said, and still mean ♡';
  document.getElementById('coupon-label').textContent = 'FROM OUR MESSAGES';
  document.getElementById('win-coupon').textContent = '“' + message + '”';
  document.getElementById('coupon-footer').textContent = 'Love, Josh ♡';
  dialog.showModal();
  celebrate();
}
function celebrate() {
  const confetti = document.getElementById('confetti');
  confetti.replaceChildren();
  for (let i = 0; i < 33; i++) {
    const particle = document.createElement('span');
    particle.className = 'confetti-piece';
    particle.textContent = ['💗','💕','✦','♡','🌸'][i % 5];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * .7}s`;
    particle.style.animationDuration = `${2 + Math.random() * 2}s`;
    confetti.appendChild(particle);
  }
  setTimeout(() => confetti.replaceChildren(), 4300);
}

left.addEventListener('click', () => move(-1));
right.addEventListener('click', () => move(1));
grab.addEventListener('click', play);
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
document.getElementById('play-again').addEventListener('click', () => dialog.close());
window.addEventListener('keydown', e => {
  if (dialog.open || e.altKey || e.ctrlKey || e.metaKey || ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON') { e.preventDefault(); play(); }
});
