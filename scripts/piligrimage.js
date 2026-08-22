/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'census-navigator-india';
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

  { id:'od_konark', name:'Konark Sun Temple',
  question:'Konark Sun Temple?',
  fact:"The Konark Sun Temple in Odisha was built by the Eastern Ganga ruler Narasimhadeva I in the 13th century. It is a classic Kalinga school of Nagara architecture, famous for its chariot-shaped plan, 24 carved wheels and seven horses.",
  states:['Odisha'],
  paths: siteBox(19.89, 86.09, 0.45)
},

{ id:'od_lingaraj', name:'Lingaraj Temple',
  question:'Lingaraj Temple?',
  fact:"The Lingaraj Temple at Bhubaneswar is a major example of Kalinga architecture, a regional form of Nagara style. Its principal components include the deul, jagamohana, nata-mandapa and bhoga-mandapa.",
  states:['Odisha'],
  paths: siteBox(20.24, 85.83, 0.45)
},

{ id:'od_jagannath', name:'Jagannath Temple',
  question:'Jagannath Temple?',
  fact:"The Jagannath Temple at Puri is a major Kalinga-style temple of the Nagara tradition. Its massive rekha deul and associated jagamohana, nata-mandapa and bhoga-mandapa are characteristic of Odisha temple architecture.",
  states:['Odisha'],
  paths: siteBox(19.80, 85.82, 0.45)
},

{ id:'od_mukteshwar', name:'Mukteshwar Temple',
  question:'Mukteshwar Temple?',
  fact:"Mukteshwar Temple in Bhubaneswar is an important 10th-century example of Kalinga architecture. It is especially famous for its ornate torana gateway and finely carved sculptures.",
  states:['Odisha'],
  paths: siteBox(20.24, 85.83, 0.45)
},

{ id:'od_rajarani', name:'Rajarani Temple',
  question:'Rajarani Temple?',
  fact:"Rajarani Temple at Bhubaneswar is a notable example of mature Kalinga Nagara architecture, particularly known for its richly carved exterior and red-gold sandstone.",
  states:['Odisha'],
  paths: siteBox(20.25, 85.84, 0.45)
},

{ id:'od_brahmeswara', name:'Brahmeswara Temple',
  question:'Brahmeswara Temple?',
  fact:"Brahmeswara Temple in Bhubaneswar is an important Kalinga-style Nagara temple dating to the 11th century, noted for its sculptural decoration and developed temple plan.",
  states:['Odisha'],
  paths: siteBox(20.24, 85.84, 0.45)
},

{ id:'up_kashi_vishwanath', name:'Kashi Vishwanath Temple',
  question:'Kashi Vishwanath Temple?',
  fact:"Kashi Vishwanath Temple in Varanasi is one of the most important Shiva temples in India. Its present structure belongs broadly to the North Indian Nagara tradition, with prominent golden-plated shikhara elements.",
  states:['Uttar Pradesh'],
  paths: siteBox(25.31, 83.01, 0.45)
},

{ id:'up_khajuraho_kandariya', name:'Kandariya Mahadeva Temple',
  question:'Kandariya Mahadeva Temple?',
  fact:"Kandariya Mahadeva Temple at Khajuraho is one of the finest examples of mature Nagara architecture. Built under the Chandellas, it is famous for its soaring shikhara and exceptionally rich sculptural programme.",
  states:['Madhya Pradesh'],
  paths: siteBox(24.85, 79.92, 0.45)
},

{ id:'mp_lakshmana_khajuraho', name:'Lakshmana Temple',
  question:'Lakshmana Temple?',
  fact:"The Lakshmana Temple at Khajuraho is an important Chandella-period Nagara temple. Its panchayatana layout, elevated platform and richly sculpted exterior are major UPSC features.",
  states:['Madhya Pradesh'],
  paths: siteBox(24.85, 79.92, 0.45)
},

{ id:'mp_vishwanath_khajuraho', name:'Vishvanatha Temple',
  question:'Vishvanatha Temple?',
  fact:"The Vishvanatha Temple at Khajuraho is a Chandella-period Nagara temple dedicated to Shiva, noted for its elaborate shikhara composition and sculptural decoration.",
  states:['Madhya Pradesh'],
  paths: siteBox(24.85, 79.92, 0.45)
},

