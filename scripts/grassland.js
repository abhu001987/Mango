/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'wind-navigator'; // change per-game file, e.g. 'desert-navigator'
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

/* ---------------- Wind data ----------------
   Each wind has one or more rectangular zones it blows across.
   zone = {latMin, latMax, lonMin, lonMax, dir} — dir is the compass
   bearing (0=N, 90=E, 180=S, 270=W) the wind blows TOWARD, used to
   rotate the animated flow arrows.
------------------------------------------------ */
const WINDS = [
  { name:"Trade Winds", category:"Planetary Wind",
    zones:[
      {latMin:5, latMax:30, lonMin:-180, lonMax:180, dir:225},
      {latMin:-30, latMax:-5, lonMin:-180, lonMax:180, dir:315}
    ],
    fact:"Steady belts blowing from the subtropical highs toward the equator on both sides — NE trades in the north, SE trades in the south — powered old sailing ships across the oceans." },
  { name:"Westerlies", category:"Planetary Wind",
    zones:[
      {latMin:35, latMax:60, lonMin:-180, lonMax:180, dir:90},
      {latMin:-60, latMax:-35, lonMin:-180, lonMax:180, dir:90}
    ],
    fact:"Blow from the subtropical highs toward the poles, roughly west to east, in the mid-latitudes of both hemispheres — the engine behind most weather systems in temperate zones." },
  { name:"Polar Easterlies", category:"Planetary Wind",
    zones:[
      {latMin:60, latMax:90, lonMin:-180, lonMax:180, dir:270},
      {latMin:-90, latMax:-60, lonMin:-180, lonMax:180, dir:270}
    ],
    fact:"Cold, dry winds that flow from the polar highs toward lower latitudes, generally east to west, in the belt closest to both poles." },
  { name:"Monsoon Winds", category:"Periodic Wind",
    zones:[ {latMin:5, latMax:30, lonMin:65, lonMax:100, dir:45} ],
    fact:"Seasonal winds that reverse direction across the year — the moisture-laden southwest monsoon brings summer rain to South Asia, while a drier northeast flow dominates in winter." },
  { name:"Land Breeze & Sea Breeze", category:"Periodic Wind",
    zones:[ {latMin:8, latMax:20, lonMin:72, lonMax:76, dir:90} ],
    fact:"A daily coastal cycle — by day the sea breeze blows from sea to land as the land heats faster, and by night the land breeze reverses it as the sea stays warmer. Shown here over India's west coast as a classic example." },
  { name:"Mountain Breeze & Valley Breeze", category:"Periodic Wind",
    zones:[ {latMin:28, latMax:34, lonMin:76, lonMax:82, dir:0} ],
    fact:"A daily mountain cycle — the valley breeze rises up sun-warmed slopes by day, and the mountain breeze sinks back down as cooler, denser air by night. Shown here over the Himalayan foothills as a classic example." },
  { name:"Loo", category:"Local Wind — India",
    zones:[ {latMin:22, latMax:30, lonMin:70, lonMax:88, dir:90} ],
    fact:"A scorching, dry summer wind that sweeps across the plains of North India and Pakistan in the afternoon, with temperatures that can pose a real heatstroke risk." },
  { name:"Chinook", category:"Local Wind — North America",
    zones:[ {latMin:40, latMax:55, lonMin:-110, lonMax:-100, dir:90} ],
    fact:"A warm, dry wind that descends the eastern slopes of the Rockies, capable of melting snow and lifting temperatures dramatically within hours — nicknamed the 'snow eater'." },
  { name:"Foehn", category:"Local Wind — Alps",
    zones:[ {latMin:45, latMax:48, lonMin:6, lonMax:14, dir:0} ],
    fact:"A warm, dry downslope wind on the northern side of the Alps, formed as moist air loses its moisture climbing the southern slopes then warms rapidly descending the other side." },
  { name:"Mistral", category:"Local Wind — France",
    zones:[ {latMin:43, latMax:45, lonMin:3, lonMax:6, dir:180} ],
    fact:"A strong, cold, dry wind that funnels down the Rhone valley in southern France toward the Mediterranean, often arriving with a clear, sharp blue sky behind it." },
  { name:"Bora", category:"Local Wind — Adriatic",
    zones:[ {latMin:42, latMax:46, lonMin:13, lonMax:19, dir:225} ],
    fact:"A cold, gusty wind that plunges from the mountains of the Balkan interior down to the Adriatic coast, strongest in the cooler months." },
  { name:"Sirocco", category:"Local Wind — Sahara/Mediterranean",
    zones:[ {latMin:20, latMax:40, lonMin:-5, lonMax:20, dir:0} ],
    fact:"A hot, dust-laden wind that originates over the Sahara and sweeps north across the Mediterranean, often arriving in Southern Europe carrying a haze of desert sand." },
  { name:"Harmattan", category:"Local Wind — West Africa",
    zones:[ {latMin:5, latMax:20, lonMin:-15, lonMax:15, dir:225} ],
    fact:"A dry, dusty trade wind that blows from the Sahara toward the Gulf of Guinea in the cooler months, often reducing visibility across West Africa with fine desert dust." },
  { name:"Subtropical Westerly Jet", category:"Upper-Atmospheric Wind",
    zones:[
      {latMin:25, latMax:35, lonMin:-180, lonMax:180, dir:90},
      {latMin:-35, latMax:-25, lonMin:-180, lonMax:180, dir:90}
    ],
    fact:"A fast, high-altitude westerly river of air near 30° latitude in both hemispheres, formed where tropical and mid-latitude air masses meet." },
  { name:"Tropical Easterly Jet", category:"Upper-Atmospheric Wind",
    zones:[ {latMin:5, latMax:20, lonMin:-20, lonMax:100, dir:270} ],
    fact:"A high-altitude easterly jet that forms over South Asia and Africa during the northern summer, closely linked to the strength of the Indian monsoon." },
  { name:"Polar Front Jet", category:"Upper-Atmospheric Wind",
    zones:[
      {latMin:50, latMax:65, lonMin:-180, lonMax:180, dir:90},
      {latMin:-65, latMax:-50, lonMin:-180, lonMax:180, dir:90}
    ],
    fact:"A wavy, fast-moving westerly jet that forms where cold polar air meets warmer mid-latitude air, steering many of the storm systems in temperate regions." }
];

