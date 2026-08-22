/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'india-mountain-range-navigator'; // change per-game file, e.g. 'india-river-navigator'
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
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(function(){ syncNavHeight(); });
}
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
    setTimeout(function(){ try { map.invalidateSize(); } catch(e){} }, 320);
  });
  }
});

/* ===== Exit Dialog Functions ===== */
function showExitDialog() {
  document.getElementById('exit-dialog-overlay').classList.add('show');
}
function closeExitDialog() {
  document.getElementById('exit-dialog-overlay').classList.remove('show');
}
function confirmExit() {
  window.location.href = 'index.html';
}

function goBack() {
  if (document.referrer && document.referrer.includes(window.location.host)) {
    history.back();
  } else {
    window.location.href = 'index.html';
  }
}

/* ---------------- Header visibility ---------------- */
function setHeaderVisible(visible){
  var nav = document.getElementById('siteNav');
  if (!nav) return;
  nav.classList.toggle('header-hidden', !visible);
  if (visible) {
    syncNavHeight();
  }
  requestAnimationFrame(function(){
    try { map.invalidateSize(); } catch(e){}
  });
}

/* ---------------- Mountain range data ----------------
   Each range has a rough line following its length/extent (used to draw it
   on the map) plus an "anchor" — the last point in the path, a well-known
   peak or landmark for that range — which is what scoring distances are
   measured between. Pool is 12 for now; ROUNDS_PER_GAME picks 10 of them
   per run and reshuffles the order and the decoy options every run, same
   as the river version. Add more ranges to this array later and the game
   will automatically draw from the larger pool. */
