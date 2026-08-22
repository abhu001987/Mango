/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'places-in-news-navigator';
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
   PLACES IN NEWS DATA
   Each round is a current-affairs question tagged with a
   scope: 'india' or 'world'. The map, the highlight layer, the
   alias table, and the scoring scale ALL switch automatically
   based on this one field — so adding a new question daily is
   just adding one object below with the right scope, coordinates,
   answerNames (state name for India, country name for World) and
   a small "bullseye" box around the real location.
   ============================================================ */
function siteBox(lat, lng, half){
  half = half || 0.3;
  return [[
    [lat+half, lng-half],
    [lat+half, lng+half],
    [lat-half, lng+half],
    [lat-half, lng-half],
    [lat+half, lng-half]
  ]];
}
/* Average the corner points of a round's boxes to get its display centre (for the record marker) */
function centerOfPaths(paths){
  let latSum = 0, lngSum = 0, n = 0;
  paths.forEach(ring=>{
    for(let i=0;i<ring.length-1;i++){ latSum += ring[i][0]; lngSum += ring[i][1]; n++; }
  });
  return n ? [latSum/n, lngSum/n] : [0,0];
}

const ROUNDS = [
{
  id:'ashokan_major_rock_edicts',
  name:'Major Rock Edicts of Ashoka',
  scope:'history',
  question:'The Major Rock Edicts of Emperor Ashoka',
  fact:"The Major Rock Edicts of Emperor Ashoka, which spread the message of Dhamma after the Kalinga War, are found at Girnar, Dhauli, Jaugada and several other locations across the Indian subcontinent.",
  answerNames:['Gujarat','Odisha'],
  paths:[
    siteBox(21.52,70.46,0.5),   // Girnar
    siteBox(20.19,85.84,0.5)    // Dhauli
  ]
},

{
  id:'nalanda_university',
  name:'Nalanda University',
  scope:'history',
  question:'Nalanda University',
  fact:"Nalanda University, one of the world's earliest residential universities and a UNESCO World Heritage Site, flourished during the Gupta and Pala periods.",
  answerNames:['Bihar'],
  paths:siteBox(25.14,85.44,0.4)
},

{
  id:'battle_of_plassey',
  name:'Battle of Plassey',
  scope:'history',
  question:'The Battle of Plassey',
  fact:"The Battle of Plassey, fought in 1757 between the East India Company and Siraj-ud-Daulah, marked the beginning of British political dominance in India.",
  answerNames:['West Bengal'],
  paths:siteBox(23.80,88.25,0.5)
},

{
  id:'first_schedule',
  name:'First Schedule',
  scope:'polity',
  question:'The First Schedule of the Constitution',
  fact:"The First Schedule of the Constitution, which has frequently changed after the creation of new states and Union Territories, contains the names and territorial extent of all States and Union Territories.",
  answerNames:['States and Union Territories'],
  paths:[]
},

{
  id:'fifty_sixth_amendment',
  name:'56th Constitutional Amendment',
  scope:'polity',
  question:'The 56th Constitutional Amendment Act, 1987',
  fact:"The 56th Constitutional Amendment Act, 1987 granted statehood to Goa while Daman and Diu continued as a Union Territory.",
  answerNames:['Goa'],
  paths:siteBox(15.49,73.82,0.4)
},

{
  id:'ninth_schedule',
  name:'Ninth Schedule',
  scope:'polity',
  question:'The Ninth Schedule of the Constitution',
  fact:"The Ninth Schedule, created by the First Constitutional Amendment in 1951, was designed to protect certain laws from judicial review, primarily land reform legislation.",
  answerNames:['First Constitutional Amendment'],
  paths:[]
},

{
  id:'bombay_stock_exchange',
  name:'Bombay Stock Exchange',
  scope:'economics',
  question:'Bombay Stock Exchange (BSE)',
  fact:"The Bombay Stock Exchange, Asia's oldest stock exchange and home to the Sensex index, is located in India's financial capital.",
  answerNames:['Maharashtra'],
  paths:siteBox(18.9297,72.8331,0.15)
},

{
  id:'rbi_headquarters',
  name:'Reserve Bank of India Headquarters',
  scope:'economics',
  question:'The headquarters of the Reserve Bank of India',
  fact:"The Reserve Bank of India, India's central bank responsible for monetary policy and currency issuance, has its headquarters in Mumbai.",
  answerNames:['Maharashtra'],
  paths:siteBox(18.9326,72.8365,0.15)
},

{
  id:'gift_city',
  name:'GIFT City',
  scope:'economics',
  question:'GIFT City is located in which state?',
  fact:"GIFT City, India's first operational International Financial Services Centre (IFSC), is located between Ahmedabad and Gandhinagar.",
  answerNames:['Gujarat'],
  paths:siteBox(23.164,72.683,0.25)
},

{
  id:'wayanad_landslide',
  name:'Wayanad',
  scope:'current',
  question:'Wayanad is located in which state?',
  fact:"Wayanad, which was in the news after devastating landslides triggered by heavy rainfall, is a hilly district in the Western Ghats.",
  answerNames:['Kerala'],
  paths:siteBox(11.69,76.13,0.45)
},

{
  id:'lothal',
  name:'Lothal',
  scope:'history',
  question:'Lothal is located in which state?',
  fact:"Lothal, one of the most important cities of the Indus Valley Civilization and known for its ancient dockyard, is located in the state of Gujarat.",
  answerNames:['Gujarat'],
  paths:siteBox(22.52,72.25,0.3)
},

{
  id:'sarnath',
  name:'Sarnath',
  scope:'history',
  question:'Sarnath is located in which state?',
  fact:"Sarnath, where Gautama Buddha delivered his first sermon after attaining enlightenment and established the Buddhist Sangha, is located in the state of Uttar Pradesh.",
  answerNames:['Uttar Pradesh'],
  paths:siteBox(25.38,83.02,0.3)
},

{
  id:'halebidu',
  name:'Halebidu',
  scope:'history',
  question:'Halebidu is located in which state?',
  fact:"Halebidu, the former capital of the Hoysala dynasty and famous for its Hoysaleswara Temple, is located in Karnataka.",
  answerNames:['Karnataka'],
  paths:siteBox(13.21,75.99,0.3)
},

{
  id:'article_371g',
  name:'Article 371G',
  scope:'polity',
  question:'Article 371G applies to which state?',
  fact:"Article 371G provides special constitutional provisions to Mizoram.",
  answerNames:['Mizoram'],
  paths:siteBox(23.16,92.94,0.6)
},

{
  id:'36th_amendment',
  name:'36th Constitutional Amendment',
  scope:'polity',
  question:'The 36th Constitutional Amendment admitted which state into India?',
  fact:"The 36th Constitutional Amendment Act, 1975 admitted Sikkim as the 22nd state of India.",
  answerNames:['Sikkim'],
  paths:siteBox(27.53,88.51,0.5)
},

{
  id:'puducherry_legislature',
  name:'Puducherry',
  scope:'polity',
  question:'Puducherry is located in which Union Territory?',
  fact:"Puducherry is a Union Territory with an elected Legislative Assembly under Article 239A.",
  answerNames:['Puducherry'],
  paths:siteBox(11.94,79.81,0.3)
},

{
  id:'vizhinjam_port',
  name:'Vizhinjam International Seaport',
  scope:'economics',
  question:'Vizhinjam International Seaport is located in which state?',
  fact:"Vizhinjam International Seaport is India's first deep-water transshipment port, located in Kerala.",
  answerNames:['Kerala'],
  paths:siteBox(8.37,76.99,0.25)
},

{
  id:'dholera_sir',
  name:'Dholera Special Investment Region',
  scope:'economics',
  question:'Dholera Special Investment Region is located in which state?',
  fact:"Dholera SIR is a flagship smart industrial city under the Delhi–Mumbai Industrial Corridor in Gujarat.",
  answerNames:['Gujarat'],
  paths:siteBox(22.25,72.20,0.4)
},

{
  id:'paradip_port',
  name:'Paradip Port',
  scope:'economics',
  question:'Paradip Port is located in which state?',
  fact:"Paradip Port is one of India's major ports located in Odisha.",
  answerNames:['Odisha'],
  paths:siteBox(20.27,86.67,0.3)
},

{
  id:'silkyara_tunnel',
  name:'Silkyara Tunnel',
  scope:'current',
  question:'Silkyara Tunnel is located in which state?',
  fact:"The Silkyara Tunnel, known for the 2023 rescue operation, is located in Uttarakhand.",
  answerNames:['Uttarakhand'],
  paths:siteBox(30.88,78.34,0.3)
},
{
  id:'south_lhonak_lake',
  name:'South Lhonak Lake',
  scope:'current',
  question:'South Lhonak Lake is located in which state?',
  fact:"South Lhonak Lake came into the news after a Glacial Lake Outburst Flood (GLOF) triggered devastating floods in the Teesta basin.",
  answerNames:['Sikkim'],
  paths:siteBox(27.90,88.72,0.30)
},

{
  id:'kuno_national_park',
  name:'Kuno National Park',
  scope:'environment',
  question:'Kuno National Park is located in which state?',
  fact:"Kuno National Park gained attention as the site of India's Cheetah Reintroduction Project.",
  answerNames:['Madhya Pradesh'],
  paths:siteBox(25.93,77.38,0.40)
},

{
  id:'guneri_bhs',
  name:'Guneri Inland Mangroves',
  scope:'environment',
  question:'Guneri Inland Mangroves are located in which state?',
  fact:"Guneri Inland Mangroves were declared Gujarat's first Biodiversity Heritage Site.",
  answerNames:['Gujarat'],
  paths:siteBox(23.73,68.82,0.35)
},

{
  id:'anchar_lake',
  name:'Anchar Lake',
  scope:'environment',
  question:'Anchar Lake is located in which Union Territory?',
  fact:"Anchar Lake was in the news over concerns regarding wetland degradation and restoration efforts.",
  answerNames:['Jammu and Kashmir'],
  paths:siteBox(34.15,74.82,0.30)
},

{
  id:'bangus_valley',
  name:'Bangus Valley',
  scope:'current',
  question:'Bangus Valley is located in which Union Territory?',
  fact:"Bangus Valley has recently been promoted as an eco-tourism destination.",
  answerNames:['Jammu and Kashmir'],
  paths:siteBox(34.53,74.24,0.40)
},

{
  id:'mhadei_sanctuary',
  name:'Mhadei Wildlife Sanctuary',
  scope:'environment',
  question:'Mhadei Wildlife Sanctuary is located in which state?',
  fact:"Mhadei Wildlife Sanctuary is frequently in the news due to the Mahadayi River water dispute.",
  answerNames:['Goa'],
  paths:siteBox(15.60,74.15,0.35)
},

{
  id:'similipal_tiger_reserve',
  name:'Similipal Tiger Reserve',
  scope:'environment',
  question:'Similipal Tiger Reserve is located in which state?',
  fact:"Similipal Tiger Reserve is known for its melanistic tigers and UNESCO Biosphere Reserve status.",
  answerNames:['Odisha'],
  paths:siteBox(21.75,86.35,0.45)
},

{
  id:'kolleru_lake',
  name:'Kolleru Lake',
  scope:'environment',
  question:'Kolleru Lake is located in which state?',
  fact:"Kolleru Lake is one of India's largest freshwater lakes and a Ramsar Site.",
  answerNames:['Andhra Pradesh'],
  paths:siteBox(16.62,81.30,0.45)
},

{
  id:'d_ering_sanctuary',
  name:'D’Ering Wildlife Sanctuary',
  scope:'environment',
  question:'D’Ering Wildlife Sanctuary is located in which state?',
  fact:"D’Ering Wildlife Sanctuary was recently in the news following reports of tiger movement.",
  answerNames:['Arunachal Pradesh'],
  paths:siteBox(28.12,95.03,0.45)
},

{
  id:'hemis_national_park',
  name:'Hemis National Park',
  scope:'environment',
  question:'Hemis National Park is located in which Union Territory?',
  fact:"Hemis National Park is India's largest national park and a major habitat of the snow leopard.",
  answerNames:['Ladakh'],
  paths:siteBox(33.75,77.60,0.60)
},

{
  id:'dibang_valley',
  name:'Dibang Valley',
  scope:'current',
  question:'Dibang Valley is located in which state?',
  fact:"Dibang Valley was in the news due to the proposed Dibang Multipurpose Hydroelectric Project.",
  answerNames:['Arunachal Pradesh'],
  paths:siteBox(28.70,95.85,0.55)
},

{
  id:'great_nicobar',
  name:'Great Nicobar Island',
  scope:'current',
  question:'Great Nicobar Island belongs to which Union Territory?',
  fact:"Great Nicobar Island was in the news because of the proposed mega infrastructure development project.",
  answerNames:['Andaman and Nicobar Islands'],
  paths:siteBox(7.00,93.80,0.55)
},

{
  id:'teesta_basin',
  name:'Teesta River',
  scope:'current',
  question:'The Teesta River primarily flows through which state before entering Bangladesh?',
  fact:"The Teesta River was in the news after devastating flash floods caused by a GLOF in Sikkim.",
  answerNames:['Sikkim'],
  paths:siteBox(27.35,88.60,0.45)
},

{
  id:'loktak_lake',
  name:'Loktak Lake',
  scope:'environment',
  question:'Loktak Lake is located in which state?',
  fact:"Loktak Lake is famous for its floating phumdis and Keibul Lamjao National Park.",
  answerNames:['Manipur'],
  paths:siteBox(24.55,93.80,0.45)
},

{
  id:'keibul_lamjao',
  name:'Keibul Lamjao National Park',
  scope:'environment',
  question:'Keibul Lamjao National Park is located in which state?',
  fact:"Keibul Lamjao is the world's only floating national park and the natural habitat of the Sangai deer.",
  answerNames:['Manipur'],
  paths:siteBox(24.47,93.78,0.35)
},

{
  id:'deocha_pachami',
  name:'Deocha-Pachami Coal Block',
  scope:'economics',
  question:'Deocha-Pachami Coal Block is located in which state?',
  fact:"Deocha-Pachami is one of India's largest coal mining projects.",
  answerNames:['West Bengal'],
  paths:siteBox(23.83,87.67,0.35)
},

{
  id:'zojila_tunnel',
  name:'Zojila Tunnel',
  scope:'current',
  question:'Zojila Tunnel is being constructed in which Union Territory?',
  fact:"The Zojila Tunnel will provide all-weather connectivity between Srinagar and Leh.",
  answerNames:['Ladakh'],
  paths:siteBox(34.28,75.55,0.35)
},

{
  id:'semicon_dholera',
  name:'Dholera Semiconductor Park',
  scope:'economics',
  question:'Dholera Semiconductor Park is located in which state?',
  fact:"Dholera Semiconductor Park is being developed as a major semiconductor manufacturing hub under the India Semiconductor Mission.",
  answerNames:['Gujarat'],
  paths:siteBox(22.25,72.20,0.40)
},

{
  id:'bharat_mandapam',
  name:'Bharat Mandapam',
  scope:'current',
  question:'Bharat Mandapam is located in which city?',
  fact:"Bharat Mandapam hosted the G20 Leaders' Summit in 2023.",
  answerNames:['Delhi'],
  paths:siteBox(28.61,77.24,0.25)
},

{
  id:'namdapha',
  name:'Namdapha National Park',
  scope:'environment',
  question:'Namdapha National Park is located in which state?',
  fact:"Namdapha National Park is one of India's richest biodiversity hotspots and was recently in the news for wildlife conservation.",
  answerNames:['Arunachal Pradesh'],
  paths:siteBox(27.52,96.38,0.55)
}
];
const ROUNDS_PER_GAME = 10; // solo runs pick min(this, ROUNDS.length) at random each time. Challenge mode always uses the exact order sent by the challenger.

