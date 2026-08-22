/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'mountain-navigator';
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
      setTimeout(function(){ try { map.invalidateSize(); } catch(e){} }, 320);
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
  requestAnimationFrame(function(){ try { map.invalidateSize(); } catch(e){} });
}

/* ============================================================
   MOUNTAIN DATA
   Each entry is stored as a single summit coordinate wrapped in a
   "paths" array (kept from the original data shape) — only
   paths[0][0] is used now, as the correct-answer location.
   Educational approximations, not survey-grade GIS data.
   ============================================================ */
const ROUNDS = [

  { id:'everest', name:'Mount Everest', region:'',
    fact:"The world's highest mountain above sea level, located in the Himalayas on the Nepal–China border.",
    countries:['Nepal','China'],
    paths:[[[27.9881,86.9250],[27.9881,86.9250]]]
  },

  { id:'k2', name:'K2', region:'',
    fact:"The world's second-highest mountain, located in the Karakoram on the Pakistan–China border and known for its exceptionally difficult climbing conditions.",
    countries:['Pakistan','China'],
    paths:[[[35.8808,76.5156],[35.8808,76.5156]]]
  },

  { id:'kangchenjunga', name:'Kangchenjunga', region:'',
    fact:"The world's third-highest mountain, located on the India–Nepal border in the eastern Himalayas and traditionally regarded as sacred by local communities.",
    countries:['India','Nepal'],
    paths:[[[27.7025,88.1475],[27.7025,88.1475]]]
  },

  { id:'lhotse', name:'Lhotse', region:'',
    fact:"The world's fourth-highest mountain, immediately south of Mount Everest and connected to it by the South Col.",
    countries:['Nepal','China'],
    paths:[[[27.9617,86.9330],[27.9617,86.9330]]]
  },

  { id:'makalu', name:'Mount Makalu', region:'',
    fact:"The world's fifth-highest mountain, a striking four-sided pyramid in the eastern Himalayas near the Nepal–China border.",
    countries:['Nepal','China'],
    paths:[[[27.8897,87.0889],[27.8897,87.0889]]]
  },

  { id:'cho_oyu', name:'Cho Oyu', region:'',
    fact:"The world's sixth-highest mountain, located in the Himalayas on the Nepal–China border and considered one of the more accessible 8,000-metre peaks.",
    countries:['Nepal','China'],
    paths:[[[28.0942,86.6608],[28.0942,86.6608]]]
  },

  { id:'dhaulagiri', name:'Dhaulagiri I', region:'',
    fact:"The world's seventh-highest mountain, located entirely in Nepal and forming one of the major peaks of the central Himalayas.",
    countries:['Nepal'],
    paths:[[[28.6967,83.4875],[28.6967,83.4875]]]
  },

  { id:'manaslu', name:'Manaslu', region:'',
    fact:"The world's eighth-highest mountain, located in Nepal's Mansiri Himal and known as the 'Mountain of the Spirit'.",
    countries:['Nepal'],
    paths:[[[28.5497,84.5617],[28.5497,84.5617]]]
  },

  { id:'nanga_parbat', name:'Nanga Parbat', region:'',
    fact:"The world's ninth-highest mountain, located in the western Himalayas of Pakistan and famous for its enormous vertical relief and challenging climbing routes.",
    countries:['Pakistan'],
    paths:[[[35.2372,74.5892],[35.2372,74.5892]]]
  },

  { id:'annapurna', name:'Annapurna I', region:'',
    fact:"The world's tenth-highest mountain, located in north-central Nepal. Its surrounding massif is famous for dramatic mountain landscapes and deep valleys.",
    countries:['Nepal'],
    paths:[[[28.5958,84.5614],[28.5958,84.5614]]]
  },

  { id:'gasherbrum_i', name:'Gasherbrum I', region:'',
    fact:"Also known as Hidden Peak, it is the world's eleventh-highest mountain and lies in the Karakoram on the Pakistan–China border.",
    countries:['Pakistan','China'],
    paths:[[[35.7242,76.6964],[35.7242,76.6964]]]
  },

  { id:'broad_peak', name:'Broad Peak', region:'',
    fact:"The world's twelfth-highest mountain, located in the Karakoram near K2 on the Pakistan–China border.",
    countries:['Pakistan','China'],
    paths:[[[35.8119,76.5656],[35.8119,76.5656]]]
  },

  { id:'gasherbrum_ii', name:'Gasherbrum II', region:'',
    fact:"The world's thirteenth-highest mountain and one of the major 8,000-metre peaks of the Karakoram, located on the Pakistan–China border.",
    countries:['Pakistan','China'],
    paths:[[[35.7580,76.6530],[35.7580,76.6530]]]
  },

  { id:'shishapangma', name:'Shishapangma', region:'',
    fact:"The world's fourteenth-highest mountain and the only 8,000-metre peak located entirely within China, in the Himalayas of Tibet.",
    countries:['China'],
    paths:[[[28.3520,85.7790],[28.3520,85.7790]]]
  },

  { id:'gyachung_kang', name:'Gyachung Kang', region:'',
    fact:"The highest mountain between Mount Everest and Cho Oyu and the world's fifteenth-highest major peak, located on the Nepal–China border.",
    countries:['Nepal','China'],
    paths:[[[28.0900,86.7400],[28.0900,86.7400]]]
  },

  { id:'nanda_devi', name:'Nanda Devi', region:'',
    fact:"The second-highest mountain in India and the highest mountain located entirely within India, rising in the Garhwal Himalayas of Uttarakhand.",
    countries:['India'],
    paths:[[[30.3750,79.9700],[30.3750,79.9700]]]
  },

  { id:'kamet', name:'Kamet', region:'',
    fact:"One of the highest peaks of India, located in the Garhwal Himalayas of Uttarakhand near the Tibet border.",
    countries:['India'],
    paths:[[[30.9218,79.5947],[30.9218,79.5947]]]
  },

  { id:'saltoro_kangri', name:'Saltoro Kangri', region:'',
    fact:"The highest peak of the Saltoro Mountains in the Karakoram, located in the disputed Siachen region near the India–Pakistan frontier.",
    countries:['India','Pakistan'],
    paths:[[[35.3970,76.8420],[35.3970,76.8420]]]
  },

  { id:'tirich_mir', name:'Tirich Mir', region:'',
    fact:"The highest mountain of the Hindu Kush and the highest peak entirely within Pakistan, rising above the Chitral region.",
    countries:['Pakistan'],
    paths:[[[36.2550,71.8400],[36.2550,71.8400]]]
  },

  { id:'noshaq', name:'Noshaq', region:'',
    fact:"The highest mountain in Afghanistan and the second-highest peak of the Hindu Kush, located on the Afghanistan–Pakistan border.",
    countries:['Afghanistan','Pakistan'],
    paths:[[[36.4350,71.8320],[36.4350,71.8320]]]
  },

  { id:'island_peak', name:'Island Peak', region:'',
    fact:"A prominent trekking peak in Nepal's Khumbu region, located near Mount Everest and officially known as Imja Tse.",
    countries:['Nepal'],
    paths:[[[27.9247,86.9308],[27.9247,86.9308]]]
  },

  { id:'ama_dablam', name:'Ama Dablam', region:'',
    fact:"One of the most recognizable peaks of the Everest region, famous for its steep pyramid shape and dramatic ridges above the Khumbu Valley.",
    countries:['Nepal'],
    paths:[[[27.8617,86.8610],[27.8617,86.8610]]]
  },

  { id:'mount_elbrus', name:'Mount Elbrus', region:'',
    fact:"The highest mountain in Europe and a dormant volcano in the Caucasus Mountains, commonly included among the Seven Summits.",
    countries:['Russia'],
    paths:[[[43.3550,42.4420],[43.3550,42.4420]]]
  },

  { id:'mont_blanc', name:'Mont Blanc', region:'',
    fact:"The highest mountain in the Alps and one of Europe's most famous peaks, situated on the France–Italy border.",
    countries:['France','Italy'],
    paths:[[[45.8326,6.8652],[45.8326,6.8652]]]
  },

  { id:'matterhorn', name:'Matterhorn', region:'',
    fact:"One of the world's most recognizable mountains, a distinctive pyramid-shaped peak in the Alps on the Switzerland–Italy border.",
    countries:['Switzerland','Italy'],
    paths:[[[45.9763,7.6586],[45.9763,7.6586]]]
  },

  { id:'aconcagua', name:'Aconcagua', region:'',
    fact:"The highest mountain in both the Western Hemisphere and the Southern Hemisphere and the highest peak outside Asia.",
    countries:['Argentina'],
    paths:[[[-32.6532,-70.0109],[-32.6532,-70.0109]]]
  },

  { id:'denali', name:'Denali', region:'',
    fact:"The highest mountain in North America, located in Alaska and rising dramatically above the surrounding Alaska Range.",
    countries:['United States of America'],
    paths:[[[63.0695,-151.0074],[63.0695,-151.0074]]]
  },

  { id:'mount_logan', name:'Mount Logan', region:'',
    fact:"The highest mountain in Canada and the second-highest peak in North America, located in the Saint Elias Mountains of Yukon.",
    countries:['Canada'],
    paths:[[[60.5670,-140.4050],[60.5670,-140.4050]]]
  },

  { id:'kilimanjaro', name:'Mount Kilimanjaro', region:'',
    fact:"Africa's highest mountain and the world's highest free-standing mountain, consisting of three volcanic cones: Kibo, Mawenzi and Shira.",
    countries:['Tanzania'],
    paths:[[[-3.0674,37.3556],[-3.0674,37.3556]]]
  },

  { id:'mount_stanley', name:'Mount Stanley', region:'',
    fact:"The highest mountain of Uganda and the Democratic Republic of the Congo and the third-highest mountain in Africa, located in the Rwenzori Mountains.",
    countries:['Uganda','Democratic Republic of the Congo'],
    paths:[[[0.3833,29.8719],[0.3833,29.8719]]]
  },

  { id:'mount_ararat', name:'Mount Ararat', region:'',
    fact:"A dormant volcanic massif in eastern Turkey and the country's highest peak, traditionally associated with the biblical story of Noah's Ark.",
    countries:['Turkey'],
    paths:[[[39.7019,44.2986],[39.7019,44.2986]]]
  },

  { id:'damavand', name:'Mount Damavand', region:'',
    fact:"The highest mountain in Iran and the highest volcano in Asia, rising from the Alborz Mountains south of the Caspian Sea.",
    countries:['Iran'],
    paths:[[[35.9550,52.1090],[35.9550,52.1090]]]
  },

  { id:'zhengshan', name:'Mount Gongga', region:'',
    fact:"Also known as Minya Konka, it is the highest mountain in Sichuan and one of the highest peaks outside the main Himalayan-Karakoram ranges.",
    countries:['China'],
    paths:[[[29.5960,101.8790],[29.5960,101.8790]]]
  },

  { id:'mount_tai', name:'Mount Tai', region:'',
    fact:"One of China's most sacred mountains and a major cultural and religious landmark associated with imperial pilgrimage and Taoism.",
    countries:['China'],
    paths:[[[36.2550,117.1000],[36.2550,117.1000]]]
  },

  { id:'mount_kinabalu', name:'Mount Kinabalu', region:'',
    fact:"The highest mountain in Malaysia and on the island of Borneo, famous for exceptional plant diversity and granite formations.",
    countries:['Malaysia'],
    paths:[[[6.0750,116.5580],[6.0750,116.5580]]]
  },

  { id:'puncak_jaya', name:'Puncak Jaya', region:'',
    fact:"The highest mountain in Indonesia, Oceania and the island of New Guinea, located in the Sudirman Range of Papua.",
    countries:['Indonesia'],
    paths:[[[-4.0589,137.1940],[-4.0589,137.1940]]]
  },

  { id:'mount_apo', name:'Mount Apo', region:'',
    fact:"The highest mountain in the Philippines, a potentially active stratovolcano located on Mindanao.",
    countries:['Philippines'],
    paths:[[[7.0040,125.2700],[7.0040,125.2700]]]
  },

  { id:'mount_ruapehu', name:'Mount Ruapehu', region:'',
    fact:"The highest mountain in New Zealand's North Island and an active stratovolcano within Tongariro National Park.",
    countries:['New Zealand'],
    paths:[[[-39.2820,175.5620],[-39.2820,175.5620]]]
  },

  { id:'mount_cook', name:'Aoraki / Mount Cook', region:'',
    fact:"The highest mountain in New Zealand, located in the Southern Alps and surrounded by glaciers and spectacular alpine landscapes.",
    countries:['New Zealand'],
    paths:[[[-43.5950,170.1410],[-43.5950,170.1410]]]
  },

  { id:'kosciuszko', name:'Mount Kosciuszko', region:'',
    fact:"The highest mountain on mainland Australia and the highest point of the Australian Alps.",
    countries:['Australia'],
    paths:[[[-36.4559,148.2632],[-36.4559,148.2632]]]
  },

  { id:'vinson', name:'Vinson Massif', region:'',
    fact:"The highest mountain in Antarctica and one of the Seven Summits, located in the Sentinel Range of the Ellsworth Mountains.",
    countries:['Antarctica'],
    paths:[[[-78.5254,-85.6171],[-78.5254,-85.6171]]]
  },

  { id:'mauna_kea', name:'Mauna Kea', region:'',
    fact:"A dormant volcano on Hawaii whose summit is the highest point in the Hawaiian Islands. Measured from its submarine base, it rises more than 10,000 metres.",
    countries:['United States of America'],
    paths:[[[19.8207,-155.4681],[19.8207,-155.4681]]]
  },

  { id:'mount_erebus', name:'Mount Erebus', region:'',
    fact:"The southernmost active volcano on Earth, located on Ross Island in Antarctica and known for its persistent lava lake.",
    countries:['Antarctica'],
    paths:[[[-77.5280,167.1530],[-77.5280,167.1530]]]
  },

  { id:'mount_meru', name:'Mount Meru', region:'',
    fact:"A prominent stratovolcano in northern Tanzania and the second-highest mountain in Tanzania after Kilimanjaro.",
    countries:['Tanzania'],
    paths:[[[-3.2460,36.7480],[-3.2460,36.7480]]]
  },

  { id:'mount_kenya', name:'Mount Kenya', region:'',
    fact:"Africa's second-highest mountain, located near the equator in central Kenya and protected within Mount Kenya National Park.",
    countries:['Kenya'],
    paths:[[[-0.1521,37.3084],[-0.1521,37.3084]]]
  },

  { id:'ras_dashen', name:'Ras Dashen', region:'',
    fact:"The highest mountain in Ethiopia and one of the highest peaks in Africa, located in the Simien Mountains.",
    countries:['Ethiopia'],
    paths:[[[13.2360,38.3700],[13.2360,38.3700]]]
  },

  { id:'toubkal', name:'Mount Toubkal', region:'',
    fact:"The highest mountain in Morocco and North Africa, located in the High Atlas Mountains south of Marrakech.",
    countries:['Morocco'],
    paths:[[[31.0590,-7.9150],[31.0590,-7.9150]]]
  },

  { id:'mount_cameroon', name:'Mount Cameroon', region:'',
    fact:"An active volcano and the highest mountain in Cameroon and West Africa, rising directly from the Gulf of Guinea coast.",
    countries:['Cameroon'],
    paths:[[[4.2030,9.1700],[4.2030,9.1700]]]
  },

  { id:'table_mountain', name:'Table Mountain', region:'',
    fact:"The iconic flat-topped mountain overlooking Cape Town and one of South Africa's most recognizable natural landmarks.",
    countries:['South Africa'],
    paths:[[[-33.9628,18.4098],[-33.9628,18.4098]]]
  }

];
const ROUNDS_PER_GAME = 10; // solo runs pick 10 at random each time. Challenge mode always uses the exact order sent by the challenger.
const OPTIONS_PER_ROUND = 4; // one correct pin + this many minus one decoys

