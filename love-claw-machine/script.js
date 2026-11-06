// One secret prize: Josh's personal letter to Elina.
// The claw stays challenging, and every successful catch reveals the same letter. Replaying is always allowed.
const LETTER = "Hi baby,\n\nSorry for making you cry these past couple of days. First for making it seem like I don't miss you and second when you thought I was frustrated. First, i want to let you know that i always miss you, everyday at all times. That is why I made this for you. Also, Its normal to feel those things. I promise you that i will always free up some time after work to facetime you. I love you and I always will. I will do anything for you. I yearn for you. I love every part of you, every single quirks, smile and kisses. You're the best thing to has ever happened to me and I know we'll spend the rest of our lives together. I'm not hopeful, because I know for sure if we're comitted to building the future together then we'll grow old together, travel around the world together and play volleyball and rave until we're 50. I will make sure to give you the reassurance and love that you deserve. When you feel upset or sad, I will cheer you up instead of being cold like I was before. I love you baby and here is to many years together";
const capsules = [...document.querySelectorAll('[data-capsule]')];
const claw = document.getElementById('claw');
const windowEl = document.getElementById('window');
const statusEl = document.getElementById('status');
const dialog = document.getElementById('win-dialog');
const left = document.getElementById('left');
const right = document.getElementById('right');
const grab = document.getElementById('grab');
const readAgain = document.getElementById('read-again');
const STORAGE_KEY = 'elina-love-claw-letter-opened-v1';
let position = 50;
let busy = false;
let opened = false;
try { opened = localStorage.getItem(STORAGE_KEY) === 'yes'; } catch (_) {}
function updateControls() {
  [left,right,grab].forEach(b => { b.disabled = busy || dialog.open; });
  readAgain.hidden = !opened;
}
function move(direction) {
  if (busy || dialog.open) return;
  position = Math.max(10, Math.min(90, position + direction * 5));
  claw.style.left = position + '%';
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve,ms)); }
function nearestCapsule() {
  const center = claw.getBoundingClientRect();
  const x = center.left + center.width/2;
  let target = null;
  let distance = Infinity;
  for (const capsule of capsules) {
    const rect = capsule.querySelector('.toy').getBoundingClientRect();
    const d = Math.abs(x-(rect.left+rect.width/2));
    if (d < distance) { distance = d; target = capsule; }
  }
  return { target, distance };
}
let revealTimer;
function showLetter() {
  document.getElementById('love-letter').textContent = LETTER;
  const stage = document.getElementById('reveal-stage');
  const content = document.getElementById('letter-reveal');
  clearTimeout(revealTimer);
  document.getElementById('voice-message').pause();
  stage.hidden = false;
  stage.classList.remove('is-opening');
  content.hidden = true;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => stage.classList.add('is-opening'));
  });
  revealTimer = setTimeout(() => {
    stage.hidden = true;
    content.hidden = false;
    dialog.scrollTop = 0;
  }, 2800);
  updateControls();
}
async function play() {
  if (busy || dialog.open) return;
  busy = true; updateControls();
  windowEl.classList.add('grabbing');
  const finalPosition = Math.max(10, Math.min(90, position + (Math.random()*18-9)));
  claw.style.left = finalPosition + '%';
  await delay(260);
  const {target,distance} = nearestCapsule();
  const width = windowEl.clientWidth;
  const excellent = Math.max(8,width*.022);
  const maximum = Math.max(14,width*.038);
  const aligned = target && distance <= maximum;
  const caught = aligned && Math.random() < (distance<=excellent ? .40 : .14);
  const drop = aligned ? Math.max(90,target.getBoundingClientRect().top-windowEl.getBoundingClientRect().top-77) : windowEl.clientHeight*.56;
  claw.style.top = (16+drop)+'px';
  await delay(770);
  claw.classList.add('closed');
  await delay(310);
  if (caught) target.classList.add('caught');
  claw.style.top = '16px';
  await delay(820);
  claw.classList.remove('closed');
  position = finalPosition;
  if (caught) {
    opened = true;
    try { localStorage.setItem(STORAGE_KEY,'yes'); } catch (_) {}
    showLetter();
    celebrate();
    await delay(400);
    target.classList.remove('caught');
  } else {
    statusEl.textContent = aligned ? 'It slipped! Try again ♡' : 'Aim closer and try again ♡';
    windowEl.classList.remove('miss-flash');
    void windowEl.offsetWidth;
    windowEl.classList.add('miss-flash');
    setTimeout(()=>windowEl.classList.remove('miss-flash'),700);
  }
  windowEl.classList.remove('grabbing');
  busy = false; updateControls();
}
function celebrate() {
  const confetti = document.getElementById('confetti');
  confetti.replaceChildren();
  for (let i=0;i<38;i++) {
    const piece = document.createElement('span');
    piece.className='confetti-piece';
    piece.textContent=['💗','💕','✦','♡','🌸'][i%5];
    piece.style.left=(Math.random()*100)+'%';
    piece.style.animationDelay=(Math.random()*.7)+'s';
    piece.style.animationDuration=(2+Math.random()*2)+'s';
    confetti.append(piece);
  }
  setTimeout(()=>confetti.replaceChildren(),4300);
}
left.addEventListener('click',()=>move(-1));
right.addEventListener('click',()=>move(1));
grab.addEventListener('click',play);
readAgain.addEventListener('click',showLetter);
function closeLetter() {
  clearTimeout(revealTimer);
  document.getElementById('voice-message').pause();
  dialog.close();
  updateControls();
}
document.getElementById('close-dialog').addEventListener('click',closeLetter);
document.getElementById('play-again').addEventListener('click',closeLetter);
dialog.addEventListener('close', () => {
  clearTimeout(revealTimer);
  document.getElementById('voice-message').pause();
  updateControls();
});
window.addEventListener('keydown',e=>{
  if(dialog.open||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
  if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}
  if(e.key==='ArrowRight'){e.preventDefault();move(1);}
  if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();play();}
});
updateControls();
