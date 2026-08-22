/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'circulation-navigator';
const API_BASE = 'https://game-api.abhikr18996.workers.dev';

/* ---------------- Fixed header height sync ---------------- */
function syncNavHeight() {
  var nav = document.getElementById('siteNav');
  if (!nav) return;
  if (nav.classList.contains('header-hidden')) return;
  document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
}
document.addEventListener('DOMContentLoaded', syncNavHeight);
window.addEventListener('load', syncNavHeight);
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function(){ syncNavHeight(); }); }
setTimeout(syncNavHeight, 300);
setTimeout(syncNavHeight, 900);

/* ---------------- Shared header: theme + navigation ---------------- */
document.addEventListener('DOMContentLoaded', function() {
  var bg0 = getComputedStyle(document.documentElement).getPropertyValue('--bg-0').trim();
  if (!bg0) document.documentElement.classList.add('theme-css-missing');

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var html = document.documentElement;
      var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('terra-site-theme', next); } catch (e) {}
      setTimeout(function(){ try { map.invalidateSize(); redrawActive(); } catch(e){} }, 320);
    });
  }
});

function showExitDialog() { document.getElementById('exit-dialog-overlay').classList.add('show'); }
function closeExitDialog() { document.getElementById('exit-dialog-overlay').classList.remove('show'); }
function confirmExit() { window.location.href = 'index.html'; }

function setHeaderVisible(visible){
  var nav = document.getElementById('siteNav');
  if (!nav) return;
  nav.classList.toggle('header-hidden', !visible);
  if (visible) { syncNavHeight(); }
  requestAnimationFrame(function(){ try { map.invalidateSize(); redrawActive(); } catch(e){} });
}

/* ============================================================
   CIRCULATION DATA
   Idealized three-cell model. Latitudes are the standard
   textbook approximations, not exact real-world measurements
   (real belts shift seasonally with the sun).
   ============================================================ */
const ROUNDS = [
  { id:'equator', name:'Equator', kind:'line', lat:0, tol:1,
    fact:"The great circle equidistant from both poles, marking 0° latitude — day and night stay closest to equal here all year." },
  { id:'cancer', name:'Tropic of Cancer', kind:'line', lat:23.5, tol:1,
    fact:"The northernmost latitude where the sun can appear directly overhead, reached at the June solstice." },
  { id:'capricorn', name:'Tropic of Capricorn', kind:'line', lat:-23.5, tol:1,
    fact:"The southernmost latitude where the sun can appear directly overhead, reached at the December solstice." },

  { id:'doldrums', name:'Equatorial Low Pressure (Doldrums)', kind:'band', min:-5, max:5,
    fact:"Where the trade winds of both hemispheres converge and warm air rises — sailors could sit becalmed here for weeks.",
    wind:'rise', windLabel:'Rising, converging air — light, unpredictable surface winds' },

  { id:'ne-trades', name:'Northeast Trade Winds', kind:'band', min:5, max:30,
    fact:"Steady winds north of the equator, historically the route sailing ships rode across the Atlantic toward the Americas.",
    wind:'flow', bearing:225, windLabel:'Steady surface winds blowing from the northeast toward the equator' },

  { id:'se-trades', name:'Southeast Trade Winds', kind:'band', min:-30, max:-5,
    fact:"The southern-hemisphere counterpart of the trades, curved toward the equator by the Coriolis effect.",
    wind:'flow', bearing:315, windLabel:'Steady surface winds blowing from the southeast toward the equator' },

  { id:'horse-n', name:'Subtropical High Pressure (Horse Latitudes) — N', kind:'band', min:25, max:35,
    fact:"Sinking, drying air near 30°N calms the winds and feeds deserts — sailors reportedly threw horses overboard here when becalmed.",
    wind:'sink', windLabel:'Sinking, diverging air — calm, dry surface winds' },

  { id:'horse-s', name:'Subtropical High Pressure (Horse Latitudes) — S', kind:'band', min:-35, max:-25,
    fact:"The southern mirror of the horse latitudes, where descending air feeds some of the driest deserts on Earth.",
    wind:'sink', windLabel:'Sinking, diverging air — calm, dry surface winds' },

  { id:'west-n', name:'Prevailing Westerlies — N', kind:'band', min:35, max:60,
    fact:"Blowing from the southwest toward the northeast, these winds steer most weather systems across North America and Europe.",
    wind:'flow', bearing:45, windLabel:'Surface winds blowing from the southwest toward the northeast' },

  { id:'west-s', name:'Prevailing Westerlies — S', kind:'band', min:-60, max:-35,
    fact:"Almost unbroken by land, the Southern Ocean's westerlies power the fierce 'Roaring Forties' and 'Furious Fifties'.",
    wind:'flow', bearing:135, windLabel:'Surface winds blowing from the northwest toward the southeast' },

  { id:'subpolar-n', name:'Sub-Polar Low Pressure — N', kind:'band', min:55, max:65,
    fact:"Where warm westerlies meet cold polar air near 60°N, fueling storm systems across the North Atlantic and North Pacific.",
    wind:'rise', windLabel:'Rising, converging air — a stormy low-pressure belt' },

  { id:'subpolar-s', name:'Sub-Polar Low Pressure — S', kind:'band', min:-65, max:-55,
    fact:"Encircling Antarctica near 60°S, this belt of rising air drives the Southern Ocean's relentless storms.",
    wind:'rise', windLabel:'Rising, converging air — a stormy low-pressure belt' },

  { id:'polar-e-n', name:'Polar Easterlies — N', kind:'band', min:65, max:85,
    fact:"Cold, dense air sinking at the pole spreads outward and is deflected into winds that blow from the northeast.",
    wind:'flow', bearing:225, windLabel:'Cold surface winds blowing from the northeast' },

  { id:'polar-e-s', name:'Polar Easterlies — S', kind:'band', min:-85, max:-65,
    fact:"Frigid air spilling off Antarctica curves into steady winds that blow from the southeast around the continent.",
    wind:'flow', bearing:315, windLabel:'Cold surface winds blowing from the southeast' },

  { id:'polar-high-n', name:'Polar High Pressure — N', kind:'band', min:82, max:90,
    fact:"Frigid, sinking air over the Arctic creates one of Earth's coldest and calmest pressure zones.",
    wind:'sink', windLabel:'Sinking, diverging air — frigid and calm' },

  { id:'polar-high-s', name:'Polar High Pressure — S', kind:'band', min:-90, max:-82,
    fact:"The coldest place on the planet — sinking air over Antarctica's ice sheet forms a deep, persistent high.",
    wind:'sink', windLabel:'Sinking, diverging air — frigid and calm' }
];
const ROUNDS_PER_GAME = 10; // solo runs sample 10 of the 16 targets, reshuffled each time. Challenge mode always uses the exact order sent by the challenger (see loadChallengeGame), so this constant only affects fresh/solo runs.