/* ---------------- Map setup (starts on the India view; each round re-frames itself) ---------------- */
const INDIA_HOME_VIEW = { center:[22.6, 80.0], zoom:4.4 };
const WORLD_HOME_VIEW = { center:[20, 10], zoom:2.3 };

const map = L.map('map', {
  worldCopyJump:false,
  dragging:true,
  touchZoom:true,
  doubleClickZoom:false,
  scrollWheelZoom:true,
  minZoom:2,
  maxZoom:9,
  zoomControl:true,
  attributionControl:true
}).setView(INDIA_HOME_VIEW.center, INDIA_HOME_VIEW.zoom);

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
tiles.on('load', ()=>{ tilesLoaded = true; document.getElementById('map-loading').classList.add('hidden'); });
setTimeout(()=>{ if(!tilesLoaded) document.getElementById('map-loading').classList.add('hidden'); }, 2500);

/* ---------------- India boundary overlay (always shown for context) ---------------- */
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

/* ---------------- Indian states overlay (for India-scope reveal highlighting) ---------------- */
let indiaStatesGeo = null;
const INDIA_STATES_URLS = [
  '/data/india-states-source-a.geojson',   // same-repo relative path, faster & no external dependency
  '/data/india-states-source-b.geojson'
];
async function loadIndiaStates(){
  for(const url of INDIA_STATES_URLS){
    try{
      const res = await fetch(url);
      if(!res.ok) continue;
      indiaStatesGeo = await res.json();
      return;
    }catch(e){ console.warn('India states overlay source failed, trying next:', url, e); }
  }
  console.warn('India states overlay: all sources failed — state highlighting will be unavailable.');
}
loadIndiaStates();