const RANGES = [

  {name:"Himalayas", fact:"The world's youngest and highest mountain system, stretching over 2,400 km from Jammu & Kashmir through Himachal Pradesh, Uttarakhand, Nepal, Sikkim and Arunachal Pradesh, and home to Kangchenjunga, India's highest peak.",
   path:[[34.3,76.0],[32.2,77.5],[30.7,79.5],[28.5,83.5],[27.7,88.15]]},

  {name:"Karakoram Range", fact:"Lying largely in Ladakh, the Karakoram is one of the world's most heavily glaciated regions outside the poles and contains K2, the world's second-highest peak, along with the Siachen Glacier.",
   path:[[35.9,74.5],[35.6,75.8],[35.5,76.5],[35.4,77.0]]},

  {name:"Aravalli Range", fact:"One of the oldest fold mountain systems on Earth, the Aravallis run roughly 700 km from Delhi through Haryana and Rajasthan to Gujarat, with Guru Shikhar near Mount Abu as their highest point.",
   path:[[28.6,76.8],[27.5,76.6],[26.4,74.6],[24.6,73.7],[24.6,72.7]]},

  {name:"Vindhya Range", fact:"A range of hills running across central India that traditionally marks the boundary between North and South India, stretching from Gujarat through Madhya Pradesh toward Uttar Pradesh and Bihar.",
   path:[[24.5,74.5],[23.8,77.0],[23.2,79.0],[22.9,80.5],[22.7,81.8]]},

  {name:"Satpura Range", fact:"A range of hills in central India running roughly parallel to the Vindhyas between the Narmada and Tapi rivers, with Dhupgarh near Pachmarhi as its highest point.",
   path:[[21.5,73.0],[21.7,75.0],[22.0,77.0],[22.3,78.0],[22.47,78.43]]},

  {name:"Western Ghats", fact:"A UNESCO World Heritage biodiversity hotspot running about 1,600 km along India's western coast from Gujarat to Tamil Nadu, with Anamudi in Kerala as its highest peak.",
   path:[[21.0,73.3],[19.0,73.4],[17.0,73.6],[15.0,74.2],[13.0,75.2],[11.5,76.3],[10.16,77.06]]},

  {name:"Eastern Ghats", fact:"A discontinuous chain of hills running along India's eastern coast from Odisha to Tamil Nadu, cut across by rivers such as the Mahanadi, Godavari, Krishna and Kaveri.",
   path:[[21.5,86.5],[19.5,84.7],[18.3,82.87]]},

  {name:"Nilgiri Hills", fact:"Meaning 'Blue Mountains', the Nilgiris rise where the Western and Eastern Ghats meet near the Tamil Nadu-Kerala-Karnataka border, with Doddabetta as their highest peak.",
   path:[[11.7,76.3],[11.5,76.5],[11.4,76.7]]},

  {name:"Purvanchal Range", fact:"The northeastern hill ranges including the Patkai, Naga and Mizo Hills that curve along India's border with Myanmar, with Mount Saramati in Nagaland as their highest peak.",
   path:[[27.5,95.7],[26.8,95.3],[25.75,95.05]]},

  {name:"Pir Panjal Range", fact:"A range of the Lesser Himalaya separating the Kashmir Valley from the Chenab valley, home to the Gulmarg ski resort and the Banihal Pass.",
   path:[[33.0,76.0],[33.5,75.0],[33.8,74.5],[34.05,74.38]]},

  {name:"Zanskar Range", fact:"A range of the Himalaya running through Ladakh east of the Great Himalaya, separating the Zanskar valley from the Indus valley and rising above 6,000 m in places.",
   path:[[32.8,78.0],[33.2,77.5],[33.4,77.3],[33.6,77.1]]},

  {name:"Shivalik Hills", fact:"The outermost and youngest foothills of the Himalaya, running along the base of the main range from Jammu & Kashmir to Assam, including the Dehradun-Mussoorie region.",
   path:[[32.5,76.5],[31.5,77.0],[30.9,77.6],[30.45,78.08]]},

  {name:"Ladakh Range",
 fact:"A high mountain range in eastern Ladakh lying north of the Indus River and south of the Karakoram Range, extending into Tibet.",
 path:[[34.8,77.2],[34.9,78.0],[34.8,78.8],[34.7,79.5]]},

{name:"Kailash Range",
 fact:"A trans-Himalayan mountain range extending across western Tibet and adjoining Ladakh, associated with Mount Kailash and the sources of major Asian rivers.",
 path:[[31.2,81.0],[31.1,81.6],[31.0,82.2]]},

{name:"Dhauladhar Range",
 fact:"A southern branch of the Himalayas in Himachal Pradesh, rising abruptly above the Kangra Valley with Hanuman Tibba as its highest peak.",
 path:[[32.4,75.9],[32.3,76.4],[32.2,76.8]]},

{name:"Mahabharat Range",
 fact:"Also called the Lesser Himalaya, this range lies south of the Great Himalayas and extends into Uttarakhand, Sikkim and Nepal.",
 path:[[30.4,79.3],[29.7,80.2],[28.5,83.0],[27.8,86.5]]},

{name:"Patkai Range",
 fact:"A mountain range forming part of the Purvanchal Hills along the India–Myanmar border in Arunachal Pradesh and Nagaland.",
 path:[[27.5,96.0],[27.0,95.8],[26.5,95.6]]},

{name:"Naga Hills",
 fact:"A mountain range extending across Nagaland and northwestern Myanmar, with Mount Saramati as its highest peak.",
 path:[[26.8,94.8],[26.3,94.9],[25.9,95.1]]},

{name:"Mizo Hills",
 fact:"A series of parallel hill ranges covering most of Mizoram and extending into Myanmar.",
 path:[[24.8,92.7],[24.2,92.8],[23.6,92.9]]},

{name:"Garo Hills",
 fact:"The westernmost hill range of Meghalaya, inhabited predominantly by the Garo people.",
 path:[[25.7,90.2],[25.5,90.5],[25.3,90.8]]},

{name:"Khasi Hills",
 fact:"A central hill range of Meghalaya, home to Shillong Peak and Cherrapunji.",
 path:[[25.6,91.5],[25.5,91.8],[25.4,92.0]]},

{name:"Jaintia Hills",
 fact:"The eastern hill range of Meghalaya, known for limestone caves and rich coal deposits.",
 path:[[25.4,92.2],[25.3,92.5],[25.2,92.8]]},

{name:"Cardamom Hills",
 fact:"A southern extension of the Western Ghats in Kerala and Tamil Nadu, famous for spice plantations and biodiversity.",
 path:[[9.9,77.1],[9.7,77.3],[9.5,77.5]]},

{name:"Anaimalai Hills",
 fact:"A section of the Western Ghats on the Kerala–Tamil Nadu border containing Anamudi, the highest peak in South India.",
 path:[[10.5,76.9],[10.3,77.0],[10.1,77.2]]}

];

const RANGE_COLORS = ['#F2545F','#5B7FFF','#D4A853','#8B7CF6']; // coral, blue, gold, violet

/* ---------------- Map setup ---------------- */
const map = L.map('map', {
  worldCopyJump:false,
  minZoom:4,
  maxZoom:10,
  zoomControl:true,
  attributionControl:true
}).setView([22.6, 80.5], 4.6);