{ id:'mp_mahakaleshwar', name:'Mahakaleshwar Temple',
  question:'Mahakaleshwar Temple?',
  fact:"The Mahakaleshwar Temple at Ujjain is one of the twelve Jyotirlingas and an important Shaiva pilgrimage centre. Its present architectural form reflects later Maratha-period reconstruction rather than a single ancient architectural style.",
  states:['Madhya Pradesh'],
  paths: siteBox(23.18, 75.78, 0.45)
},

{ id:'mp_omkareshwar', name:'Omkareshwar Temple',
  question:'Omkareshwar Temple?',
  fact:"Omkareshwar in Madhya Pradesh is one of the twelve Jyotirlingas. The temple complex represents a long architectural evolution with strong North Indian temple traditions and later regional additions.",
  states:['Madhya Pradesh'],
  paths: siteBox(22.24, 76.15, 0.45)
},

{ id:'gu_modhera', name:'Modhera Sun Temple',
  question:'Modhera Sun Temple?',
  fact:"The Modhera Sun Temple in Gujarat was built during the Solanki period. It is a major example of Maru-Gurjara architecture, a western Indian development of the Nagara tradition, famous for its intricately carved sabha-mandapa and stepped tank.",
  states:['Gujarat'],
  paths: siteBox(23.58, 72.13, 0.45)
},

{ id:'gu_somnath', name:'Somnath Temple',
  question:'Somnath Temple?',
  fact:"Somnath is one of the twelve Jyotirlingas. The present temple is built in the Kailash Mahameru Prasada tradition of western Indian temple architecture, closely associated with the Maru-Gurjara/Nagara tradition.",
  states:['Gujarat'],
  paths: siteBox(20.89, 70.40, 0.45)
},

{ id:'gu_dwarakadhish', name:'Dwarkadhish Temple',
  question:'Dwarkadhish Temple?',
  fact:"Dwarkadhish Temple at Dwarka is a major Krishna pilgrimage centre. Its tall shikhara and temple plan belong broadly to the western Indian Nagara tradition.",
  states:['Gujarat'],
  paths: siteBox(22.24, 68.97, 0.45)
},

{ id:'gu_akshardham', name:'Akshardham Temple',
  question:'Akshardham Temple?',
  fact:"Akshardham at Gandhinagar is a modern Hindu temple complex built in a traditional architectural idiom, using carved sandstone and features inspired by classical Indian temple architecture.",
  states:['Gujarat'],
  paths: siteBox(23.22, 72.65, 0.45)
},

{ id:'raj_dilwara', name:'Dilwara Temples',
  question:'Dilwara Temples?',
  fact:"The Dilwara Jain Temples at Mount Abu are masterpieces of western Indian temple architecture. They are especially famous for extraordinarily detailed marble carving and belong to the Maru-Gurjara tradition.",
  states:['Rajasthan'],
  paths: siteBox(24.59, 72.71, 0.45)
},

{ id:'raj_ranakpur', name:'Ranakpur Jain Temple',
  question:'Ranakpur Jain Temple?',
  fact:"The Ranakpur Jain Temple is a major example of Maru-Gurjara Jain architecture. Its distinctive features include numerous intricately carved pillars, multiple domes and a highly elaborate interior.",
  states:['Rajasthan'],
  paths: siteBox(25.12, 73.47, 0.45)
},

{ id:'raj_eklingji', name:'Eklingji Temple',
  question:'Eklingji Temple?',
  fact:"Eklingji Temple near Udaipur is a major Shaiva centre associated with the rulers of Mewar. Its architecture reflects the regional Nagara tradition of Rajasthan.",
  states:['Rajasthan'],
  paths: siteBox(24.75, 73.72, 0.45)
},