/* ---------------- Map setup ---------------- */
const map = L.map('map', {
  worldCopyJump:false,
  dragging:true,
  touchZoom:true,
  doubleClickZoom:false,
  scrollWheelZoom:true,
  minZoom:2,
  maxZoom:8,
  zoomControl:true,
  attributionControl:true
}).setView([20, 30], 2);

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
const INDIA_BOUNDARY_URLS = [
  '/data/india-boundary.geojson'
];
async function loadIndiaBoundary(){
  for(const url of INDIA_BOUNDARY_URLS){
    try{
      const res = await fetch(url);
      if(!res.ok) continue;
      const geo = await res.json();
      L.geoJSON(geo, { interactive:false, style:{ color:'#D4A853', weight:2.2, opacity:1, fillColor:'#D4A853', fillOpacity:0.06 } }).addTo(map);
      return;
    }catch(e){ console.warn('India boundary overlay source failed, trying next:', url, e); }
  }
  console.warn('India boundary overlay: all sources failed — falling back to base tiles only.');
}
loadIndiaBoundary();

/* ---------------- World countries overlay (for round-result highlighting) ---------------- */
let worldCountriesGeo = null;
const WORLD_BOUNDARY_URLS = [
  'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
  'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json'
];
async function loadWorldCountries(){
  for(const url of WORLD_BOUNDARY_URLS){
    try{
      const res = await fetch(url);
      if(!res.ok) continue;
      worldCountriesGeo = await res.json();
      return;
    }catch(e){ console.warn('World countries overlay source failed, trying next:', url, e); }
  }
  console.warn('World countries overlay: all sources failed — country highlighting will be unavailable.');
}
loadWorldCountries();

