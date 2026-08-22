/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'canals-navigator-india';
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
   INDIA FORESTS / NATIONAL PARKS DATA
   Each site is represented as a small polygon (a tight box around
   its real coordinates) so the same distance/scoring math used for
   the Lake Navigator (nearest-edge / inside-polygon) works unchanged.
   Add more entries to this array any time — everything else (shuffle,
   scoring, challenge links) keeps working with no code changes.
   ============================================================ */
function siteBox(lat, lng, half){
  half = half || 0.07;
  return [[
    [lat+half, lng-half],
    [lat+half, lng+half],
    [lat-half, lng+half],
    [lat-half, lng-half],
    [lat+half, lng-half]
  ]];
}

const ROUNDS = [

  // =========================
  // NORTH INDIA
  // =========================

  { id:'upper_ganga', name:'Upper Ganga Canal', region:'',
    fact:"One of India's oldest major irrigation canals, opened in 1854. It takes off from the Ganga at Haridwar and irrigates large areas of western Uttar Pradesh.",
    states:['Uttarakhand','Uttar Pradesh'],
    paths: siteBox(29.95, 78.10)
  },

  { id:'lower_ganga', name:'Lower Ganga Canal', region:'',
    fact:"A major Ganga irrigation canal system serving central and eastern parts of Uttar Pradesh, drawing water from the Ganga system near Narora.",
    states:['Uttar Pradesh'],
    paths: siteBox(28.20, 78.40)
  },

  { id:'eastern_ganga', name:'Eastern Ganga Canal', region:'',
    fact:"An important irrigation canal system in the Ganga basin serving the eastern part of Uttar Pradesh and drawing water from the Ganga near Bijnor.",
    states:['Uttar Pradesh'],
    paths: siteBox(29.37, 78.00)
  },

  { id:'madhya_ganga', name:'Madhya Ganga Canal', region:'',
    fact:"A major irrigation project in western Uttar Pradesh designed to utilize Ganga waters for irrigation in the Ganga-Yamuna doab and adjoining areas.",
    states:['Uttar Pradesh'],
    paths: siteBox(28.75, 78.50)
  },

  { id:'agra_canal', name:'Agra Canal', region:'',
    fact:"An important historical canal taking off from the Yamuna at Okhla near Delhi. It carries Yamuna water southward for irrigation in the Delhi-Haryana-Uttar Pradesh region.",
    states:['Delhi','Haryana','Uttar Pradesh'],
    paths: siteBox(28.56, 77.31)
  },

  { id:'eastern_yamuna', name:'Eastern Yamuna Canal', region:'',
    fact:"A major irrigation canal of the Yamuna system, taking off near the Yamuna barrage at Hathnikund and serving areas of western Uttar Pradesh.",
    states:['Uttar Pradesh','Haryana'],
    paths: siteBox(29.77, 77.42)
  },

  { id:'western_yamuna', name:'Western Yamuna Canal', region:'',
    fact:"One of northern India's historic irrigation canals, originating from the Yamuna and serving extensive agricultural areas of Haryana.",
    states:['Haryana'],
    paths: siteBox(30.15, 77.30)
  },

  { id:'sirhind', name:'Sirhind Canal', region:'',
    fact:"A major irrigation canal system of Punjab taking off from the Sutlej near Ropar. It serves large agricultural areas of the Malwa region.",
    states:['Punjab'],
    paths: siteBox(30.98, 76.52)
  },

  { id:'upper_bari_doab', name:'Upper Bari Doab Canal', region:'',
    fact:"A historic canal of Punjab carrying Ravi waters into the Bari Doab between the Ravi and Beas rivers. It played an important role in the irrigation development of Punjab.",
    states:['Punjab'],
    paths: siteBox(31.63, 74.95)
  },

  { id:'bist_doab', name:'Bist Doab Canal System', region:'',
    fact:"An important irrigation network in the Beas-Sutlej doab, serving agricultural areas of central Punjab.",
    states:['Punjab'],
    paths: siteBox(31.15, 75.55)
  },

  { id:'bhakra_canal', name:'Bhakra Canal System', region:'',
    fact:"A major canal network supplied by the Bhakra-Nangal system, distributing Sutlej waters for irrigation across the northwestern plains.",
    states:['Punjab','Haryana','Rajasthan'],
    paths: siteBox(31.40, 76.40)
  },

  { id:'indira_gandhi', name:'Indira Gandhi Canal', region:'',
    fact:"One of India's most important desert irrigation projects, carrying Sutlej-Beas waters from Harike into the arid regions of northwestern Rajasthan and transforming agriculture in the Thar Desert.",
    states:['Punjab','Haryana','Rajasthan'],
    paths: siteBox(29.95, 74.20)
  },

  { id:'gang_canal', name:'Gang Canal', region:'',
    fact:"Built to carry Sutlej waters into the dry areas of northern Rajasthan, it transformed the Sri Ganganagar region into one of India's important irrigated agricultural belts.",
    states:['Punjab','Rajasthan'],
    paths: siteBox(29.92, 73.88)
  },

  { id:'ferozepur_feeder', name:'Ferozepur Feeder', region:'',
    fact:"A major feeder canal associated with the Gang Canal system, carrying water from Punjab toward the irrigated agricultural areas of northern Rajasthan.",
    states:['Punjab','Rajasthan'],
    paths: siteBox(30.95, 74.60)
  },

  { id:'sarda_canal', name:'Sharda Canal', region:'',
    fact:"A major irrigation canal system taking water from the Sharda River and serving extensive areas of Uttar Pradesh's Terai and Gangetic plains.",
    states:['Uttar Pradesh'],
    paths: siteBox(28.10, 80.20)
  },

  { id:'sarda_sahayak', name:'Sharda Sahayak Canal System', region:'',
    fact:"A major inter-basin irrigation system that transfers Sharda waters toward the Ghaghara basin and supports agriculture across eastern Uttar Pradesh.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.35, 81.35)
  },

  { id:'saryu_canal', name:'Saryu Canal System', region:'',
    fact:"A major irrigation project linking the waters of the Ghaghara, Saryu, Rapti, Banganga and Rohini systems through a large network of canals serving eastern Uttar Pradesh.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.05, 82.15)
  },

  { id:'gandak_canal', name:'Gandak Canal', region:'',
    fact:"A major irrigation canal system supplied by the Gandak River, serving agricultural areas of northwestern Bihar and eastern Uttar Pradesh.",
    states:['Bihar','Uttar Pradesh'],
    paths: siteBox(26.35, 84.30)
  },

  { id:'western_kosi', name:'Western Kosi Canal', region:'',
    fact:"An important irrigation canal system associated with the Kosi River, serving agricultural areas of northern Bihar and extending into the transboundary Kosi basin.",
    states:['Bihar'],
    paths: siteBox(26.45, 86.35)
  },

  { id:'eastern_kosi', name:'Eastern Kosi Canal', region:'',
    fact:"A major canal system of the Kosi irrigation project, designed to utilize Kosi waters for irrigation in northeastern Bihar.",
    states:['Bihar'],
    paths: siteBox(26.30, 87.00)
  },

  { id:'sone_canal', name:'Sone Canal System', region:'',
    fact:"One of India's historic irrigation canal systems, taking water from the Sone River and serving the agricultural plains of southwestern Bihar.",
    states:['Bihar'],
    paths: siteBox(25.05, 84.00)
  },

  { id:'kamla_western', name:'Kamla Western Canal', region:'',
    fact:"An important irrigation canal associated with the Kamla River system, serving agricultural areas of northern Bihar.",
    states:['Bihar'],
    paths: siteBox(26.25, 86.05)
  },


  // =========================
  // CENTRAL & WESTERN INDIA
  // =========================

  { id:'narmada_main', name:'Narmada Main Canal', region:'',
    fact:"The main canal of the Sardar Sarovar irrigation system, carrying Narmada water across Gujarat and toward parts of Rajasthan. It is one of India's major modern irrigation canals.",
    states:['Gujarat','Rajasthan'],
    paths: siteBox(23.20, 72.80)
  },

  { id:'narmada_rajasthan', name:'Narmada Canal Project', region:'',
    fact:"An extension of the Narmada irrigation system that carries Narmada waters into the arid districts of southern Rajasthan.",
    states:['Gujarat','Rajasthan'],
    paths: siteBox(24.00, 72.00)
  },

  { id:'mahi_canal', name:'Mahi Canal System', region:'',
    fact:"An irrigation network based on the waters of the Mahi River, supporting agriculture in southeastern Rajasthan and eastern Gujarat.",
    states:['Gujarat','Rajasthan'],
    paths: siteBox(23.35, 74.00)
  },

  { id:'chambal_canal', name:'Chambal Canal System', region:'',
    fact:"A major irrigation network developed from the Chambal Valley Project, distributing Chambal waters across southeastern Rajasthan and adjoining Madhya Pradesh.",
    states:['Madhya Pradesh','Rajasthan'],
    paths: siteBox(25.00, 76.55)
  },

  { id:'gandhi_sagar_canal', name:'Gandhi Sagar Canal', region:'',
    fact:"An important component of the Chambal irrigation system, carrying regulated Chambal waters toward agricultural areas of the region.",
    states:['Madhya Pradesh','Rajasthan'],
    paths: siteBox(24.65, 75.90)
  },

  { id:'bansagar_canal', name:'Bansagar Canal', region:'',
    fact:"A major irrigation canal system associated with the Bansagar project on the Sone River, supplying irrigation water to eastern Madhya Pradesh and southeastern Uttar Pradesh.",
    states:['Madhya Pradesh','Uttar Pradesh'],
    paths: siteBox(24.10, 82.65)
  },

  { id:'betwa_canal', name:'Betwa Canal System', region:'',
    fact:"An important irrigation network associated with the Betwa River and the Matatila and Rajghat projects, serving Bundelkhand and adjoining areas.",
    states:['Madhya Pradesh','Uttar Pradesh'],
    paths: siteBox(25.15, 78.80)
  },

  { id:'ken_canal', name:'Ken Canal', region:'',
    fact:"An irrigation canal system associated with the Ken River and Bundelkhand region, where canal irrigation is important because of the area's semi-arid conditions.",
    states:['Madhya Pradesh','Uttar Pradesh'],
    paths: siteBox(25.25, 80.10)
  },

  { id:'tawa_canal', name:'Tawa Canal System', region:'',
    fact:"A major irrigation network supplied by the Tawa reservoir, serving agricultural areas of the Narmada valley in Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.55, 77.95)
  },

  { id:'jayakwadi_left', name:'Jayakwadi Left Bank Canal', region:'',
    fact:"A major canal of the Jayakwadi irrigation project carrying water from the Godavari basin toward large agricultural areas of Marathwada.",
    states:['Maharashtra'],
    paths: siteBox(19.55, 75.40)
  },

  { id:'jayakwadi_right', name:'Jayakwadi Right Bank Canal', region:'',
    fact:"The right-bank canal of the Jayakwadi system, distributing Godavari waters for irrigation in parts of Marathwada.",
    states:['Maharashtra'],
    paths: siteBox(19.45, 75.30)
  },


  // =========================
  // EASTERN INDIA
  // =========================

  { id:'damodar_canal', name:'Damodar Canal System', region:'',
    fact:"A major irrigation network associated with the Damodar Valley system, supplying water to agricultural areas of West Bengal and supporting the multipurpose development of the Damodar basin.",
    states:['West Bengal','Jharkhand'],
    paths: siteBox(23.55, 87.65)
  },

  { id:'mayurakshi', name:'Mayurakshi Canal System', region:'',
    fact:"An important irrigation system based on the Mayurakshi River and Tilpara Barrage, serving agricultural areas of Birbhum and adjoining districts.",
    states:['West Bengal','Jharkhand'],
    paths: siteBox(24.00, 87.60)
  },

  { id:'kangsabati', name:'Kangsabati Canal System', region:'',
    fact:"A major irrigation system of southwestern West Bengal supplied by the Kangsabati and Kumari rivers, serving the drought-prone districts of the region.",
    states:['West Bengal'],
    paths: siteBox(23.10, 87.00)
  },

  { id:'dvc_canals', name:'Damodar Valley Canal System', region:'',
    fact:"The canal network of the Damodar Valley Corporation distributes water from its reservoirs and barrages for irrigation and supports agriculture in the lower Damodar basin.",
    states:['West Bengal','Jharkhand'],
    paths: siteBox(23.55, 87.85)
  },

  { id:'hirakud_canals', name:'Hirakud Canal System', region:'',
    fact:"A major irrigation network supplied by the Hirakud multipurpose project on the Mahanadi, supporting agriculture across western Odisha.",
    states:['Odisha'],
    paths: siteBox(21.53, 83.87)
  },

  { id:'manganadi_delta', name:'Mahanadi Delta Canal System', region:'',
    fact:"A large network of canals distributing Mahanadi waters across the deltaic plains of Odisha, one of eastern India's major canal-irrigated regions.",
    states:['Odisha'],
    paths: siteBox(20.45, 85.85)
  },


  // =========================
  // SOUTH INDIA
  // =========================

  { id:'krishna_delta', name:'Krishna Delta Canal System', region:'',
    fact:"A historic irrigation network distributing Krishna River waters across the fertile Krishna-Godavari delta, supporting intensive agriculture in coastal Andhra Pradesh.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.35, 80.65)
  },

  { id:'godavari_delta', name:'Godavari Delta Canal System', region:'',
    fact:"One of India's major deltaic irrigation networks, distributing Godavari waters across the fertile coastal plains of Andhra Pradesh.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.95, 81.75)
  },

  { id:'tungabhadra', name:'Tungabhadra Canal System', region:'',
    fact:"A major irrigation system supplied by the Tungabhadra reservoir, serving agricultural areas of northern Karnataka and adjoining Andhra Pradesh.",
    states:['Karnataka','Andhra Pradesh'],
    paths: siteBox(15.25, 76.35)
  },

  { id:'malaprabha', name:'Malaprabha Canal System', region:'',
    fact:"An important irrigation network supplied by the Malaprabha reservoir, serving the semi-arid agricultural areas of northern Karnataka.",
    states:['Karnataka'],
    paths: siteBox(15.55, 75.70)
  },

  { id:'ghataprabha', name:'Ghataprabha Canal System', region:'',
    fact:"A major irrigation system based on the Ghataprabha River and reservoir, serving agricultural areas of northern Karnataka.",
    states:['Karnataka'],
    paths: siteBox(16.15, 74.85)
  },

  { id:'lower_bhavani', name:'Lower Bhavani Canal', region:'',
    fact:"A major irrigation canal supplied by the Lower Bhavani Project, carrying water from the Bhavanisagar reservoir to agricultural areas of western Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(11.45, 77.20)
  },

  { id:'kaveri_delta', name:'Kaveri Delta Canal System', region:'',
    fact:"A historic and extensive canal network distributing Kaveri waters across the fertile delta of Tamil Nadu, supporting rice cultivation and intensive agriculture.",
    states:['Tamil Nadu'],
    paths: siteBox(10.80, 79.00)
  },

  { id:'periyar_main', name:'Periyar Main Canal', region:'',
    fact:"Part of the historic Periyar irrigation system that diverts water eastward from the Periyar basin toward the Vaigai basin in Tamil Nadu.",
    states:['Kerala','Tamil Nadu'],
    paths: siteBox(9.60, 77.15)
  },

  { id:'vaigai_canal', name:'Vaigai Canal System', region:'',
    fact:"An irrigation network supplied by the Vaigai reservoir and river system, serving agricultural areas of southern Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(9.80, 78.20)
  },

  { id:'telugu_ganga', name:'Telugu Ganga Canal', region:'',
    fact:"A major inter-basin water transfer project carrying Krishna River waters toward the Chennai region, providing water for both irrigation and urban supply.",
    states:['Andhra Pradesh','Tamil Nadu'],
    paths: siteBox(13.35, 79.20)
  },

  { id:'kurnool_cuddapah', name:'Kurnool–Cuddapah Canal', region:'',
    fact:"A historic canal of the Pennar-Krishna region, constructed during British rule and later incorporated into modern irrigation development in Rayalaseema.",
    states:['Andhra Pradesh'],
    paths: siteBox(15.75, 78.10)
  },

  { id:'nagarjuna_sagar_left', name:'Nagarjuna Sagar Left Bank Canal', region:'',
    fact:"A major irrigation canal carrying Krishna waters from Nagarjuna Sagar toward agricultural areas on the left bank, particularly in Telangana.",
    states:['Telangana','Andhra Pradesh'],
    paths: siteBox(16.65, 79.30)
  },

  { id:'nagarjuna_sagar_right', name:'Nagarjuna Sagar Right Bank Canal', region:'',
    fact:"The right-bank canal of the Nagarjuna Sagar project, distributing Krishna waters across large agricultural areas of coastal and southeastern Andhra Pradesh.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.50, 80.00)
  },


  // =========================
  // COASTAL / NAVIGATION CANALS
  // =========================

  { id:'buckingham', name:'Buckingham Canal', region:'',
    fact:"A historic coastal navigation canal running along the Coromandel Coast. It forms part of the National Waterway 4 system and historically linked several waterways between Andhra Pradesh and Tamil Nadu.",
    states:['Andhra Pradesh','Tamil Nadu'],
    paths: siteBox(13.65, 80.25)
  },

  { id:'west_coast', name:'West Coast Canal', region:'',
    fact:"A major inland navigation canal running along the Kerala coast and forming the core of National Waterway 3 between Kottapuram and Kollam.",
    states:['Kerala'],
    paths: siteBox(10.20, 76.35)
  },

  { id:'canoly', name:'Canoly Canal', region:'',
    fact:"A historic coastal canal in Kerala constructed as part of the region's traditional inland navigation network and associated with the Malabar coast.",
    states:['Kerala'],
    paths: siteBox(11.25, 75.78)
  },

  { id:'champakara', name:'Champakara Canal', region:'',
    fact:"An inland navigation canal near Kochi forming part of National Waterway 3 and connecting the backwaters with the industrial areas around Kochi.",
    states:['Kerala'],
    paths: siteBox(9.95, 76.35)
  },

  { id:'udyogmandal', name:'Udyogmandal Canal', region:'',
    fact:"A navigation canal in the Kochi region forming part of National Waterway 3 and connecting industrial and backwater areas.",
    states:['Kerala'],
    paths: siteBox(10.10, 76.30)
  },

  { id:'eluru', name:'Eluru Canal', region:'',
    fact:"A major navigation and irrigation-related canal in the Krishna-Godavari region, forming part of National Waterway 4 between the Godavari and Krishna systems.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.72, 81.10)
  },

  { id:'commamur', name:'Commamur Canal', region:'',
    fact:"A historic navigation canal connecting waterways of coastal Andhra and forming part of National Waterway 4.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.05, 80.55)
  },

  { id:'north_buckingham', name:'North Buckingham Canal', region:'',
    fact:"The northern section of the Buckingham Canal navigation system, extending southward from the Andhra coast toward Chennai.",
    states:['Andhra Pradesh','Tamil Nadu'],
    paths: siteBox(13.90, 80.25)
  },

  { id:'south_buckingham', name:'South Buckingham Canal', region:'',
    fact:"The southern section of the Buckingham Canal, extending south of Chennai along the Coromandel Coast and historically used for inland navigation.",
    states:['Tamil Nadu'],
    paths: siteBox(12.50, 80.15)
  },


  // =========================
  // IMPORTANT LINK / PROPOSED
  // =========================

  { id:'sutlej_yamuna_link', name:'Sutlej–Yamuna Link Canal', region:'',
    fact:"A proposed/inter-state canal intended to transfer Ravi-Beas waters toward Haryana. It is one of India's most important and politically sensitive interstate water disputes.",
    states:['Punjab','Haryana'],
    paths: siteBox(30.75, 76.55)
  },

  { id:'ken_betwa_link', name:'Ken–Betwa Link Canal', region:'',
    fact:"A major interlinking project intended to transfer surplus water from the Ken basin to the Betwa basin to improve irrigation and water availability in Bundelkhand.",
    states:['Madhya Pradesh','Uttar Pradesh'],
    paths: siteBox(24.90, 79.80)
  },

  { id:'par_tapi_narmada', name:'Par–Tapi–Narmada Link', region:'',
    fact:"A proposed interlinking project intended to transfer water from west-flowing rivers of southern Gujarat and northern Maharashtra toward the Narmada basin.",
    states:['Gujarat','Maharashtra'],
    paths: siteBox(21.50, 73.20)
  },

  { id:'daman_ganga_pinjal', name:'Damanganga–Pinjal Link', region:'',
    fact:"A proposed river-link project intended to transfer water from the Damanganga basin toward the Mumbai metropolitan region through the Pinjal system.",
    states:['Gujarat','Maharashtra'],
    paths: siteBox(20.05, 73.10)
  },

  { id:'godavari_krishna_link', name:'Godavari–Krishna Link', region:'',
    fact:"A major inter-basin transfer concept involving Godavari waters for use in the Krishna basin, important in India's National River Linking discussions.",
    states:['Telangana','Andhra Pradesh'],
    paths: siteBox(16.70, 80.10)
  },

  { id:'krishna_pennar_link', name:'Krishna–Pennar Link', region:'',
    fact:"A proposed inter-basin link intended to transfer Krishna basin waters toward the Pennar basin and improve water availability in drought-prone parts of southern Andhra Pradesh.",
    states:['Andhra Pradesh'],
    paths: siteBox(15.25, 79.20)
  },

  { id:'pennar_cauvery_link', name:'Pennar–Cauvery Link', region:'',
    fact:"A proposed river-link concept intended to transfer water southward from the Pennar basin toward the Cauvery basin as part of India's interlinking-of-rivers programme.",
    states:['Andhra Pradesh','Tamil Nadu'],
    paths: siteBox(13.95, 79.65)
  }

];
const ROUNDS_PER_GAME = 10; // solo runs pick 10 at random each time. Challenge mode always uses the exact order sent by the challenger.