{ id:'raj_ambika_mata', name:'Ambika Mata Temple',
  question:'Ambika Mata Temple?',
  fact:"Ambika Mata Temple in Rajasthan is an important example of Nagara architecture. Its ornate shikhara and extensive sculptural decoration have led to comparisons with Khajuraho-style temple art.",
  states:['Rajasthan'],
  paths: siteBox(24.63, 73.68, 0.45)
},

{ id:'mh_ellora_kailasa', name:'Kailasa Temple',
  question:'Kailasa Temple?',
  fact:"The Kailasa Temple at Ellora was commissioned under the Rashtrakuta ruler Krishna I. It is a monolithic rock-cut temple inspired by the Dravida architectural tradition and represents one of India's greatest rock-cut monuments.",
  states:['Maharashtra'],
  paths: siteBox(20.03, 75.18, 0.45)
},

{ id:'mh_ghrishneshwar', name:'Grishneshwar Temple',
  question:'Grishneshwar Temple?',
  fact:"Grishneshwar is one of the twelve Jyotirlingas and lies near Ellora. The present temple reflects later Maratha-period reconstruction with regional Deccan temple features.",
  states:['Maharashtra'],
  paths: siteBox(20.02, 75.18, 0.45)
},

{ id:'mh_trimbakeshwar', name:'Trimbakeshwar Temple',
  question:'Trimbakeshwar Temple?',
  fact:"Trimbakeshwar is one of the twelve Jyotirlingas. The present temple is associated with the 18th-century Maratha period and displays a distinctive black-stone regional Deccan style.",
  states:['Maharashtra'],
  paths: siteBox(19.93, 73.53, 0.45)
},

{ id:'mh_bhimashankar', name:'Bhimashankar Temple',
  question:'Bhimashankar Temple?',
  fact:"Bhimashankar is one of the twelve Jyotirlingas. Its architecture combines older Nagara influences with later regional additions and is associated with the Deccan and Maratha architectural traditions.",
  states:['Maharashtra'],
  paths: siteBox(19.07, 73.54, 0.45)
},

{ id:'ka_virupaksha_pattadakal', name:'Virupaksha Temple',
  question:'Virupaksha Temple?',
  fact:"The Virupaksha Temple at Pattadakal was built under Queen Lokamahadevi during the Chalukya period. It is a major Dravida-style temple within the Chalukyan architectural complex, while Pattadakal as a whole demonstrates both Nagara and Dravida traditions.",
  states:['Karnataka'],
  paths: siteBox(15.95, 75.82, 0.45)
},

{ id:'ka_papanatha', name:'Papanatha Temple',
  question:'Papanatha Temple?',
  fact:"The Papanatha Temple at Pattadakal is notable for combining Nagara and Dravida architectural elements, making it an important example of Chalukyan experimentation in Deccan temple architecture.",
  states:['Karnataka'],
  paths: siteBox(15.95, 75.82, 0.45)
},

{ id:'ka_durga_aih', name:'Durga Temple',
  question:'Durga Temple Aihole?',
  fact:"The Durga Temple at Aihole is an important Early Chalukyan monument. Its apsidal plan and surrounding colonnade reflect experimentation that combined different North and South Indian architectural traditions.",
  states:['Karnataka'],
  paths: siteBox(16.02, 75.88, 0.45)
},

{ id:'ka_ladkhan', name:'Lad Khan Temple',
  question:'Lad Khan Temple?',
  fact:"The Lad Khan Temple at Aihole is one of the earliest surviving Chalukyan structural temples. Its architecture shows an early experimental form combining features that later developed into Nagara and Dravida traditions.",
  states:['Karnataka'],
  paths: siteBox(16.02, 75.88, 0.45)
},

{ id:'ka_badami_caves', name:'Badami Cave Temples',
  question:'Badami Cave Temples?',
  fact:"The Badami Cave Temples were developed under the Chalukyas and contain Hindu, Jain and other religious imagery. Their architecture reflects a mixture of northern Nagara and southern Dravida traditions in the Deccan.",
  states:['Karnataka'],
  paths: siteBox(15.92, 75.68, 0.45)
},