/* ---------------- World countries overlay (for World-scope reveal highlighting) ---------------- */
let worldCountriesGeo = null;
const WORLD_COUNTRIES_URLS = [
  '/data/world-boundaries.geojson',
  'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
  'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json'
];
async function loadWorldCountries(){
  for(const url of WORLD_COUNTRIES_URLS){
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

/* Alias tables for the few names that differ between our round data and the source datasets */
const STATE_NAME_ALIASES = {
  'delhi': ['delhi', 'nct of delhi', 'national capital territory of delhi'],
  'odisha': ['odisha', 'orissa'],
  'uttarakhand': ['uttarakhand', 'uttaranchal']
};
const COUNTRY_NAME_ALIASES = {
  'united states': ['united states', 'united states of america', 'usa', 'us'],
  'south sudan': ['south sudan', 's. sudan'],
  'myanmar': ['myanmar', 'burma'],
  'vietnam': ['vietnam', 'viet nam'],
  'laos': ['laos', "lao people's democratic republic", 'lao pdr'],
  'serbia': ['serbia', 'republic of serbia']   // add this
};

function stateFeatureMatches(feature, targetName){
  const props = (feature && feature.properties) || {};
  const raw = props.NAME_1 || props.ST_NM || props.st_nm || props.name || props.NAME || props.State || props.state || '';
  const fn = String(raw).toLowerCase().trim();
  const tgt = targetName.toLowerCase().trim();
  if(fn === tgt) return true;
  const aliases = STATE_NAME_ALIASES[tgt];
  if(aliases && aliases.includes(fn)) return true;
  return false;
}
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

/* Colors mirror the same good/mid/bad verdict palette used for round feedback,
   so the highlighted region visually echoes how close the guess was. */
const VERDICT_HIGHLIGHT_COLOR = { good:'#4A9E7A', mid:'#D4A853', bad:'#F2545F' };

function highlightAnswer(round, cls){
  const color = VERDICT_HIGHLIGHT_COLOR[cls] || '#D4A853';
  const geo = round.scope === 'world' ? worldCountriesGeo : indiaStatesGeo;
  const matcher = round.scope === 'world' ? countryFeatureMatches : stateFeatureMatches;
  if(!geo || !Array.isArray(round.answerNames) || !round.answerNames.length) return;
  round.answerNames.forEach(name=>{
    const feature = geo.features.find(f => matcher(f, name));
    if(!feature) return;
    let layer;
    try{
      layer = L.geoJSON(feature, {
        interactive:false,
        style:{ color:color, weight:2, opacity:0.9, fillColor:color, fillOpacity:0.16 }
      }).addTo(map);
    }catch(e){ return; }
    revealLayers.push(layer);
    try{
      const center = layer.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({ className:'', html:`<div class="country-label" style="--clabel-color:${color}">${name}</div>`, iconSize:[0,0] }),
        interactive:false
      }).addTo(map);
      revealLayers.push(label);
    }catch(e){ /* bounds unavailable for this geometry; skip label */ }
  });
}