/* ---------------- Map setup ---------------- */
const map = L.map('map', {
  worldCopyJump:false,
  dragging:true,
  touchZoom:true,
  doubleClickZoom:false,
  scrollWheelZoom:true,
  minZoom:2,
  maxZoom:6,
  zoomControl:true,
  attributionControl:true
}).setView([5, 20], 2);

const tiles = L.tileLayer('https://mapidesk-tile-cache.abhikr18996.workers.dev/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom:19,
  keepBuffer:4,
  updateWhenZooming:false,
  crossOrigin:true
}).addTo(map);

const labelTiles = L.tileLayer('https://mapidesk-tile-cache.abhikr18996.workers.dev/light_only_labels/{z}/{x}/{y}{r}.png', {
  minZoom:4, maxZoom:19, keepBuffer:4, updateWhenZooming:false, crossOrigin:true
}).addTo(map);

let tilesLoaded = false;
tiles.on('load', ()=>{ tilesLoaded = true; document.getElementById('map-loading').classList.add('hidden'); });
setTimeout(()=>{ if(!tilesLoaded) document.getElementById('map-loading').classList.add('hidden'); }, 2500);

/* ---------------- India boundary overlay ---------------- */
let indiaLayer = null;
const INDIA_BOUNDARY_URLS = [
  '/data/india-boundary.geojson'
];
async function loadIndiaBoundary(){
  for(const url of INDIA_BOUNDARY_URLS){
    try{
      const res = await fetch(url);
      if(!res.ok) continue;
      const geo = await res.json();
      indiaLayer = L.geoJSON(geo, {
        interactive:false,
        style:{ color:'#D4A853', weight:2.2, opacity:1, fillColor:'#D4A853', fillOpacity:0.06 }
      }).addTo(map);
      return;
    }catch(e){ console.warn('India boundary overlay source failed, trying next:', url, e); }
  }
  console.warn('India boundary overlay: all sources failed — falling back to base tiles only.');
}
loadIndiaBoundary();

/* ---------------- Game state ---------------- */
let order = [];
let roundIdx = 0;
let scores = [];
let results = [];
let guessed = false;
let guessLat = null;
let mode = 'own';
let rival = null;
let currentGameCode = null;
let challengeCreated = false;
let resultPosted = false;

function shuffleIdx(n, count){
  const a = Array.from({length:n}, (_,i)=>i);
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return typeof count === 'number' ? a.slice(0, count) : a;
}

function setupDots(){
  const dots = document.getElementById('dots');
  dots.innerHTML = order.map((_,i)=>`<div class="dot" id="dot-${i}"></div>`).join('');
}
function updateDots(){
  order.forEach((_,i)=>{
    const d = document.getElementById('dot-'+i);
    d.classList.toggle('done', i < roundIdx);
    d.classList.toggle('now', i === roundIdx);
  });
}

function setMapVisible(visible){
  document.getElementById('map-viewport').classList.toggle('screen-covered', !visible);
}
setMapVisible(false);

function exitToMenu(){ showExitDialog(); }

function startFreshGame(){
  mode = 'own'; rival = null; currentGameCode = null; challengeCreated = false; resultPosted = false;
  order = shuffleIdx(ROUNDS.length, ROUNDS_PER_GAME);
  beginRound();
}

function beginRound(){
  roundIdx = 0; scores = []; results = [];
  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-end').classList.add('hidden');
  document.getElementById('challenge-flag').classList.toggle('show', mode === 'challenge');
  setMapVisible(true);
  setHeaderVisible(false);
  setupDots();
  loadRound();
  setTimeout(()=>{ map.invalidateSize(); }, 50);
}

function loadRound(){
  guessed = false; guessLat = null;
  clearOverlay();
  map.stop();
  map.flyTo([5, 20], 2, { duration: 0.6, easeLinearity: 0.25 });
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('wind-desc').style.display = 'none';
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = ROUNDS[order[roundIdx]].name;
  updateDots();
}