{ id:'ka_hoysalesvara', name:'Hoysalesvara Temple',
  question:'Hoysalesvara Temple?',
  fact:"The Hoysalesvara Temple at Halebidu is a masterpiece of Hoysala architecture. Its stellate plan, soapstone construction, richly carved exterior, circumambulatory platform and layered friezes are key UPSC features.",
  states:['Karnataka'],
  paths: siteBox(13.23, 75.99, 0.45)
},

{ id:'ka_chennakeshava', name:'Chennakeshava Temple',
  question:'Chennakeshava Temple?',
  fact:"The Chennakeshava Temple at Belur is a major example of Hoysala architecture, famous for its star-shaped platform, soapstone carving, ornate pillars and highly detailed sculptural panels.",
  states:['Karnataka'],
  paths: siteBox(13.16, 75.87, 0.45)
},

{ id:'ka_keshava_somanathapura', name:'Keshava Temple',
  question:'Keshava Temple Somanathapura?',
  fact:"The Keshava Temple at Somanathapura is one of the finest surviving Hoysala temples. Its stellate plan, intricate soapstone carvings and sculptural friezes are characteristic of Hoysala architecture.",
  states:['Karnataka'],
  paths: siteBox(12.28, 76.90, 0.45)
},

{ id:'ka_mahabaleshwar', name:'Mahabaleshwar Temple',
  question:'Mahabaleshwar Temple?',
  fact:"The Mahabaleshwar Temple at Gokarna is an important Shaiva pilgrimage centre. Its architecture is associated with the traditional Dravida temple form and regional Karnataka styles.",
  states:['Karnataka'],
  paths: siteBox(14.55, 74.32, 0.45)
},

{ id:'tn_brihadisvara_thanjavur', name:'Brihadisvara Temple',
  question:'Brihadisvara Temple Thanjavur?',
  fact:"Brihadisvara Temple at Thanjavur was built by Chola ruler Rajaraja I. It is a masterpiece of mature Dravida architecture, famous for its enormous vimana, axial layout and monumental scale.",
  states:['Tamil Nadu'],
  paths: siteBox(10.78, 79.13, 0.45)
},

{ id:'tn_gangaikonda', name:'Gangaikonda Cholapuram Temple',
  question:'Gangaikonda Cholapuram Temple?',
  fact:"The Gangaikonda Cholapuram temple was built by Rajendra Chola I and forms part of the Great Living Chola Temples. It represents mature Chola Dravida architecture with a monumental vimana.",
  states:['Tamil Nadu'],
  paths: siteBox(11.21, 79.45, 0.45)
},

{ id:'tn_airavatesvara', name:'Airavatesvara Temple',
  question:'Airavatesvara Temple?',
  fact:"The Airavatesvara Temple at Darasuram was built during the Chola period and is part of the Great Living Chola Temples. It is a refined example of Dravida architecture with elaborate stone carving.",
  states:['Tamil Nadu'],
  paths: siteBox(10.95, 79.36, 0.45)
},

{ id:'tn_shore', name:'Shore Temple',
  question:'Shore Temple?',
  fact:"The Shore Temple at Mahabalipuram was built during the Pallava period. It is a landmark of early Dravida structural architecture and forms part of the UNESCO Group of Monuments at Mahabalipuram.",
  states:['Tamil Nadu'],
  paths: siteBox(12.62, 80.19, 0.45)
},

{ id:'tn_kailasanatha_kanchi', name:'Kailasanatha Temple',
  question:'Kailasanatha Temple Kanchipuram?',
  fact:"The Kailasanatha Temple at Kanchipuram was built under the Pallava ruler Narasimhavarman II. It is one of the earliest major structural examples of the Dravida temple style.",
  states:['Tamil Nadu'],
  paths: siteBox(12.84, 79.70, 0.45)
},

{ id:'tn_vaikunta_perumal', name:'Vaikunta Perumal Temple',
  question:'Vaikunta Perumal Temple?',
  fact:"The Vaikunta Perumal Temple at Kanchipuram was built during the Pallava period and is an important early Dravida-style Vaishnava temple.",
  states:['Tamil Nadu'],
  paths: siteBox(12.84, 79.70, 0.45)
},