const COUNTRY_NAME_ALIASES = {
  'united states of america': ['united states of america','united states','usa','us'],
  'south korea': ['south korea','republic of korea','korea, south'],
  'north korea': ['north korea','democratic people\'s republic of korea','korea, north','dem. rep. korea'],
  'russia': ['russia','russian federation'],
  'taiwan': ['taiwan','republic of china'],
  'democratic republic of the congo': ['democratic republic of the congo','dem. rep. congo','congo, dem. rep.','dr congo']
};
function countryFeatureMatches(feature, targetName){
  const props = (feature && feature.properties) || {};
  const raw = props.name || props.NAME || props.ADMIN || props.admin || '';
  const fn = String(raw).toLowerCase().trim();
  const tgt = targetName.toLowerCase().trim();
  if(fn === tgt) return true;
  const aliases = COUNTRY_NAME_ALIASES[tgt];
  if(aliases && aliases.includes(fn)) return true;
  return false;
}

const VERDICT_HIGHLIGHT_COLOR = { good:'#4A9E7A', mid:'#D4A853', bad:'#F2545F' };

function highlightCountries(names, cls){
  if(!worldCountriesGeo || !Array.isArray(names) || !names.length) return;
  const color = VERDICT_HIGHLIGHT_COLOR[cls] || '#D4A853';
  names.forEach(name=>{
    const feature = worldCountriesGeo.features.find(f => countryFeatureMatches(f, name));
    if(!feature) return;
    let layer;
    try{
      layer = L.geoJSON(feature, {
        interactive:false,
        style:{ color:color, weight:2, opacity:0.9, fillColor:color, fillOpacity:0.16 }
      }).addTo(map);
    }catch(e){ return; }
    revealLayers.push(layer);
  });
}