/* ---------------- Record marker icon (shown over the reveal location, on top of the highlighted region) ---------------- */
function mineralIconHtml(color, label){
  return `<div class="mineral-icon-wrap">
    <svg width="36" height="26" viewBox="0 0 36 26" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 9c3-4 6-4 9 0s6 4 9 0 6-4 9 0 6 4 7 4" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M1 16c3-4 6-4 9 0s6 4 9 0 6-4 9 0 6 4 7 4" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>
    </svg>
  </div>`;
}
function mineralDivIcon(color, label){
  return L.divIcon({
    className:'',
    html: mineralIconHtml(color, label),   // ✅ matches the function you actually defined above it
    iconSize:[36,26],
    iconAnchor:[18,13]
  });
}

/* ---------------- Pin icons ---------------- */
function pinIcon(color){
  return L.divIcon({
    className:'',
    html:`<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`,
    iconSize:[26,34],
    iconAnchor:[13,34]
  });
}
const GUESS_ICON = pinIcon('#F2545F');

/* ---------------- Game state ---------------- */
let order = [];
let roundIdx = 0;
let scores = [];
let results = [];
let guessed = false;
let guessMarker = null;
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
  order = shuffleIdx(ROUNDS.length, Math.min(ROUNDS_PER_GAME, ROUNDS.length));
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