{ id:'tn_meenakshi', name:'Meenakshi Temple',
  question:'Meenakshi Temple?',
  fact:"The Meenakshi-Sundareswarar Temple at Madurai is a major example of later Dravida architecture. It is famous for its enormous gopurams, mandapas, sculptural decoration and temple-city planning.",
  states:['Tamil Nadu'],
  paths: siteBox(9.92, 78.12, 0.45)
},

{ id:'tn_ramanathaswamy', name:'Ramanathaswamy Temple',
  question:'Ramanathaswamy Temple?',
  fact:"Ramanathaswamy Temple at Rameswaram is one of the twelve Jyotirlingas. It is a major Dravida temple famous for its exceptionally long pillared corridors and large gopurams.",
  states:['Tamil Nadu'],
  paths: siteBox(9.29, 79.31, 0.45)
},

{ id:'tn_brihadisvara_gangaikonda', name:'Brihadisvara Temple Gangaikonda Cholapuram',
  question:'Brihadisvara Gangaikonda Cholapuram?',
  fact:"This Chola temple represents mature Dravida architecture and is one of the Great Living Chola Temples, known for its monumental vimana and refined sculptural programme.",
  states:['Tamil Nadu'],
  paths: siteBox(11.21, 79.45, 0.45)
},

{ id:'ap_amaralingeswara', name:'Amaralingeswara Temple',
  question:'Amaralingeswara Temple?',
  fact:"The Amaralingeswara Temple at Amaravati is an important Shaiva temple with a long architectural history. Its present form shows a mixture of Dravida and Nagara influences.",
  states:['Andhra Pradesh'],
  paths: siteBox(16.57, 80.36, 0.45)
},

{ id:'ap_venkateswara', name:'Venkateswara Temple',
  question:'Venkateswara Temple Tirupati?',
  fact:"The Venkateswara Temple at Tirumala is one of India's most important Vaishnava pilgrimage centres. Its architecture belongs broadly to the South Indian Dravida tradition, with large gopurams and elaborate mandapas.",
  states:['Andhra Pradesh'],
  paths: siteBox(13.68, 79.35, 0.45)
},

{ id:'ap_srisailam', name:'Mallikarjuna Temple',
  question:'Mallikarjuna Temple Srisailam?',
  fact:"Mallikarjuna Temple at Srisailam is one of the twelve Jyotirlingas. Its architecture reflects South Indian Dravida traditions with regional Deccan influences.",
  states:['Andhra Pradesh'],
  paths: siteBox(16.07, 78.87, 0.45)
},

{ id:'tel_ramappa', name:'Ramappa Temple',
  question:'Ramappa Temple?',
  fact:"Ramappa Temple at Palampet was built under the Kakatiyas. It is a distinctive Kakatiya architectural masterpiece known for its carved sandstone walls, star-like plan, sculpted pillars and lightweight bricks in the superstructure.",
  states:['Telangana'],
  paths: siteBox(18.26, 79.94, 0.45)
},

{ id:'tel_thousand_pillars', name:'Thousand Pillar Temple',
  question:'Thousand Pillar Temple?',
  fact:"The Thousand Pillar Temple at Hanamkonda is a major Kakatiya monument. Its architecture combines Deccan temple traditions with highly ornate pillars, multiple shrines and elaborate stone carving.",
  states:['Telangana'],
  paths: siteBox(18.00, 79.58, 0.45)
},

{ id:'tel_bhadrachalam', name:'Bhadrachalam Temple',
  question:'Bhadrachalam Temple?',
  fact:"Bhadrachalam Temple is a major Rama temple in Telangana. Its architecture reflects South Indian temple traditions with later regional and Nayaka influences.",
  states:['Telangana'],
  paths: siteBox(17.67, 80.89, 0.45)
},

{ id:'ker_padmanabhaswamy', name:'Padmanabhaswamy Temple',
  question:'Padmanabhaswamy Temple?',
  fact:"Padmanabhaswamy Temple in Thiruvananthapuram is a major Vaishnava temple. Its architecture is a distinctive fusion of Kerala and Dravida traditions, particularly visible in its wooden elements, sloping roofs and monumental gopuram.",
  states:['Kerala'],
  paths: siteBox(8.48, 76.95, 0.45)
},