const tiles = L.tileLayer('https://mapidesk-tile-cache.abhikr18996.workers.dev/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> · India boundary: official depiction, Govt. of India',
  maxZoom:19,
  keepBuffer:4,
  updateWhenZooming:false,
  crossOrigin:true
}).addTo(map);

const labelTiles = L.tileLayer('https://mapidesk-tile-cache.abhikr18996.workers.dev/light_only_labels/{z}/{x}/{y}{r}.png', {
  minZoom:4, maxZoom:19, keepBuffer:4, updateWhenZooming:false, crossOrigin:true
}).addTo(map);

let tilesLoaded = false;
tiles.on('load', ()=>{
  tilesLoaded = true;
  document.getElementById('map-loading').classList.add('hidden');
});
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
    }catch(e){
      console.warn('India boundary overlay source failed, trying next:', url, e);
    }
  }
  console.warn('India boundary overlay: all sources failed — falling back to base tiles only.');
}
loadIndiaBoundary();

let markerLayer = L.layerGroup().addTo(map);

/* Mountain-peak icon used for every option badge — color is the only
   thing that changes between the four choices in a round. */
function mountainSvg(color){
  return `
  <svg class="rb-mountain" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle class="rb-ring" cx="24" cy="24" r="21" fill="rgba(255,255,255,0.92)" stroke="${color}" stroke-width="2.4"/>
    <path d="M9 33 L18 16 L24 26 L30 14 L39 33 Z" fill="${color}" opacity="0.32"/>
    <path d="M7 34.5 L17 20 L23 29 L29 18 L41 34.5 Z" fill="${color}"/>
    <path d="M17 20 L19.6 23.6 L15.2 24.9 Z" fill="#fff" opacity="0.92"/>
    <path d="M29 18 L31.8 21.8 L27 23.1 Z" fill="#fff" opacity="0.92"/>
  </svg>`;
}

function rangeIcon(color){
  return L.divIcon({
    className:'',
    html:`<div class="range-badge" style="--badge-color:${color}">
            <span class="rb-glow"></span>
            ${mountainSvg(color)}
          </div>`,
    iconSize:[46,46],
    iconAnchor:[23,23]
  });
}

/* ---------------- Game state ---------------- */
let order = [];          // array of RANGES indices — the target for each round
let roundOptions = [];   // array of [idx0, idx1, idx2, idx3] — the 4 ranges shown each round
let roundIdx = 0;
let scores = [];
let results = [];
let guessed = false;
let mode = 'own';
let rival = null;          // {name, score, pts}
let currentGameCode = null; // set once a challenge is created OR accepted
let challengeCreated = false; // guards duplicate /game/create calls this session
let resultPosted = false;     // guards duplicate /game/update calls this session
let roundMarkers = [];        // {rangeIdx, marker, line} for the current round

const ROUNDS_PER_GAME = 10; // how many mountain ranges per game (pool currently has 12)

function shuffleIdx(n, count){
  const a = Array.from({length:n}, (_,i)=>i);
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return typeof count === 'number' ? a.slice(0, count) : a;
}

