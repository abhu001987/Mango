/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'scheme-navigator-india';
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
   INDIA CENSUS 2011 DATA
   Each round is a Census 2011 (or related demographic) question
   whose answer is a single Indian state. "name" is a short label
   used on the map (marker tag / line label / breakdown row) and
   "question" is the full question shown in the HUD card, which
   now wraps onto multiple lines instead of being clipped. Each
   site is a small polygon centred on the answer state so the same
   distance/scoring math used across the Navigator series (nearest-
   edge / inside-polygon, plus a full-credit "inside the correct
   state" cap) works unchanged. Add more entries any time — shuffle,
   scoring and challenge links all keep working automatically.
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
/* Average the corner points of a round's boxes to get its display centre (for the record marker) */
function centerOfPaths(paths){
  let latSum = 0, lngSum = 0, n = 0;
  paths.forEach(ring=>{
    for(let i=0;i<ring.length-1;i++){ latSum += ring[i][0]; lngSum += ring[i][1]; n++; }
  });
  return n ? [latSum/n, lngSum/n] : [0,0];
}

const ROUNDS = [

  { id:'wb_lakshmir_bhandar', name:'Lakshmir Bhandar',
  question:'Lakshmir Bhandar scheme?',
  fact:"Lakshmir Bhandar is a West Bengal social security scheme providing financial assistance to eligible women.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_kanyashree', name:'Kanyashree Prakalpa',
  question:'Kanyashree Prakalpa scheme?',
  fact:"Kanyashree Prakalpa is a West Bengal scheme aimed at encouraging girls to continue education and preventing child marriage.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_rupashree', name:'Rupashree Prakalpa',
  question:'Rupashree Prakalpa scheme?',
  fact:"Rupashree Prakalpa provides one-time financial assistance to eligible economically disadvantaged families for the marriage of adult daughters.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_swasthya_sathi', name:'Swasthya Sathi',
  question:'Swasthya Sathi scheme?',
  fact:"Swasthya Sathi is a West Bengal health protection scheme providing cashless healthcare benefits to eligible beneficiaries.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_duare_sarkar', name:'Duare Sarkar',
  question:'Duare Sarkar scheme?',
  fact:"Duare Sarkar is a West Bengal government outreach initiative that brings various public services closer to citizens.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_krishak_bandhu', name:'Krishak Bandhu',
  question:'Krishak Bandhu scheme?',
  fact:"Krishak Bandhu is a West Bengal agricultural support scheme providing financial assistance and social security to farmers.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_sabooj_sathi', name:'Sabooj Sathi',
  question:'Sabooj Sathi scheme?',
  fact:"Sabooj Sathi provides bicycles to eligible students in West Bengal to encourage school attendance and reduce dropouts.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_student_credit_card', name:'Student Credit Card',
  question:'Student Credit Card scheme?',
  fact:"The West Bengal Student Credit Card scheme provides education loans to eligible students pursuing higher studies.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_utkarsh_bangla', name:'Utkarsh Bangla',
  question:'Utkarsh Bangla scheme?',
  fact:"Utkarsh Bangla is a West Bengal skill development initiative providing vocational training and improving employability.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_karmashree', name:'Karmashree',
  question:'Karmashree scheme?',
  fact:"Karmashree is a West Bengal employment-oriented initiative aimed at providing additional work opportunities to rural households.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_jai_johar', name:'Jai Johar',
  question:'Jai Johar scheme?',
  fact:"Jai Johar is a West Bengal social security scheme providing pension support to eligible Scheduled Tribe beneficiaries.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_taposili_bandhu', name:'Taposili Bandhu',
  question:'Taposili Bandhu scheme?',
  fact:"Taposili Bandhu is a West Bengal social security scheme providing pension support to eligible Scheduled Caste beneficiaries.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'wb_aikyashree', name:'Aikyashree',
  question:'Aikyashree scheme?',
  fact:"Aikyashree is a West Bengal scholarship programme supporting students from minority communities in education.",
  states:['West Bengal'],
  paths: siteBox(22.57, 88.36, 0.55)
},

{ id:'od_kalia', name:'KALIA',
  question:'KALIA scheme?',
  fact:"KALIA is an Odisha agricultural support scheme for farmers, sharecroppers and landless agricultural households.",
  states:['Odisha'],
  paths: siteBox(20.30, 85.82, 0.55)
},

{ id:'od_bsky', name:'Biju Swasthya Kalyan Yojana',
  question:'Biju Swasthya Kalyan Yojana scheme?',
  fact:"Biju Swasthya Kalyan Yojana was Odisha's major health assurance initiative providing healthcare support to eligible beneficiaries.",
  states:['Odisha'],
  paths: siteBox(20.30, 85.82, 0.55)
},

{ id:'od_mission_shakti', name:'Mission Shakti',
  question:'Mission Shakti scheme?',
  fact:"Mission Shakti is an Odisha initiative promoting women's empowerment through self-help groups and livelihood activities.",
  states:['Odisha'],
  paths: siteBox(20.30, 85.82, 0.55)
},

{ id:'tn_pudhumai_penn', name:'Pudhumai Penn',
  question:'Pudhumai Penn scheme?',
  fact:"Pudhumai Penn provides financial assistance to eligible girls from government schools pursuing higher education in Tamil Nadu.",
  states:['Tamil Nadu'],
  paths: siteBox(13.08, 80.27, 0.65)
},

{ id:'tn_tamil_pudhalvan', name:'Tamil Pudhalvan',
  question:'Tamil Pudhalvan scheme?',
  fact:"Tamil Pudhalvan provides financial assistance to eligible boys from government and government-aided schools pursuing higher education in Tamil Nadu.",
  states:['Tamil Nadu'],
  paths: siteBox(13.08, 80.27, 0.65)
},

{ id:'tn_illam_thedi_kalvi', name:'Illam Thedi Kalvi',
  question:'Illam Thedi Kalvi scheme?',
  fact:"Illam Thedi Kalvi provides supplementary learning support to children in their neighbourhoods and addresses learning gaps.",
  states:['Tamil Nadu'],
  paths: siteBox(13.08, 80.27, 0.65)
},

{ id:'kl_kudumbashree', name:'Kudumbashree',
  question:'Kudumbashree scheme?',
  fact:"Kudumbashree is Kerala's major women-oriented community-based poverty alleviation and livelihood programme.",
  states:['Kerala'],
  paths: siteBox(8.52, 76.94, 0.55)
},

{ id:'kl_life_mission', name:'LIFE Mission',
  question:'LIFE Mission scheme?',
  fact:"LIFE Mission is Kerala's comprehensive housing programme aimed at providing secure housing to homeless and landless families.",
  states:['Kerala'],
  paths: siteBox(8.52, 76.94, 0.55)
},

{ id:'kl_karunya', name:'Karunya',
  question:'Karunya scheme?',
  fact:"Karunya is a Kerala health assistance programme providing financial support for treatment of serious illnesses to eligible beneficiaries.",
  states:['Kerala'],
  paths: siteBox(8.52, 76.94, 0.55)
},

{ id:'ap_nadu_nedu', name:'Nadu-Nedu',
  question:'Nadu-Nedu scheme?',
  fact:"Nadu-Nedu is an Andhra Pradesh programme aimed at improving infrastructure and facilities in government schools and other public institutions.",
  states:['Andhra Pradesh'],
  paths: siteBox(16.51, 80.64, 0.65)
},

{ id:'ap_amma_vodi', name:'Amma Vodi',
  question:'Amma Vodi scheme?',
  fact:"Amma Vodi was an Andhra Pradesh welfare scheme providing financial assistance to eligible mothers or guardians to support children's education.",
  states:['Andhra Pradesh'],
  paths: siteBox(16.51, 80.64, 0.65)
},

{ id:'ap_rythu_bharosa', name:'YSR Rythu Bharosa',
  question:'YSR Rythu Bharosa scheme?',
  fact:"YSR Rythu Bharosa provides financial support to eligible farmers and agricultural households in Andhra Pradesh.",
  states:['Andhra Pradesh'],
  paths: siteBox(16.51, 80.64, 0.65)
},

{ id:'ts_rythu_bandhu', name:'Rythu Bandhu',
  question:'Rythu Bandhu scheme?',
  fact:"Rythu Bandhu is a Telangana agricultural investment support scheme for farmers.",
  states:['Telangana'],
  paths: siteBox(17.39, 78.49, 0.55)
},

{ id:'ts_rythu_bima', name:'Rythu Bima',
  question:'Rythu Bima scheme?',
  fact:"Rythu Bima is a Telangana farmer life insurance scheme providing financial relief to eligible farmers' families.",
  states:['Telangana'],
  paths: siteBox(17.39, 78.49, 0.55)
},

{ id:'ts_kalyana_lakshmi', name:'Kalyana Lakshmi',
  question:'Kalyana Lakshmi scheme?',
  fact:"Kalyana Lakshmi provides financial assistance for the marriage of eligible women from economically disadvantaged families in Telangana.",
  states:['Telangana'],
  paths: siteBox(17.39, 78.49, 0.55)
},

{ id:'ts_dalit_bandhu', name:'Dalit Bandhu',
  question:'Dalit Bandhu scheme?',
  fact:"Dalit Bandhu is a Telangana economic empowerment scheme providing financial assistance to eligible Dalit households.",
  states:['Telangana'],
  paths: siteBox(17.39, 78.49, 0.55)
},

{ id:'ka_gruha_lakshmi', name:'Gruha Lakshmi',
  question:'Gruha Lakshmi scheme?',
  fact:"Gruha Lakshmi is a Karnataka welfare scheme providing financial assistance to eligible women heads of households.",
  states:['Karnataka'],
  paths: siteBox(15.32, 75.71, 0.60)
},

{ id:'ka_shakti', name:'Shakti',
  question:'Shakti scheme?',
  fact:"Shakti provides free travel on eligible state-run public buses to women and certain other eligible passengers in Karnataka.",
  states:['Karnataka'],
  paths: siteBox(15.32, 75.71, 0.60)
},

{ id:'ka_anna_bhagya', name:'Anna Bhagya',
  question:'Anna Bhagya scheme?',
  fact:"Anna Bhagya is a Karnataka food security programme providing food-grain support to eligible beneficiaries.",
  states:['Karnataka'],
  paths: siteBox(15.32, 75.71, 0.60)
},

{ id:'ka_yuva_nidhi', name:'Yuva Nidhi',
  question:'Yuva Nidhi scheme?',
  fact:"Yuva Nidhi provides financial assistance to eligible unemployed graduates and diploma holders in Karnataka.",
  states:['Karnataka'],
  paths: siteBox(15.32, 75.71, 0.60)
},

{ id:'mh_ladki_bahin', name:'Mukhyamantri Majhi Ladki Bahin',
  question:'Mukhyamantri Majhi Ladki Bahin scheme?',
  fact:"Mukhyamantri Majhi Ladki Bahin is a Maharashtra welfare scheme providing financial assistance to eligible women.",
  states:['Maharashtra'],
  paths: siteBox(19.08, 72.88, 0.65)
},

{ id:'mh_mjpjay', name:'Mahatma Jyotirao Phule Jan Arogya Yojana',
  question:'Mahatma Jyotirao Phule Jan Arogya Yojana scheme?',
  fact:"Mahatma Jyotirao Phule Jan Arogya Yojana provides cashless health insurance and treatment support to eligible beneficiaries in Maharashtra.",
  states:['Maharashtra'],
  paths: siteBox(19.08, 72.88, 0.65)
},

{ id:'mp_ladli_behna', name:'Ladli Behna Yojana',
  question:'Ladli Behna Yojana scheme?',
  fact:"Mukhyamantri Ladli Behna Yojana provides financial assistance to eligible women in Madhya Pradesh.",
  states:['Madhya Pradesh'],
  paths: siteBox(23.26, 77.41, 0.70)
},

{ id:'mp_ladli_laxmi', name:'Ladli Laxmi Yojana',
  question:'Ladli Laxmi Yojana scheme?',
  fact:"Ladli Laxmi Yojana promotes the welfare, education and future security of girl children in Madhya Pradesh.",
  states:['Madhya Pradesh'],
  paths: siteBox(23.26, 77.41, 0.70)
},

{ id:'mp_kisan_kalyan', name:'Mukhyamantri Kisan Kalyan Yojana',
  question:'Mukhyamantri Kisan Kalyan Yojana scheme?',
  fact:"Mukhyamantri Kisan Kalyan Yojana provides additional financial support to eligible farmers in Madhya Pradesh.",
  states:['Madhya Pradesh'],
  paths: siteBox(23.26, 77.41, 0.70)
},

{ id:'raj_chiranjeevi', name:'Chiranjeevi Swasthya Bima Yojana',
  question:'Chiranjeevi Swasthya Bima Yojana scheme?',
  fact:"Chiranjeevi Swasthya Bima Yojana was Rajasthan's major health insurance initiative providing cashless treatment coverage to eligible families.",
  states:['Rajasthan'],
  paths: siteBox(26.91, 75.79, 0.80)
},

{ id:'cg_godhan_nyay', name:'Godhan Nyay Yojana',
  question:'Godhan Nyay Yojana scheme?',
  fact:"Godhan Nyay Yojana was a Chhattisgarh initiative associated with procurement of cow dung and promotion of rural livelihoods and organic inputs.",
  states:['Chhattisgarh'],
  paths: siteBox(21.28, 81.87, 0.65)
},

{ id:'cg_mahtari_vandan', name:'Mahtari Vandan Yojana',
  question:'Mahtari Vandan Yojana scheme?',
  fact:"Mahtari Vandan Yojana provides financial assistance to eligible married women in Chhattisgarh.",
  states:['Chhattisgarh'],
  paths: siteBox(21.28, 81.87, 0.65)
},

{ id:'jh_maiya_samman', name:'Mukhyamantri Maiya Samman Yojana',
  question:'Mukhyamantri Maiya Samman Yojana scheme?',
  fact:"Mukhyamantri Maiya Samman Yojana provides financial assistance to eligible women in Jharkhand.",
  states:['Jharkhand'],
  paths: siteBox(23.61, 85.28, 0.65)
},

{ id:'jh_abua_awas', name:'Abua Awas Yojana',
  question:'Abua Awas Yojana scheme?',
  fact:"Abua Awas Yojana is a Jharkhand housing initiative aimed at providing permanent houses to eligible families lacking adequate housing.",
  states:['Jharkhand'],
  paths: siteBox(23.61, 85.28, 0.65)
},

{ id:'bihar_kanya_utthan', name:'Mukhyamantri Kanya Utthan Yojana',
  question:'Mukhyamantri Kanya Utthan Yojana scheme?',
  fact:"Mukhyamantri Kanya Utthan Yojana provides financial support to promote the education and welfare of girls in Bihar.",
  states:['Bihar'],
  paths: siteBox(25.10, 85.60, 0.60)
},

{ id:'bihar_jeevika', name:'JEEViKA',
  question:'JEEViKA scheme?',
  fact:"JEEViKA is Bihar's major rural livelihoods programme that organises rural women into self-help groups and promotes financial inclusion and income generation.",
  states:['Bihar'],
  paths: siteBox(25.10, 85.60, 0.60)
},

{ id:'up_kanya_sumangala', name:'Kanya Sumangala Yojana',
  question:'Kanya Sumangala Yojana scheme?',
  fact:"Mukhyamantri Kanya Sumangala Yojana provides financial assistance at different stages of a girl's life and education in Uttar Pradesh.",
  states:['Uttar Pradesh'],
  paths: siteBox(26.85, 80.95, 0.65)
},

{ id:'up_odop', name:'One District One Product',
  question:'One District One Product scheme?',
  fact:"One District One Product promotes district-specific products, traditional industries, artisans and local enterprises in Uttar Pradesh.",
  states:['Uttar Pradesh'],
  paths: siteBox(26.85, 80.95, 0.65)
},

{ id:'up_abhyudaya', name:'Mukhyamantri Abhyudaya Yojana',
  question:'Mukhyamantri Abhyudaya Yojana scheme?',
  fact:"Mukhyamantri Abhyudaya Yojana provides free coaching and academic support to students preparing for competitive examinations in Uttar Pradesh.",
  states:['Uttar Pradesh'],
  paths: siteBox(26.85, 80.95, 0.65)
},

{ id:'as_orunodoi', name:'Orunodoi',
  question:'Orunodoi scheme?',
  fact:"Orunodoi is an Assam social assistance programme providing financial support to eligible economically vulnerable households.",
  states:['Assam'],
  paths: siteBox(26.14, 91.79, 0.70)
},

{ id:'as_nijut_moina', name:'Nijut Moina',
  question:'Nijut Moina scheme?',
  fact:"Nijut Moina is an Assam initiative providing financial assistance to girl students to encourage higher education and reduce early marriage.",
  states:['Assam'],
  paths: siteBox(26.14, 91.79, 0.70)
},

{ id:'hp_himcare', name:'HIMCARE',
  question:'HIMCARE scheme?',
  fact:"HIMCARE is Himachal Pradesh's health protection scheme providing cashless treatment support to eligible families.",
  states:['Himachal Pradesh'],
  paths: siteBox(31.10, 77.17, 0.60)
},

{ id:'hp_grihini_suvidha', name:'Grihini Suvidha Yojana',
  question:'Grihini Suvidha Yojana scheme?',
  fact:"Grihini Suvidha Yojana was launched in Himachal Pradesh to provide LPG connections to eligible households and promote clean cooking.",
  states:['Himachal Pradesh'],
  paths: siteBox(31.10, 77.17, 0.60)
},

{ id:'punjab_aam_aadmi_clinic', name:'Aam Aadmi Clinic',
  question:'Aam Aadmi Clinic scheme?',
  fact:"Aam Aadmi Clinics provide accessible primary healthcare services to citizens through government health facilities in Punjab.",
  states:['Punjab'],
  paths: siteBox(30.90, 75.86, 0.65)
},

{ id:'guj_matrushakti', name:'Mukhyamantri Matrushakti Yojana',
  question:'Mukhyamantri Matrushakti Yojana scheme?',
  fact:"Mukhyamantri Matrushakti Yojana is a Gujarat initiative focused on improving nutrition among pregnant women and lactating mothers.",
  states:['Gujarat'],
  paths: siteBox(23.22, 72.63, 0.65)
},

{ id:'guj_mysy', name:'Mukhyamantri Yuva Swavalamban Yojana',
  question:'Mukhyamantri Yuva Swavalamban Yojana scheme?',
  fact:"Mukhyamantri Yuva Swavalamban Yojana provides financial assistance and educational support to eligible students in Gujarat.",
  states:['Gujarat'],
  paths: siteBox(23.22, 72.63, 0.65)
}

];
const ROUNDS_PER_GAME = 10; // solo runs pick min(this, ROUNDS.length) at random each time. Challenge mode always uses the exact order sent by the challenger.

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
   Highlights just the STATE the census record belongs to, not the whole country — more
   useful for UPSC-style map practice. Tries a couple of mirrors of a standard India-states
   GeoJSON. */
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

/* ---------------- Record marker icon (shown over the reveal location, on top of the highlighted state) ---------------- */
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

/* Is the guess anywhere inside the census fact's actual answer state? */
function isInsideAnyState(gLatLng, stateNames){
  if(!indiaStatesGeo) return false;
  const [lat, lng] = gLatLng;
  return stateNames.some(name=>{
    const feature = indiaStatesGeo.features.find(f => stateFeatureMatches(f, name));
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

  // If you're outside the answer's marker box but inside the state that actually
  // holds the record, don't torch the score for it — cap the *scoring* distance.
  const insideState = km > 0 && isInsideAnyState(gLatLng, round.states);
  const scoringKm = insideState ? Math.min(km, 100) : km;

  const v = verdictFor(scoringKm);
  const pts = scoreFor(scoringKm);
  scores.push(pts);
  results.push({name:round.name, km, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit both the guess and the real answer state, so the
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

  // Record marker, placed directly over the answer's location on the
  // map so the player sees exactly where — and over which state — it lies.
  const centerColor = VERDICT_HIGHLIGHT_COLOR[v.cls] || '#D4A853';
  const recordMarker = L.marker(centerOfPaths(round.paths), {
    icon: mineralDivIcon(centerColor, round.states[0]),
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
  if(avg >= 85) msg = "Master of Indian census geography. UPSC map-based questions won't stand a chance.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of India's Census 2011 data.";
  else if(avg >= 40) msg = "Solid run. These census records are trickier than they look — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the census map closer. Chart again!';
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the census map closer this time.';
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
    const msg = `📊 I just charted the Census Navigator (India) and scored ${currentAvgScore}%. Think you can pin the Census 2011 records closer? Take the same questions: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`📊 Think you can beat my Census Navigator score of ${currentAvgScore}%?`);
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
