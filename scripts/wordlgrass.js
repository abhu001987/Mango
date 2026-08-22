/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'grassland-navigator';
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

/* ---------------- Grassland data ----------------
   Each grassland has one or more rectangular zones covering the region
   it occupies. zone = {latMin, latMax, lonMin, lonMax}.
------------------------------------------------ */
const GRASSLANDS = [
  { name:"Prairies", category:"Temperate Grassland — USA & Canada",
    zones:[ {latMin:30, latMax:55, lonMin:-105, lonMax:-90} ],
    fact:"Vast temperate grasslands across the central United States and Canada, once home to immense bison herds and now the heart of North America's wheat and corn farming." },
  { name:"Pampas", category:"Temperate Grassland — Argentina & Uruguay",
    zones:[ {latMin:-40, latMax:-30, lonMin:-65, lonMax:-55} ],
    fact:"Fertile temperate grassland plains stretching across Argentina and Uruguay, famous for cattle ranching and the gauchos who worked them." },
  { name:"Steppes", category:"Temperate Grassland — Central Eurasia",
    zones:[ {latMin:45, latMax:55, lonMin:30, lonMax:90} ],
    fact:"A dry, treeless temperate grassland belt running across Central Asia and southern Russia, historically the route of nomadic herders and the Silk Road." },
  { name:"Veld", category:"Temperate Grassland — South Africa",
    zones:[ {latMin:-30, latMax:-22, lonMin:24, lonMax:30} ],
    fact:"Open temperate grassland and scrubland across the South African interior plateau, used for grazing cattle and sheep." },
  { name:"Downs", category:"Temperate Grassland — Australia",
    zones:[ {latMin:-35, latMax:-18, lonMin:138, lonMax:150} ],
    fact:"Rolling temperate grassland plains found across parts of Queensland and New South Wales, a mainstay of Australia's grazing industry." },
  { name:"Canterbury Plains", category:"Temperate Grassland — New Zealand",
    zones:[ {latMin:-44.5, latMax:-43, lonMin:171, lonMax:173} ],
    fact:"New Zealand's largest area of flat land, a temperate grassland region on the South Island known for sheep and dairy farming." },
  { name:"Puszta", category:"Temperate Grassland — Hungary",
    zones:[ {latMin:46, latMax:48, lonMin:19, lonMax:21.5} ],
    fact:"The great temperate grassland plain of Hungary, once open steppe and now largely farmland, with the Hortobágy remaining one of Europe's last wild grass plains." },
  { name:"Llanos", category:"Tropical Grassland — Venezuela & Colombia",
    zones:[ {latMin:3, latMax:9, lonMin:-72, lonMax:-62} ],
    fact:"Tropical grassland plains along the Orinoco River basin, flooding in the wet season and drying out under the sun in the dry season." },
  { name:"Campos", category:"Tropical Grassland — Brazil",
    zones:[ {latMin:-30, latMax:-20, lonMin:-55, lonMax:-45} ],
    fact:"Tropical and subtropical grasslands across the Brazilian highlands, used for cattle ranching south of the Amazon basin." },
  { name:"Gran Chaco", category:"Tropical Grassland — Paraguay, Argentina & Bolivia",
    zones:[ {latMin:-26, latMax:-18, lonMin:-65, lonMax:-57} ],
    fact:"A vast lowland region of tropical grassland and dry forest shared by Paraguay, Argentina and Bolivia." },
  { name:"Savanna", category:"Tropical Grassland — Tropical Africa",
    zones:[ {latMin:-15, latMax:12, lonMin:-10, lonMax:40} ],
    fact:"Tropical grassland dotted with scattered trees across much of sub-Saharan Africa, home to the continent's great herds of grazing wildlife." },
  { name:"Sahel", category:"Semi-Arid Grassland — Africa, south of the Sahara",
    zones:[ {latMin:10, latMax:16, lonMin:-17, lonMax:40} ],
    fact:"A semi-arid transitional belt of grassland and scrub running across Africa just south of the Sahara, between the desert and the wetter savanna." },
  { name:"Mongolian Steppe", category:"Temperate Grassland — Mongolia & Northern China",
  zones:[ {latMin:41, latMax:52, lonMin:87, lonMax:120} ],
  fact:"One of the world's largest remaining temperate grasslands, supporting nomadic pastoralism and iconic wildlife such as the Przewalski's horse." },
  { name:"Kazakh Steppe", category:"Temperate Grassland — Kazakhstan",
  zones:[ {latMin:46, latMax:55, lonMin:46, lonMax:88} ],
  fact:"The vast grasslands of Kazakhstan form one of Earth's largest continuous steppe ecosystems and are an important migration route for saiga antelope." },
  { name:"Patagonian Steppe", category:"Temperate Grassland — Argentina & Chile",
  zones:[ {latMin:-52, latMax:-38, lonMin:-73, lonMax:-65} ],
  fact:"A cool, windswept grassland and shrub-steppe stretching across southern Argentina and Chile, home to guanacos and rheas." },
  { name:"Tibetan Plateau Grasslands", category:"Alpine Grassland — China, India & Nepal",
  zones:[ {latMin:28, latMax:38, lonMin:78, lonMax:101} ],
  fact:"High-altitude alpine meadows and grasslands covering the Tibetan Plateau, often called the 'Roof of the World' and supporting yak pastoralism." },
  { name:"Cerrado", category:"Tropical Savanna — Brazil",
  zones:[ {latMin:-24, latMax:-3, lonMin:-60, lonMax:-42} ],
  fact:"The world's most biodiverse tropical savanna, combining grasslands, shrublands and woodlands across central Brazil." },
  { name:"Deccan Grasslands", category:"Tropical Grassland — India",
  zones:[ {latMin:13, latMax:22, lonMin:73, lonMax:81} ],
  fact:"Ancient tropical grasslands of peninsular India supporting blackbuck, Indian wolf and the critically endangered Great Indian Bustard." },
  { name:"East African Savanna", category:"Tropical Grassland — Kenya & Tanzania",
  zones:[ {latMin:-5, latMax:5, lonMin:33, lonMax:41} ],
  fact:"Open tropical grasslands famous for the Great Migration of wildebeest, zebras and gazelles across the Serengeti and Maasai Mara." },
  { name:"Forest-Steppe", category:"Temperate Grassland — Eastern Europe & Western Asia",
  zones:[ {latMin:47, latMax:56, lonMin:20, lonMax:70} ],
  fact:"A transition zone between forests and grasslands, characterized by alternating woodland and open steppe across Eastern Europe and western Asia." }
];