{ id:'ker_guruvayur', name:'Guruvayur Temple',
  question:'Guruvayur Temple?',
  fact:"Guruvayur Temple is one of Kerala's most important Krishna temples. Its architecture follows the traditional Kerala temple style, characterized by a compact sanctum, tiled/sloping roofs and timber construction.",
  states:['Kerala'],
  paths: siteBox(10.59, 76.04, 0.45)
},

{ id:'ker_sabarimala', name:'Sabarimala Temple',
  question:'Sabarimala Temple?',
  fact:"Sabarimala is a major pilgrimage centre dedicated to Ayyappa. Its architecture reflects the Kerala temple tradition, with wooden and stone construction and steeply pitched roofs suited to the region's climate.",
  states:['Kerala'],
  paths: siteBox(9.43, 77.08, 0.45)
},

{ id:'ker_vadakkunnathan', name:'Vadakkunnathan Temple',
  question:'Vadakkunnathan Temple?',
  fact:"Vadakkunnathan Temple at Thrissur is a classic example of Kerala temple architecture, with timber structures, sloping roofs, mural traditions and a large enclosed temple complex.",
  states:['Kerala'],
  paths: siteBox(10.52, 76.21, 0.45)
},

{ id:'uk_kedarnath', name:'Kedarnath Temple',
  question:'Kedarnath Temple?',
  fact:"Kedarnath Temple is one of the twelve Jyotirlingas and an important Himalayan pilgrimage centre. It represents a distinctive Himalayan/Nagara temple tradition using massive stone blocks and a simple, robust form.",
  states:['Uttarakhand'],
  paths: siteBox(30.73, 79.07, 0.45)
},

{ id:'uk_badrinath', name:'Badrinath Temple',
  question:'Badrinath Temple?',
  fact:"Badrinath is one of the Char Dham pilgrimage sites. Its present architecture reflects Himalayan temple traditions with later renovations and a distinctive colourful facade.",
  states:['Uttarakhand'],
  paths: siteBox(30.74, 79.49, 0.45)
},

{ id:'uk_jageshwar', name:'Jageshwar Temples',
  question:'Jageshwar Temples?',
  fact:"The Jageshwar group in Uttarakhand contains numerous early medieval Shiva temples. They are important examples of Himalayan Nagara architecture, particularly the curvilinear shikhara tradition.",
  states:['Uttarakhand'],
  paths: siteBox(29.64, 79.85, 0.45)
},

{ id:'hp_chintpurni', name:'Chintpurni Temple',
  question:'Chintpurni Temple?',
  fact:"Chintpurni is an important Shakti pilgrimage centre in Himachal Pradesh. Its architecture reflects the regional Himalayan temple tradition.",
  states:['Himachal Pradesh'],
  paths: siteBox(31.68, 76.04, 0.45)
},

{ id:'hp_baijnath', name:'Baijnath Temple',
  question:'Baijnath Temple?',
  fact:"Baijnath Temple in Himachal Pradesh is an important example of Himalayan Nagara architecture, characterized by its stone construction and curvilinear shikhara.",
  states:['Himachal Pradesh'],
  paths: siteBox(32.05, 76.65, 0.45)
},

{ id:'bihar_mahabodhi', name:'Mahabodhi Temple',
  question:'Mahabodhi Temple?',
  fact:"The Mahabodhi Temple at Bodh Gaya marks the site associated with Buddha's enlightenment. Its tall pyramidal tower represents a distinctive Buddhist temple form influenced by North Indian architectural traditions and is a UNESCO World Heritage Site.",
  states:['Bihar'],
  paths: siteBox(24.70, 84.99, 0.45)
},

{ id:'bihar_mundeshwari', name:'Mundeshwari Temple',
  question:'Mundeshwari Temple?',
  fact:"Mundeshwari Temple in Bihar is one of India's ancient surviving Hindu temples. Its unusual octagonal plan and stone construction make it an important early example of regional temple architecture.",
  states:['Bihar'],
  paths: siteBox(25.05, 83.61, 0.45)
},