/* ---------------- Choice pin icon (the 4 tappable answer markers) ---------------- */
const MOUNTAIN_GLYPH = '<path d="M3 19h18L14 6l-3.5 5L9 9z"/><path d="M5.5 15.3L9 9l1.6 2.3"/>';
function choicePinIcon(state){
  // state: 'default' | 'correct' | 'wrong' | 'dim'
  const cls = 'choice-pin' + (state && state !== 'default' ? ' ' + state : '') + (state === 'dim' ? '' : ' locked-ready');
  return L.divIcon({
    className:'',
    html:`<div class="${cls} pop"><svg viewBox="0 0 24 24">${MOUNTAIN_GLYPH}</svg></div>`,
    iconSize:[44,44],
    iconAnchor:[22,22]
  });
}

/* ---------------- Game state ---------------- */
let order = [];
let roundIdx = 0;
let scores = [];
let results = [];
let guessed = false;
let optionMarkers = [];  // {marker, isCorrect, roundRef}
let revealLayers = [];
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

function clearRevealLayers(){
  revealLayers.forEach(l=>{ try{ map.removeLayer(l); }catch(e){} });
  revealLayers = [];
}
function clearOptionMarkers(){
  optionMarkers.forEach(o=>{ try{ map.removeLayer(o.marker); }catch(e){} });
  optionMarkers = [];
}