/* ---------------- Latitude <-> pixel helpers ---------------- */
function clampLat(lat){ return Math.max(-85, Math.min(85, lat)); }
function latToY(lat){ return map.latLngToContainerPoint([clampLat(lat), map.getCenter().lng]).y; }
function yToLat(y){
  const rect = document.getElementById('map-viewport').getBoundingClientRect();
  const x = rect.width/2;
  return clampLat(map.containerPointToLatLng(L.point(x, y)).lat);
}
function fmtLat(lat){
  const d = Math.abs(lat);
  const dir = lat > 0.05 ? 'N' : (lat < -0.05 ? 'S' : '');
  return d.toFixed(1) + '°' + dir;
}

/* ---------------- Overlay drawing ---------------- */
const overlay = document.getElementById('line-overlay');
function clearOverlay(){ overlay.innerHTML = ''; }

function drawGuessLine(lat){
  let el = document.getElementById('guess-line');
  if(!el){
    el = document.createElement('div');
    el.id = 'guess-line'; el.className = 'h-line';
    el.innerHTML = '<div class="hit-area" id="guess-hit"></div><div class="rule"></div><div class="chip" id="guess-chip"></div>';
    overlay.appendChild(el);
    attachGuessLineDrag(document.getElementById('guess-hit'));
  }
  el.style.top = latToY(lat) + 'px';
  document.getElementById('guess-chip').textContent = 'You: ' + fmtLat(lat);
}

/* Grabbing the red line itself moves it freely up/down, independent of the
   map's own pan/zoom (which is handled natively by Leaflet everywhere else). */
let guessDragging = false;
function attachGuessLineDrag(hit){
  hit.addEventListener('pointerdown', function(e){
    if(guessed) return;
    guessDragging = true;
    try{ hit.setPointerCapture(e.pointerId); }catch(err){}
    e.stopPropagation();
    e.preventDefault();
  });
  hit.addEventListener('pointermove', function(e){
    if(!guessDragging || guessed) return;
    e.stopPropagation();
    const rect = viewport.getBoundingClientRect();
    const y = e.clientY - rect.top;
    guessLat = yToLat(y);
    drawGuessLine(guessLat);
  });
  function endGuessDrag(e){
    if(guessDragging){
      guessDragging = false;
      try{ hit.releasePointerCapture(e.pointerId); }catch(err){}
    }
  }
  hit.addEventListener('pointerup', endGuessDrag);
  hit.addEventListener('pointercancel', endGuessDrag);
}

function drawTarget(round){
  if(round.kind === 'line'){
    const el = document.createElement('div');
    el.id = 'target-line'; el.className = 'h-line';
    el.innerHTML = `<div class="rule"></div><div class="chip">${fmtLat(round.lat)}</div>`;
    el.style.top = latToY(round.lat) + 'px';
    overlay.appendChild(el);
    return { midY: latToY(round.lat), topY: latToY(round.lat)-22, botY: latToY(round.lat)+22 };
  } else {
    const topY = latToY(round.max);
    const botY = latToY(round.min);
    const el = document.createElement('div');
    el.id = 'target-band'; 
    el.style.top = topY + 'px';
    el.style.height = Math.max(4, botY - topY) + 'px';
    el.innerHTML = `<div class="band-mid"></div><div class="chip">${fmtLat(round.max)} to ${fmtLat(round.min)}</div>`;
    overlay.appendChild(el);
    return { midY:(topY+botY)/2, topY, botY };
  }
}

/* ---- wind arrow rendering ---- */
function spawnFlowArrow(container, bandTop, bandBot, bearing){
  const rect = document.getElementById('map-viewport').getBoundingClientRect();
  const rad = bearing * Math.PI/180;
  const dist = 60;
  const dx = Math.round(Math.sin(rad)*dist);
  const dy = Math.round(-Math.cos(rad)*dist);
  const arrow = document.createElement('div');
  arrow.className = 'w-arrow';
  const left = 8 + Math.random()*(rect.width-16);
  const top = bandTop + Math.random()*Math.max(1,(bandBot-bandTop));
  arrow.style.left = left + 'px';
  arrow.style.top = top + 'px';
  arrow.style.setProperty('--rot', bearing + 'deg');
  arrow.style.setProperty('--dx', dx + 'px');
  arrow.style.setProperty('--dy', dy + 'px');
  arrow.style.transform = 'rotate(' + bearing + 'deg)';
  arrow.style.animation = 'windFlow ' + (2.2 + Math.random()*1.1) + 's ease-in-out ' + (Math.random()*1.4) + 's infinite';
  container.appendChild(arrow);
}
function spawnVerticalChevron(container, bandTop, bandBot, rising){
  const rect = document.getElementById('map-viewport').getBoundingClientRect();
  const chev = document.createElement('div');
  chev.className = 'w-chev';
  chev.textContent = rising ? '▲' : '▼';
  const left = rect.width*0.5 + (Math.random()*2-1)*rect.width*0.35;
  const top = bandTop + (bandBot-bandTop) * (0.3 + Math.random()*0.4);
  chev.style.left = left + 'px';
  chev.style.top = top + 'px';
  chev.style.animation = (rising?'windRise':'windSink') + ' ' + (1.8+Math.random()*0.8) + 's ease-in-out ' + (Math.random()*1.2) + 's infinite';
  container.appendChild(chev);
}
function spawnConvergeDot(container, bandTop, bandBot){
  const rect = document.getElementById('map-viewport').getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'pulse-dot';
  dot.style.left = (rect.width*0.5) + 'px';
  dot.style.top = ((bandTop+bandBot)/2) + 'px';
  container.appendChild(dot);
}