function shuffleArr(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// Builds the 4-option set for one round: the target range plus 3 distinct
// decoys from the pool, in a randomly shuffled order.
function buildRoundOptions(targetIdx){
  const pool = RANGES.map((_,i)=>i).filter(i=>i!==targetIdx);
  shuffleArr(pool);
  const opts = [targetIdx, ...pool.slice(0,3)];
  return shuffleArr(opts);
}

function haversine(lat1,lon1,lat2,lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

function exitToMenu(){
  showExitDialog();
}

function startFreshGame(){
  mode = 'own';
  rival = null;
  currentGameCode = null;
  challengeCreated = false;
  resultPosted = false;
  order = shuffleIdx(RANGES.length, ROUNDS_PER_GAME);
  roundOptions = order.map(buildRoundOptions);
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
  setTimeout(()=>map.invalidateSize(), 50);
}

function loadRound(){
  guessed = false;
  markerLayer.clearLayers();
  roundMarkers = [];
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = RANGES[order[roundIdx]].name;
  updateDots();
  drawRoundOptions();
}

function drawRoundOptions(){
  const opts = roundOptions[roundIdx];
  const boundsPts = [];
  opts.forEach((rangeIdx, i)=>{
    const range = RANGES[rangeIdx];
    const color = RANGE_COLORS[i];

    // soft glow underneath — gives the ridge a "backlit" feel
    const glowLine = L.polyline(range.path, {
      color, weight:9, opacity:0.16, lineCap:'round', lineJoin:'round', interactive:false
    }).addTo(markerLayer);

    // crisp ridge line on top
    const line = L.polyline(range.path, {
      color, weight:3.4, opacity:0.92, lineCap:'round', lineJoin:'round', className:'range-line'
    }).addTo(markerLayer);

    range.path.forEach(p=>boundsPts.push(p));
    const anchor = range.path[range.path.length-1];
    const marker = L.marker(anchor, {icon:rangeIcon(color), riseOnHover:true}).addTo(markerLayer);
    marker.on('click', ()=> chooseRange(rangeIdx, marker, line));
    roundMarkers.push({rangeIdx, marker, line, glowLine});
  });
  map.fitBounds(L.latLngBounds(boundsPts), {padding:[60,60], maxZoom:7});
}

function verdictFor(km){
  if(km < 150) return {label:'Exact match — well read!', cls:'good', icon:'target'};
  if(km < 400) return {label:'Excellent read!', cls:'good', icon:'check'};
  if(km < 900) return {label:'Nearby — solid instinct.', cls:'mid', icon:'compass'};
  if(km < 1800) return {label:'Right region, wrong range.', cls:'mid', icon:'compass'};
  return {label:'Way off course — but noted.', cls:'bad', icon:'x'};
}

const VERDICT_ICONS = {
  target: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" style="fill:currentColor"/></svg>',
  check: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  compass: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8l-5 3-1 5 5-3z"/></svg>',
  x: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* Trophy icon used for a strong final score */
const TROPHY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4z"/><path d="M8 4H5a3 3 0 003 3M16 4h3a3 3 0 01-3 3"/><path d="M12 11v4"/><path d="M9 20h6"/><path d="M10 17h4v3h-4z"/></svg>';

function scoreFor(km){
  return Math.max(0, Math.round(100 - km/30));
}

/* Smooth ease-out count-up used for score numbers */
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

/* ===== per-round micro-effect on guess ===== */
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

function chooseRange(rangeIdx, chosenMarker, chosenLine){
  if(guessed) return;
  guessed = true;

  const targetIdx = order[roundIdx];
  const target = RANGES[targetIdx];
  const chosen = RANGES[rangeIdx];
  const chosenAnchor = chosen.path[chosen.path.length-1];
  const targetAnchor = target.path[target.path.length-1];
  const km = haversine(chosenAnchor[0], chosenAnchor[1], targetAnchor[0], targetAnchor[1]);
  const v = verdictFor(km);
  const pts = scoreFor(km);
  const correct = rangeIdx === targetIdx;
  scores.push(pts);
  results.push({name:target.name, km:Math.round(km), pts, cls:v.cls});

  // Highlight: dim everything, lock further clicks, mark the correct range
  // and (if wrong) the one that was picked, and draw a connector between them.
  roundMarkers.forEach(rm=>{
    const el = rm.marker.getElement();
    const isTarget = rm.rangeIdx === targetIdx;
    const isChosen = rm.rangeIdx === rangeIdx;
    if(el){
      const badge = el.querySelector('.range-badge');
      if(badge){
        badge.classList.add('locked');
        if(isTarget) badge.classList.add('correct');
        else if(isChosen) badge.classList.add('wrong-picked');
        else badge.classList.add('dim');
      }
    }
    if(isTarget){
      rm.line.setStyle({weight:6, opacity:1});
      if(rm.glowLine) rm.glowLine.setStyle({opacity:0.34});
    } else if(!isChosen){
      rm.line.setStyle({opacity:0.2});
      if(rm.glowLine) rm.glowLine.setStyle({opacity:0.05});
    }
  });

  if(!correct){
    L.polyline([chosenAnchor, targetAnchor], {color:'#748A98', weight:1.4, dashArray:'4 4', opacity:0.8, interactive:false}).addTo(markerLayer);
    map.flyToBounds(L.latLngBounds([chosenAnchor, targetAnchor].concat(target.path).concat(chosen.path)), {padding:[70,70], maxZoom:7, duration:0.6});
  }

  const verdictLabel = correct
    ? `Correct — that's the ${target.name}!`
    : `Not quite — that was the ${chosen.name}. ${v.label}`;
  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${verdictLabel}  (+${pts} pts)`;
  document.getElementById('verdict-text').className = 'verdict ' + v.cls;
  document.getElementById('fact-text').textContent = target.fact;

  const rivalLine = document.getElementById('rival-line');
  if(mode === 'challenge' && rival && Array.isArray(rival.pts)){
    const theirPts = rival.pts[roundIdx];
    if(pts > theirPts){ rivalLine.textContent = `You beat your rival on this one — they scored +${theirPts} pts here.`; }
    else if(pts < theirPts){ rivalLine.textContent = `Your rival had the edge here — they scored +${theirPts} pts.`; }
    else{ rivalLine.textContent = `Dead even with your rival on this range — +${theirPts} pts each.`; }
    rivalLine.style.display = 'block';
  }

  document.getElementById('feedback').classList.add('show');
  document.getElementById('tap-hint').style.display = 'none';
  document.getElementById('next-btn').style.display = 'inline-block';
  document.getElementById('next-btn').textContent = roundIdx === order.length-1 ? 'See Results →' : 'Next Range →';

  const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  document.getElementById('score-live').textContent = avg + '%';

  updateDots();
  triggerRoundEffect(v.cls);
}

function nextRound(){
  roundIdx++;
  if(roundIdx >= order.length){
    endGame();
    return;
  }
  loadRound();
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
  if(avg >= 85) msg = "Master navigator. You could chart India's mountain ranges blind.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned navigator's eye.";
  else if(avg >= 40) msg = "Solid run. India's mountain ranges are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = TROPHY_ICON + ' You out-navigated your rival!';
      vb.classList.add('win');
      vsCard.classList.add('fx-winner');
      fireConfetti({count:110, maxFrames:230, spread:1});
    }
    else if(avg < rival.score){
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival navigated closer. Chart again!';
      vb.classList.add('lose');
    }
    else {
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/></svg> Dead even — perfectly matched navigators.';
      vb.classList.add('tie');
    }

    renderBreakdown(scores, rival.pts);

    // Post my result once — this is the ONE write for the "completing a
    // challenge" event. Guarded so refresh/double-fire never re-writes.
    postMyResultOnce(currentGameCode, avg, scores);
  } else {
    vsBlock.style.display = 'none';
    renderSoloBreakdown();
    if(avg >= 85) fireConfetti({count:70, maxFrames:200, spread:1});
  }

  // Reset the share box to its un-generated state — link is created
  // on-demand only when the user taps Copy/WhatsApp/Telegram.
  resetChallengeLinkUI();

  document.getElementById('screen-end').classList.remove('hidden');
  setMapVisible(false);
  setHeaderVisible(true);
}

function renderBreakdown(myPts, theirPts){
  const box = document.getElementById('breakdown-list');
  box.innerHTML = '';
  order.forEach((rangeIdx, i)=>{
    const mine = myPts[i], theirs = Array.isArray(theirPts) ? theirPts[i] : null;
    const row = document.createElement('div');
    row.className = 'b-row';
    row.style.animationDelay = (i * 0.06) + 's';
    if(theirs === null || theirs === undefined){
      row.innerHTML = `<span class="b-name">${RANGES[rangeIdx].name}</span>
        <span class="b-marks"><span class="b-mk ok">${mine}</span></span>`;
    } else {
      row.innerHTML = `<span class="b-name">${RANGES[rangeIdx].name}</span>
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
    row.style.animationDelay = (i * 0.06) + 's';
    row.innerHTML = `<span class="b-idx">${i+1}</span>
      <span class="b-name">${r.name}</span>
      <span class="b-dist">${r.km} km</span>
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

// gameCode is namespaced per game type so India River Navigator, Strait
// Navigator, India Mountain Range Navigator, etc. can all share one Worker
// + one KV without colliding.
function namespacedCode(rawCode){
  return `${GAME_TYPE}:${rawCode}`;
}

// ---- WRITE #1: creating a shareable challenge (only on Copy/Share tap) ----
async function createChallengeOnDemand(avgScore, myScores){
  if(challengeCreated && currentGameCode){
    return currentGameCode; // already created this run — don't write again
  }
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
      order,
      roundOptions
    })
  });
  const data = await res.json();
  if(!res.ok){ throw new Error(data.error || 'Could not create challenge link.'); }

  challengeCreated = true;
  currentGameCode = gameCode;
  return gameCode;
}

// ---- WRITE #2: posting your result against someone's challenge ----
// Guarded by both an in-memory flag and sessionStorage, so a page refresh
// on the results screen never re-fires this.
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
  }catch(e){
    // Non-fatal — the comparison already rendered client-side from `rival`.
    console.warn('Could not post result:', e);
  }
}

// ---- READ: fetching a rival's game, cached in sessionStorage ----
async function fetchGame(gameCode){
  const cacheKey = 'game-' + gameCode;
  const cached = sessionStorage.getItem(cacheKey);
  if(cached){
    try{ return JSON.parse(cached); }catch(e){ /* fall through to refetch */ }
  }
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
  }catch(e){
    showToast('Could not check right now');
  }
  btn.disabled = false; btn.textContent = "Check if they've replied";
}

function showReplyComparison(data){
  rival = { name: data.challengerName || 'A navigator', score: data.challengedScore, pts: data.challengedResults };
  document.getElementById('vs-block').style.display = 'block';
  document.getElementById('vs-rival-name').textContent = rival.name;
  animateCount(document.getElementById('vs-rival-score'), rival.score, 700);
  animateCount(document.getElementById('vs-you-score'), currentAvgScore, 700);
  const vb = document.getElementById('verdict-box');
  vb.classList.remove('win','lose','tie');
  const vsCard = document.getElementById('vs-card');
  vsCard.classList.remove('fx-winner');
  if(currentAvgScore > rival.score){
    vb.innerHTML = TROPHY_ICON + ' You out-navigated them!';
    vb.classList.add('win'); vsCard.classList.add('fx-winner');
    fireConfetti({count:110, maxFrames:230, spread:1});
  } else if(currentAvgScore < rival.score){
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They navigated closer this time.';
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
  ['wa-share','tg-share'].forEach(id=>{
    document.getElementById(id).classList.add('disabled');
  });
}

function buildLinkFromGameCode(gameCode){
  const base = window.location.origin + window.location.pathname;
  return base + '?g=' + encodeURIComponent(gameCode);
}

// Ensures a challenge exists in KV (creating it on first call only),
// fills the share UI, and returns the link. Used by Copy + both share icons
// so whichever the user taps first triggers the single write.
async function ensureChallengeLinkReady(){
  const linkInput = document.getElementById('challenge-link');
  if(linkInput.value) return linkInput.value; // already generated this run

  const copyBtn = document.getElementById('copy-link-btn');
  copyBtn.disabled = true;
  copyBtn.textContent = '...';
  try{
    const gameCode = await createChallengeOnDemand(currentAvgScore, scores);
    saveMyChallenge(gameCode, currentAvgScore, scores);
document.getElementById('check-reply-btn').style.display = 'inline-block';
    const link = buildLinkFromGameCode(gameCode);
    linkInput.value = link;

    const msg = `⛰️ I just charted the India Mountain Range Navigator and scored ${currentAvgScore}%. Think you can navigate closer? Take the same 10 ranges: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`⛰️ Think you can beat my India Mountain Range Navigator score of ${currentAvgScore}%?`);
    ['wa-share','tg-share'].forEach(id=>{
      document.getElementById(id).classList.remove('disabled');
    });

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
    navigator.clipboard.writeText(link).then(done).catch(()=>{
      document.execCommand('copy');
      done();
    });
  }catch(e){ /* error already toasted */ }
}

// WhatsApp / Telegram icons: generate the link first (if not already done),
// then open the share URL that was just filled in.
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

// Parses either a full URL/pasted text containing ?g=CODE, or a bare code.
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
  } else {
    g = raw; // assume they pasted a bare code
  }
  if(!g) throw new Error('This link is missing its challenge code.');
  return g; // this is the full namespaced gameCode, e.g. "india-mountain-range-navigator:ab12cd"
}

function loadChallengeGame(gameCode, gameData){
  mode = 'challenge';
  rival = {
    name: gameData.challengerName || 'A navigator',
    score: gameData.challengerScore,
    pts: gameData.challengerResults
  };
  order = gameData.order;
  roundOptions = Array.isArray(gameData.roundOptions) && gameData.roundOptions.length === order.length
    ? gameData.roundOptions
    : order.map(buildRoundOptions); // fallback for older/foreign payloads
  currentGameCode = gameCode;
  resultPosted = false;
  beginRound();
}

let pendingChallenge = null; // { gameCode, gameData }

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
    const gameData = await fetchGame(gameCode); // READ (cached after first fetch)
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
    fetchGame(g).then(gameData=>{
      showChallengeInvite(g, gameData);
    }).catch(e=>{
      console.warn('Could not load challenge from URL:', e);
    });
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
    try { map.invalidateSize(); } catch(e){}
  }, 150);
}
window.addEventListener('resize', handleViewportSettle);
window.visualViewport && window.visualViewport.addEventListener('resize', handleViewportSettle);
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
