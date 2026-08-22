/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'Glaciers-navigator';
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
   VOLCANO DATA
   Each volcano is stored as a single summit coordinate, wrapped in
   the same "paths" shape used by the other Navigator games (a path
   of two identical points) so the existing distance/scoring code
   works unchanged — educational approximations, not survey-grade
   GIS data.
   ============================================================ */
const ROUNDS = [

  // =========================
  // HIMALAYAS & KARAKORAM
  // =========================

  { id:'siachen', name:'Siachen Glacier', region:'',
    fact:"The largest glacier in the Karakoram and one of the world's most strategically important glaciers, located in the eastern Karakoram in the disputed region between India and Pakistan. The Nubra River originates from its snout.",
    countries:['India','Pakistan'],
    paths:[[[35.421,77.105],[35.421,77.105]]]
  },

  { id:'baltoro', name:'Baltoro Glacier', region:'',
    fact:"One of the world's largest valley glaciers outside the polar regions, located in Pakistan's Karakoram. It provides access to some of the world's highest peaks, including K2, Broad Peak and the Gasherbrum group.",
    countries:['Pakistan'],
    paths:[[[35.720,76.590],[35.720,76.590]]]
  },

  { id:'biafo', name:'Biafo Glacier', region:'',
    fact:"A major glacier of the Karakoram in Pakistan that forms an important glacial system with the Hispar Glacier. Together they create one of the world's longest non-polar glacial traverses.",
    countries:['Pakistan'],
    paths:[[[35.900,75.850],[35.900,75.850]]]
  },

  { id:'hispar', name:'Hispar Glacier', region:'',
    fact:"A major Karakoram glacier in Pakistan that meets the Biafo Glacier at the Hispar La, forming one of the longest continuous glacier systems outside the polar regions.",
    countries:['Pakistan'],
    paths:[[[36.000,75.650],[36.000,75.650]]]
  },

  { id:'gangotri', name:'Gangotri Glacier', region:'',
    fact:"One of India's most important Himalayan glaciers and the source region of the Bhagirathi River, one of the principal headstreams of the Ganga. It lies in Uttarakhand's Garhwal Himalaya.",
    countries:['India'],
    paths:[[[30.950,79.070],[30.950,79.070]]]
  },

  { id:'yamunotri', name:'Yamunotri Glacier', region:'',
    fact:"The glacier and snowfield region associated with the source of the Yamuna River in Uttarakhand. The Yamuna emerges from the Champasar Glacier region near the Yamunotri shrine.",
    countries:['India'],
    paths:[[[31.010,78.450],[31.010,78.450]]]
  },

  { id:'milam', name:'Milam Glacier', region:'',
    fact:"One of the largest glaciers of Uttarakhand, located in the Kumaon Himalaya. It is associated with the Goriganga River and lies near the Indo-Tibetan border.",
    countries:['India'],
    paths:[[[30.360,80.070],[30.360,80.070]]]
  },

  { id:'pindari', name:'Pindari Glacier', region:'',
    fact:"A famous glacier of the Kumaon Himalaya in Uttarakhand, feeding the Pindar River, which later joins the Alaknanda. It is one of India's best-known trekking glaciers.",
    countries:['India'],
    paths:[[[30.270,80.010],[30.270,80.010]]]
  },

  { id:'satopanth', name:'Satopanth Glacier', region:'',
    fact:"A major glacier in Uttarakhand's Garhwal Himalaya near the Chaukhamba massif. Its meltwater contributes to the Alaknanda river system.",
    countries:['India'],
    paths:[[[30.750,79.450],[30.750,79.450]]]
  },

  { id:'bara_shigri', name:'Bara Shigri Glacier', region:'',
    fact:"The largest glacier in Himachal Pradesh, located in the Lahaul-Spiti region. It feeds the Chandra River, which joins the Bhaga River at Tandi to form the Chandrabhaga or Chenab.",
    countries:['India'],
    paths:[[[32.270,77.620],[32.270,77.620]]]
  },

  { id:'chhota_shigri', name:'Chhota Shigri Glacier', region:'',
    fact:"A well-studied glacier in Himachal Pradesh's Lahaul region and an important indicator of Himalayan climate change. It feeds the Chandra River system.",
    countries:['India'],
    paths:[[[32.250,77.550],[32.250,77.550]]]
  },

  { id:'drang_drung', name:'Drang-Drung Glacier', region:'',
    fact:"One of the largest glaciers in Ladakh, located near the Pensi La in the Zanskar Range. Its meltwater contributes to the Doda River, a major tributary of the Suru.",
    countries:['India'],
    paths:[[[33.560,76.030],[33.560,76.030]]]
  },

  { id:'zemu', name:'Zemu Glacier', region:'',
    fact:"The largest glacier in Sikkim and one of the major glaciers of the eastern Himalaya. It lies at the foot of Kangchenjunga and feeds the Teesta river system.",
    countries:['India'],
    paths:[[[27.700,88.280],[27.700,88.280]]]
  },

  { id:'rathong', name:'Rathong Glacier', region:'',
    fact:"A major glacier in the Kangchenjunga region of Sikkim and an important source of meltwater for the Rathong River.",
    countries:['India'],
    paths:[[[27.580,88.050],[27.580,88.050]]]
  },

  { id:'lonak', name:'Lonak Glacier', region:'',
    fact:"A major glacier in northern Sikkim near the Tibetan border. It is part of the high-altitude glacier system feeding the Teesta basin.",
    countries:['India'],
    paths:[[[28.010,88.650],[28.010,88.650]]]
  },

  { id:'khumbu', name:'Khumbu Glacier', region:'',
    fact:"One of the world's best-known Himalayan glaciers, located on the southern slopes of Mount Everest in Nepal. The Everest Base Camp route crosses its lower icefall.",
    countries:['Nepal'],
    paths:[[[28.000,86.850],[28.000,86.850]]]
  },

  { id:'ngo_zumpa', name:'Ngozumpa Glacier', region:'',
    fact:"The longest glacier in the Himalayas, located in Nepal's Cho Oyu region. It extends along the high Himalayan valley near the Gokyo Lakes.",
    countries:['Nepal'],
    paths:[[[28.050,86.650],[28.050,86.650]]]
  },

  { id:'rongbuk', name:'Rongbuk Glacier', region:'',
    fact:"A major glacier on the northern side of Mount Everest in Tibet. Rongbuk Valley and its glacier provide the classic northern approach to Everest.",
    countries:['China'],
    paths:[[[28.020,86.850],[28.020,86.850]]]
  },

  { id:'fedchenko', name:'Fedchenko Glacier', region:'',
    fact:"The longest glacier in the Pamir Mountains and one of the longest valley glaciers outside the polar regions. It lies entirely within Tajikistan.",
    countries:['Tajikistan'],
    paths:[[[38.770,72.280],[38.770,72.280]]]
  },

  { id:'inylchek', name:'Inylchek_glacier', region:'',
    fact:"A major glacier system of the Tian Shan, divided into Northern and Southern Inylchek glaciers. It lies near the Kyrgyzstan–China border below some of Central Asia's highest peaks.",
    countries:['Kyrgyzstan','China'],
    paths:[[[42.180,79.800],[42.180,79.800]]]
  },

  // =========================
  // ALPS
  // =========================

  { id:'aletsch', name:'Aletsch Glacier', region:'',
    fact:"The largest glacier in the Alps and one of Europe's most important glaciers. It lies in Switzerland and is part of the Jungfrau-Aletsch UNESCO World Heritage landscape.",
    countries:['Switzerland'],
    paths:[[[46.500,8.050],[46.500,8.050]]]
  },

  { id:'mer_de_glace', name:'Mer de Glace', region:'',
    fact:"One of the most famous glaciers in the French Alps, descending from the Mont Blanc massif above Chamonix.",
    countries:['France'],
    paths:[[[45.920,6.930],[45.920,6.930]]]
  },

  { id:'gorner', name:'Gorner Glacier', region:'',
    fact:"A major glacier system near Zermatt in Switzerland, surrounded by famous Alpine peaks including the Monte Rosa massif and Matterhorn.",
    countries:['Switzerland'],
    paths:[[[45.930,7.840],[45.930,7.840]]]
  },

  { id:'theodul', name:'Theodul Glacier', region:'',
    fact:"A glacier system in the Pennine Alps near the Switzerland–Italy border and an important high-altitude ice body around the Zermatt-Cervinia region.",
    countries:['Switzerland','Italy'],
    paths:[[[45.930,7.710],[45.930,7.710]]]
  },

  { id:'rhone_glacier', name:'Rhône Glacier', region:'',
    fact:"A famous glacier in the Swiss Alps that gives rise to the Rhône River. It has retreated significantly and is widely used to illustrate Alpine glacier retreat.",
    countries:['Switzerland'],
    paths:[[[46.580,8.390],[46.580,8.390]]]
  },

  // =========================
  // ICELAND & SCANDINAVIA
  // =========================

  { id:'vatnajokull', name:'Vatnajökull', region:'',
    fact:"Europe's largest ice cap by area, covering a substantial portion of southeastern Iceland and feeding numerous outlet glaciers.",
    countries:['Iceland'],
    paths:[[[64.400,-16.800],[64.400,-16.800]]]
  },

  { id:'skeidararjokull', name:'Skeiðarárjökull', region:'',
    fact:"A major outlet glacier of Vatnajökull in Iceland, famous for its powerful glacial outburst floods known as jökulhlaups.",
    countries:['Iceland'],
    paths:[[[63.950,-17.150],[63.950,-17.150]]]
  },

  { id:'eyjafjallajokull', name:'Eyjafjallajökull', region:'',
    fact:"An ice cap covering a volcanic massif in southern Iceland, whose 2010 volcanic eruption beneath the ice generated a major ash cloud that disrupted European air travel.",
    countries:['Iceland'],
    paths:[[[63.630,-19.620],[63.630,-19.620]]]
  },

  { id:'engabreen', name:'Engabreen', region:'',
    fact:"One of Norway's most famous outlet glaciers of the Svartisen ice cap and one of the lowest-altitude glaciers in continental Europe.",
    countries:['Norway'],
    paths:[[[66.730,14.020],[66.730,14.020]]]
  },

  // =========================
  // ALASKA & NORTH AMERICA
  // =========================

  { id:'malaspina', name:'Malaspina Glacier', region:'',
    fact:"A vast piedmont glacier in Alaska formed where several valley glaciers spread onto a broad coastal plain. It is one of the largest glacier complexes outside the polar regions.",
    countries:['United States of America'],
    paths:[[[60.200,-140.500],[60.200,-140.500]]]
  },

  { id:'seward', name:'Seward Glacier', region:'',
    fact:"A major glacier of the Saint Elias Mountains extending toward the Alaska–Yukon border and forming part of the enormous ice-covered landscape of the region.",
    countries:['United States of America','Canada'],
    paths:[[[60.550,-140.900],[60.550,-140.900]]]
  },

  { id:'bering', name:'Bering Glacier', region:'',
    fact:"The largest glacier in North America by area and a major glacier system of Alaska's Saint Elias Mountains.",
    countries:['United States of America'],
    paths:[[[60.200,-143.800],[60.200,-143.800]]]
  },

  { id:'hubbard', name:'Hubbard Glacier', region:'',
    fact:"A huge tidewater glacier in Alaska that flows into Disenchantment Bay. Its terminus has periodically advanced and can block Russell Fjord.",
    countries:['United States of America'],
    paths:[[[60.020,-139.500],[60.020,-139.500]]]
  },

  { id:'columbia', name:'Columbia Glacier', region:'',
    fact:"A major tidewater glacier near Valdez, Alaska, famous for rapid retreat and calving and widely studied as an example of climate-driven glacier change.",
    countries:['United States of America'],
    paths:[[[61.070,-147.100],[61.070,-147.100]]]
  },

  { id:'mendenhall', name:'Mendenhall Glacier', region:'',
    fact:"A well-known valley glacier near Juneau, Alaska, famous for its accessible ice caves, lake and rapid long-term retreat.",
    countries:['United States of America'],
    paths:[[[58.450,-134.550],[58.450,-134.550]]]
  },

  { id:'alaska_glacier', name:'Worthington Glacier', region:'',
    fact:"A readily accessible glacier near Valdez in Alaska and one of the state's best-known examples of a glacier visible from a major road.",
    countries:['United States of America'],
    paths:[[[61.140,-145.760],[61.140,-145.760]]]
  },

  { id:'athabasca', name:'Athabasca Glacier', region:'',
    fact:"One of the most visited glaciers in the Canadian Rockies and an outlet of the Columbia Icefield. Its retreat is a prominent indicator of climate change in the Rockies.",
    countries:['Canada'],
    paths:[[[52.220,-117.230],[52.220,-117.230]]]
  },

  { id:'columbia_icefield', name:'Columbia Icefield', region:'',
    fact:"The largest icefield in the Canadian Rockies, feeding major glaciers and rivers flowing toward the Pacific, Arctic and Hudson Bay drainage systems.",
    countries:['Canada'],
    paths:[[[52.150,-117.300],[52.150,-117.300]]]
  },

  { id:'taylor', name:'Taylor Glacier', region:'',
    fact:"A glacier in Canada's Yukon region associated with the Kluane icefield landscape and the extensive glaciation of the Saint Elias Mountains.",
    countries:['Canada'],
    paths:[[[60.900,-139.000],[60.900,-139.000]]]
  },

  // =========================
  // ANDES & SOUTH AMERICA
  // =========================

  { id:'perito_moreno', name:'Perito Moreno Glacier', region:'',
    fact:"One of the world's most famous advancing glaciers, located in Argentina's Los Glaciares National Park. Its terminus periodically calves into Lago Argentino.",
    countries:['Argentina'],
    paths:[[[50.495,-73.050],[50.495,-73.050]]]
  },

  { id:'upsala', name:'Upsala Glacier', region:'',
    fact:"One of the largest glaciers of Argentina's Los Glaciares National Park, flowing into Lago Argentino and experiencing major changes in its terminus.",
    countries:['Argentina'],
    paths:[[[49.850,-73.280],[49.850,-73.280]]]
  },

  { id:'viedma', name:'Viedma Glacier', region:'',
    fact:"A large Patagonian glacier flowing into Lago Viedma in Argentina and forming part of the Southern Patagonian Ice Field.",
    countries:['Argentina'],
    paths:[[[49.470,-73.030],[49.470,-73.030]]]
  },

  { id:'grey', name:'Grey Glacier', region:'',
    fact:"A major glacier of the Southern Patagonian Ice Field in Chile, located within Torres del Paine National Park and terminating in Grey Lake.",
    countries:['Chile'],
    paths:[[[50.990,-73.230],[50.990,-73.230]]]
  },

  { id:'san_rafael', name:'San Rafael Glacier', region:'',
    fact:"A tidewater glacier of the Northern Patagonian Ice Field in Chile that reaches Laguna San Rafael. It is one of the most famous glacier landscapes of Patagonia.",
    countries:['Chile'],
    paths:[[[46.680,-73.850],[46.680,-73.850]]]
  },

  { id:'brüggen', name:'Brüggen Glacier', region:'',
    fact:"Also called Pío XI Glacier, it is the largest glacier of the Southern Patagonian Ice Field and is notable because its terminus has shown periods of advance while many nearby glaciers retreat.",
    countries:['Chile'],
    paths:[[[49.230,-73.700],[49.230,-73.700]]]
  },

  { id:'quelccaya', name:'Quelccaya Ice Cap', region:'',
    fact:"The largest tropical ice cap in the world, located in the Peruvian Andes. It has experienced significant retreat and is an important indicator of climate change in the tropics.",
    countries:['Peru'],
    paths:[[[13.930,-70.840],[13.930,-70.840]]]
  },

  { id:'pastoruri', name:'Pastoruri Glacier', region:'',
    fact:"A famous glacier in Peru's Cordillera Blanca that has retreated substantially and is an important example of glacier loss in the tropical Andes.",
    countries:['Peru'],
    paths:[[[9.760,-77.360],[9.760,-77.360]]]
  },

  { id:'humboldt', name:'Humboldt Glacier', region:'',
    fact:"The last surviving glacier in Venezuela and a symbol of rapid tropical glacier retreat. Its remaining ice has become extremely small compared with its historical extent.",
    countries:['Venezuela'],
    paths:[[[8.540,-71.000],[8.540,-71.000]]]
  },

  { id:'cotacotani', name:'Cotacotani Glacier', region:'',
    fact:"A high-altitude glacier system in the Andes of Bolivia and Chile region, representative of the rapidly changing tropical and subtropical Andean cryosphere.",
    countries:['Bolivia'],
    paths:[[[17.480,-68.180],[17.480,-68.180]]]
  },

  // =========================
  // NEW ZEALAND
  // =========================

  { id:'tasman', name:'Tasman Glacier', region:'',
    fact:"The largest glacier in New Zealand, located in the Southern Alps and flowing from the Tasman Saddle toward Tasman Lake.",
    countries:['New Zealand'],
    paths:[[[-43.680,170.850],[-43.680,170.850]]]
  },

  { id:'franz_josef', name:'Franz Josef Glacier', region:'',
    fact:"A famous temperate glacier on New Zealand's South Island descending from the Southern Alps toward the West Coast. Its terminus has undergone major fluctuations.",
    countries:['New Zealand'],
    paths:[[[-43.470,170.180],[-43.470,170.180]]]
  },

  { id:'fox', name:'Fox Glacier', region:'',
    fact:"A major temperate glacier on New Zealand's South Island descending from the Southern Alps toward the West Coast.",
    countries:['New Zealand'],
    paths:[[[-43.470,169.950],[-43.470,169.950]]]
  },

  { id:'hooker', name:'Hooker Glacier', region:'',
    fact:"A major glacier below Aoraki/Mount Cook in New Zealand's Southern Alps, feeding Hooker Lake.",
    countries:['New Zealand'],
    paths:[[[-43.690,170.090],[-43.690,170.090]]]
  },

  // =========================
  // AFRICA
  // =========================

  { id:'kibo_glaciers', name:'Kilimanjaro Glaciers', region:'',
    fact:"The remaining glaciers and ice fields on Mount Kilimanjaro represent one of Africa's most important tropical cryosphere systems and have undergone major long-term retreat.",
    countries:['Tanzania'],
    paths:[[[-3.067,37.355],[-3.067,37.355]]]
  },

  { id:'rwenzori', name:'Rwenzori Glaciers', region:'',
    fact:"The glaciers of the Rwenzori Mountains are among the few remaining equatorial glaciers in Africa. They occur around Mount Stanley and neighboring high peaks of the Uganda–DR Congo border region.",
    countries:['Uganda','Democratic Republic of the Congo'],
    paths:[[[0.380,29.870],[0.380,29.870]]]
  },

  // =========================
  // GREENLAND & ARCTIC
  // =========================

  { id:'jakobshavn', name:'Jakobshavn Glacier', region:'',
    fact:"One of Greenland's fastest-flowing outlet glaciers, draining ice from the Greenland Ice Sheet into Ilulissat Icefjord. It is famous for producing enormous icebergs.",
    countries:['Greenland'],
    paths:[[[69.170,-49.830],[69.170,-49.830]]]
  },

  { id:'petermann', name:'Petermann Glacier', region:'',
    fact:"A major outlet glacier of northern Greenland that flows into Nares Strait. Its floating ice tongue has experienced major calving events.",
    countries:['Greenland'],
    paths:[[[81.150,-61.120],[81.150,-61.120]]]
  },

  { id:'sermeq_kujalleq', name:'Sermeq Kujalleq', region:'',
    fact:"The Greenlandic name of Jakobshavn Glacier, one of the most productive iceberg-producing glaciers in the Northern Hemisphere.",
    countries:['Greenland'],
    paths:[[[69.170,-49.830],[69.170,-49.830]]]
  },

  // =========================
  // ANTARCTICA
  // =========================

  { id:'lambert', name:'Lambert Glacier', region:'',
    fact:"One of the world's largest glacier systems, draining a vast portion of the East Antarctic Ice Sheet toward the Amery Ice Shelf.",
    countries:['Antarctica'],
    paths:[[[-71.200,69.000],[-71.200,69.000]]]
  },

  { id:'pine_island', name:'Pine Island Glacier', region:'',
    fact:"A major Antarctic ice stream flowing into the Amundsen Sea. It is one of the fastest-changing parts of the West Antarctic Ice Sheet and a major contributor to Antarctic ice loss.",
    countries:['Antarctica'],
    paths:[[[-75.200,-100.000],[-75.200,-100.000]]]
  },

  { id:'thwaites', name:'Thwaites Glacier', region:'',
    fact:"A huge glacier in West Antarctica draining into the Amundsen Sea. Its rapid ice loss and potential contribution to future sea-level rise make it one of the world's most closely studied glaciers.",
    countries:['Antarctica'],
    paths:[[[-75.500,-106.750],[-75.500,-106.750]]]
  },

  { id:'beardmore', name:'Beardmore Glacier', region:'',
    fact:"One of the world's largest valley glaciers, descending from the Antarctic Plateau through the Transantarctic Mountains toward the Ross Ice Shelf. It was a major route for early Antarctic expeditions.",
    countries:['Antarctica'],
    paths:[[[-83.000,171.000],[-83.000,171.000]]]
  },

  { id:'ferrar', name:'Ferrar Glacier', region:'',
    fact:"A major valley glacier in Victoria Land, Antarctica, flowing from the Transantarctic Mountains toward the Ross Sea region.",
    countries:['Antarctica'],
    paths:[[[-77.750,163.000],[-77.750,163.000]]]
  },

  { id:'denman', name:'Denman Glacier', region:'',
    fact:"A major glacier of East Antarctica draining toward the Shackleton Ice Shelf. It contains some of the deepest known ice-bed terrain on the continent.",
    countries:['Antarctica'],
    paths:[[[-80.000,99.000],[-80.000,99.000]]]
  },

  { id:'totten', name:'Totten Glacier', region:'',
    fact:"A major outlet glacier of East Antarctica flowing toward the Sabrina Coast. It is important in studies of Antarctic ice-sheet stability and sea-level rise.",
    countries:['Antarctica'],
    paths:[[[-67.000,116.000],[-67.000,116.000]]]
  },

  { id:'mertz', name:'Mertz Glacier', region:'',
    fact:"A large glacier in East Antarctica that flows into the Southern Ocean and forms a prominent floating glacier tongue.",
    countries:['Antarctica'],
    paths:[[[-67.900,144.000],[-67.900,144.000]]]
  },

  { id:'ross', name:'Ross Ice Shelf', region:'',
    fact:"The world's largest ice shelf, floating over the Ross Sea. Although technically an ice shelf rather than a glacier, it is a major component of the Antarctic cryosphere.",
    countries:['Antarctica'],
    paths:[[[-82.000,175.000],[-82.000,175.000]]]
  }

];
const ROUNDS_PER_GAME = 10; // solo runs pick 10 at random each time. Challenge mode always uses the exact order sent by the challenger.

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

