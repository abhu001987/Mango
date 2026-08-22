/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'superlatives-navigator';
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
   QUESTION DATA
   Each question has a single correct-answer coordinate, wrapped in the
   same "paths" shape used by the other Navigator games (a path of two
   identical points) so the existing distance/scoring code works
   unchanged — educational approximations, not survey-grade GIS data.
   ============================================================ */
const ROUNDS = [

  { id:'pop_1', question:"Which is the most populous country in the world?", answer:'India',
    fact:"India overtook China to become the world's most populous country around 2023, with a population of well over 1.4 billion people.",
    countries:['India'],
    paths:[[[21.0,78.0],[21.0,78.0]]]
  },

  { id:'pop_2', question:"Which is the second-most populous country in the world?", answer:'China',
    fact:"China was the world's most populous country for decades before India overtook it, and it remains a close second with over 1.4 billion people.",
    countries:['China'],
    paths:[[[35.0,105.0],[35.0,105.0]]]
  },

  { id:'city_1', question:"Which is the most populous city in the world by urban agglomeration?", answer:'Tokyo, Japan',
    fact:"Tokyo's greater urban agglomeration, spilling across Kanto into cities like Yokohama and Kawasaki, houses well over 35 million people — the largest metropolitan population on Earth.",
    countries:['Japan'],
    paths:[[[35.6762,139.6503],[35.6762,139.6503]]]
  },

  { id:'city_2', question:"Which is the largest city in the world by urban agglomeration population?", answer:'Tokyo, Japan',
    fact:"By this measure Tokyo again tops the list — its metropolitan area is so vast that it outranks even famously huge agglomerations like Delhi, Shanghai and São Paulo.",
    countries:['Japan'],
    paths:[[[35.6762,139.6503],[35.6762,139.6503]]]
  },

  { id:'city_3', question:"Which is the largest city in the world by area within administrative boundaries?", answer:'Chongqing, China',
    fact:"Chongqing's municipal boundaries sprawl across roughly 82,000 square kilometers of mountainous southwestern China — far larger in administrative area than any other city, though much of that land is rural.",
    countries:['China'],
    paths:[[[29.5630,106.5516],[29.5630,106.5516]]]
  },
  { id:'demo_1',
  question:"Which country is currently in Stage 5 of the Demographic Transition Model?",
  answer:'Japan',
  fact:"Japan has very low birth rates, an aging population, and natural population decline, characteristics of Stage 5.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_2',
  question:"Which country has the highest median age in the world?",
  answer:'Monaco',
  fact:"Monaco has the world's highest median age due to long life expectancy and low birth rates.",
  countries:['Monaco'],
  paths:[[[43.7384,7.4246],[43.7384,7.4246]]]
},

{ id:'demo_3',
  question:"Which continent has the fastest population growth rate?",
  answer:'Africa',
  fact:"Africa has the world's highest population growth due to high fertility rates and a young population.",
  countries:['Africa'],
  paths:[[[1.6508,17.6791],[1.6508,17.6791]]]
},

{ id:'demo_4',
  question:"Which country is projected to contribute the largest share of global population growth by 2050?",
  answer:'Nigeria',
  fact:"Nigeria is expected to experience one of the fastest population increases in the coming decades.",
  countries:['Nigeria'],
  paths:[[[9.0820,8.6753],[9.0820,8.6753]]]
},

{ id:'demo_5',
  question:"Which country was the first to officially implement a nationwide One-Child Policy?",
  answer:'China',
  fact:"China introduced the One-Child Policy in 1979 to control rapid population growth.",
  countries:['China'],
  paths:[[[35.8617,104.1954],[35.8617,104.1954]]]
},

{ id:'demo_6',
  question:"Which country has the world's highest total fertility rate?",
  answer:'Niger',
  fact:"Niger consistently records the highest fertility rate, averaging around six or more children per woman.",
  countries:['Niger'],
  paths:[[[17.6078,8.0817],[17.6078,8.0817]]]
},

{ id:'demo_7',
  question:"Which country has the highest life expectancy in the world?",
  answer:'Monaco',
  fact:"Monaco has one of the highest life expectancies, exceeding 85 years.",
  countries:['Monaco'],
  paths:[[[43.7384,7.4246],[43.7384,7.4246]]]
},

{ id:'demo_8',
  question:"Which country has the world's largest overseas diaspora?",
  answer:'India',
  fact:"India has the largest diaspora population, with millions of people living abroad.",
  countries:['India'],
  paths:[[[21.0,78.0],[21.0,78.0]]]
},

{ id:'demo_9',
  question:"Which country receives the highest amount of remittances in the world?",
  answer:'India',
  fact:"India has consistently been the world's largest recipient of remittances sent by overseas workers.",
  countries:['India'],
  paths:[[[21.0,78.0],[21.0,78.0]]]
},

{ id:'demo_10',
  question:"Which country hosts the largest number of international migrants?",
  answer:'United States',
  fact:"The United States hosts more international migrants than any other country.",
  countries:['United States'],
  paths:[[[39.8283,-98.5795],[39.8283,-98.5795]]]
},

{ id:'demo_11',
  question:"Which country has the lowest population density among sovereign states?",
  answer:'Mongolia',
  fact:"Mongolia has one of the lowest population densities due to its vast land area and small population.",
  countries:['Mongolia'],
  paths:[[[46.8625,103.8467],[46.8625,103.8467]]]
},

{ id:'demo_12',
  question:"Which country has the highest population density among sovereign states?",
  answer:'Monaco',
  fact:"Monaco is the world's most densely populated sovereign country.",
  countries:['Monaco'],
  paths:[[[43.7384,7.4246],[43.7384,7.4246]]]
},

{ id:'demo_13',
  question:"Which country is expected to experience the largest population decline by 2100?",
  answer:'China',
  fact:"China's population is projected to decline significantly because of low fertility and aging.",
  countries:['China'],
  paths:[[[35.8617,104.1954],[35.8617,104.1954]]]
},

{ id:'demo_14',
  question:"Which country has the highest urban population in the world?",
  answer:'China',
  fact:"China has the world's largest urban population, with hundreds of millions living in cities.",
  countries:['China'],
  paths:[[[35.8617,104.1954],[35.8617,104.1954]]]
},

{ id:'demo_15',
  question:"Which country has the highest rural population in the world?",
  answer:'India',
  fact:"Despite rapid urbanization, India still has the world's largest rural population.",
  countries:['India'],
  paths:[[[21.0,78.0],[21.0,78.0]]]
},

{ id:'demo_16',
  question:"Which country has the largest working-age population in the world?",
  answer:'India',
  fact:"India has the world's largest working-age population, providing a significant demographic dividend.",
  countries:['India'],
  paths:[[[21.0,78.0],[21.0,78.0]]]
},

{ id:'demo_17',
  question:"Which country has the highest old-age dependency ratio?",
  answer:'Japan',
  fact:"Japan's aging society has resulted in one of the world's highest old-age dependency ratios.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_18',
  question:"Which continent has the youngest median age?",
  answer:'Africa',
  fact:"Africa has the youngest population in the world, with a median age below 20 years.",
  countries:['Africa'],
  paths:[[[1.6508,17.6791],[1.6508,17.6791]]]
},

{ id:'demo_19',
  question:"Which country has the world's largest refugee-hosting population?",
  answer:'Turkey',
  fact:"Turkey has hosted more refugees than any other country in recent years.",
  countries:['Turkey'],
  paths:[[[38.9637,35.2433],[38.9637,35.2433]]]
},

{ id:'demo_20',
  question:"Which country has the highest net immigration in the world?",
  answer:'United States',
  fact:"The United States consistently records one of the world's highest net migration gains.",
  countries:['United States'],
  paths:[[[39.8283,-98.5795],[39.8283,-98.5795]]]
},

{ id:'demo_21',
  question:"Which country is known for having the oldest population in the world?",
  answer:'Japan',
  fact:"Japan has one of the highest proportions of people aged 65 years and above.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_22',
  question:"Which continent accounts for nearly 60% of the world's population?",
  answer:'Asia',
  fact:"Asia is home to almost three-fifths of the global population.",
  countries:['Asia'],
  paths:[[[34.0479,100.6197],[34.0479,100.6197]]]
},

{ id:'demo_23',
  question:"Which country has successfully reversed decades of population decline through immigration-led growth?",
  answer:'Canada',
  fact:"Canada relies heavily on immigration to sustain population and economic growth.",
  countries:['Canada'],
  paths:[[[56.1304,-106.3468],[56.1304,-106.3468]]]
},

{ id:'demo_24',
  question:"Which country has the world's highest proportion of foreign-born residents?",
  answer:'United Arab Emirates',
  fact:"Nearly 90% of the UAE's population consists of expatriates.",
  countries:['United Arab Emirates'],
  paths:[[[23.4241,53.8478],[23.4241,53.8478]]]
},

{ id:'demo_25',
  question:"Which country first reached a population of one billion people?",
  answer:'China',
  fact:"China became the first country in history to surpass one billion population in the early 1980s.",
  countries:['China'],
  paths:[[[35.8617,104.1954],[35.8617,104.1954]]]
},
  { id:'demo_26',
  question:"Which country has the largest Muslim population in the world?",
  answer:'Indonesia',
  fact:"Indonesia is home to the world's largest Muslim population, with over 240 million Muslims.",
  countries:['Indonesia'],
  paths:[[[-0.7893,113.9213],[-0.7893,113.9213]]]
},

{ id:'demo_27',
  question:"Which country has the largest Christian population in the world?",
  answer:'United States',
  fact:"The United States has the world's largest Christian population by absolute numbers.",
  countries:['United States'],
  paths:[[[39.8283,-98.5795],[39.8283,-98.5795]]]
},

{ id:'demo_28',
  question:"Which country has the world's largest Hindu population?",
  answer:'India',
  fact:"More than 90% of the world's Hindus live in India.",
  countries:['India'],
  paths:[[[21.0,78.0],[21.0,78.0]]]
},

{ id:'demo_29',
  question:"Which country has the largest Buddhist population in the world?",
  answer:'China',
  fact:"China has the world's largest Buddhist population, although many people practice Buddhism alongside other traditions.",
  countries:['China'],
  paths:[[[35.8617,104.1954],[35.8617,104.1954]]]
},

{ id:'demo_30',
  question:"Which country has the highest percentage of urban population in the world?",
  answer:'Singapore',
  fact:"Singapore is almost entirely urban, with nearly 100% of its population living in urban areas.",
  countries:['Singapore'],
  paths:[[[1.3521,103.8198],[1.3521,103.8198]]]
},

{ id:'demo_31',
  question:"Which country has the lowest fertility rate among major countries?",
  answer:'South Korea',
  fact:"South Korea has recorded the world's lowest fertility rate in recent years.",
  countries:['South Korea'],
  paths:[[[35.9078,127.7669],[35.9078,127.7669]]]
},

{ id:'demo_32',
  question:"Which country is projected to become the third-most populous country by 2050?",
  answer:'Nigeria',
  fact:"According to UN projections, Nigeria is expected to overtake the United States by around 2050.",
  countries:['Nigeria'],
  paths:[[[9.0820,8.6753],[9.0820,8.6753]]]
},

{ id:'demo_33',
  question:"Which country has the highest annual population growth rate among major nations?",
  answer:'Nigeria',
  fact:"Nigeria's high fertility rate contributes to one of the fastest population growth rates among major countries.",
  countries:['Nigeria'],
  paths:[[[9.0820,8.6753],[9.0820,8.6753]]]
},

{ id:'demo_34',
  question:"Which continent has the lowest population growth rate?",
  answer:'Europe',
  fact:"Europe has the slowest population growth due to low fertility and an aging population.",
  countries:['Europe'],
  paths:[[[54.5260,15.2551],[54.5260,15.2551]]]
},

{ id:'demo_35',
  question:"Which country has the highest percentage of people aged 65 years and above?",
  answer:'Japan',
  fact:"Nearly one-third of Japan's population is aged 65 years or older.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_36',
  question:"Which country has the largest number of internally displaced persons due to conflict?",
  answer:'Sudan',
  fact:"Sudan has one of the world's largest internally displaced populations due to ongoing conflict.",
  countries:['Sudan'],
  paths:[[[12.8628,30.2176],[12.8628,30.2176]]]
},

{ id:'demo_37',
  question:"Which organization publishes the World Population Prospects report?",
  answer:'United Nations',
  fact:"The UN Department of Economic and Social Affairs publishes the World Population Prospects.",
  countries:[],
  paths:[]
},

{ id:'demo_38',
  question:"Which country has the largest Slavic population in the world?",
  answer:'Russia',
  fact:"Russia is home to the largest Slavic population worldwide.",
  countries:['Russia'],
  paths:[[[61.5240,105.3188],[61.5240,105.3188]]]
},

{ id:'demo_39',
  question:"Which country has the highest proportion of elderly people in Asia?",
  answer:'Japan',
  fact:"Japan has the oldest population structure in Asia.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_40',
  question:"Which country records one of the highest levels of immigration per capita?",
  answer:'Canada',
  fact:"Canada admits one of the highest numbers of immigrants relative to its population.",
  countries:['Canada'],
  paths:[[[56.1304,-106.3468],[56.1304,-106.3468]]]
},

{ id:'demo_41',
  question:"Which country has the world's largest Arabic-speaking population?",
  answer:'Egypt',
  fact:"Egypt has the largest Arabic-speaking population in the world.",
  countries:['Egypt'],
  paths:[[[26.8206,30.8025],[26.8206,30.8025]]]
},

{ id:'demo_42',
  question:"Which country has the largest Spanish-speaking population?",
  answer:'Mexico',
  fact:"Mexico has more native Spanish speakers than any other country.",
  countries:['Mexico'],
  paths:[[[23.6345,-102.5528],[23.6345,-102.5528]]]
},

{ id:'demo_43',
  question:"Which country has the largest Portuguese-speaking population?",
  answer:'Brazil',
  fact:"Brazil accounts for the majority of Portuguese speakers worldwide.",
  countries:['Brazil'],
  paths:[[[-14.2350,-51.9253],[-14.2350,-51.9253]]]
},

{ id:'demo_44',
  question:"Which country has the world's largest French-speaking population?",
  answer:'Democratic Republic of the Congo',
  fact:"The Democratic Republic of the Congo has the largest French-speaking population in the world.",
  countries:['Democratic Republic of the Congo'],
  paths:[[[-4.0383,21.7587],[-4.0383,21.7587]]]
},

{ id:'demo_45',
  question:"Which country has the largest Japanese-speaking population?",
  answer:'Japan',
  fact:"Nearly all native Japanese speakers live in Japan.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_46',
  question:"Which country has the largest Bengali-speaking population?",
  answer:'Bangladesh',
  fact:"Bangladesh has the largest population of native Bengali speakers.",
  countries:['Bangladesh'],
  paths:[[[23.6850,90.3563],[23.6850,90.3563]]]
},

{ id:'demo_47',
  question:"Which country has the world's highest female life expectancy?",
  answer:'Japan',
  fact:"Japanese women consistently have one of the highest life expectancies in the world.",
  countries:['Japan'],
  paths:[[[36.2048,138.2529],[36.2048,138.2529]]]
},

{ id:'demo_48',
  question:"Which country has the highest male life expectancy?",
  answer:'Switzerland',
  fact:"Swiss men are among the longest-living male populations globally.",
  countries:['Switzerland'],
  paths:[[[46.8182,8.2275],[46.8182,8.2275]]]
},

{ id:'demo_49',
  question:"Which continent has the smallest share of the world's population?",
  answer:'Oceania',
  fact:"Oceania accounts for less than 1% of the world's population.",
  countries:['Australia'],
  paths:[[[-25.2744,133.7751],[-25.2744,133.7751]]]
},

{ id:'demo_50',
  question:"Which country has the largest youth population (ages 15–24) in the world?",
  answer:'India',
  fact:"India has the world's largest youth population, making it a key demographic advantage.",
  countries:['India'],
  paths:[[[21.0,78.0],[21.0,78.0]]]
},

{ id:'demo_51',
  question:"Which country is known as the first nation to complete the demographic transition?",
  answer:'United Kingdom',
  fact:"The demographic transition model was first observed during the industrialization of the United Kingdom.",
  countries:['United Kingdom'],
  paths:[[[55.3781,-3.4360],[55.3781,-3.4360]]]
},

{ id:'demo_52',
  question:"Which country has the largest ethnic Chinese population outside China?",
  answer:'Indonesia',
  fact:"Indonesia has the largest overseas ethnic Chinese community.",
  countries:['Indonesia'],
  paths:[[[-0.7893,113.9213],[-0.7893,113.9213]]]
},

{ id:'demo_53',
  question:"Which country has the largest concentration of expatriate workers?",
  answer:'United Arab Emirates',
  fact:"Foreign nationals constitute nearly 90% of the UAE's total population.",
  countries:['United Arab Emirates'],
  paths:[[[23.4241,53.8478],[23.4241,53.8478]]]
},

{ id:'demo_54',
  question:"Which country has the highest natural increase in population among major countries?",
  answer:'Nigeria',
  fact:"Nigeria's combination of high birth rates and declining mortality results in rapid natural increase.",
  countries:['Nigeria'],
  paths:[[[9.0820,8.6753],[9.0820,8.6753]]]
},

{ id:'demo_55',
  question:"Which country has the largest labor force in the world?",
  answer:'China',
  fact:"China has the world's largest labor force, although India is expected to surpass it in the future.",
  countries:['China'],
  paths:[[[35.8617,104.1954],[35.8617,104.1954]]]
}

];
const ROUNDS_PER_GAME = 5; // uses the full question set each run, shuffled.

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
  '/data/world-boundaries.geojson',
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