function homeViewFor(scope){
  return scope === 'world' ? WORLD_HOME_VIEW : INDIA_HOME_VIEW;
}

function loadRound(){
  guessed = false;
  clearRevealLayers();
  if(guessMarker){ map.removeLayer(guessMarker); guessMarker = null; }
  const round = ROUNDS[order[roundIdx]];
  const home = homeViewFor(round.scope);
  map.stop();
  map.flyTo(home.center, home.zoom, { duration: 0.6, easeLinearity: 0.25 });
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('legend-line').style.display = 'none';
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = round.question;
  document.getElementById('strait-region').textContent = '';
  const badge = document.getElementById('scope-badge');
  if(round.scope === 'world'){
    badge.textContent = '🌍 World Focus';
    badge.className = 'scope-badge world';
  } else {
    badge.textContent = '🇮🇳 India Focus';
    badge.className = 'scope-badge india';
  }
  updateDots();
}

/* ---------------- Tap-to-drop / drag-to-adjust pin (native Leaflet marker dragging keeps map panning conflict-free) ---------------- */
function onMapClick(e){
  if(guessed) return;
  if(!guessMarker){
    guessMarker = L.marker(e.latlng, { icon: GUESS_ICON, draggable: true, autoPan: true }).addTo(map);
  } else {
    guessMarker.setLatLng(e.latlng);
  }
  document.getElementById('tap-hint').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'inline-block';
}
map.on('click', onMapClick);