/* Alias table for the few names that differ between our round data and the
   Natural-Earth-derived dataset's `name` property. */
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

const VOLCANO_ICON = L.divIcon({
  className:'',
  html:`<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
    <circle cx="14" cy="14" r="12" fill="#D4A853" stroke="#1A2E3B" stroke-width="1.6"/>
    <path d="M6 19 L12 9 L15 13 L18 6 L23 19 Z" fill="#1A2E3B"/>
    <circle cx="18" cy="8.5" r="1.6" fill="#F2545F"/>
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
  document.getElementById('legend-line').style.display = 'none';
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  document.getElementById('strait-name').textContent = ROUNDS[order[roundIdx]].name;
  document.getElementById('strait-region').textContent = ROUNDS[order[roundIdx]].region;
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
/* Ray-casting point-in-polygon test on [lat,lng] pairs (kept for parity with other Navigator games; volcanoes are
   modeled as single summit points, so this never triggers, but it's here for consistency with the shared code) */
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

/* Is the guess anywhere inside one of the round's bordering countries? */
function isInsideAnyCountry(gLatLng, countryNames){
  if(!worldCountriesGeo) return false;
  const [lat, lng] = gLatLng;
  return countryNames.some(name=>{
    const feature = worldCountriesGeo.features.find(f => countryFeatureMatches(f, name));
    return feature ? pointInGeoJSONPolygon(lng, lat, feature.geometry) : false;
  });
}
function nearestOnPaths(p, paths){
  // Exactly on the volcano's summit point? Full credit — distance 0.
  for(const path of paths){
    if(pointInPolygon(p, path)){
      return { dist: 0, latlng: p };
    }
  }
  // Otherwise, distance to the nearest point along the channel line.
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

  // If you're off the exact summit but inside a country the volcano
  // actually sits in, don't torch the score for it — cap the *scoring* distance.
  const insideCountry = km > 0 && isInsideAnyCountry(gLatLng, round.countries);
  const scoringKm = insideCountry ? Math.min(km, 100) : km;

  const v = verdictFor(scoringKm);
  const pts = scoreFor(scoringKm);
  scores.push(pts);
  results.push({name:round.name, km, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit both the guess and the real volcano's location, so the
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
    const marker = L.marker(pt, { icon: VOLCANO_ICON, interactive:false }).addTo(map);
    revealLayers.push(marker);
    if(i === 0){
      const label = L.marker(pt, {
        icon: L.divIcon({ className:'', html:`<div class="line-label">${round.name}</div>`, iconSize:[0,0] }),
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
  if(avg >= 85) msg = "Master of world geography. You could pinpoint these volcanoes from memory.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of the world's active peaks.";
  else if(avg >= 40) msg = "Solid run. These volcanoes are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the volcanoes closer. Chart again!';
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the volcanoes closer this time.';
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
    const msg = `🌋 I just charted the Volcano Navigator and scored ${currentAvgScore}%. Think you can pin the volcanoes closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🌋 Think you can beat my Volcano Navigator score of ${currentAvgScore}%?`);
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