/* Alias table for the few names that differ between our round data and the
   Natural-Earth-derived dataset's `name` property. */
const COUNTRY_NAME_ALIASES = {
  'united states': ['united states', 'united states of america', 'usa', 'us'],
  'south sudan': ['south sudan', 's. sudan'],
  'myanmar': ['myanmar', 'burma'],
  'vietnam': ['vietnam', 'viet nam'],
  'laos': ['laos', "lao people's democratic republic", 'lao pdr'],
  'serbia': ['serbia', 'republic of serbia']   // add this
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

/* Colors mirror the same good/mid/bad verdict palette used for round feedback,
   so the highlighted countries visually echo how close the guess was. */
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

const ANSWER_ICON = L.divIcon({
  className:'',
  html:`<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
    <circle cx="14" cy="14" r="12" fill="#D4A853" stroke="#1A2E3B" stroke-width="1.6"/>
    <path d="M9 15.5l3.2 3.2L19.5 11" stroke="#1A2E3B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  iconSize:[28,28],
  iconAnchor:[14,14]
});

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

function loadRound(){
  guessed = false;
  clearRevealLayers();
  if(guessMarker){ map.removeLayer(guessMarker); guessMarker = null; }
  map.stop();
  map.flyTo([20, 30], 2, { duration: 0.6, easeLinearity: 0.25 });
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('answer-line').textContent = '';
  document.getElementById('legend-line').style.display = 'none';
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = ROUNDS[order[roundIdx]].question;
  document.getElementById('strait-region').textContent = '';
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
/* Ray-casting point-in-polygon test on [lat,lng] pairs (kept for parity with other Navigator games; answers are
   modeled as single points, so this never triggers, but it's here for consistency with the shared code) */
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

/* Is the guess anywhere inside one of the round's relevant countries? */
function isInsideAnyCountry(gLatLng, countryNames){
  if(!worldCountriesGeo) return false;
  const [lat, lng] = gLatLng;
  return countryNames.some(name=>{
    const feature = worldCountriesGeo.features.find(f => countryFeatureMatches(f, name));
    return feature ? pointInGeoJSONPolygon(lng, lat, feature.geometry) : false;
  });
}
function nearestOnPaths(p, paths){
  // Exactly on the answer point? Full credit — distance 0.
  for(const path of paths){
    if(pointInPolygon(p, path)){
      return { dist: 0, latlng: p };
    }
  }
  // Otherwise, distance to the nearest point along the reference line.
  let best = null;
  paths.forEach(path=>{
    for(let i=0;i<path.length-1;i++){
      const r = nearestOnSegment(p, path[i], path[i+1]);
      if(!best || r.dist < best.dist) best = r;
    }
  });
  return best;
}

/* ---------------- Scoring ---------------- */
function scoreFor(km){ return Math.max(0, Math.round(100 - km/5)); }
function verdictFor(km){
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

  // If you're off the exact point but inside the answer's own country,
  // don't torch the score for it — cap the *scoring* distance.
  const insideCountry = km > 0 && isInsideAnyCountry(gLatLng, round.countries);
  const scoringKm = insideCountry ? Math.min(km, 100) : km;

  const v = verdictFor(scoringKm);
  const pts = scoreFor(scoringKm);
  scores.push(pts);
  results.push({name:round.answer, km, pts, cls:v.cls});

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
  map.flyToBounds(bounds, { padding:[60,60], maxZoom:6, duration:1.1, easeLinearity:0.25 });
  setTimeout(fireReveal, 1600); // fallback in case flyToBounds doesn't fire moveend
}

function revealResult(round, gLatLng, nearest, km, v, pts){
  clearRevealLayers();

  round.paths.forEach((path, i)=>{
    const pt = path[0];
    const marker = L.marker(pt, { icon: ANSWER_ICON, interactive:false }).addTo(map);
    revealLayers.push(marker);
    if(i === 0){
      const label = L.marker(pt, {
        icon: L.divIcon({ className:'', html:`<div class="line-label">${round.answer}</div>`, iconSize:[0,0] }),
        interactive:false
      }).addTo(map);
      revealLayers.push(label);
    }
  });

  highlightCountries(round.countries, v.cls);

  const connector = L.polyline([gLatLng, nearest.latlng], { color:'#F2545F', weight:2, opacity:0.85, dashArray:'6,6' }).addTo(map);
  revealLayers.push(connector);

  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${v.label}  (${km===0?'right on it':km+' km off'} · +${pts} pts)`;
  document.getElementById('verdict-text').className = 'verdict ' + v.cls;
  document.getElementById('answer-line').textContent = 'Answer: ' + round.answer;
  document.getElementById('fact-text').textContent = round.fact;
  document.getElementById('legend-line').style.display = 'flex';

  const rivalLine = document.getElementById('rival-line');
  if(mode === 'challenge' && rival && Array.isArray(rival.pts)){
    const theirPts = rival.pts[roundIdx];
    if(pts > theirPts){ rivalLine.textContent = `You beat your rival on this one — they scored +${theirPts} pts here.`; }
    else if(pts < theirPts){ rivalLine.textContent = `Your rival had the edge here — they scored +${theirPts} pts.`; }
    else{ rivalLine.textContent = `Dead even with your rival on this question — +${theirPts} pts each.`; }
    rivalLine.style.display = 'block';
  }

  document.getElementById('feedback').classList.add('show');
  document.getElementById('next-btn').style.display = 'inline-block';
  document.getElementById('next-btn').textContent = roundIdx === order.length-1 ? 'See Results →' : 'Next Question →';

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
  if(avg >= 85) msg = "Master of world superlatives. You could pinpoint these answers from memory.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of the world's biggest and busiest places.";
  else if(avg >= 40) msg = "Solid run. These questions are trickier than they look — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the questions closer. Chart again!';
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
      row.innerHTML = `<span class="b-name">${ROUNDS[rIdx].answer}</span>
        <span class="b-marks"><span class="b-mk ok">${mine}</span></span>`;
    } else {
      row.innerHTML = `<span class="b-name">${ROUNDS[rIdx].answer}</span>
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the questions closer this time.';
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
    const msg = `🌍 I just charted the Superlatives Navigator and scored ${currentAvgScore}%. Think you know world geography better? Take the same questions: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🌍 Think you can beat my Superlatives Navigator score of ${currentAvgScore}%?`);
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