/* ---------------- Map setup ---------------- */
const map = L.map('map', {
  worldCopyJump:true,
  minZoom:2,
  maxZoom:9,
  zoomControl:true,
  attributionControl:true
}).setView([20,20], 2);

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
const GRASS_BLADE_SVG = '<svg viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 20V6c0-3-2-5-2-5s1 4 1 7c0-4-3-6-3-6s2 5 2 9" stroke-linecap="round"/><path d="M9 20V4c0-3 2-5 2-5s-1 4-1 7c0-4 3-6 3-6s-2 5-2 9" stroke-linecap="round"/></svg>';
function grassTuftIcon(delay){
  return L.divIcon({
    className:'',
    html:`<div class="grass-tuft" style="animation-delay:${delay}s;">${GRASS_BLADE_SVG}</div>`,
    iconSize:[20,22],
    iconAnchor:[10,20]
  });
}
function zoneLabelIcon(text){
  return L.divIcon({
    className:'',
    html:`<div class="grass-zone-label">${text}</div>`,
    iconSize:[0,0],
    iconAnchor:[0,-4]
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

const ROUNDS_PER_GAME = 10; // how many grasslands per game

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
/* A grid of sample points spread across a rectangle, for scattering grass tufts.
   Grid density scales gently with zone size, capped for performance. */
function gridPoints(rect){
  const latSpan = rect.latMax - rect.latMin;
  const lonSpan = Math.min(rect.lonMax - rect.lonMin, 220); // guard huge belts
  const cols = clamp(Math.round(lonSpan/14), 3, 7);
  const rows = clamp(Math.round(latSpan/6), 2, 4);
  const points = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const lat = rect.latMin + (latSpan*(r+0.5))/rows;
      const lon = rect.lonMin + ((rect.lonMax-rect.lonMin)*(c+0.5))/cols;
      points.push([lat, lon]);
    }
  }
  return points;
}
function formatDist(km){
  return km <= 1 ? 'inside the region' : Math.round(km) + ' km outside the region';
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
  order = shuffleIdx(GRASSLANDS.length, ROUNDS_PER_GAME);
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
  document.getElementById('strait-name').textContent = GRASSLANDS[order[roundIdx]].name;
  document.getElementById('cat-tag').textContent = GRASSLANDS[order[roundIdx]].category;
  updateDots();
  map.setView([20,20], 2);
}

function verdictFor(km){
  if(km <= 1) return {label:'Right in the grass — bullseye!', cls:'good', icon:'target'};
  if(km < 350) return {label:'Excellent reading!', cls:'good', icon:'check'};
  if(km < 800) return {label:'Close to the region.', cls:'mid', icon:'compass'};
  if(km < 1700) return {label:'Right area, rough spot.', cls:'mid', icon:'compass'};
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

const ZONE_BORDER_COLORS = { good:'#4A9E7A', mid:'#D4A853', bad:'#F2545F' };

/* Draws the target grassland's full extent — a green-tinted region with a
   scattered field of swaying grass tufts — with the border colored by how
   close the guess was. The green fill/grass always shows the true region. */
function drawGrasslandZone(target, cls){
  const borderColor = ZONE_BORDER_COLORS[cls] || ZONE_BORDER_COLORS.mid;
  target.zones.forEach((z)=>{
    const bounds = [[z.latMin, z.lonMin],[z.latMax, z.lonMax]];
    L.rectangle(bounds, {
      color: borderColor,
      weight: 2,
      dashArray: '6 5',
      fillColor: '#4E9950',
      fillOpacity: 0.22,
      interactive: false
    }).addTo(markerLayer);

    const pts = gridPoints(z);
    pts.forEach((p, i)=>{
      L.marker(p, { icon: grassTuftIcon((i%6)*0.12), interactive:false }).addTo(markerLayer);
    });

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
  const target = GRASSLANDS[order[roundIdx]];
  const match = bestZoneMatch(gLat, gLon, target.zones);
  const km = match.dist;
  const v = verdictFor(km);
  const pts = scoreFor(km);
  scores.push(pts);
  results.push({name:target.name, dist:Math.round(km), pts, cls:v.cls});

  const guessLatLng = [gLat, gLon];
  const [nLat, nLon] = nearestPointInRect(gLat, gLon, match.zone);

  markerLayer.clearLayers();
  drawGrasslandZone(target, v.cls);

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
    else{ rivalLine.textContent = `Dead even with your rival on this grassland — +${theirPts} pts each.`; }
    rivalLine.style.display = 'block';
  }

  document.getElementById('feedback').classList.add('show');
  document.getElementById('tap-hint').style.display = 'none';
  document.getElementById('next-btn').style.display = 'inline-block';
  document.getElementById('next-btn').textContent = roundIdx === order.length-1 ? 'See Results →' : 'Next Grassland →';

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
  if(avg >= 85) msg = "Master of the plains. You could chart the world's grasslands blind.";
  else if(avg >= 65) msg = "Sharp sense of the grasslands — a seasoned navigator's eye.";
  else if(avg >= 40) msg = "Solid run. The world's grass plains are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the grassland closer. Chart again!';
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
  order.forEach((gIdx, i)=>{
    const mine = myPts[i], theirs = Array.isArray(theirPts) ? theirPts[i] : null;
    const row = document.createElement('div');
    row.className = 'b-row';
    row.style.animationDelay = (i * 0.06) + 's';
    if(theirs === null || theirs === undefined){
      row.innerHTML = `<span class="b-name">${GRASSLANDS[gIdx].name}</span>
        <span class="b-marks"><span class="b-mk ok">${mine}</span></span>`;
    } else {
      row.innerHTML = `<span class="b-name">${GRASSLANDS[gIdx].name}</span>
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
    const distLabel = r.dist <= 1 ? 'in region' : r.dist + ' km out';
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
// Grassland Navigator, etc. can all share one Worker + one KV without colliding.
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the grassland closer this time.';
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

    const msg = `🌾 I just charted the Grassland Navigator and scored ${currentAvgScore}%. Think you can read the plains closer? Take the same 10 grasslands: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🌾 Think you can beat my Grassland Navigator score of ${currentAvgScore}%?`);
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
  return g; // this is the full namespaced gameCode, e.g. "grassland-navigator:ab12cd"
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
  const colors = ['#D4A853', '#7CC36A', '#4A9E7A', '#F2545F'];
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