/* ---------------- Map setup (India in focus) ---------------- */
const map = L.map('map', {
  worldCopyJump:false,
  dragging:true,
  touchZoom:true,
  doubleClickZoom:false,
  scrollWheelZoom:true,
  minZoom:3,
  maxZoom:9,
  zoomControl:true,
  attributionControl:true
}).setView([22.6, 80.0], 4.4);

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

/* ---------------- Indian states overlay (for round-result highlighting) ----------------
   Highlights just the STATE a forest lies in, not the whole country — more useful for
   UPSC-style map practice. Tries a couple of mirrors of a standard India-states GeoJSON. */
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

/* Alias table for the few state names that differ between our round data and the
   source dataset's name property (e.g. Delhi is sometimes "NCT of Delhi"). */
const STATE_NAME_ALIASES = {
  'delhi': ['delhi', 'nct of delhi', 'national capital territory of delhi'],
  'odisha': ['odisha', 'orissa'],
  'uttarakhand': ['uttarakhand', 'uttaranchal']
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

/* Colors mirror the same good/mid/bad verdict palette used for round feedback,
   so the highlighted state visually echoes how close the guess was. */
const VERDICT_HIGHLIGHT_COLOR = { good:'#4A9E7A', mid:'#D4A853', bad:'#F2545F' };

function highlightStates(names, cls){
  if(!indiaStatesGeo || !Array.isArray(names) || !names.length) return;
  const color = VERDICT_HIGHLIGHT_COLOR[cls] || '#D4A853';
  names.forEach(name=>{
    const feature = indiaStatesGeo.features.find(f => stateFeatureMatches(f, name));
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

function loadRound(){
  guessed = false;
  clearRevealLayers();
  if(guessMarker){ map.removeLayer(guessMarker); guessMarker = null; }
  map.stop();
  map.flyTo([22.6, 80.0], 4.4, { duration: 0.6, easeLinearity: 0.25 });
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

/* Is the guess anywhere inside the forest's actual state? */
function isInsideAnyState(gLatLng, stateNames){
  if(!indiaStatesGeo) return false;
  const [lat, lng] = gLatLng;
  return stateNames.some(name=>{
    const feature = indiaStatesGeo.features.find(f => stateFeatureMatches(f, name));
    return feature ? pointInGeoJSONPolygon(lng, lat, feature.geometry) : false;
  });
}
function nearestOnPaths(p, paths){
  // Inside the forest's marker box? Full credit — distance 0.
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

  // If you're outside the forest's marker box but inside the state the forest
  // actually sits in, don't torch the score for it — cap the *scoring* distance.
  const insideState = km > 0 && isInsideAnyState(gLatLng, round.states);
  const scoringKm = insideState ? Math.min(km, 100) : km;

  const v = verdictFor(scoringKm);
  const pts = scoreFor(scoringKm);
  scores.push(pts);
  results.push({name:round.name, km, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit both the guess and the real forest, so the
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
  map.flyToBounds(bounds, { padding:[80,80], maxZoom:8, duration:1.1, easeLinearity:0.25 });
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

  highlightStates(round.states, v.cls);

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
  if(avg >= 85) msg = "Master of Indian forest geography. UPSC map-based questions won't stand a chance.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of India's forests and national parks.";
  else if(avg >= 40) msg = "Solid run. These forests are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the forests closer. Chart again!';
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the forests closer this time.';
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
    const msg = `🌳 I just charted the Forest Navigator (India) and scored ${currentAvgScore}%. Think you can pin the forests closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🌳 Think you can beat my Forest Navigator score of ${currentAvgScore}%?`);
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