/* ---------------- Distance math (equirectangular approximation, fine at this scale) ---------------- */
function toXY(lat, lng, refLat){
  const R = 6371;
  const x = (lng * Math.PI/180) * R * Math.cos(refLat*Math.PI/180);
  const y = (lat * Math.PI/180) * R;
  return {x,y};
}
function nearestOnSegment(p, a, b){
  const refLat = (p[0]+a[0]+b[0])/3;
  const P = toXY(p[0], p[1], refLat), A = toXY(a[0], a[1], refLat), B = toXY(b[0], b[1], refLat);
  const ABx = B.x-A.x, ABy = B.y-A.y, APx = P.x-A.x, APy = P.y-A.y;
  const len2 = ABx*ABx+ABy*ABy;
  let t = len2 === 0 ? 0 : (APx*ABx+APy*ABy)/len2;
  t = Math.max(0, Math.min(1, t));
  const Cx = A.x+t*ABx, Cy = A.y+t*ABy;
  const dx = P.x-Cx, dy = P.y-Cy;
  return { dist: Math.sqrt(dx*dx+dy*dy), latlng:[ a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1]) ] };
}
/* Ray-casting point-in-polygon test on [lat,lng] pairs */
function pointInPolygon(point, vs){
  const x = point[1], y = point[0];
  let inside = false;
  for(let i = 0, j = vs.length - 1; i < vs.length; j = i++){
    const xi = vs[i][1], yi = vs[i][0];
    const xj = vs[j][1], yj = vs[j][0];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if(intersect) inside = !inside;
  }
  return inside;
}
/* Point-in-polygon for real GeoJSON geometry (coords are [lng,lat], can have holes/multipolygons) */
function pointInGeoJSONPolygon(lng, lat, geometry){
  function ringContains(ring, x, y){
    let inside = false;
    for(let i=0, j=ring.length-1; i<ring.length; j=i++){
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi)+xi);
      if(intersect) inside = !inside;
    }
    return inside;
  }
  function polygonContains(coords, x, y){
    if(!ringContains(coords[0], x, y)) return false;
    for(let k=1;k<coords.length;k++){ if(ringContains(coords[k], x, y)) return false; } // holes
    return true;
  }
  if(geometry.type === 'Polygon') return polygonContains(geometry.coordinates, lng, lat);
  if(geometry.type === 'MultiPolygon') return geometry.coordinates.some(poly => polygonContains(poly, lng, lat));
  return false;
}