/* Build 4 answer options for a round: the real summit + 3 decoys pulled
   from other, different mountains so they're plausible but wrong. */
function buildOptionsForRound(round){
  const correctPt = round.paths[0][0];
  const otherIdxs = ROUNDS.map((_,i)=>i).filter(i => ROUNDS[i].id !== round.id);
  const decoyIdxs = shuffleIdx(otherIdxs.length, OPTIONS_PER_ROUND - 1).map(i => otherIdxs[i]);
  const opts = [{ lat: correctPt[0], lng: correctPt[1], isCorrect:true }];
  decoyIdxs.forEach(i=>{
    const p = ROUNDS[i].paths[0][0];
    opts.push({ lat:p[0], lng:p[1], isCorrect:false });
  });
  // shuffle final order so the correct pin isn't always first
  const shuffled = shuffleIdx(opts.length).map(i => opts[i]);
  return shuffled;
}

function loadRound(){
  guessed = false;
  clearRevealLayers();
  clearOptionMarkers();
  map.stop();
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('legend-line').style.display = 'none';
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = ROUNDS[order[roundIdx]].name;
  document.getElementById('strait-region').textContent = ROUNDS[order[roundIdx]].region;
  updateDots();

  const round = ROUNDS[order[roundIdx]];
  const opts = buildOptionsForRound(round);
  const boundsPoints = [];
  opts.forEach(opt=>{
    const marker = L.marker([opt.lat, opt.lng], { icon: choicePinIcon('default'), interactive:true, keyboard:false }).addTo(map);
    marker.on('click', ()=> chooseOption(opt, marker, round));
    optionMarkers.push({ marker, opt });
    boundsPoints.push([opt.lat, opt.lng]);
  });
  const bounds = L.latLngBounds(boundsPoints);
  map.flyToBounds(bounds, { padding:[70,70], maxZoom:6, duration:0.7, easeLinearity:0.25 });
}