function drawWind(round, topY, botY){
  if(!round.wind) return;
  const rawH = Math.abs(botY-topY);
  const effH = Math.max(30, rawH); // guarantee enough room for icons even on very thin/clamped polar bands
  const layer = document.createElement('div');
  layer.className = 'wind-layer';
  layer.style.top = Math.min(topY,botY) + 'px';
  layer.style.height = effH + 'px';
  overlay.appendChild(layer);

  if(round.wind === 'flow'){
    for(let i=0;i<7;i++) spawnFlowArrow(layer, 0, effH, round.bearing);
  } else if(round.wind === 'rise'){
    spawnConvergeDot(layer, 0, effH);
    for(let i=0;i<5;i++) spawnVerticalChevron(layer, 0, effH, true);
  } else if(round.wind === 'sink'){
    for(let i=0;i<5;i++) spawnVerticalChevron(layer, 0, effH, false);
  }
}

/* ---------------- Tap-to-place handling (map stays fully pannable/zoomable) ---------------- */
const viewport = document.getElementById('map-viewport');

function onMapClick(e){
  if(guessed) return;
  guessLat = clampLat(e.latlng.lat);
  drawGuessLine(guessLat);
  document.getElementById('tap-hint').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'inline-block';
}
map.on('click', onMapClick);

/* ---------------- Scoring ---------------- */
function degDiff(lat, round){
  if(round.kind === 'line'){
    const d = Math.abs(lat - round.lat);
    return d <= round.tol ? 0 : d - round.tol;
  } else {
    if(lat >= round.min && lat <= round.max) return 0;
    return lat < round.min ? (round.min - lat) : (lat - round.max);
  }
}
function scoreFor(deg){ return Math.max(0, Math.round(100 - deg*4)); }
function verdictFor(deg){
  if(deg <= 0) return {label:'Bullseye — right on target!', cls:'good', icon:'target'};
  if(deg < 2) return {label:'Excellent placement!', cls:'good', icon:'check'};
  if(deg < 5) return {label:'Nearby — solid instinct.', cls:'mid', icon:'compass'};
  if(deg < 12) return {label:'Right general zone.', cls:'mid', icon:'compass'};
  return {label:'Way off course — but noted.', cls:'bad', icon:'x'};
}