/* Is the guess anywhere inside the round's actual answer state/country? */
function isInsideAnswerRegion(gLatLng, round){
  const geo = round.scope === 'world' ? worldCountriesGeo : indiaStatesGeo;
  const matcher = round.scope === 'world' ? countryFeatureMatches : stateFeatureMatches;
  if(!geo) return false;
  const [lat, lng] = gLatLng;
  return round.answerNames.some(name=>{
    const feature = geo.features.find(f => matcher(f, name));
    return feature ? pointInGeoJSONPolygon(lng, lat, feature.geometry) : false;
  });
}
function nearestOnPaths(p, paths){
  // Inside the answer's marker box? Full credit — distance 0.
  for(const path of paths){
    if(pointInPolygon(p, path)){
      return { dist: 0, latlng: p };
    }
  }
  // Otherwise, distance to the nearest edge (existing near-miss logic).
  let best = null;
  paths.forEach(path=>{
    for(let i=0;i<path.length-1;i++){
      const r = nearestOnSegment(p, path[i], path[i+1]);
      if(!best || r.dist < best.dist) best = r;
    }
  });
  return best;
}

/* ---------------- Scoring — scale switches with the round's scope ----------------
   India questions use a tight scale (states are close together); World questions
   use a loose scale (countries are continents apart). */
function scoreFor(km, scope){
  return scope === 'world'
    ? Math.max(0, Math.round(100 - km/40))
    : Math.max(0, Math.round(100 - km/5));
}
function verdictFor(km, scope){
  if(scope === 'world'){
    if(km <= 80) return {label:'Bullseye — right on it!', cls:'good', icon:'target'};
    if(km < 250) return {label:'Excellent placement!', cls:'good', icon:'check'};
    if(km < 700) return {label:'Nearby — solid instinct.', cls:'mid', icon:'compass'};
    if(km < 1800) return {label:'Right general region.', cls:'mid', icon:'compass'};
    return {label:'Way off course — but noted.', cls:'bad', icon:'x'};
  }
  if(km <= 15) return {label:'Bullseye — right on it!', cls:'good', icon:'target'};
  if(km < 60) return {label:'Excellent placement!', cls:'good', icon:'check'};
  if(km < 150) return {label:'Nearby — solid instinct.', cls:'mid', icon:'compass'};
  if(km < 350) return {label:'Right general zone.', cls:'mid', icon:'compass'};
  return {label:'Way off course — but noted.', cls:'bad', icon:'x'};
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
  } else {
    if(feedback){
      feedback.classList.remove('fx-pulse-mid'); void feedback.offsetWidth;
      feedback.classList.add('fx-pulse-mid');
      setTimeout(()=> feedback.classList.remove('fx-pulse-mid'), 700);
    }
  }
}