/* ---------------- Map setup ---------------- */
const map = L.map('map', {
  worldCopyJump:true,
  minZoom:2,
  maxZoom:9,
  zoomControl:true,
  attributionControl:true
}).setView([20,20], 2);

const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> · India boundary: official depiction, Govt. of India',
  subdomains:'abcd',
  maxZoom:19,
  keepBuffer:4,
  updateWhenZooming:false,
  crossOrigin:true
}).addTo(map);

const labelTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  subdomains:'abcd',
  minZoom:4,
  maxZoom:19,
  keepBuffer:4,
  updateWhenZooming:false,
  crossOrigin:true
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

function pinIcon(cls){
  return L.divIcon({
    className:'',
    html:`<div class="pin-wrap ${cls}"><div class="pin-ring"></div><div class="pin-core"></div></div>`,
    iconSize:[22,22],
    iconAnchor:[11,11]
  });
}
function pingIcon(){
  return L.divIcon({ className:'', html:`<div class="pin-ping"></div>`, iconSize:[6,6], iconAnchor:[3,3] });
}
function windArrowIcon(dirDeg, cls, delay){
  return L.divIcon({
    className:'',
    html:`<div class="wind-arrow ${cls}" style="animation-delay:${delay}s;"><svg viewBox="0 0 24 24" style="transform:rotate(${dirDeg}deg);"><path d="M12 2l7 18-7-5-7 5z"/></svg></div>`,
    iconSize:[26,26],
    iconAnchor:[13,13]
  });
}
function zoneLabelIcon(text){
  return L.divIcon({
    className:'',
    html:`<div class="wind-zone-label">${text}</div>`,
    iconSize:[0,0],
    iconAnchor:[0,-6]
  });
}

/* ---------------- Game state ---------------- */
let order = [];
let roundIdx = 0;
let scores = [];
let results = [];
let guessed = false;
let mode = 'own';
let rival = null;          // {name, score, pts}
let currentGameCode = null; // set once a challenge is created OR accepted
let challengeCreated = false; // guards duplicate /game/create calls this session
let resultPosted = false;     // guards duplicate /game/update calls this session

const ROUNDS_PER_GAME = 10; // how many winds per game

