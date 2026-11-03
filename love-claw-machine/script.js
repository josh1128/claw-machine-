// Love Claw: moving capsules, collectible tickets, and one gift prize per local day.
// A successful love-note catch gives one stamp. Redeem 7 stamps for one random gift.
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
const redeemButton = document.getElementById('redeem-stamps');
const stampCount = document.getElementById('stamp-count');
const stampTrack = document.getElementById('stamp-track');
const dailyMessage = document.getElementById('daily-message');
const STORAGE_KEY = 'elina-love-claw-daily-v1';
let position = 50;
let busy = false;
let state = { stamps: 0, lastPrizeDate: '' };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  state.stamps = Math.min(7, Math.max(0, Math.floor(Number(saved.stamps) || 0)));
  state.lastPrizeDate = typeof saved.lastPrizeDate === 'string' ? saved.lastPrizeDate : '';
} catch (_) { /* Private browsing may not permit storage */ }
function today() {
  // Local calendar date (not UTC); play resumes after the player's local midnight.
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function prizeClaimedToday() { return state.lastPrizeDate === today(); }
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}
function refreshUI() {
  stampCount.textContent = String(state.stamps);
  stampTrack.replaceChildren();
  for (let i=0;i<7;i++) {
    const mark = document.createElement('span');
    mark.className = 'stamp-mark' + (i<state.stamps ? ' earned' : '');
    mark.textContent = i<state.stamps ? '♥' : '☆';
    stampTrack.append(mark);
  }
  const done = prizeClaimedToday();
  [left,right,grab].forEach(button => { button.disabled = busy || done || dialog.open; });
  redeemButton.disabled = busy || done || dialog.open || state.stamps<7;
  dailyMessage.hidden = !done;
  dailyMessage.textContent = done ? '💕 You won your prize today! The claw reopens tomorrow. ♡' : '';
  windowEl.classList.toggle('daily-locked',done);
}
function move(direction) {
  refreshUI();
  if (busy || prizeClaimedToday() || dialog.open) return;
  position = Math.max(10, Math.min(90, position + direction * 4));
  claw.style.left = position + '%';
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function setLocked(value) { busy = value; refreshUI(); }
function nearestCapsule() {
  const clawBox = claw.getBoundingClientRect();
  const clawX = clawBox.left + clawBox.width/2;
  let best = null, distance = Infinity;
  for (const capsule of capsules) {
    const rect = capsule.querySelector('.toy').getBoundingClientRect();
    const d = Math.abs(clawX - (rect.left + rect.width/2));
    if (d < distance) { distance=d; best=capsule; }
  }
  return { target:best, distance };
}
const deckItems=[
  ...Object.keys(GIFTS).map(key => ({type:'gift',key})),
  ...LOVE_MESSAGES.map((_,index) => ({type:'message',index}))
];
let deck=[];
function nextSurprise() {
  // The deck mixes four prizes and eight messages without revealing contents.
  if (!deck.length) {
    deck=[...deckItems];
    for (let i=deck.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [deck[i],deck[j]]=[deck[j],deck[i]];
    }
  }
  return deck.pop();
}
function finishGift(gift) {
  state.lastPrizeDate=today();
  saveProgress();
  showWin(gift);
  refreshUI();
}
async function redeemStamps() {
  refreshUI();
  if (busy || dialog.open || prizeClaimedToday() || state.stamps<7) return;
  setLocked(true);
  state.stamps -= 7;
  const keys=Object.keys(GIFTS);
  const gift=GIFTS[keys[Math.floor(Math.random()*keys.length)]];
  finishGift(gift);
  setLocked(false);
}
async function play() {
  refreshUI();
  if (busy || prizeClaimedToday() || dialog.open) return;
  setLocked(true);
  // Freeze moving boxes at the instant GRAB is pressed. Drift makes alignment matter.
  windowEl.classList.add('grabbing');
  const drift=(Math.random()*8-4);
  const finalPosition=Math.max(10,Math.min(90,position+drift));
  claw.style.left=finalPosition+'%';
  await delay(260);
  const {target,distance}=nearestCapsule();
  const width=windowEl.clientWidth;
  const excellent=Math.max(13,width*.036);
  const maximum=Math.max(22,width*.057);
  const aligned=target && distance<=maximum;
  const success=aligned && Math.random()<(distance<=excellent ? .72 : .36);
  const drop=aligned ? Math.max(90,target.getBoundingClientRect().top-windowEl.getBoundingClientRect().top-77) : windowEl.clientHeight*.56;
  claw.style.top=(16+drop)+'px';
  await delay(770);
  claw.classList.add('closed');
  await delay(310);
  if (success) target.classList.add('caught');
  claw.style.top='16px';
  await delay(820);
  claw.classList.remove('closed');
  position=finalPosition;
  if (success) {
    const reward=nextSurprise();
    if (reward.type==='gift') {
      finishGift(GIFTS[reward.key]);
    } else {
      state.stamps=Math.min(7,state.stamps+1);
      saveProgress();
      showNote(LOVE_MESSAGES[reward.index]);
    }
    await delay(400);
    target.classList.remove('caught');
  } else {
    statusEl.textContent=aligned ? 'It slipped! Try again ♡' : 'Aim closer and try again ♡';
    windowEl.classList.remove('miss-flash');
    void windowEl.offsetWidth;
    windowEl.classList.add('miss-flash');
    setTimeout(() => windowEl.classList.remove('miss-flash'),700);
  }
  windowEl.classList.remove('grabbing');
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


left.addEventListener('click',()=>move(-1));
right.addEventListener('click',()=>move(1));
grab.addEventListener('click',play);
redeemButton.addEventListener('click',redeemStamps);
document.getElementById('close-dialog').addEventListener('click',()=>{dialog.close();refreshUI();});
document.getElementById('play-again').addEventListener('click',()=>{dialog.close();refreshUI();});
window.addEventListener('keydown',e=>{
 if (dialog.open || e.altKey || e.ctrlKey || e.metaKey || ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
 if (e.key==='ArrowLeft') {e.preventDefault();move(-1);}
 if (e.key==='ArrowRight') {e.preventDefault();move(1);}
 if (e.code==='Space' && e.target.tagName!=='BUTTON') {e.preventDefault();play();}
});
refreshUI();