/* ---------------- Scoring (binary: right pin = full points) ---------------- */
function verdictForCorrect(isCorrect){
  return isCorrect
    ? {label:'Correct!', cls:'good', icon:'check'}
    : {label:"Not quite — here's the right one.", cls:'bad', icon:'x'};
}
const VERDICT_ICONS = {
  target: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" style="fill:currentColor"/></svg>',
  check: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  compass: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8l-5 3-1 5 5-3z"/></svg>',
  x: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
const TROPHY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4z"/><path d="M8 4H5a3 3 0 003 3M16 4h3a3 3 0 01-3 3"/><path d="M12 11v4"/><path d="M9 20h6"/><path d="M10 17h4v3h-4z"/></svg>';

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
  }
}

/* Called when the player taps one of the 4 answer pins. */
function chooseOption(opt, chosenMarker, round){
  if(guessed) return;
  guessed = true;

  const pts = opt.isCorrect ? 100 : 0;
  scores.push(pts);
  results.push({name:round.name, correct:opt.isCorrect, pts, cls: opt.isCorrect ? 'good' : 'bad'});

  document.getElementById('tap-hint').style.display = 'none';

  // Re-style every pin: correct = green, the one you tapped (if wrong) = red, others = dimmed.
  optionMarkers.forEach(o=>{
    let state = 'dim';
    if(o.opt.isCorrect) state = 'correct';
    else if(o.marker === chosenMarker) state = 'wrong';
    o.marker.setIcon(choicePinIcon(state));
  });

  const v = verdictForCorrect(opt.isCorrect);
  highlightCountries(round.countries, v.cls);

  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${v.label}  (+${pts} pts)`;
  document.getElementById('verdict-text').className = 'verdict ' + v.cls;
  document.getElementById('fact-text').textContent = round.region + ' — ' + round.fact;
  document.getElementById('legend-line').style.display = 'flex';

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
  if(avg >= 85) msg = "Master of world geography. You could pinpoint these mountains from memory.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of the world's peaks.";
  else if(avg >= 40) msg = "Solid run. These mountains are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the mountains closer. Chart again!';
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
      <span class="b-dist">${r.correct ? 'Correct' : 'Incorrect'}</span>
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
const MY_CHALLENGES_KEY = 'my-challenges-' + GAME_TYPE;
const CHALLENGE_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000; // matches your worker's 60-day TTL

function myChallenges(){
  try{ return JSON.parse(localStorage.getItem(MY_CHALLENGES_KEY) || '{}'); }
  catch(e){ return {}; }
}

function saveMyChallenge(gameCode, avg, scoreArr){
  const all = myChallenges();
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the mountains closer this time.';
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
    const msg = `⛰️ I just charted the Mountains Navigator and scored ${currentAvgScore}%. Think you can pick the peaks closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`⛰️ Think you can beat my Mountains Navigator score of ${currentAvgScore}%?`);
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