function shuffleIdx(n, count){
  const a = Array.from({length:n}, (_,i)=>i);
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return typeof count === 'number' ? a.slice(0, count) : a;
}

function haversine(lat1,lon1,lat2,lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

/* Nearest point inside (or on the edge of) a rectangular zone */
function nearestPointInRect(lat, lon, rect){
  return [ clamp(lat, rect.latMin, rect.latMax), clamp(lon, rect.lonMin, rect.lonMax) ];
}
function distToRect(lat, lon, rect){
  const [latN, lonN] = nearestPointInRect(lat, lon, rect);
  return haversine(lat, lon, latN, lonN);
}
/* Finds the zone (of possibly several) closest to a click, and the distance (0 = inside) */
function bestZoneMatch(lat, lon, zones){
  let best = null;
  zones.forEach(z=>{
    const d = distToRect(lat, lon, z);
    if(!best || d < best.dist) best = { zone:z, dist:d };
  });
  return best;
}
/* A handful of sample points spread across a rectangle, for placing flow arrows */
function sampleRectPoints(rect, n){
  n = n || 5;
  const points = [];
  const latMid = (rect.latMin + rect.latMax)/2;
  const latSpan = rect.latMax - rect.latMin;
  const lonSpan = rect.lonMax - rect.lonMin;
  for(let i=0;i<n;i++){
    const t = (i+0.5)/n;
    const lon = rect.lonMin + lonSpan*t;
    const latOff = (i % 2 === 0 ? 0.28 : -0.28) * latSpan;
    points.push([ clamp(latMid + latOff, rect.latMin, rect.latMax), lon ]);
  }
  return points;
}
function formatDist(km){
  return km <= 1 ? 'inside the zone' : Math.round(km) + ' km outside the zone';
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
  order = shuffleIdx(WINDS.length, ROUNDS_PER_GAME);
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
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = WINDS[order[roundIdx]].name;
  document.getElementById('cat-tag').textContent = WINDS[order[roundIdx]].category;
  updateDots();
  map.setView([20,20], 2);
}

function verdictFor(km){
  if(km <= 1) return {label:'Right in the flow — bullseye!', cls:'good', icon:'target'};
  if(km < 350) return {label:'Excellent reading!', cls:'good', icon:'check'};
  if(km < 800) return {label:'Close to the zone.', cls:'mid', icon:'compass'};
  if(km < 1700) return {label:'Right region, rough spot.', cls:'mid', icon:'compass'};
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
  if(km <= 1) return 100;
  return Math.max(0, Math.round(90 - km/25));
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

map.on('click', onMapClick);

const ZONE_COLORS = { good:'#4A9E7A', mid:'#D4A853', bad:'#F2545F' };

/* Draws the target wind's full zone (all rects) with a dashed outline and
   a small flock of animated flow arrows through it, colored by verdict. */
function drawWindZone(target, cls){
  const color = ZONE_COLORS[cls] || ZONE_COLORS.mid;
  target.zones.forEach((z, zi)=>{
    const bounds = [[z.latMin, z.lonMin],[z.latMax, z.lonMax]];
    L.rectangle(bounds, {
      color: color,
      weight: 2,
      dashArray: '6 5',
      fillColor: color,
      fillOpacity: 0.10,
      interactive: false
    }).addTo(markerLayer);

    const pts = sampleRectPoints(z, 5);
    pts.forEach((p, i)=>{
      L.marker(p, { icon: windArrowIcon(z.dir, cls, i*0.15), interactive:false }).addTo(markerLayer);
    });

    // Label the zone once per rectangle, near its top edge
    const labelLat = z.latMax - (z.latMax - z.latMin) * 0.06;
    const labelLon = (z.lonMin + z.lonMax) / 2;
    L.marker([labelLat, labelLon], { icon: zoneLabelIcon(target.name), interactive:false }).addTo(markerLayer);
  });
}

function onMapClick(evt){
  if(guessed) return;
  guessed = true;

  const gLat = evt.latlng.lat;
  const gLon = evt.latlng.lng;
  const target = WINDS[order[roundIdx]];
  const match = bestZoneMatch(gLat, gLon, target.zones);
  const km = match.dist;
  const v = verdictFor(km);
  const pts = scoreFor(km);
  scores.push(pts);
  results.push({name:target.name, dist:Math.round(km), pts, cls:v.cls});

  const guessLatLng = [gLat, gLon];
  const [nLat, nLon] = nearestPointInRect(gLat, gLon, match.zone);

  markerLayer.clearLayers();
  drawWindZone(target, v.cls);

  L.marker(guessLatLng, {icon: pingIcon(), interactive:false}).addTo(markerLayer);
  if(km > 1){
    L.polyline([guessLatLng, [nLat, nLon]], {color:'#748A98', weight:1.4, dashArray:'4 4', opacity:0.75, interactive:false}).addTo(markerLayer);
  }
  L.marker(guessLatLng, {icon: pinIcon('pin-guess'), interactive:false}).addTo(markerLayer);

  const zoneBounds = L.latLngBounds(target.zones.map(z=>[[z.latMin,z.lonMin],[z.latMax,z.lonMax]]).flat());
  const combinedBounds = L.latLngBounds([guessLatLng]).extend(zoneBounds);
  map.flyToBounds(combinedBounds, {padding:[70,70], maxZoom:6, duration:0.6});

  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${v.label}  (${formatDist(km)} · +${pts} pts)`;
  document.getElementById('verdict-text').className = 'verdict ' + v.cls;
  document.getElementById('fact-text').textContent = target.fact;

  const rivalLine = document.getElementById('rival-line');
  if(mode === 'challenge' && rival && Array.isArray(rival.pts)){
    const theirPts = rival.pts[roundIdx];
    if(pts > theirPts){ rivalLine.textContent = `You beat your rival on this one — they scored +${theirPts} pts here.`; }
    else if(pts < theirPts){ rivalLine.textContent = `Your rival had the edge here — they scored +${theirPts} pts.`; }
    else{ rivalLine.textContent = `Dead even with your rival on this wind — +${theirPts} pts each.`; }
    rivalLine.style.display = 'block';
  }

  document.getElementById('feedback').classList.add('show');
  document.getElementById('tap-hint').style.display = 'none';
  document.getElementById('next-btn').style.display = 'inline-block';
  document.getElementById('next-btn').textContent = roundIdx === order.length-1 ? 'See Results →' : 'Next Wind →';

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
  if(avg >= 85) msg = "Master meteorologist. You could chart the atmosphere blind.";
  else if(avg >= 65) msg = "Sharp sense of the winds — a seasoned navigator's eye.";
  else if(avg >= 40) msg = "Solid run. The world's winds are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the wind closer. Chart again!';
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
  order.forEach((wIdx, i)=>{
    const mine = myPts[i], theirs = Array.isArray(theirPts) ? theirPts[i] : null;
    const row = document.createElement('div');
    row.className = 'b-row';
    row.style.animationDelay = (i * 0.06) + 's';
    if(theirs === null || theirs === undefined){
      row.innerHTML = `<span class="b-name">${WINDS[wIdx].name}</span>
        <span class="b-marks"><span class="b-mk ok">${mine}</span></span>`;
    } else {
      row.innerHTML = `<span class="b-name">${WINDS[wIdx].name}</span>
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
    const distLabel = r.dist <= 1 ? 'in zone' : r.dist + ' km out';
    row.innerHTML = `<span class="b-idx">${i+1}</span>
      <span class="b-name">${r.name}</span>
      <span class="b-dist">${distLabel}</span>
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

// gameCode is namespaced per game type so Strait Navigator, Wind Navigator,
// etc. can all share one Worker + one KV without colliding.
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
      order
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
    vb.innerHTML = TROPHY_ICON + ' You out-navigated them!';
    vb.classList.add('win'); vsCard.classList.add('fx-winner');
    fireConfetti({count:110, maxFrames:230, spread:1});
  } else if(currentAvgScore < rival.score){
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the wind closer this time.';
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

    const msg = `🌬️ I just charted the Wind Navigator and scored ${currentAvgScore}%. Think you can read the atmosphere closer? Take the same 10 winds: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🌬️ Think you can beat my Wind Navigator score of ${currentAvgScore}%?`);
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
  return g; // this is the full namespaced gameCode, e.g. "wind-navigator:ab12cd"
}

function loadChallengeGame(gameCode, gameData){
  mode = 'challenge';
  rival = {
    name: gameData.challengerName || 'A navigator',
    score: gameData.challengerScore,
    pts: gameData.challengerResults
  };
  order = gameData.order;
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
