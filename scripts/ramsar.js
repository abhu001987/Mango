/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'ramsar-navigator-india';
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
   INDIA MINERALS DATA
   Each mineral is placed at its major producing belt (not the
   whole state) so distinct minerals from the same state — e.g.
   Iron Ore, Chromite and Bauxite are all led by Odisha — still
   land at different points on the map. Each site is a small
   polygon so the same distance/scoring math used for the Forest /
   Plateau / Coast / Island Navigator (nearest-edge / inside-
   polygon) works unchanged. Add more entries any time — shuffle,
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
/* Average the corner points of a round's boxes to get its display centre (for the mineral icon marker) */
function centerOfPaths(paths){
  let latSum = 0, lngSum = 0, n = 0;
  paths.forEach(ring=>{
    for(let i=0;i<ring.length-1;i++){ latSum += ring[i][0]; lngSum += ring[i][1]; n++; }
  });
  return n ? [latSum/n, lngSum/n] : [0,0];
}

const ROUNDS = [

  // =========================
  // ANDHRA PRADESH
  // =========================

  { id:'kolleru_lake', name:'Kolleru Lake', region:'',
    fact:"Kolleru is one of India's largest freshwater lakes, located between the Krishna and Godavari deltas. It is an important habitat for migratory waterbirds and a major Ramsar wetland of Andhra Pradesh.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.70, 81.20, 0.30)
  },

  // =========================
  // ASSAM
  // =========================

  { id:'deepor_beel', name:'Deepor Beel', region:'',
    fact:"Deepor Beel is a permanent freshwater lake and wetland on the southwestern edge of Guwahati. It is an important wintering and migratory bird habitat and is connected with the Brahmaputra river system.",
    states:['Assam'],
    paths: siteBox(26.13, 91.65, 0.20)
  },

  // =========================
  // BIHAR
  // =========================

  { id:'kanwar_taal', name:'Kanwar (Kabar) Taal', region:'',
    fact:"Kanwar Taal is Asia's largest freshwater oxbow lake and an important wetland of the Indo-Gangetic plain. It supports large numbers of migratory waterbirds in Bihar.",
    states:['Bihar'],
    paths: siteBox(25.58, 86.10, 0.20)
  },

  { id:'nagi_bird_sanctuary', name:'Nagi Bird Sanctuary', region:'',
    fact:"Nagi Bird Sanctuary is a man-made reservoir in Jamui district that provides an important wintering habitat for migratory waterbirds. It is one of Bihar's Ramsar wetlands.",
    states:['Bihar'],
    paths: siteBox(24.73, 86.37, 0.12)
  },

  { id:'nakti_bird_sanctuary', name:'Nakti Bird Sanctuary', region:'',
    fact:"Nakti Bird Sanctuary is a reservoir wetland in Jamui district of Bihar. It is particularly important for migratory waterbirds and is part of the state's growing network of internationally important wetlands.",
    states:['Bihar'],
    paths: siteBox(24.77, 86.48, 0.12)
  },

  { id:'gokul_jalashay', name:'Gokul Jalashay', region:'',
    fact:"Gokul Jalashay is a Ramsar wetland in Buxar district of Bihar. It is an important freshwater wetland supporting resident and migratory birds in the Ganga plain.",
    states:['Bihar'],
    paths: siteBox(25.60, 84.00, 0.15)
  },

  { id:'udaipur_jheel', name:'Udaipur Jheel', region:'',
    fact:"Udaipur Jheel is a freshwater wetland in West Champaran district of Bihar. It provides habitat for migratory and resident waterbirds and became a Ramsar site in 2025.",
    states:['Bihar'],
    paths: siteBox(26.75, 84.45, 0.15)
  },

  { id:'gogabeel_lake', name:'Gogabeel Lake', region:'',
    fact:"Gogabeel Lake is a wetland in Katihar district of Bihar and an important bird habitat of the Ganga floodplain. It became a Ramsar site in 2025.",
    states:['Bihar'],
    paths: siteBox(25.65, 87.75, 0.15)
  },

  // =========================
  // CHHATTISGARH
  // =========================

  { id:'kopra_jalashay', name:'Kopra Jalashay', region:'',
    fact:"Kopra Jalashay is a freshwater reservoir wetland in Bilaspur district of Chhattisgarh. It became the state's first Ramsar site in 2025 and is important for waterbirds.",
    states:['Chhattisgarh'],
    paths: siteBox(22.20, 82.20, 0.15)
  },

  // =========================
  // GOA
  // =========================

  { id:'nanda_lake', name:'Nanda Lake', region:'',
    fact:"Nanda Lake is a freshwater wetland in South Goa. It is surrounded by agricultural landscapes and supports aquatic vegetation, fish and wetland birds.",
    states:['Goa'],
    paths: siteBox(15.20, 74.10, 0.12)
  },

  // =========================
  // GUJARAT
  // =========================

  { id:'khijadiya', name:'Khijadiya Bird Sanctuary', region:'',
    fact:"Khijadiya is a coastal wetland near Jamnagar containing both freshwater and saline ecosystems. Its unusual combination of habitats supports a rich diversity of resident and migratory birds.",
    states:['Gujarat'],
    paths: siteBox(22.53, 70.18, 0.15)
  },

  { id:'nalsarovar', name:'Nalsarovar', region:'',
    fact:"Nalsarovar is a large shallow freshwater wetland and one of Gujarat's most important bird habitats. It consists of a lake and numerous small islands and supports large congregations of migratory waterbirds.",
    states:['Gujarat'],
    paths: siteBox(22.80, 72.03, 0.30)
  },

  { id:'thol_lake', name:'Thol Lake', region:'',
    fact:"Thol Lake is a shallow freshwater reservoir and important bird sanctuary near Ahmedabad. It is particularly known for migratory waterbirds including flamingos and cranes.",
    states:['Gujarat'],
    paths: siteBox(23.27, 72.37, 0.12)
  },

  { id:'wadhvana_wetland', name:'Wadhvana Wetland', region:'',
    fact:"Wadhvana Wetland is an irrigation reservoir in Vadodara district of Gujarat. It provides important habitat for migratory waterbirds, especially during the winter season.",
    states:['Gujarat'],
    paths: siteBox(22.18, 73.48, 0.12)
  },

  { id:'chhari_dhand', name:'Chhari-Dhand', region:'',
    fact:"Chhari-Dhand is a seasonal freshwater wetland in the Banni landscape of Kutch. It is an important stopover and breeding area for numerous migratory and resident birds and became a Ramsar site in 2026.",
    states:['Gujarat'],
    paths: siteBox(23.75, 69.10, 0.20)
  },

  // =========================
  // HARYANA
  // =========================

  { id:'sultanpur', name:'Sultanpur National Park', region:'',
    fact:"Sultanpur National Park is a wetland near Gurugram and an important wintering site for migratory birds along the Central Asian Flyway. It is one of Haryana's two Ramsar sites.",
    states:['Haryana'],
    paths: siteBox(28.47, 76.88, 0.12)
  },

  { id:'bhindawas', name:'Bhindawas Wildlife Sanctuary', region:'',
    fact:"Bhindawas is Haryana's largest freshwater wetland and an important habitat for migratory waterbirds. It lies in the Yamuna-Ganga plain and became a Ramsar site in 2021.",
    states:['Haryana'],
    paths: siteBox(28.53, 76.58, 0.15)
  },

  // =========================
  // HIMACHAL PRADESH
  // =========================

  { id:'chandra_taal', name:'Chandra Taal', region:'',
    fact:"Chandra Taal is a high-altitude freshwater lake in the Spiti region of Himachal Pradesh. Located at about 4,300 metres, it is an important wetland of the trans-Himalayan cold desert.",
    states:['Himachal Pradesh'],
    paths: siteBox(32.49, 77.61, 0.12)
  },

  { id:'pong_dam_lake', name:'Pong Dam Lake', region:'',
    fact:"Pong Dam Lake is the reservoir of the Beas Dam in Himachal Pradesh. It is an important wintering ground for large numbers of migratory waterbirds.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.95, 75.95, 0.25)
  },

  { id:'renuka_lake', name:'Renuka Lake', region:'',
    fact:"Renuka Lake is a natural freshwater lake in Sirmaur district of Himachal Pradesh. It is surrounded by forested hills and is one of India's smallest Ramsar sites by area.",
    states:['Himachal Pradesh'],
    paths: siteBox(30.60, 77.45, 0.10)
  },

  // =========================
  // JAMMU & KASHMIR
  // =========================

  { id:'hokersar', name:'Hokersar Wetland', region:'',
    fact:"Hokersar is a freshwater wetland near Srinagar in the Kashmir Valley. It is a major wintering ground for migratory birds arriving from northern Eurasia.",
    states:['Jammu & Kashmir'],
    paths: siteBox(34.12, 74.80, 0.15)
  },

  { id:'hygam', name:'Hygam Wetland Conservation Reserve', region:'',
    fact:"Hygam Wetland lies in the Kashmir Valley and supports large numbers of migratory and resident waterbirds. It forms part of the important wetland network of the Jhelum basin.",
    states:['Jammu & Kashmir'],
    paths: siteBox(34.22, 74.63, 0.15)
  },

  { id:'shallabugh', name:'Shallabugh Wetland', region:'',
    fact:"Shallabugh Wetland is a large freshwater marsh near Srinagar. It provides important habitat for wintering waterbirds and is hydrologically connected with the Jhelum floodplain.",
    states:['Jammu & Kashmir'],
    paths: siteBox(34.18, 74.72, 0.18)
  },

  { id:'mansar_surinsar', name:'Mansar-Surinsar Lakes', region:'',
    fact:"Mansar-Surinsar is a composite freshwater lake system in the Jammu region. The lakes have ecological, hydrological and cultural importance and support diverse aquatic and bird life.",
    states:['Jammu & Kashmir'],
    paths: siteBox(32.69, 75.17, 0.18)
  },

  { id:'wular_lake', name:'Wular Lake', region:'',
    fact:"Wular is one of Asia's largest freshwater lakes and is associated with the Jhelum River. It plays an important role in flood regulation, fisheries and migratory bird habitat in the Kashmir Valley.",
    states:['Jammu & Kashmir'],
    paths: siteBox(34.35, 74.57, 0.30)
  },

  // =========================
  // JHARKHAND
  // =========================

  { id:'udhwa_lake', name:'Udhwa Lake Bird Sanctuary', region:'',
    fact:"Udhwa Lake is a wetland complex in Sahibganj district of Jharkhand consisting of two interconnected oxbow lakes. It is an important habitat for migratory waterbirds and became Jharkhand's first Ramsar site in 2025.",
    states:['Jharkhand'],
    paths: siteBox(25.25, 87.75, 0.18)
  },

  // =========================
  // KARNATAKA
  // =========================

  { id:'ranganathittu', name:'Ranganathittu Bird Sanctuary', region:'',
    fact:"Ranganathittu is a group of small river islands on the Cauvery near Mysuru. It is one of Karnataka's best-known waterbird habitats and supports large colonies of breeding and migratory birds.",
    states:['Karnataka'],
    paths: siteBox(12.42, 76.65, 0.12)
  },

  { id:'ankasamudra', name:'Ankasamudra Bird Conservation Reserve', region:'',
    fact:"Ankasamudra is a man-made wetland and bird habitat in Vijayanagara district of Karnataka. Its shallow waters and surrounding vegetation support numerous resident and migratory birds.",
    states:['Karnataka'],
    paths: siteBox(15.10, 76.25, 0.12)
  },

  { id:'aghanashini', name:'Aghanashini Estuary', region:'',
    fact:"Aghanashini is a natural estuarine wetland on Karnataka's coast where the Aghanashini River meets the Arabian Sea. Its mangroves, mudflats and tidal habitats support rich coastal biodiversity.",
    states:['Karnataka'],
    paths: siteBox(14.42, 74.42, 0.18)
  },

  { id:'magadi_kere', name:'Magadi Kere Conservation Reserve', region:'',
    fact:"Magadi Kere is a wetland in Gadag district of Karnataka known especially for wintering waterbirds. It is an important inland wetland of the Deccan Plateau.",
    states:['Karnataka'],
    paths: siteBox(15.35, 75.62, 0.12)
  },

  // =========================
  // KERALA
  // =========================

  { id:'ashtamudi', name:'Ashtamudi Wetland', region:'',
    fact:"Ashtamudi is a large backwater system in southern Kerala with numerous arms and islands. It supports mangroves, fisheries, clam resources and a rich variety of aquatic biodiversity.",
    states:['Kerala'],
    paths: siteBox(8.95, 76.58, 0.25)
  },

  { id:'sasthamkotta', name:'Sasthamkotta Lake', region:'',
    fact:"Sasthamkotta is Kerala's largest freshwater lake and an important source of drinking water. It is surrounded by lateritic and forested landscapes and supports diverse aquatic life.",
    states:['Kerala'],
    paths: siteBox(9.00, 76.63, 0.12)
  },

  { id:'vembanad_kol', name:'Vembanad-Kol Wetland', region:'',
    fact:"Vembanad-Kol is the largest lake and wetland system of Kerala. It includes extensive backwaters, paddy fields and estuarine habitats and is vital for fisheries, agriculture, transport and migratory birds.",
    states:['Kerala'],
    paths: siteBox(9.55, 76.40, 0.40)
  },

  // =========================
  // LADAKH
  // =========================

  { id:'tso_kar', name:'Tso Kar', region:'',
    fact:"Tso Kar is a high-altitude wetland complex in Ladakh consisting of a hypersaline lake and freshwater wetlands. It is an important habitat for the black-necked crane and other high-altitude birds.",
    states:['Ladakh'],
    paths: siteBox(33.30, 78.00, 0.18)
  },

  { id:'tsomoriri', name:'Tsomoriri Lake', region:'',
    fact:"Tsomoriri is a high-altitude freshwater-to-brackish lake in the Changthang region of Ladakh. It is an important breeding ground for the black-necked crane and bar-headed goose.",
    states:['Ladakh'],
    paths: siteBox(32.98, 78.31, 0.18)
  },

  // =========================
  // MADHYA PRADESH
  // =========================

  { id:'bhoj_wetland', name:'Bhoj Wetland', region:'',
    fact:"Bhoj Wetland consists of the Upper and Lower Lakes of Bhopal. The lakes provide drinking water to Bhopal and support important aquatic biodiversity and waterbirds.",
    states:['Madhya Pradesh'],
    paths: siteBox(23.25, 77.35, 0.18)
  },

  { id:'sakhya_sagar', name:'Sakhya Sagar', region:'',
    fact:"Sakhya Sagar is a freshwater reservoir within the Madhav National Park landscape at Shivpuri. It supports marsh and aquatic habitats and a variety of resident and migratory birds.",
    states:['Madhya Pradesh'],
    paths: siteBox(25.43, 77.74, 0.12)
  },

  { id:'sirpur_lake', name:'Sirpur Lake', region:'',
    fact:"Sirpur Lake is an urban freshwater wetland in Indore and an important bird habitat. Its restoration has helped revive wetland biodiversity in the city.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.74, 75.80, 0.12)
  },

  { id:'yashwant_sagar', name:'Yashwant Sagar', region:'',
    fact:"Yashwant Sagar is a reservoir near Indore formed on the Gambhir River. It is an important water source and wetland habitat supporting numerous waterbirds.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.82, 75.66, 0.15)
  },

  { id:'tawa_reservoir', name:'Tawa Reservoir', region:'',
    fact:"Tawa Reservoir is formed by the Tawa Dam on the Tawa River, a tributary of the Narmada. It is an important freshwater wetland supporting fisheries, agriculture and waterbirds.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.62, 77.90, 0.18)
  },

  // =========================
  // MAHARASHTRA
  // =========================

  { id:'lonar_lake', name:'Lonar Lake', region:'',
    fact:"Lonar is a nearly circular saline-alkaline lake formed in a meteorite impact crater in basaltic rock. It is one of India's most unusual geological and ecological wetlands.",
    states:['Maharashtra'],
    paths: siteBox(19.98, 76.51, 0.13)
  },

  { id:'nandur_madhameshwar', name:'Nandur Madhameshwar', region:'',
    fact:"Nandur Madhameshwar is a wetland complex at the confluence of the Godavari and Kadva rivers. It is often called the 'Bharatpur of Maharashtra' because of its rich birdlife.",
    states:['Maharashtra'],
    paths: siteBox(20.00, 74.10, 0.20)
  },

  { id:'thane_creek', name:'Thane Creek', region:'',
    fact:"Thane Creek is a tidal estuarine wetland near Mumbai. Its mudflats and mangroves support large congregations of flamingos and other migratory waterbirds.",
    states:['Maharashtra'],
    paths: siteBox(19.22, 72.98, 0.20)
  },

  // =========================
  // MANIPUR
  // =========================

  { id:'loktak_lake', name:'Loktak Lake', region:'',
    fact:"Loktak is the largest freshwater lake in northeastern India and is famous for its floating phumdis. It supports Keibul Lamjao National Park, the natural habitat of the endangered Sangai deer.",
    states:['Manipur'],
    paths: siteBox(24.55, 93.78, 0.25)
  },

  // =========================
  // MIZORAM
  // =========================

  { id:'pala_wetland', name:'Pala Wetland', region:'',
    fact:"Pala Wetland is a natural freshwater lake surrounded by forested hills in Mizoram. It supports wetland biodiversity and is particularly important for birds and aquatic ecosystems.",
    states:['Mizoram'],
    paths: siteBox(22.32, 92.52, 0.12)
  },

  // =========================
  // ODISHA
  // =========================

  { id:'ansupa_lake', name:'Ansupa Lake', region:'',
    fact:"Ansupa is a freshwater oxbow lake on the Mahanadi floodplain in Odisha. It supports aquatic vegetation, fisheries and a variety of resident and migratory waterbirds.",
    states:['Odisha'],
    paths: siteBox(20.48, 85.60, 0.15)
  },

  { id:'bhitarkanika', name:'Bhitarkanika Mangroves', region:'',
    fact:"Bhitarkanika is one of India's major mangrove ecosystems in the Brahmani-Baitarani delta. It is famous for saltwater crocodiles, mangrove biodiversity and important estuarine habitats.",
    states:['Odisha'],
    paths: siteBox(20.72, 86.88, 0.25)
  },

  { id:'chilika_lake', name:'Chilika Lake', region:'',
    fact:"Chilika is India's largest coastal lagoon and one of the world's major wintering grounds for migratory waterbirds. It is also famous for Irrawaddy dolphins and extensive fisheries.",
    states:['Odisha'],
    paths: siteBox(19.72, 85.32, 0.35)
  },

  { id:'hirakud_reservoir', name:'Hirakud Reservoir', region:'',
    fact:"Hirakud Reservoir is formed by the Hirakud Dam across the Mahanadi River. It is an important freshwater wetland supporting fisheries, irrigation and large numbers of waterbirds.",
    states:['Odisha'],
    paths: siteBox(21.52, 83.87, 0.20)
  },

  { id:'satkosia_gorge', name:'Satkosia Gorge', region:'',
    fact:"Satkosia Gorge is a major freshwater riverine wetland along the Mahanadi where the river cuts through the Eastern Ghats. It is important for riverine biodiversity and gharial and mugger conservation.",
    states:['Odisha'],
    paths: siteBox(20.65, 84.75, 0.30)
  },

  { id:'tampara_lake', name:'Tampara Lake', region:'',
    fact:"Tampara is a long, shallow freshwater lagoon near the Odisha coast. It supports aquatic vegetation, fisheries and migratory waterbirds.",
    states:['Odisha'],
    paths: siteBox(19.33, 85.10, 0.18)
  },

  // =========================
  // PUNJAB
  // =========================

  { id:'beas_conservation', name:'Beas Conservation Reserve', region:'',
    fact:"Beas Conservation Reserve protects a long stretch of the Beas River in Punjab. It is particularly important for the endangered Indus river dolphin and the gharial, along with numerous waterbirds.",
    states:['Punjab'],
    paths: siteBox(31.20, 75.25, 0.35)
  },

  { id:'harike_wetland', name:'Harike Wetland', region:'',
    fact:"Harike is a major freshwater wetland formed at the confluence of the Beas and Sutlej rivers. It is an important wintering ground for migratory waterbirds and a key wetland of the Indus basin.",
    states:['Punjab'],
    paths: siteBox(31.15, 74.98, 0.18)
  },

  { id:'kanjli_wetland', name:'Kanjli Wetland', region:'',
    fact:"Kanjli is a man-made wetland formed by the construction of a headworks across the Kali Bein River. It supports aquatic biodiversity and migratory birds in Punjab.",
    states:['Punjab'],
    paths: siteBox(31.38, 75.37, 0.12)
  },

  { id:'keshopur_miani', name:'Keshopur-Miani Community Reserve', region:'',
    fact:"Keshopur-Miani is a community-managed wetland complex in Gurdaspur district. It consists of marshes, agricultural lands and ponds supporting many migratory waterbirds.",
    states:['Punjab'],
    paths: siteBox(32.00, 75.40, 0.18)
  },

  { id:'nangal_wildlife', name:'Nangal Wildlife Sanctuary', region:'',
    fact:"Nangal Wildlife Sanctuary lies around the Sutlej River and Nangal Reservoir. It provides habitat for migratory waterbirds and is associated with the riverine ecosystem of the Sutlej.",
    states:['Punjab'],
    paths: siteBox(31.38, 76.38, 0.15)
  },

  { id:'ropar_wetland', name:'Ropar Wetland', region:'',
    fact:"Ropar Wetland is a human-made wetland created by a barrage across the Sutlej River. It supports migratory waterbirds and important riverine and aquatic biodiversity.",
    states:['Punjab'],
    paths: siteBox(30.97, 76.52, 0.15)
  },

  // =========================
  // RAJASTHAN
  // =========================

  { id:'keoladeo', name:'Keoladeo National Park', region:'',
    fact:"Keoladeo is a famous man-made wetland and bird sanctuary in Bharatpur. It is one of India's oldest Ramsar sites and a major wintering ground for migratory waterbirds.",
    states:['Rajasthan'],
    paths: siteBox(27.16, 77.52, 0.12)
  },

  { id:'sambhar_lake', name:'Sambhar Lake', region:'',
    fact:"Sambhar is India's largest inland salt lake. It is a shallow saline wetland surrounded by salt flats and is especially important for flamingos and other wintering waterbirds.",
    states:['Rajasthan'],
    paths: siteBox(26.98, 75.00, 0.30)
  },

  { id:'khichan', name:'Khichan', region:'',
    fact:"Khichan is a desert wetland and village landscape in western Rajasthan famous for its enormous wintering population of Demoiselle cranes. It became a Ramsar site in 2025.",
    states:['Rajasthan'],
    paths: siteBox(27.15, 72.25, 0.12)
  },

  { id:'menar', name:'Menar Wetland Complex', region:'',
    fact:"Menar is a wetland complex near Udaipur consisting of village ponds and lakes. It is particularly important for migratory waterbirds including flamingos and is known for community-based wetland conservation.",
    states:['Rajasthan'],
    paths: siteBox(24.55, 74.10, 0.18)
  },

  { id:'siliserh_lake', name:'Siliserh Lake', region:'',
    fact:"Siliserh Lake is a freshwater reservoir near Alwar surrounded by the Aravalli hills. It supports aquatic habitats and resident and migratory birds and became a Ramsar site in 2025.",
    states:['Rajasthan'],
    paths: siteBox(27.55, 76.55, 0.13)
  },

  // =========================
  // SIKKIM
  // =========================

  { id:'khecheopalri', name:'Khecheopalri Wetland', region:'',
    fact:"Khecheopalri is a sacred high-altitude freshwater wetland in Sikkim. The lake is surrounded by forest and is culturally important to Buddhist and Hindu communities.",
    states:['Sikkim'],
    paths: siteBox(27.30, 88.18, 0.12)
  },

  // =========================
  // TAMIL NADU
  // =========================

  { id:'chitrangudi', name:'Chitrangudi Bird Sanctuary', region:'',
    fact:"Chitrangudi is a freshwater wetland in Ramanathapuram district and an important breeding and wintering ground for waterbirds. It is part of Tamil Nadu's extensive network of bird sanctuaries.",
    states:['Tamil Nadu'],
    paths: siteBox(9.35, 78.48, 0.12)
  },

  { id:'gulf_of_mannar', name:'Gulf of Mannar Marine Biosphere Reserve', region:'',
    fact:"The Gulf of Mannar contains coral reefs, seagrass beds, mangroves, mudflats and coastal wetlands. It is one of India's most important marine biodiversity areas and supports dugongs and many coral and fish species.",
    states:['Tamil Nadu'],
    paths: siteBox(9.10, 79.10, 0.30)
  },

  { id:'kanjirankulam', name:'Kanjirankulam Bird Sanctuary', region:'',
    fact:"Kanjirankulam is a seasonal freshwater wetland in Ramanathapuram district. It is an important nesting and breeding site for several waterbird species.",
    states:['Tamil Nadu'],
    paths: siteBox(9.30, 78.48, 0.12)
  },

  { id:'karaivetti', name:'Karaivetti Bird Sanctuary', region:'',
    fact:"Karaivetti is one of Tamil Nadu's largest inland bird sanctuaries. Its freshwater wetland supports large numbers of migratory waterbirds during the winter season.",
    states:['Tamil Nadu'],
    paths: siteBox(10.95, 79.00, 0.15)
  },

  { id:'karikili', name:'Karikili Bird Sanctuary', region:'',
    fact:"Karikili is a freshwater wetland in Chengalpattu district. It is an important wintering and breeding habitat for migratory and resident waterbirds.",
    states:['Tamil Nadu'],
    paths: siteBox(12.55, 79.90, 0.12)
  },

  { id:'koonthankulam', name:'Koonthankulam Bird Sanctuary', region:'',
    fact:"Koonthankulam is a group of irrigation tanks in Tirunelveli district and an important breeding site for colonial waterbirds. It is especially significant for migratory birds.",
    states:['Tamil Nadu'],
    paths: siteBox(8.53, 77.72, 0.12)
  },

  { id:'longwood_shola', name:'Longwood Shola Reserve Forest', region:'',
    fact:"Longwood Shola is a high-elevation shola-grassland wetland ecosystem in the Nilgiris. Its forests, streams and wetlands support many endemic species of the Western Ghats.",
    states:['Tamil Nadu'],
    paths: siteBox(11.40, 76.75, 0.13)
  },

  { id:'pallikarnai_marsh', name:'Pallikarnai Marsh Reserve Forest', region:'',
    fact:"Pallikarnai Marsh is a major urban freshwater and brackish wetland in Chennai. It is one of the last remaining natural wetlands of the Chennai region and supports many waterbirds.",
    states:['Tamil Nadu'],
    paths: siteBox(12.94, 80.22, 0.15)
  },

  { id:'pichavaram_mangrove', name:'Pichavaram Mangrove', region:'',
    fact:"Pichavaram is one of India's important mangrove ecosystems on the Tamil Nadu coast. Its network of tidal channels and mangrove islands provides habitat for fish, birds and other coastal biodiversity.",
    states:['Tamil Nadu'],
    paths: siteBox(11.43, 79.78, 0.15)
  },

  { id:'point_calimere', name:'Point Calimere Wildlife and Bird Sanctuary', region:'',
    fact:"Point Calimere is a coastal wetland at the southeastern tip of Tamil Nadu. It contains salt marshes, mangroves, shallow waters and mudflats and is an important migratory bird habitat.",
    states:['Tamil Nadu'],
    paths: siteBox(10.30, 79.85, 0.20)
  },

  { id:'suchindram_theroor', name:'Suchindram Theroor Wetland Complex', region:'',
    fact:"Suchindram Theroor is a network of freshwater tanks and wetlands in the far south of Tamil Nadu. It is an important habitat for migratory and resident waterbirds.",
    states:['Tamil Nadu'],
    paths: siteBox(8.15, 77.45, 0.15)
  },

  { id:'udhayamarthandapuram', name:'Udhayamarthandapuram Bird Sanctuary', region:'',
    fact:"Udhayamarthandapuram is a seasonal freshwater wetland in the Cauvery delta region. It attracts large numbers of migratory waterbirds during the northeast monsoon and winter.",
    states:['Tamil Nadu'],
    paths: siteBox(10.55, 79.48, 0.12)
  },

  { id:'vadavur', name:'Vadavur Bird Sanctuary', region:'',
    fact:"Vadavur is a large irrigation tank and wetland in the Cauvery delta. It provides important feeding and roosting habitat for migratory waterbirds.",
    states:['Tamil Nadu'],
    paths: siteBox(10.73, 79.20, 0.12)
  },

  { id:'vedanthangal', name:'Vedanthangal Bird Sanctuary', region:'',
    fact:"Vedanthangal is one of India's oldest bird sanctuaries. Its traditional community-protected irrigation tank supports large breeding colonies of waterbirds.",
    states:['Tamil Nadu'],
    paths: siteBox(12.54, 79.85, 0.12)
  },

  { id:'vellode', name:'Vellode Bird Sanctuary', region:'',
    fact:"Vellode is a freshwater irrigation tank near Erode. It is an important wintering and feeding habitat for migratory waterbirds.",
    states:['Tamil Nadu'],
    paths: siteBox(11.23, 77.63, 0.12)
  },

  { id:'vembannur', name:'Vembannur Wetland Complex', region:'',
    fact:"Vembannur is a freshwater wetland complex in Tamil Nadu supporting resident and migratory birds. It is part of the state's extensive network of tank-based wetlands.",
    states:['Tamil Nadu'],
    paths: siteBox(11.95, 79.55, 0.12)
  },

  { id:'nanjarayan', name:'Nanjarayan Bird Sanctuary', region:'',
    fact:"Nanjarayan is a restored freshwater irrigation tank near Tiruppur. It supports migratory and resident waterbirds and became a Ramsar site in 2024.",
    states:['Tamil Nadu'],
    paths: siteBox(11.08, 77.34, 0.12)
  },

  { id:'kazhuveli', name:'Kazhuveli Bird Sanctuary', region:'',
    fact:"Kazhuveli is a large coastal brackish wetland in Villupuram district. It contains mudflats, salt marshes and shallow waters and is an important stopover site for migratory birds.",
    states:['Tamil Nadu'],
    paths: siteBox(12.05, 79.95, 0.25)
  },

  { id:'sakkarakottai', name:'Sakkarakottai Bird Sanctuary', region:'',
    fact:"Sakkarakottai is a seasonal freshwater wetland in Ramanathapuram district. It supports large numbers of migratory and resident waterbirds and became a Ramsar site in 2025.",
    states:['Tamil Nadu'],
    paths: siteBox(9.38, 78.85, 0.12)
  },

  { id:'therthangal', name:'Therthangal Bird Sanctuary', region:'',
    fact:"Therthangal is a seasonal freshwater wetland in Ramanathapuram district. It is an important habitat for migratory waterbirds and became a Ramsar site in 2025.",
    states:['Tamil Nadu'],
    paths: siteBox(9.35, 78.72, 0.12)
  },

  // =========================
  // TRIPURA
  // =========================

  { id:'rudrasagar', name:'Rudrasagar Lake', region:'',
    fact:"Rudrasagar is a lowland freshwater lake in Tripura surrounded by agricultural land. It supports migratory waterbirds and is particularly important for wetland biodiversity in northeastern India.",
    states:['Tripura'],
    paths: siteBox(23.50, 91.33, 0.13)
  },

  // =========================
  // UTTAR PRADESH
  // =========================

  { id:'bakhira', name:'Bakhira Sanctuary', region:'',
    fact:"Bakhira is a large freshwater wetland in eastern Uttar Pradesh and one of the important wintering grounds for migratory waterbirds in the Ganga plain.",
    states:['Uttar Pradesh'],
    paths: siteBox(26.92, 83.95, 0.20)
  },

  { id:'haiderpur', name:'Haiderpur Wetland', region:'',
    fact:"Haiderpur Wetland is a human-made wetland associated with the Ganga floodplain and the Madhya Ganga Barrage. It supports a large diversity of migratory and resident waterbirds.",
    states:['Uttar Pradesh'],
    paths: siteBox(29.45, 78.02, 0.18)
  },

  { id:'nawabganj', name:'Nawabganj Bird Sanctuary', region:'',
    fact:"Nawabganj is a freshwater wetland in Unnao district near Lucknow. It is an important wintering habitat for migratory waterbirds and supports diverse wetland vegetation.",
    states:['Uttar Pradesh'],
    paths: siteBox(26.62, 80.65, 0.12)
  },

  { id:'parvati_arga', name:'Parvati Arga Bird Sanctuary', region:'',
    fact:"Parvati Arga consists of two connected freshwater lakes in Gonda district. It is an important habitat for wintering waterbirds and supports several threatened species.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.25, 82.05, 0.15)
  },

  { id:'saman', name:'Saman Bird Sanctuary', region:'',
    fact:"Saman is a seasonal freshwater oxbow wetland in Mainpuri district. It is an important wintering ground for migratory waterbirds of the Ganga-Yamuna plain.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.10, 79.10, 0.12)
  },

  { id:'samaspur', name:'Samaspur Bird Sanctuary', region:'',
    fact:"Samaspur is a freshwater wetland complex in Raebareli district. Its marshes and open water attract large numbers of wintering migratory birds.",
    states:['Uttar Pradesh'],
    paths: siteBox(26.20, 81.35, 0.13)
  },

  { id:'sandi', name:'Sandi Bird Sanctuary', region:'',
    fact:"Sandi is a freshwater wetland in Hardoi district. It is an important wintering and breeding habitat for migratory waterbirds.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.30, 80.00, 0.12)
  },

  { id:'sarsai_nawar', name:'Sarsai Nawar Jheel', region:'',
    fact:"Sarsai Nawar Jheel is a seasonal freshwater wetland in Etawah district. It is particularly important for the vulnerable Sarus crane and other wetland birds.",
    states:['Uttar Pradesh'],
    paths: siteBox(26.98, 79.20, 0.12)
  },

  { id:'sur_sarovar', name:'Sur Sarovar', region:'',
    fact:"Sur Sarovar, also known as Keetham Lake, is a freshwater reservoir near Agra. It supports a large variety of resident and migratory waterbirds and lies near the Yamuna River.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.22, 77.84, 0.13)
  },

  { id:'upper_ganga', name:'Upper Ganga River', region:'',
    fact:"The Upper Ganga River Ramsar site is a long stretch of the Ganga between Bijnor and Narora. It contains shallow river habitats, sandbanks and seasonal wetlands supporting dolphins, turtles and waterbirds.",
    states:['Uttar Pradesh'],
    paths: siteBox(28.20, 78.35, 0.45)
  },

  { id:'patna_bird_sanctuary', name:'Patna Bird Sanctuary', region:'',
    fact:"Patna Bird Sanctuary is a wetland in Etah district of Uttar Pradesh. It is an important habitat for migratory waterbirds and became a Ramsar site in 2026.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.55, 78.65, 0.12)
  },

  { id:'shekha_jheel', name:'Shekha Jheel Bird Sanctuary', region:'',
    fact:"Shekha Jheel is a freshwater wetland near Aligarh in Uttar Pradesh. It is an important habitat for migratory waterbirds and became India's 99th Ramsar site in April 2026.",
    states:['Uttar Pradesh'],
    paths: siteBox(27.88, 78.12, 0.12)
  },

  { id:'jai_prakash_narayan', name:'Jai Prakash Narayan Bird Sanctuary (Surha Tal)', region:'',
    fact:"Surha Tal is a large natural oxbow lake near Ballia in eastern Uttar Pradesh. It is an important freshwater wetland and bird habitat and became India's 100th Ramsar site in June 2026.",
    states:['Uttar Pradesh'],
    paths: siteBox(25.78, 84.15, 0.18)
  },

  // =========================
  // UTTARAKHAND
  // =========================

  { id:'asan_barrage', name:'Asan Barrage', region:'',
    fact:"Asan Barrage is a freshwater wetland formed on the Asan River near its confluence with the Yamuna system. It is Uttarakhand's first Ramsar site and an important wintering ground for waterbirds.",
    states:['Uttarakhand'],
    paths: siteBox(30.45, 77.72, 0.15)
  },

  // =========================
  // WEST BENGAL
  // =========================

  { id:'east_kolkata_wetlands', name:'East Kolkata Wetlands', region:'',
    fact:"East Kolkata Wetlands are a unique peri-urban wetland system that naturally treats Kolkata's wastewater through fish ponds and agricultural fields. They support fisheries, food production and biodiversity.",
    states:['West Bengal'],
    paths: siteBox(22.52, 88.50, 0.25)
  },

  { id:'sundarban_wetland', name:'Sundarban Wetland', region:'',
    fact:"Sundarban Wetland is part of the world's largest mangrove ecosystem in the Ganga-Brahmaputra-Meghna delta. It supports the Bengal tiger, estuarine crocodile, dolphins and enormous coastal biodiversity.",
    states:['West Bengal'],
    paths: siteBox(21.95, 88.90, 0.35)
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
   Highlights just the STATE a mineral belt lies in, not the whole country — more useful
   for UPSC-style map practice. Tries a couple of mirrors of a standard India-states GeoJSON. */
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

/* ---------------- Mineral icon (shown over the reveal location, on top of the highlighted state) ---------------- */
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

/* Is the guess anywhere inside the mineral's actual producing state? */
function isInsideAnyState(gLatLng, stateNames){
  if(!indiaStatesGeo) return false;
  const [lat, lng] = gLatLng;
  return stateNames.some(name=>{
    const feature = indiaStatesGeo.features.find(f => stateFeatureMatches(f, name));
    return feature ? pointInGeoJSONPolygon(lng, lat, feature.geometry) : false;
  });
}
function nearestOnPaths(p, paths){
  // Inside the mineral's marker box? Full credit — distance 0.
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

  // If you're outside the mineral's marker box but inside the state that actually
  // leads its production, don't torch the score for it — cap the *scoring* distance.
  const insideState = km > 0 && isInsideAnyState(gLatLng, round.states);
  const scoringKm = insideState ? Math.min(km, 100) : km;

  const v = verdictFor(scoringKm);
  const pts = scoreFor(scoringKm);
  scores.push(pts);
  results.push({name:round.name, km, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit both the guess and the real mining belt, so the
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

  // Mineral icon marker, placed directly over the mining belt's location on the
  // map so the player sees exactly where — and over which state — it lies.
  const centerColor = VERDICT_HIGHLIGHT_COLOR[v.cls] || '#D4A853';
  const mineralMarker = L.marker(centerOfPaths(round.paths), {
    icon: mineralDivIcon(centerColor, round.name),
    interactive:false
  }).addTo(map);
  revealLayers.push(mineralMarker);

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
  if(avg >= 85) msg = "Master of Indian mineral geography. UPSC map-based questions won't stand a chance.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of India's mineral belts.";
  else if(avg >= 40) msg = "Solid run. These mineral belts are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the mineral belts closer. Chart again!';
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the mineral belts closer this time.';
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
    const msg = `⛏️ I just charted the Mineral Navigator (India) and scored ${currentAvgScore}%. Think you can pin the mineral belts closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`⛏️ Think you can beat my Mineral Navigator score of ${currentAvgScore}%?`);
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
