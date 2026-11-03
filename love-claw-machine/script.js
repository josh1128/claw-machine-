// Edit the four gifts and their coupon messages here.
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

const giftTargets = [...document.querySelectorAll('[data-prize]')];
const noteTargets = [...document.querySelectorAll('[data-message-slot]')];
const claw = document.getElementById('claw');
const windowEl = document.getElementById('window');
const statusEl = document.getElementById('status');
const dialog = document.getElementById('win-dialog');
const left = document.getElementById('left');
const right = document.getElementById('right');
const grab = document.getElementById('grab');
const giftsTab = document.getElementById('gifts-tab');
const notesTab = document.getElementById('notes-tab');
let pos = 50;
let busy = false;
let mode = 'gifts';
let collected = new Set();
let discoveredNotes = new Set();
try {
  collected = new Set(JSON.parse(localStorage.getItem('elina-love-claw-collected') || '[]').filter(k => GIFTS[k]));
  discoveredNotes = new Set(JSON.parse(localStorage.getItem('elina-love-claw-notes') || '[]').filter(n => Number.isInteger(n) && n >= 0 && n < LOVE_MESSAGES.length));
} catch (_) { /* Storage can be unavailable in private browsers */ }

// Keep prizes and notes saved privately in this browser; do not display spoilers.
function renderCollection() { /* Surprise gifts are only revealed after a catch. */ }
function switchMode(next) {
  if (busy || dialog.open) return;
  mode = next;
  giftsTab.classList.toggle('active', mode === 'gifts');
  notesTab.classList.toggle('active', mode === 'notes');
  giftsTab.setAttribute('aria-pressed', String(mode === 'gifts'));
  notesTab.setAttribute('aria-pressed', String(mode === 'notes'));
  giftTargets.forEach(el => { el.hidden = mode !== 'gifts'; });
  noteTargets.forEach(el => { el.hidden = mode !== 'notes'; });
  statusEl.textContent = mode === 'gifts' ? 'Catch a sweet prize! ♡' : 'Catch an envelope to read a message from Josh! 💌';
}
function move(direction) {
  if (busy) return;
  pos = Math.max(12, Math.min(88, pos + direction * 8));
  claw.style.left = `${pos}%`;
  statusEl.textContent = 'Looking good! Drop the claw when you’re ready ♡';
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function setLocked(value) {
  busy = value;
  [left, right, grab, giftsTab, notesTab].forEach(b => b.disabled = value);
}
function nearestPrize() {
  const centerX = claw.getBoundingClientRect().left + claw.getBoundingClientRect().width / 2;
  let best = null;
  let minDistance = Infinity;
  for (const el of mode === 'gifts' ? giftTargets : noteTargets) {
    const rect = el.querySelector('.toy').getBoundingClientRect();
    const distance = Math.abs(centerX - (rect.left + rect.width / 2));
    if (distance < minDistance) { minDistance = distance; best = el; }
  }
  return minDistance <= Math.max(41, windowEl.clientWidth * .105) ? best : null;
}
function getNoteIndex(slot) {
  // Each slot starts with a different note; prioritize undiscovered notes so she can collect all eight.
  const available = LOVE_MESSAGES.map((_, i) => i).filter(i => !discoveredNotes.has(i));
  if (available.length) return available[slot % available.length];
  return slot % LOVE_MESSAGES.length;
}
async function play() {
  if (busy) return;
  setLocked(true);
  statusEl.textContent = 'Here goes nothing... ✨';
  const target = nearestPrize();
  const drop = target ? Math.max(100, target.getBoundingClientRect().top - windowEl.getBoundingClientRect().top - 78) : windowEl.clientHeight * .54;
  claw.style.top = `${16 + drop}px`;
  await delay(770);
  claw.classList.add('closed');
  await delay(360);
  if (target) target.classList.add('caught');
  claw.style.top = '16px';
  await delay(850);
  claw.classList.remove('closed');
  if (target) {
    if (mode === 'gifts') {
      const key = target.dataset.prize;
      collected.add(key);
      try { localStorage.setItem('elina-love-claw-collected', JSON.stringify([...collected])); } catch (_) {}
      renderCollection();
      showWin(GIFTS[key]);
      statusEl.textContent = `You won ${GIFTS[key].name}! Try another ♡`;
    } else {
      const index = getNoteIndex(Number(target.dataset.messageSlot));
      discoveredNotes.add(index);
      try { localStorage.setItem('elina-love-claw-notes', JSON.stringify([...discoveredNotes])); } catch (_) {}
      renderCollection();
      showNote(LOVE_MESSAGES[index]);
      statusEl.textContent = 'You found a message from Josh! 💌';
    }
    await delay(450);
    target.classList.remove('caught');
  } else {
    statusEl.textContent = 'So close! Move toward a prize and try again ♡';
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
giftsTab.addEventListener('click', () => switchMode('gifts'));
notesTab.addEventListener('click', () => switchMode('notes'));
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
renderCollection();