const VERDICT_ICONS = {
  target: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" style="fill:currentColor"/></svg>',
  check: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  compass: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8l-5 3-1 5 5-3z"/></svg>',
  x: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
const TROPHY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4z"/><path d="M8 4H5a3 3 0 003 3M16 4h3a3 3 0 01-3 3"/><path d="M12 11v4"/><path d="M9 20h6"/><path d="M10 17h4v3h-4z"/></svg>';
const WIND_ICON = '<svg viewBox="0 0 24 24"><path d="M3 8h13a3 3 0 100-6"/><path d="M3 16h17a3 3 0 110 6"/><path d="M3 12h9"/></svg>';

function animateCount(el, to, duration){
  duration = duration || 900;
  const startTime = performance.now();
  function tick(now){
    const p = Math.min(1, (now-startTime)/duration);
    const eased = 1 - Math.pow(1-p, 3);
    el.textContent = Math.round(to*eased) + '%';
    if(p < 1) requestAnimationFrame(tick);
    else el.textContent = to + '%';
  }
  requestAnimationFrame(tick);
}

function triggerRoundEffect(cls){
  const feedback = document.getElementById('feedback');
  const scorePill = document.querySelector('.score-pill');
  const mapViewport = document.getElementById('map-viewport');

  if(cls === 'good'){
    fireConfetti({count:26, maxFrames:90, spread:0.35});
    [feedback, scorePill].forEach(el=>{
      if(!el) return;
      el.classList.remove('fx-pulse-good'); void el.offsetWidth;
      el.classList.add('fx-pulse-good');
      setTimeout(()=> el.classList.remove('fx-pulse-good'), 900);
    });
  } else if(cls === 'bad'){
    [mapViewport, feedback].forEach(el=>{
      if(!el) return;
      el.classList.remove('fx-shake'); void el.offsetWidth;
      el.classList.add('fx-shake');
      setTimeout(()=> el.classList.remove('fx-shake'), 550);
    });
    feedback.classList.remove('fx-flash-bad'); void feedback.offsetWidth;
    feedback.classList.add('fx-flash-bad');
    setTimeout(()=> feedback.classList.remove('fx-flash-bad'), 550);
  } else {
    if(feedback){
      feedback.classList.remove('fx-pulse-mid'); void feedback.offsetWidth;
      feedback.classList.add('fx-pulse-mid');
      setTimeout(()=> feedback.classList.remove('fx-pulse-mid'), 700);
    }
  }
}

function lockGuess(){
  if(guessed || guessLat === null) return;
  guessed = true;

  const round = ROUNDS[order[roundIdx]];
  const gLat = guessLat;
  const deg = degDiff(gLat, round);
  const v = verdictFor(deg);
  const pts = scoreFor(deg);
  scores.push(pts);
  results.push({name:round.name, deg:Math.round(deg*10)/10, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to where this target actually sits — the player may have
  // panned/zoomed elsewhere while placing their guess, so make sure they
  // actually get shown the real location before the result appears.
  const targetCenterLat = round.kind === 'line' ? round.lat : (round.min + round.max) / 2;
  const revealZoom = Math.min(map.getZoom(), 3);

  let revealed = false;
  function fireReveal(){
    if(revealed) return;
    revealed = true;
    revealResult(round, gLat, deg, v, pts);
  }
  map.once('moveend', fireReveal);
  map.flyTo([targetCenterLat, map.getCenter().lng], revealZoom, { duration: 1.1, easeLinearity: 0.25 });
  setTimeout(fireReveal, 1400); // fallback in case flyTo doesn't fire moveend (e.g. already centered)
}

function revealResult(round, gLat, deg, v, pts){
  clearOverlay();
  const targetRect = drawTarget(round);
  drawGuessLine(gLat);
  drawWind(round, targetRect.topY, targetRect.botY);

  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${v.label}  (${deg===0?'within target':'Δ '+ (Math.round(deg*10)/10) + '°'} · +${pts} pts)`;
  document.getElementById('verdict-text').className = 'verdict ' + v.cls;
  document.getElementById('fact-text').textContent = round.fact;

  const windDesc = document.getElementById('wind-desc');
  if(round.windLabel){
    windDesc.innerHTML = WIND_ICON.replace('<svg ', '<svg class="' + '' + '" ') + ' ' + round.windLabel;
    windDesc.style.display = 'flex';
  } else {
    windDesc.style.display = 'none';
  }

  const rivalLine = document.getElementById('rival-line');
  if(mode === 'challenge' && rival && Array.isArray(rival.pts)){
    const theirPts = rival.pts[roundIdx];
    if(pts > theirPts){ rivalLine.textContent = `You beat your rival on this one — they scored +${theirPts} pts here.`; }
    else if(pts < theirPts){ rivalLine.textContent = `Your rival had the edge here — they scored +${theirPts} pts.`; }
    else{ rivalLine.textContent = `Dead even with your rival on this target — +${theirPts} pts each.`; }
    rivalLine.style.display = 'block';
  }

  document.getElementById('feedback').classList.add('show');
  document.getElementById('next-btn').style.display = 'inline-block';
  document.getElementById('next-btn').textContent = roundIdx === order.length-1 ? 'See Results →' : 'Next Target →';

  const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  document.getElementById('score-live').textContent = avg + '%';

  updateDots();
  triggerRoundEffect(v.cls);
}

function nextRound(){
  roundIdx++;
  if(roundIdx >= order.length){ endGame(); return; }
  loadRound();
}

/* Redraw whatever's on screen if the viewport resizes, or the map is panned/zoomed, mid-round */
function redrawActive(){
  if(document.getElementById('map-viewport').classList.contains('screen-covered')) return;
  if(!order.length) return;
  const round = ROUNDS[order[roundIdx]];
  if(!round) return;
  if(guessed){
    clearOverlay();
    const targetRect = drawTarget(round);
    if(guessLat !== null) drawGuessLine(guessLat);
    drawWind(round, targetRect.topY, targetRect.botY);
  } else if(guessLat !== null){
    clearOverlay();
    drawGuessLine(guessLat);
  }
}

let currentAvgScore = 0;

async function endGame(){
  const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  currentAvgScore = avg;
  animateCount(document.getElementById('final-score'), avg);

  const heroIcon = document.getElementById('score-hero-icon');
  if(heroIcon){
    heroIcon.innerHTML = avg >= 65
      ? TROPHY_ICON
      : '<svg viewBox="0 0 24 24"><path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z"/></svg>';
  }

  let msg;
  if(avg >= 85) msg = "Master of the circulation model. You could redraw the wind belts from memory.";
  else if(avg >= 65) msg = "Sharp sense of the atmosphere — a seasoned reading of the map.";
  else if(avg >= 40) msg = "Solid run. The pressure belts are tricky — chart again to sharpen your eye.";
  else msg = "";
  document.getElementById('final-msg').textContent = msg;

  const vsBlock = document.getElementById('vs-block');
  const vsCard = document.getElementById('vs-card');
  vsCard.classList.remove('fx-winner');

  const scoreHeroEl = document.getElementById('score-hero');
  const endKickerEl = document.getElementById('end-kicker');
  const finalMsgEl = document.getElementById('final-msg');

  if(mode === 'challenge'){
    if(scoreHeroEl) scoreHeroEl.style.display = 'none';
    if(finalMsgEl) finalMsgEl.style.marginTop = '28px';
  } else {
    if(scoreHeroEl) scoreHeroEl.style.display = '';
    endKickerEl.textContent = 'Mission Complete';
    if(finalMsgEl) finalMsgEl.style.marginTop = '';
  }

  if(mode === 'challenge' && rival){
    vsBlock.style.display = 'block';
    document.getElementById('vs-rival-name').textContent = rival.name;
    animateCount(document.getElementById('vs-rival-score'), rival.score, 700);
    setTimeout(()=> animateCount(document.getElementById('vs-you-score'), avg, 700), 250);

    const vb = document.getElementById('verdict-box');
    vb.classList.remove('win','lose','tie');
    if(avg > rival.score){
      vb.innerHTML = TROPHY_ICON + ' You out-read your rival!';
      vb.classList.add('win');
      vsCard.classList.add('fx-winner');
      fireConfetti({count:110, maxFrames:230, spread:1});
    }
    else if(avg < rival.score){
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the circulation closer. Chart again!';
      vb.classList.add('lose');
    }
    else {
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/></svg> Dead even — perfectly matched navigators.';
      vb.classList.add('tie');
    }

    renderBreakdown(scores, rival.pts);
    postMyResultOnce(currentGameCode, avg, scores);
  } else {
    vsBlock.style.display = 'none';
    renderSoloBreakdown();
    if(avg >= 85) fireConfetti({count:70, maxFrames:200, spread:1});
  }

  resetChallengeLinkUI();

  document.getElementById('screen-end').classList.remove('hidden');
  setMapVisible(false);
  setHeaderVisible(true);
}

function renderBreakdown(myPts, theirPts){
  const box = document.getElementById('breakdown-list');
  box.innerHTML = '';
  order.forEach((rIdx, i)=>{
    const mine = myPts[i], theirs = Array.isArray(theirPts) ? theirPts[i] : null;
    const row = document.createElement('div');
    row.className = 'b-row';
    row.style.animationDelay = (i * 0.05) + 's';
    if(theirs === null || theirs === undefined){
      row.innerHTML = `<span class="b-name">${ROUNDS[rIdx].name}</span>
        <span class="b-marks"><span class="b-mk ok">${mine}</span></span>`;
    } else {
      row.innerHTML = `<span class="b-name">${ROUNDS[rIdx].name}</span>
        <span class="b-marks">
          <span class="b-mk ${theirs > mine ? 'ok' : 'no'}" title="Rival">${theirs}</span>
          <span class="b-mk ${mine >= theirs ? 'ok' : 'no'}" title="You">${mine}</span>
        </span>`;
    }
    box.appendChild(row);
  });
}

function renderSoloBreakdown(){
  const box = document.getElementById('breakdown-list');
  box.innerHTML = '';
  results.forEach((r,i)=>{
    const row = document.createElement('div');
    row.className = 'b-row';
    row.style.animationDelay = (i * 0.05) + 's';
    row.innerHTML = `<span class="b-idx">${i+1}</span>
      <span class="b-name">${r.name}</span>
      <span class="b-dist">${r.deg===0?'on target':'Δ '+r.deg+'°'}</span>
      <span class="b-pts ${r.cls}">+${r.pts}</span>`;
    box.appendChild(row);
  });
}

/* ============================================================
   API HELPERS — Cloudflare Worker (shared KV across all games)
   ============================================================ */
function randomCode(){
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for(let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}
function namespacedCode(rawCode){ return `${GAME_TYPE}:${rawCode}`; }

async function createChallengeOnDemand(avgScore, myScores){
  if(challengeCreated && currentGameCode){ return currentGameCode; }
  const rawCode = randomCode();
  const gameCode = namespacedCode(rawCode);

  const res = await fetch(`${API_BASE}/game/create`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      gameCode,
      challengerName: 'A navigator',
      challengerScore: avgScore,
      challengerResults: myScores,
      order
    })
  });
  const data = await res.json();
  if(!res.ok){ throw new Error(data.error || 'Could not create challenge link.'); }

  challengeCreated = true;
  currentGameCode = gameCode;
  return gameCode;
}

async function postMyResultOnce(gameCode, avgScore, myScores){
  if(!gameCode) return;
  const flagKey = 'posted-' + gameCode;
  if(resultPosted || sessionStorage.getItem(flagKey)) return;
  resultPosted = true;
  sessionStorage.setItem(flagKey, '1');

  try{
    await fetch(`${API_BASE}/game/update`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        gameCode,
        challengedName: 'A navigator',
        challengedScore: avgScore,
        challengedResults: myScores
      })
    });
  }catch(e){ console.warn('Could not post result:', e); }
}

async function fetchGame(gameCode){
  const cacheKey = 'game-' + gameCode;
  const cached = sessionStorage.getItem(cacheKey);
  if(cached){ try{ return JSON.parse(cached); }catch(e){} }
  const res = await fetch(`${API_BASE}/game/get?gameCode=${encodeURIComponent(gameCode)}`);
  const data = await res.json();
  if(!res.ok){ throw new Error(data.error || 'Challenge not found.'); }
  sessionStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}
// 🔧 FIX: namespaced per game (was 'hn-my-challenges' shared across all Navigator games)
const MY_CHALLENGES_KEY = 'my-challenges-' + GAME_TYPE;
const CHALLENGE_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000; // matches your worker's 60-day TTL

function myChallenges(){
  try{ return JSON.parse(localStorage.getItem(MY_CHALLENGES_KEY) || '{}'); }
  catch(e){ return {}; }
}

function saveMyChallenge(gameCode, avg, scoreArr){
  const all = myChallenges();

  // 🔧 FIX: prune anything past the worker's TTL before adding the new one,
  // so the object can't grow unbounded across a player's history.
  const now = Date.now();
  Object.keys(all).forEach(key => {
    if (!all[key].savedAt || (now - all[key].savedAt) > CHALLENGE_MAX_AGE_MS) {
      delete all[key];
    }
  });

  all[gameCode] = { avg, scores: scoreArr, savedAt: now };
  try{
    localStorage.setItem(MY_CHALLENGES_KEY, JSON.stringify(all));
  }catch(e){
    // 🔧 FIX: quota errors no longer fail silently — at least surface it
    console.warn('Could not save challenge locally (storage quota?):', e);
  }
}

async function checkForReply(){
  if(!currentGameCode) return;
  const btn = document.getElementById('check-reply-btn');
  btn.disabled = true; btn.textContent = 'Checking…';
  try{
    sessionStorage.removeItem('game-' + currentGameCode);
    const data = await fetchGame(currentGameCode);
    if(data.status === 'completed' && data.challengedResults){
      showReplyComparison(data);
    } else {
      showToast("They haven't played yet — check back later");
    }
  }catch(e){ showToast('Could not check right now'); }
  btn.disabled = false; btn.textContent = "Check if they've replied";
}

function showReplyComparison(data){
  rival = { name: data.challengedName || 'A navigator', score: data.challengedScore, pts: data.challengedResults };
  document.getElementById('vs-block').style.display = 'block';
  document.getElementById('vs-rival-name').textContent = rival.name;
  animateCount(document.getElementById('vs-rival-score'), rival.score, 700);
  animateCount(document.getElementById('vs-you-score'), currentAvgScore, 700);
  const vb = document.getElementById('verdict-box');
  vb.classList.remove('win','lose','tie');
  const vsCard = document.getElementById('vs-card');
  vsCard.classList.remove('fx-winner');
  if(currentAvgScore > rival.score){
    vb.innerHTML = TROPHY_ICON + ' You out-read them!';
    vb.classList.add('win'); vsCard.classList.add('fx-winner');
    fireConfetti({count:110, maxFrames:230, spread:1});
  } else if(currentAvgScore < rival.score){
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the circulation closer this time.';
    vb.classList.add('lose');
  } else {
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/></svg> Dead even!';
    vb.classList.add('tie');
  }
  renderBreakdown(scores, rival.pts);
  document.getElementById('check-reply-btn').style.display = 'none';
}

/* ---------------- Challenge link build / share (on-demand) ---------------- */
function resetChallengeLinkUI(){
  const linkInput = document.getElementById('challenge-link');
  const copyBtn = document.getElementById('copy-link-btn');
  linkInput.value = '';
  linkInput.placeholder = 'Tap Copy to generate your link…';
  copyBtn.textContent = 'Copy';
  copyBtn.classList.remove('copied');
  copyBtn.disabled = false;
  ['wa-share','tg-share'].forEach(id=>{ document.getElementById(id).classList.add('disabled'); });
}
function buildLinkFromGameCode(gameCode){
  const base = window.location.origin + window.location.pathname;
  return base + '?g=' + encodeURIComponent(gameCode);
}

async function ensureChallengeLinkReady(){
  const linkInput = document.getElementById('challenge-link');
  if(linkInput.value) return linkInput.value;

  const copyBtn = document.getElementById('copy-link-btn');
  copyBtn.disabled = true;
  copyBtn.textContent = '...';
  try{
    const gameCode = await createChallengeOnDemand(currentAvgScore, scores);
    saveMyChallenge(gameCode, currentAvgScore, scores);
    document.getElementById('check-reply-btn').style.display = 'inline-block';
    const link = buildLinkFromGameCode(gameCode);
    linkInput.value = link;

    const msg = `🌬️ I just charted the Circulation Navigator and scored ${currentAvgScore}%. Think you can place the wind belts closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🌬️ Think you can beat my Circulation Navigator score of ${currentAvgScore}%?`);
    ['wa-share','tg-share'].forEach(id=>{ document.getElementById(id).classList.remove('disabled'); });

    copyBtn.disabled = false;
    copyBtn.textContent = 'Copy';
    return link;
  }catch(e){
    copyBtn.disabled = false;
    copyBtn.textContent = 'Copy';
    showToast('Could not create link — try again');
    throw e;
  }
}

async function copyChallengeLink(){
  const copyBtn = document.getElementById('copy-link-btn');
  try{
    const link = await ensureChallengeLinkReady();
    const input = document.getElementById('challenge-link');
    input.select();
    function done(){
      showToast('Challenge link copied');
      copyBtn.textContent = 'Copied ✓';
      copyBtn.classList.add('copied');
      setTimeout(()=>{ copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1800);
    }
    navigator.clipboard.writeText(link).then(done).catch(()=>{ document.execCommand('copy'); done(); });
  }catch(e){ /* error already toasted */ }
}

async function handleShareIconClick(evt, which){
  evt.preventDefault();
  try{
    await ensureChallengeLinkReady();
    const href = document.getElementById(which === 'wa' ? 'wa-share' : 'tg-share').href;
    window.open(href, '_blank', 'noopener');
  }catch(e){ /* error already toasted */ }
  return false;
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg || 'Copied to clipboard';
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1800);
}

/* ---------------- Accepting a challenge ---------------- */
function parseChallengeString(raw){
  raw = (raw || '').trim();
  if(!raw) throw new Error('Paste a challenge link first.');
  let g;
  if(raw.includes('?')){
    const qs = raw.split('?').slice(1).join('?');
    const params = new URLSearchParams(qs);
    g = params.get('g');
  } else if(/(^|[&?])g=/.test(raw)){
    const params2 = new URLSearchParams(raw);
    g = params2.get('g');
  } else { g = raw; }
  if(!g) throw new Error('This link is missing its challenge code.');
  return g;
}

function loadChallengeGame(gameCode, gameData){
  mode = 'challenge';
  rival = { name: gameData.challengerName || 'A navigator', score: gameData.challengerScore, pts: gameData.challengerResults };
  order = gameData.order;
  currentGameCode = gameCode;
  resultPosted = false;
  beginRound();
}

let pendingChallenge = null;

function showChallengeInvite(gameCode, gameData){
  pendingChallenge = { gameCode, gameData };
  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-end').classList.add('hidden');
  document.getElementById('invite-rival-name').textContent = gameData.challengerName || 'A navigator';
  document.getElementById('screen-invite').classList.remove('hidden');
  setMapVisible(false);
  setHeaderVisible(true);
}

function acceptChallengeInvite(){
  if(!pendingChallenge) return;
  const { gameCode, gameData } = pendingChallenge;
  pendingChallenge = null;
  document.getElementById('screen-invite').classList.add('hidden');
  loadChallengeGame(gameCode, gameData);
}

function declineChallengeInvite(){
  pendingChallenge = null;
  document.getElementById('screen-invite').classList.add('hidden');
  document.getElementById('screen-start').classList.remove('hidden');
  setHeaderVisible(true);
  try{
    const url = new URL(window.location.href);
    url.searchParams.delete('g');
    window.history.replaceState({}, '', url.toString());
  }catch(e){}
}

async function acceptPastedChallenge(){
  const raw = document.getElementById('paste-input').value;
  const errBox = document.getElementById('paste-err');
  errBox.style.display = 'none';
  try{
    const gameCode = parseChallengeString(raw);
    const gameData = await fetchGame(gameCode);
    showChallengeInvite(gameCode, gameData);
  }catch(e){
    errBox.textContent = e.message || 'Could not read that challenge link.';
    errBox.style.display = 'block';
  }
}

(function autoDetectChallenge(){
  try{
    const params = new URLSearchParams(window.location.search);
    const g = params.get('g');
    if(!g) return;
    const mine = myChallenges();
    if(mine[g]){
      fetchGame(g).then(data=>{
        currentGameCode = g;
        currentAvgScore = mine[g].avg;
        scores = mine[g].scores;
        mode = 'challenge';
        document.getElementById('screen-start').classList.add('hidden');
        document.getElementById('score-hero').style.display = 'none';
        document.getElementById('final-score').textContent = currentAvgScore + '%';
        document.getElementById('final-msg').textContent = '';
        document.getElementById('screen-end').classList.remove('hidden');
        setMapVisible(false);
        setHeaderVisible(true);
        if(data.status === 'completed' && data.challengedResults){
          showReplyComparison(data);
        } else {
          document.getElementById('check-reply-btn').style.display = 'inline-block';
          showToast("Still waiting on your friend to play");
        }
      }).catch(e=>console.warn('Could not load your challenge:', e));
      return;
    }
    fetchGame(g).then(gameData=>{ showChallengeInvite(g, gameData); })
      .catch(e=>{ console.warn('Could not load challenge from URL:', e); });
  }catch(e){ /* ignore malformed links, fall back to start screen */ }
})();

/* ---------------- Confetti ---------------- */
function fireConfetti(opts){
  opts = opts || {};
  const count = opts.count || 70;
  const maxFrames = opts.maxFrames || 200;
  const spread = opts.spread || 1;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#D4A853', '#EAC072', '#4A9E7A', '#F2545F'];
  const canvas = document.createElement('canvas');
  canvas.id = 'confettiCanvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const midX = canvas.width/2;
  const halfSpread = (canvas.width*spread)/2;
  const pieces = Array.from({length:count}, ()=>({
    x: midX + (Math.random()*2-1)*halfSpread,
    y: -20 - Math.random()*canvas.height*0.3,
    w: 5+Math.random()*4, h: 7+Math.random()*5,
    color: colors[Math.floor(Math.random()*colors.length)],
    vx: (Math.random()-0.5)*3, vy: 2+Math.random()*3,
    rot: Math.random()*Math.PI, vrot: (Math.random()-0.5)*0.3
  }));
  let frame = 0;
  function loop(){
    frame++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.rot += p.vrot;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    if(frame < maxFrames) requestAnimationFrame(loop);
    else canvas.remove();
  }
  requestAnimationFrame(loop);
}

/* ---------------- Responsive resize handling ---------------- */
let lastKnownWidth = window.innerWidth;
let resizeSettleTimer = null;
function handleViewportSettle(){
  clearTimeout(resizeSettleTimer);
  resizeSettleTimer = setTimeout(function(){
    const widthChanged = window.innerWidth !== lastKnownWidth;
    lastKnownWidth = window.innerWidth;
    if (widthChanged) syncNavHeight();
    try { map.invalidateSize(); redrawActive(); } catch(e){}
  }, 150);
}
window.addEventListener('resize', handleViewportSettle);
window.visualViewport && window.visualViewport.addEventListener('resize', handleViewportSettle);
map.on('zoomend moveend', function(){ try{ redrawActive(); }catch(e){} });
setTimeout(()=> { try { map.invalidateSize(); } catch(e){} }, 200);
setTimeout(()=> { try { map.invalidateSize(); } catch(e){} }, 200);

/* ---------------- AdSense: push once per real page load ---------------- */
window.addEventListener('load', function() {
  try {
    document.querySelectorAll('.ad-slot .adsbygoogle').forEach(function() {
      (adsbygoogle = window.adsbygoogle || []).push({});
    });
  } catch (e) { console.warn('AdSense not ready yet:', e); }
});
  /* Reveal an ad slot's space only once Google actually fills it — keeps the
   push() call (and thus the real ad request Google's reviewer sees) fully
   intact, just avoids reserving visible space for a blank/unfilled slot. */
document.querySelectorAll('.ad-slot').forEach(function(slot){
  const ins = slot.querySelector('.adsbygoogle');
  if(!ins) return;
  const check = () => {
    if(ins.getAttribute('data-ad-status') === 'filled'){
      slot.classList.add('ad-filled');
    }
  };
  check();
  new MutationObserver(check).observe(ins, { attributes:true, attributeFilter:['data-ad-status'] });
});