{ id:'wb_dakshineswar', name:'Dakshineswar Kali Temple',
  question:'Dakshineswar Kali Temple?',
  fact:"Dakshineswar Kali Temple in Kolkata was built in the 19th century. Its principal shrine follows the Bengal Navaratna temple style, characterized by a nine-spired superstructure.",
  states:['West Bengal'],
  paths: siteBox(22.66, 88.36, 0.45)
},

{ id:'wb_kalighat', name:'Kalighat Temple',
  question:'Kalighat Temple?',
  fact:"Kalighat Temple in Kolkata is a major Shakti pilgrimage centre. Its architecture belongs to the Bengal temple tradition, with a regional roof form and later modifications.",
  states:['West Bengal'],
  paths: siteBox(22.52, 88.34, 0.45)
},

{ id:'wb_terracotta_bishnupur', name:'Bishnupur Terracotta Temples',
  question:'Bishnupur Terracotta Temples?',
  fact:"The temples of Bishnupur are famous for Bengal's distinctive terracotta temple architecture. Rasmancha, Jor-Bangla and Shyam Rai are major examples, featuring curved Bengal roofs and elaborate terracotta panels.",
  states:['West Bengal'],
  paths: siteBox(23.07, 87.32, 0.45)
},

{ id:'assam_kamakhya', name:'Kamakhya Temple',
  question:'Kamakhya Temple?',
  fact:"Kamakhya Temple at Guwahati is one of the major Shakti Peethas. Its architecture represents the distinctive Nilachal style, combining a beehive-shaped dome with regional Assamese and broader Hindu temple features.",
  states:['Assam'],
  paths: siteBox(26.17, 91.70, 0.45)
},

{ id:'assam_ugratara', name:'Ugratara Temple',
  question:'Ugratara Temple?',
  fact:"Ugratara Temple in Guwahati is an important Shakti shrine. Its architecture reflects the regional Assamese temple tradition with later renovations.",
  states:['Assam'],
  paths: siteBox(26.18, 91.75, 0.45)
},

{ id:'manipur_shri_govindajee', name:'Shri Govindajee Temple',
  question:'Shri Govindajee Temple?',
  fact:"Shri Govindajee Temple at Imphal is an important Vaishnava temple of Manipur. Its architecture reflects the regional Manipuri temple tradition with distinctive pyramidal roofs.",
  states:['Manipur'],
  paths: siteBox(24.82, 93.94, 0.45)
},

{ id:'sikkim_rumtek', name:'Rumtek Monastery',
  question:'Rumtek Monastery?',
  fact:"Rumtek is a major Tibetan Buddhist monastery in Sikkim. Its architecture follows the Tibetan Buddhist monastic tradition rather than the Hindu Nagara or Dravida temple traditions.",
  states:['Sikkim'],
  paths: siteBox(27.32, 88.62, 0.45)
},

{ id:'goa_mangeshi', name:'Mangeshi Temple',
  question:'Mangeshi Temple?',
  fact:"Mangeshi Temple in Goa is a major Hindu temple reflecting the distinctive Goan temple architecture, which developed through a combination of traditional Hindu forms and local regional influences.",
  states:['Goa'],
  paths: siteBox(15.44, 73.96, 0.45)
},

{ id:'goa_shantadurga', name:'Shantadurga Temple',
  question:'Shantadurga Temple?',
  fact:"Shantadurga Temple at Kavlem is a major Goan Hindu temple. Its architecture features regional Goan forms, including a distinctive deepastambha and domed temple elements.",
  states:['Goa'],
  paths: siteBox(15.25, 73.98, 0.45)
},

{ id:'del_lotus', name:'Lotus Temple',
  question:'Lotus Temple?',
  fact:"The Lotus Temple in Delhi is a modern Baháʼí House of Worship rather than an ancient Hindu temple. Its architecture consists of nine marble-clad petals arranged in a lotus form.",
  states:['Delhi'],
  paths: siteBox(28.55, 77.26, 0.45)
},

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