function lockGuess(){
  if(guessed || !guessMarker) return;
  guessed = true;

  const round = ROUNDS[order[roundIdx]];
  const gll = guessMarker.getLatLng();
  const gLatLng = [gll.lat, gll.lng];
  const nearest = nearestOnPaths(gLatLng, round.paths);
  const km = Math.round(nearest.dist);

  // If you're outside the answer's marker box but inside the state/country that
  // actually holds the answer, don't torch the score for it — cap the *scoring* distance.
  const insideRegion = km > 0 && isInsideAnswerRegion(gLatLng, round);
  const cap = round.scope === 'world' ? 600 : 100;
  const scoringKm = insideRegion ? Math.min(km, cap) : km;

  const v = verdictFor(scoringKm, round.scope);
  const pts = scoreFor(scoringKm, round.scope);
  scores.push(pts);
  results.push({name:round.name, km, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit both the guess and the real answer, so the
  // player actually sees where it lies — even if they'd panned elsewhere.
  const boundsPoints = [gLatLng];
  round.paths.forEach(path=> path.forEach(pt=> boundsPoints.push(pt)));
  const bounds = L.latLngBounds(boundsPoints);

  let revealed = false;
  function fireReveal(){
    if(revealed) return;
    revealed = true;
    revealResult(round, gLatLng, nearest, km, v, pts);
  }
  map.once('moveend', fireReveal);
  map.flyToBounds(bounds, { padding:[80,80], maxZoom: round.scope === 'world' ? 7 : 8, duration:1.1, easeLinearity:0.25 });
  setTimeout(fireReveal, 1600); // fallback in case flyToBounds doesn't fire moveend
}

function revealResult(round, gLatLng, nearest, km, v, pts){
  clearRevealLayers();

  round.paths.forEach((path, i)=>{
    const line = L.polyline(path, { color:'#D4A853', weight:4, opacity:0.92 }).addTo(map);
    revealLayers.push(line);
    if(i === 0){
      const mid = path[Math.floor(path.length/2)];
      const label = L.marker(mid, {
        icon: L.divIcon({ className:'', html:`<div class="line-label">${round.name}</div>`, iconSize:[0,0] }),
        interactive:false
      }).addTo(map);
      revealLayers.push(label);
    }
  });

  highlightAnswer(round, v.cls);

  // Record marker, placed directly over the answer's location on the
  // map so the player sees exactly where — and over which state/country — it lies.
  const centerColor = VERDICT_HIGHLIGHT_COLOR[v.cls] || '#D4A853';
  const recordMarker = L.marker(centerOfPaths(round.paths), {
    icon: mineralDivIcon(centerColor, round.answerNames[0]),
    interactive:false
  }).addTo(map);
  revealLayers.push(recordMarker);

  const connector = L.polyline([gLatLng, nearest.latlng], { color:'#F2545F', weight:2, opacity:0.85, dashArray:'6,6' }).addTo(map);
  revealLayers.push(connector);

  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${v.label}  (${km===0?'right on it':km+' km off'} · +${pts} pts)`;
  document.getElementById('verdict-text').className = 'verdict ' + v.cls;
  document.getElementById('fact-text').textContent = round.fact;
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
  if(avg >= 85) msg = "Sharp current-affairs eye — India and world map questions won't stand a chance.";
  else if(avg >= 65) msg = "Solid reading of the news map, across both India and the world.";
  else if(avg >= 40) msg = "Decent run. Keep following the headlines and chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the news map closer. Chart again!';
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
      <span class="b-dist">${r.km} km off</span>
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
    vb.innerHTML = TROPHY_ICON + ' You out-read them!';
    vb.classList.add('win'); vsCard.classList.add('fx-winner');
    fireConfetti({count:110, maxFrames:230, spread:1});
  } else if(currentAvgScore < rival.score){
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the news map closer this time.';
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
    const msg = `📰 I just charted the Places in News Navigator and scored ${currentAvgScore}%. Think you can pin the news map closer? Take the same questions: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`📰 Think you can beat my Places in News Navigator score of ${currentAvgScore}%?`);
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
