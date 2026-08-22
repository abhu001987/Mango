/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'forest-navigator-india';
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
  // ANDAMAN & NICOBAR ISLANDS
  // =========================

  { id:'campbell_bay', name:'Campbell Bay National Park', region:'',
    fact:"Located on Great Nicobar Island and part of the Great Nicobar Biosphere Reserve, it protects tropical rainforest habitat important for the Nicobar megapode, giant leatherback turtles and saltwater crocodiles.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(7.02, 93.92)
  },

  { id:'galathea_bay', name:'Galathea Bay National Park', region:'',
    fact:"Located in southern Great Nicobar, this protected area is famous for important leatherback turtle nesting beaches and forms part of the Great Nicobar Biosphere Reserve.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(6.75, 93.85)
  },

  { id:'mahatma_gandhi_marine', name:'Mahatma Gandhi Marine National Park', region:'',
    fact:"A marine national park around islands off Wandoor, protecting coral reefs, mangroves, sea turtles and marine biodiversity in the Andaman Sea.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(11.55, 92.62)
  },

  { id:'middle_button', name:'Middle Button Island National Park', region:'',
    fact:"One of India's smallest national parks, consisting of a small coral-fringed island supporting marine ecosystems, reefs and species such as dugongs.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(12.30, 92.75)
  },

  { id:'mount_manipur', name:'Mount Manipur National Park', region:'',
    fact:"Formerly called Mount Harriet National Park, it protects tropical evergreen forest and contains Mount Manipur, one of the highest peaks of the Andaman Islands.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(11.77, 92.75)
  },

  { id:'north_button', name:'North Button Island National Park', region:'',
    fact:"A tiny island national park surrounded by coral reefs and marine habitats, supporting dugongs, sea turtles and other reef-associated wildlife.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(12.28, 92.78)
  },

  { id:'rani_jhansi_marine', name:'Rani Jhansi Marine National Park', region:'',
    fact:"A marine national park protecting coral reefs, mangroves and surrounding marine habitats of the Ritchies Archipelago, including important dugong and turtle habitat.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(12.05, 92.95)
  },

  { id:'saddle_peak', name:'Saddle Peak National Park', region:'',
    fact:"Located on North Andaman Island and named after Saddle Peak, the highest point of the Andaman Islands at about 732 metres.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(13.23, 93.01)
  },

  { id:'south_button', name:'South Button Island National Park', region:'',
    fact:"One of India's smallest national parks, consisting of a small coral-fringed island with rich reef and marine biodiversity.",
    states:['Andaman and Nicobar Islands'],
    paths: siteBox(11.96, 92.99)
  },


  // =========================
  // ANDHRA PRADESH
  // =========================

  { id:'papikonda', name:'Papikonda National Park', region:'',
    fact:"Located in the Eastern Ghats along the Godavari River, Papikonda protects tropical forest and important wildlife habitat in the Papikonda hills.",
    states:['Andhra Pradesh'],
    paths: siteBox(17.45, 81.55)
  },

  { id:'rajiv_gandhi_rameswaram', name:'Rajiv Gandhi (Rameswaram) National Park', region:'',
    fact:"A compact dry-deciduous national park near the Penna River, known for dryland vegetation and wildlife such as blackbuck and chinkara.",
    states:['Andhra Pradesh'],
    paths: siteBox(14.78, 79.05)
  },

  { id:'sri_venkateswara', name:'Sri Venkateswara National Park', region:'',
    fact:"Located in the Seshachalam Hills of the Eastern Ghats, it is famous for red sanders forests and species including the slender loris and golden gecko.",
    states:['Andhra Pradesh'],
    paths: siteBox(13.72, 79.32)
  },


  // =========================
  // ARUNACHAL PRADESH
  // =========================

  { id:'mouling', name:'Mouling National Park', region:'',
    fact:"Part of the Dihang-Dibang Biosphere Reserve, this Eastern Himalayan park contains diverse forests and species such as the takin, red panda and serow.",
    states:['Arunachal Pradesh'],
    paths: siteBox(28.65, 94.85)
  },

  { id:'namdapha', name:'Namdapha National Park', region:'',
    fact:"A huge Eastern Himalayan protected area spanning a remarkable altitude range from lowland rainforest to alpine habitats. It is famous for supporting tiger, leopard, snow leopard and clouded leopard.",
    states:['Arunachal Pradesh'],
    paths: siteBox(27.50, 96.40)
  },


  // =========================
  // ASSAM
  // =========================

  { id:'dehing_patkai', name:'Dehing Patkai National Park', region:'',
    fact:"Known for its extensive lowland tropical rainforest, often called the 'Amazon of the East'. It supports hoolock gibbons, Chinese pangolins and rich rainforest biodiversity.",
    states:['Assam'],
    paths: siteBox(27.35, 95.75)
  },

  { id:'dibru_saikhowa', name:'Dibru-Saikhowa National Park', region:'',
    fact:"A riverine and wetland ecosystem between the Brahmaputra and Lohit rivers, famous for feral horses and the endangered white-winged wood duck.",
    states:['Assam'],
    paths: siteBox(27.60, 95.35)
  },

  { id:'kaziranga', name:'Kaziranga National Park', region:'',
    fact:"A UNESCO World Heritage Site on the floodplains of the Brahmaputra and one of the world's most important strongholds of the greater one-horned rhinoceros.",
    states:['Assam'],
    paths: siteBox(26.58, 93.17)
  },

  { id:'manas', name:'Manas National Park', region:'',
    fact:"A UNESCO World Heritage Site along the Bhutan border and the Manas River, famous for the pygmy hog, golden langur, hispid hare, tiger and elephant.",
    states:['Assam'],
    paths: siteBox(26.72, 91.00)
  },

  { id:'nameri', name:'Nameri National Park', region:'',
    fact:"Located in the foothills of the Eastern Himalayas along the Jia-Bhoroli River, it is an important habitat of the white-winged wood duck and forms a transboundary landscape with Arunachal Pradesh.",
    states:['Assam'],
    paths: siteBox(27.02, 92.78)
  },

  { id:'orang', name:'Orang National Park', region:'',
    fact:"Often called 'Mini Kaziranga', Orang lies on the north bank of the Brahmaputra and supports one-horned rhinoceros, tiger, pygmy hog and other floodplain wildlife.",
    states:['Assam'],
    paths: siteBox(26.58, 92.30)
  },

  { id:'raimona', name:'Raimona National Park', region:'',
    fact:"Located along the Indo-Bhutan border, Raimona is particularly important for golden langurs and forms part of the larger transboundary forest landscape of western Assam.",
    states:['Assam'],
    paths: siteBox(26.55, 90.30)
  },


  // =========================
  // BIHAR
  // =========================

  { id:'valmiki', name:'Valmiki National Park', region:'',
    fact:"Located along the Indo-Nepal border and forming the core of Bihar's only tiger reserve, it is ecologically connected with Nepal's Chitwan landscape.",
    states:['Bihar'],
    paths: siteBox(27.35, 84.15)
  },


  // =========================
  // CHHATTISGARH
  // =========================

  { id:'guru_ghasidas', name:'Guru Ghasidas (Sanjay) National Park', region:'',
    fact:"A large forest landscape in northern Chhattisgarh forming part of the Guru Ghasidas-Tamor Pingla tiger landscape and important for central Indian wildlife.",
    states:['Chhattisgarh'],
    paths: siteBox(23.60, 82.45)
  },

  { id:'indravati', name:'Indravati National Park', region:'',
    fact:"Named after the Indravati River, this large forest park forms part of the Indravati Tiger Reserve and is an important refuge for wild water buffalo.",
    states:['Chhattisgarh'],
    paths: siteBox(18.75, 81.15)
  },

  { id:'kanger_valley', name:'Kanger Valley National Park', region:'',
    fact:"Known for dense forests, limestone caves such as Kutumsar and Kailash caves, and the Bastar hill myna, the state bird of Chhattisgarh.",
    states:['Chhattisgarh'],
    paths: siteBox(18.80, 81.95)
  },


  // =========================
  // GOA
  // =========================

  { id:'bhagwan_mahavir', name:'Bhagwan Mahaveer (Mollem) National Park', region:'',
    fact:"Goa's largest protected area, located in the Western Ghats and famous for Dudhsagar Falls, dense forest and rich biodiversity.",
    states:['Goa'],
    paths: siteBox(15.31, 74.25)
  },


  // =========================
  // GUJARAT
  // =========================

  { id:'blackbuck_velavadar', name:'Blackbuck (Velavadar) National Park', region:'',
    fact:"A grassland national park famous for blackbuck, nilgai, wolves and large winter roosts of harriers near the Gulf of Khambhat.",
    states:['Gujarat'],
    paths: siteBox(21.83, 72.05)
  },

  { id:'gir', name:'Gir National Park', region:'',
    fact:"The last natural stronghold of the Asiatic lion, located in the dry deciduous forests of Saurashtra.",
    states:['Gujarat'],
    paths: siteBox(21.12, 70.80)
  },

  { id:'marine_gulf_kutch', name:'Marine National Park, Gulf of Kachchh', region:'',
    fact:"India's first marine national park, established in 1982, protecting coral reefs, mangroves, sea grass and marine species including dugongs and sea turtles.",
    states:['Gujarat'],
    paths: siteBox(22.45, 69.10)
  },

  { id:'vansda', name:'Vansda National Park', region:'',
    fact:"A densely forested national park in southern Gujarat's Western Ghats landscape, dominated by moist deciduous vegetation and supporting leopards and other wildlife.",
    states:['Gujarat'],
    paths: siteBox(20.76, 73.50)
  },


  // =========================
  // HARYANA
  // =========================

  { id:'kalesar', name:'Kalesar National Park', region:'',
    fact:"A sal-dominated forest in the Shivalik foothills near the Haryana-Himachal-Uttarakhand region, supporting leopard, sambar, chital and other Himalayan foothill fauna.",
    states:['Haryana'],
    paths: siteBox(30.35, 77.43)
  },

  { id:'sultanpur', name:'Sultanpur National Park', region:'',
    fact:"A wetland national park near Delhi and Gurugram that is an important wintering and stopover site for migratory waterbirds.",
    states:['Haryana'],
    paths: siteBox(28.47, 76.89)
  },


  // =========================
  // HIMACHAL PRADESH
  // =========================

  { id:'great_himalayan', name:'Great Himalayan National Park', region:'',
    fact:"A UNESCO World Heritage Site protecting high-altitude Himalayan ecosystems and species including the western tragopan, snow leopard and Himalayan tahr.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.73, 77.50)
  },

  { id:'inderkilla', name:'Inderkilla National Park', region:'',
    fact:"A high-altitude protected area in the Kullu Himalaya containing alpine habitats and species such as snow leopard and Himalayan tahr.",
    states:['Himachal Pradesh'],
    paths: siteBox(32.25, 77.35)
  },

  { id:'khirganga', name:'Khirganga National Park', region:'',
    fact:"A Himalayan protected area around the upper Parvati Valley, containing alpine and subalpine forests and habitat for brown bear, musk deer and other mountain fauna.",
    states:['Himachal Pradesh'],
    paths: siteBox(32.02, 77.55)
  },

  { id:'pin_valley', name:'Pin Valley National Park', region:'',
    fact:"A high-altitude cold-desert national park in the Trans-Himalaya, famous for snow leopard, Siberian ibex and other species adapted to extreme conditions.",
    states:['Himachal Pradesh'],
    paths: siteBox(32.02, 78.00)
  },

  { id:'simbalbara', name:'Simbalbara National Park', region:'',
    fact:"Located in the Shivalik foothills and known for sal forests, goral, sambar and other Himalayan foothill wildlife.",
    states:['Himachal Pradesh'],
    paths: siteBox(30.52, 77.45)
  },


  // =========================
  // JAMMU & KASHMIR
  // =========================

  { id:'salim_ali', name:'City Forest (Salim Ali) National Park', region:'',
    fact:"A small urban national park near Srinagar associated with ornithologist Salim Ali and important for birds and wetland-associated wildlife.",
    states:['Jammu and Kashmir'],
    paths: siteBox(34.05, 74.88)
  },

  { id:'dachigam', name:'Dachigam National Park', region:'',
    fact:"The principal habitat of the endangered Hangul or Kashmir stag, with rugged Himalayan forests and mountain valleys near Srinagar.",
    states:['Jammu and Kashmir'],
    paths: siteBox(34.15, 75.05)
  },

  { id:'kishtwar', name:'Kishtwar High Altitude National Park', region:'',
    fact:"A rugged high-altitude Himalayan park containing snow leopard, Himalayan brown bear, markhor, musk deer and extensive mountain habitats.",
    states:['Jammu and Kashmir'],
    paths: siteBox(33.55, 76.05)
  },


  // =========================
  // JHARKHAND
  // =========================

  { id:'betla', name:'Betla National Park', region:'',
    fact:"Located in the Chota Nagpur Plateau and part of Palamu Tiger Reserve, Betla was among India's original Project Tiger reserves and contains sal-dominated forests.",
    states:['Jharkhand'],
    paths: siteBox(23.88, 84.18)
  },


  // =========================
  // KARNATAKA
  // =========================

  { id:'anshi_kali', name:'Anshi (Kali) National Park', region:'',
    fact:"Part of Kali Tiger Reserve in the Western Ghats, this forest landscape is known for rich biodiversity and occasional black panther sightings.",
    states:['Karnataka'],
    paths: siteBox(14.98, 74.45)
  },

  { id:'bandipur', name:'Bandipur National Park', region:'',
    fact:"A major tiger and elephant habitat in the Nilgiri Biosphere Reserve, forming a contiguous forest landscape with Nagarhole, Wayanad and Mudumalai.",
    states:['Karnataka'],
    paths: siteBox(11.66, 76.63)
  },

  { id:'bannerghatta', name:'Bannerghatta National Park', region:'',
    fact:"A forested protected area near Bengaluru containing elephant habitat and a biological park that includes India's first butterfly park.",
    states:['Karnataka'],
    paths: siteBox(12.80, 77.58)
  },

  { id:'kudremukh', name:'Kudremukh National Park', region:'',
    fact:"A major Western Ghats park of shola-grassland and evergreen forest, associated with the headwaters of the Tunga, Bhadra and Nethravathi rivers.",
    states:['Karnataka'],
    paths: siteBox(13.27, 75.25)
  },

  { id:'nagarhole', name:'Nagarhole (Rajiv Gandhi) National Park', region:'',
    fact:"A major tiger and elephant habitat in the Nilgiri Biosphere Reserve, connected to Bandipur through the wider Nilgiri forest landscape.",
    states:['Karnataka'],
    paths: siteBox(12.04, 76.13)
  },


  // =========================
  // KERALA
  // =========================

  { id:'anamudi_shola', name:'Anamudi Shola National Park', region:'',
    fact:"A high-altitude shola-grassland ecosystem in the Western Ghats near Munnar, supporting Nilgiri tahr and numerous endemic species.",
    states:['Kerala'],
    paths: siteBox(10.20, 77.20)
  },

  { id:'eravikulam', name:'Eravikulam National Park', region:'',
    fact:"Famous for having one of the largest populations of the endangered Nilgiri tahr and for the spectacular mass flowering of Neelakurinji.",
    states:['Kerala'],
    paths: siteBox(10.20, 77.05)
  },

  { id:'mathikettan_shola', name:'Mathikettan Shola National Park', region:'',
    fact:"A montane shola-grassland national park in the Munnar highlands, supporting elephants, sambar and numerous endemic species.",
    states:['Kerala'],
    paths: siteBox(10.05, 77.20)
  },

  { id:'pampadum_shola', name:'Pampadum Shola National Park', region:'',
    fact:"Kerala's smallest shola national park, located along the Kerala-Tamil Nadu highlands and known for montane forests and endemic wildlife.",
    states:['Kerala'],
    paths: siteBox(10.12, 77.28)
  },

  { id:'periyar', name:'Periyar National Park', region:'',
    fact:"A famous tiger and elephant reserve centered on Periyar Lake, known for forest landscapes and boat-based wildlife viewing.",
    states:['Kerala'],
    paths: siteBox(9.47, 77.23)
  },

  { id:'silent_valley', name:'Silent Valley National Park', region:'',
    fact:"One of India's finest remaining tracts of tropical evergreen rainforest in the Western Ghats, famous for the lion-tailed macaque and the environmental movement that saved it from a proposed dam.",
    states:['Kerala'],
    paths: siteBox(11.08, 76.43)
  },


  // =========================
  // LADAKH
  // =========================

  { id:'hemis', name:'Hemis National Park', region:'',
    fact:"India's largest national park, located in the Trans-Himalayan cold desert and famous for its high-altitude snow leopard habitat.",
    states:['Ladakh'],
    paths: siteBox(33.95, 77.45)
  },


  // =========================
  // MADHYA PRADESH
  // =========================

  { id:'bandhavgarh', name:'Bandhavgarh National Park', region:'',
    fact:"A famous tiger landscape known for high tiger density and the historic Bandhavgarh Fort located within the park.",
    states:['Madhya Pradesh'],
    paths: siteBox(23.63, 80.98)
  },

  { id:'ghughua_fossil', name:'Ghughua Fossil National Park', region:'',
    fact:"A unique fossil park preserving plant fossils dating back tens of millions of years, providing evidence of ancient vegetation and climate in Dindori, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.52, 81.45)
  },

  { id:'kanha', name:'Kanha National Park', region:'',
    fact:"A major sal and bamboo forest famous for conservation of the hard-ground barasingha and closely associated with the landscape that inspired The Jungle Book in Mandla – Balaghat, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.33, 80.61)
  },

  { id:'kuno', name:'Kuno National Park', region:'',
    fact:"The site of India's Project Cheetah, where African cheetahs were introduced beginning in 2022. The park lies in the Kuno River landscape in Sheopur, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(25.70, 77.10)
  },

  { id:'madhav', name:'Madhav National Park', region:'',
    fact:"A historic protected landscape around Sakhya Sagar Lake and the Shivpuri forests, known for chital, chinkara and diverse central Indian wildlife - Shivpuri, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(25.45, 77.73)
  },

  { id:'panna', name:'Panna National Park', region:'',
    fact:"Located along the Ken River, Panna became a major conservation success after tiger reintroduction and is part of the Panna Tiger Reserve landscape- Panna – Chhatarpur, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(24.72, 80.18)
  },

  { id:'pench_mp', name:'Pench National Park', region:'',
    fact:"Located around the Pench River and associated with the landscape that inspired Rudyard Kipling's The Jungle Book - Seoni – Chhindwara, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(21.65, 79.35)
  },

  { id:'sanjay_mp', name:'Sanjay (Dubri) National Park', region:'',
    fact:"A forested national park forming part of the Sanjay-Dubri tiger landscape and connected ecologically with Guru Ghasidas forests in Chhattisgarh - Sidhi, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(24.20, 82.65)
  },

  { id:'satpura', name:'Satpura National Park', region:'',
    fact:"A rugged central Indian forest landscape within the Satpura range, known for its varied terrain, sal and teak forests and Indian giant squirrel - Narmadapuram, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.55, 78.43)
  },

  { id:'van_vihar', name:'Van Vihar National Park', region:'',
    fact:"An unusual urban national park located beside Upper Lake in Bhopal, functioning as a protected green space and wildlife conservation facility within the city - Bhopal, Madhya Pradesh.",
    states:['Madhya Pradesh'],
    paths: siteBox(23.22, 77.34)
  },


  // =========================
  // MAHARASHTRA
  // =========================

  { id:'chandoli', name:'Chandoli National Park', region:'',
    fact:"A Western Ghats national park forming part of Sahyadri Tiger Reserve and known for evergreen and moist deciduous forests -Sahyadri, Maharashtra.",
    states:['Maharashtra'],
    paths: siteBox(17.12, 73.83)
  },

  { id:'gugamal', name:'Gugamal National Park', region:'',
    fact:"Part of the Melghat Tiger Reserve in the Satpura landscape, containing teak forests and important tiger habitat - Amravati, Maharashtra.",
    states:['Maharashtra'],
    paths: siteBox(21.40, 77.30)
  },

  { id:'nawegaon', name:'Nawegaon National Park', region:'',
    fact:"An eastern Maharashtra park known for rich birdlife, forests and wetlands and now part of the wider Nawegaon-Nagzira tiger landscape - Gondia, Maharashtra.",
    states:['Maharashtra'],
    paths: siteBox(21.28, 80.12)
  },

  { id:'pench_mh', name:'Pench (Jawaharlal Nehru) National Park', region:'',
    fact:"The Maharashtra portion of the Pench landscape, characterized by teak forests and wildlife including tiger, gaur and dhole - Nagpur, Maharashtra.",
    states:['Maharashtra'],
    paths: siteBox(21.70, 79.25)
  },

  { id:'sanjay_gandhi', name:'Sanjay Gandhi National Park', region:'',
    fact:"A large urban national park within Mumbai, famous for leopards, forested hills, Tulsi and Vihar lakes and the ancient Kanheri Buddhist caves - Mumbai, Maharashtra.",
    states:['Maharashtra'],
    paths: siteBox(19.22, 72.91)
  },

  { id:'tadoba', name:'Tadoba (Tadoba-Andhari) National Park', region:'',
    fact:"A major tiger landscape in central India, known for high tiger visibility, Tadoba Lake and the Andhari River - Chandrapur, Maharashtra.",
    states:['Maharashtra'],
    paths: siteBox(20.25, 79.35)
  },


  // =========================
  // MANIPUR
  // =========================

  { id:'keibul_lamjao', name:'Keibul Lamjao National Park', region:'',
    fact:"The world's only floating national park, formed on floating phumdis of Loktak Lake and famous as the last natural habitat of the endangered Sangai deer - Loktak Lake, Manipur.",
    states:['Manipur'],
    paths: siteBox(24.55, 93.82)
  },


  // =========================
  // MEGHALAYA
  // =========================

  { id:'balphakram', name:'Balphakram National Park', region:'',
    fact:"Located in the Garo Hills near Bangladesh, Balphakram is associated with Garo cultural traditions and supports elephants, red pandas and diverse hill wildlife - Garo Hills, Meghalaya.",
    states:['Meghalaya'],
    paths: siteBox(25.25, 90.95)
  },

  { id:'nokrek', name:'Nokrek National Park', region:'',
    fact:"A UNESCO Biosphere Reserve in the Garo Hills and an important genetic refuge for wild Citrus indica, the Indian wild orange - Garo Hills, Meghalaya.",
    states:['Meghalaya'],
    paths: siteBox(25.47, 90.30)
  },


  // =========================
  // MIZORAM
  // =========================

  { id:'murlen', name:'Murlen National Park', region:'',
    fact:"A montane forest park near the Myanmar border, supporting species such as hoolock gibbon, serow and other northeastern hill fauna - Champhai, Mizoram.",
    states:['Mizoram'],
    paths: siteBox(23.58, 93.05)
  },

  { id:'phawngpui', name:'Phawngpui (Blue Mountain) National Park', region:'',
    fact:"Centered around Phawngpui, the highest peak of Mizoram, this park contains montane forests and species including serow, goral and Blyth's tragopan - Lawngtlai, Mizoram.",
    states:['Mizoram'],
    paths: siteBox(22.65, 93.05)
  },


  // =========================
  // NAGALAND
  // =========================

  { id:'intanki', name:'Intanki (Ntangki) National Park', region:'',
    fact:"Nagaland's only national park, protecting tropical and subtropical forests and wildlife including hoolock gibbons and other northeastern species - Peren, Nagaland.",
    states:['Nagaland'],
    paths: siteBox(25.55, 93.65)
  },


  // =========================
  // ODISHA
  // =========================

  { id:'bhitarkanika', name:'Bhitarkanika National Park', region:'',
    fact:"A major mangrove ecosystem in the Brahmani-Baitarani delta and one of India's most important habitats for saltwater crocodiles - Kendrapara, Odisha.",
    states:['Odisha'],
    paths: siteBox(20.65, 86.90)
  },

  { id:'similipal', name:'Similipal National Park', region:'',
    fact:"A tiger reserve and biosphere reserve dominated by sal forests, famous for waterfalls and occasional melanistic tigers - Mayurbhanj, Odisha.",
    states:['Odisha'],
    paths: siteBox(21.62, 86.32)
  },


  // =========================
  // RAJASTHAN
  // =========================

  { id:'mukundra_hills', name:'Mukundra Hills National Park', region:'',
    fact:"A forested national park in the Mukundra and Darrah hills forming part of a major tiger landscape in southeastern Rajasthan - Kota – Jhalawar, Rajasthan.",
    states:['Rajasthan'],
    paths: siteBox(24.65, 75.85)
  },

  { id:'desert', name:'Desert National Park', region:'',
    fact:"A vast protected area in the Thar Desert and one of India's most important habitats for the critically endangered Great Indian Bustard - Jaisalmer – Barmer, Rajasthan.",
    states:['Rajasthan'],
    paths: siteBox(26.75, 70.55)
  },

  { id:'keoladeo', name:'Keoladeo (Bharatpur) National Park', region:'',
    fact:"A famous man-made wetland and Ramsar and UNESCO World Heritage Site, internationally important for migratory and resident waterbirds - Bharatpur, Rajasthan.",
    states:['Rajasthan'],
    paths: siteBox(27.16, 77.52)
  },

  { id:'ranthambore', name:'Ranthambore National Park', region:'',
    fact:"A famous tiger landscape at the meeting zone of the Aravalli and Vindhya ranges, known for its historic hilltop fort and visible tiger population - Sawai Madhopur, Rajasthan.",
    states:['Rajasthan'],
    paths: siteBox(26.02, 76.50)
  },

  { id:'sariska', name:'Sariska National Park', region:'',
    fact:"A tiger reserve in the Aravalli hills where tigers were locally extirpated but subsequently reintroduced, making it an important tiger conservation case study - Alwar, Rajasthan.",
    states:['Rajasthan'],
    paths: siteBox(27.33, 76.44)
  },


  // =========================
  // SIKKIM
  // =========================

  { id:'khangchendzonga', name:'Khangchendzonga National Park', region:'',
    fact:"A UNESCO Mixed World Heritage Site surrounding the Kanchenjunga landscape and protecting alpine and high-altitude ecosystems with snow leopard, red panda and many Himalayan species - Sikkim Himalaya.",
    states:['Sikkim'],
    paths: siteBox(27.67, 88.25)
  },


  // =========================
  // TAMIL NADU
  // =========================

  { id:'guindy', name:'Guindy National Park', region:'',
    fact:"One of India's smallest national parks, located within Chennai and protecting dry evergreen vegetation along with blackbuck, spotted deer and other urban wildlife - Chennai, Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(13.01, 80.23)
  },

  { id:'gulf_mannar', name:'Gulf of Mannar Marine National Park', region:'',
    fact:"A marine national park consisting of a chain of islands, coral reefs, seagrass beds and mangroves. The region is important for dugongs, sea turtles and other marine life - Gulf of Mannar, Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(9.15, 79.15)
  },

  { id:'indira_gandhi', name:'Indira Gandhi (Annamalai) National Park', region:'',
    fact:"Located in the Western Ghats and forming the core of the Anamalai Tiger Reserve, it supports lion-tailed macaques, Nilgiri tahr, elephants and diverse rainforest wildlife - Anaimalai Hills, Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(10.40, 76.95)
  },

  { id:'mudumalai', name:'Mudumalai National Park', region:'',
    fact:"A major wildlife landscape of the Nilgiri Biosphere Reserve, connected to Bandipur and Wayanad and known for elephants, tigers and rich dry and moist deciduous forests - Nilgiris, Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(11.57, 76.55)
  },

  { id:'mukurthi', name:'Mukurthi National Park', region:'',
    fact:"A high-altitude shola-grassland ecosystem in the Nilgiris and an important stronghold of the endangered Nilgiri tahr - Nilgiris, Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(11.45, 76.58)
  },


  // =========================
  // TELANGANA
  // =========================

  { id:'kbr', name:'Kasu Brahmananda Reddy National Park', region:'',
    fact:"An urban national park in the heart of Hyderabad, protecting dry deciduous vegetation and green space around the historic Chiran Palace area - Hyderabad, Telangana.",
    states:['Telangana'],
    paths: siteBox(17.42, 78.42)
  },

  { id:'mahavir_harina', name:'Mahavir Harina Vanasthali National Park', region:'',
    fact:"An urban protected area established on a former hunting ground and known particularly for blackbuck and other dryland wildlife - Hyderabad, Telangana.",
    states:['Telangana'],
    paths: siteBox(17.33, 78.62)
  },

  { id:'mrugavani', name:'Mrugavani National Park', region:'',
    fact:"A small dry-deciduous national park near Hyderabad, protecting urban-fringe forest habitat and wildlife including chital and smaller mammals - Hyderabad, Telangana.",
    states:['Telangana'],
    paths: siteBox(17.35, 78.28)
  },


  // =========================
  // TRIPURA
  // =========================

  { id:'bison_tripura', name:'Bison (Rajbari) National Park', region:'',
    fact:"A forested protected area in southern Tripura known for gaur or Indian bison, hoolock gibbons and other northeastern wildlife - Trishna, Tripura.",
    states:['Tripura'],
    paths: siteBox(23.28, 91.48)
  },

  { id:'clouded_leopard', name:'Clouded Leopard (Sipahijola) National Park', region:'',
    fact:"A small protected forest region known for the clouded leopard and other northeastern fauna including Phayre's langur - Sepahijala, Tripura.",
    states:['Tripura'],
    paths: siteBox(23.67, 91.35)
  },


  // =========================
  // UTTAR PRADESH
  // =========================

  { id:'dudhwa', name:'Dudhwa National Park', region:'',
    fact:"A major Terai ecosystem on the Indo-Nepal border, famous for swamp deer, tigers and successful reintroduction of the greater one-horned rhinoceros - Lakhimpur Kheri, Uttar Pradesh.",
    states:['Uttar Pradesh'],
    paths: siteBox(28.50, 80.65)
  },


  // =========================
  // UTTARAKHAND
  // =========================

  { id:'gangotri', name:'Gangotri National Park', region:'',
    fact:"A high-altitude Himalayan park surrounding the Gangotri region and glacier landscape, associated with the source region of the Bhagirathi River - Uttarkashi, Uttarakhand.",
    states:['Uttarakhand'],
    paths: siteBox(30.95, 79.10)
  },

  { id:'govind_pashu_vihar', name:'Govind Pashu Vihar National Park', region:'',
    fact:"A Himalayan protected area around the Tons and Yamuna headwaters, providing habitat for snow leopard, western tragopan and other high-altitude species - Uttarkashi, Uttarakhand.",
    states:['Uttarakhand'],
    paths: siteBox(31.10, 78.30)
  },

  { id:'corbett', name:'Jim Corbett National Park', region:'',
    fact:"India's oldest national park, established in 1936 as Hailey National Park, and the site where Project Tiger was launched in 1973 - Nainital – Pauri Garhwal, Uttarakhand.",
    states:['Uttarakhand'],
    paths: siteBox(29.53, 78.77)
  },

  { id:'nanda_devi', name:'Nanda Devi National Park', region:'',
    fact:"A UNESCO World Heritage Site surrounding the Nanda Devi massif and protecting high-altitude Himalayan ecosystems and species such as snow leopard and Himalayan musk deer - Chamoli, Uttarakhand.",
    states:['Uttarakhand'],
    paths: siteBox(30.62, 79.85)
  },

  { id:'rajaji', name:'Rajaji National Park', region:'',
    fact:"A major Shivalik forest landscape and elephant habitat around the Ganga and Song river systems, forming an important northern limit of Asian elephant distribution - Haridwar – Dehradun, Uttarakhand.",
    states:['Uttarakhand'],
    paths: siteBox(30.05, 78.15)
  },

  { id:'valley_flowers', name:'Valley of Flowers National Park', region:'',
    fact:"A UNESCO World Heritage Site famous for alpine meadows filled with endemic Himalayan flowers during the summer, including a spectacular seasonal floral display - Chamoli, Uttarakhand.",
    states:['Uttarakhand'],
    paths: siteBox(30.73, 79.60)
  },


  // =========================
  // WEST BENGAL
  // =========================

  { id:'buxa', name:'Buxa National Park', region:'',
    fact:"A major Dooars forest landscape along the Bhutan border and an important wildlife corridor connecting northeastern India with Bhutan - Alipurduar, West Bengal.",
    states:['West Bengal'],
    paths: siteBox(26.70, 89.58)
  },

  { id:'gorumara', name:'Gorumara National Park', region:'',
    fact:"A Dooars national park known for one-horned rhinoceros, gaur and riverine forests around the Murti and Raidak river systems - Jalpaiguri, West Bengal.",
    states:['West Bengal'],
    paths: siteBox(26.70, 88.80)
  },

  { id:'jaldapara', name:'Jaldapara National Park', region:'',
    fact:"A major Terai-Dooars grassland and forest ecosystem known for the greater one-horned rhinoceros, elephants and the Torsa River - Alipurduar, West Bengal.",
    states:['West Bengal'],
    paths: siteBox(26.70, 89.30)
  },

  { id:'neora_valley', name:'Neora Valley National Park', region:'',
    fact:"A pristine Eastern Himalayan forest landscape famous for red panda habitat and its position at the ecological meeting point of Bengal, Sikkim and Bhutan - Kalimpong, West Bengal.",
    states:['West Bengal'],
    paths: siteBox(27.08, 88.70)
  },

  { id:'singalila', name:'Singalila National Park', region:'',
    fact:"A high-altitude Himalayan park along the Singalila Ridge, famous for red pandas, Himalayan black bears and the Sandakphu trekking landscape - Darjeeling, West Bengal.",
    states:['West Bengal'],
    paths: siteBox(27.10, 88.00)
  },

  { id:'sundarbans', name:'Sundarbans National Park', region:'',
    fact:"The world's largest contiguous mangrove forest, part of the Ganges-Brahmaputra delta and famous for the Royal Bengal tiger adapted to a saline mangrove environment - South 24 Parganas, West Bengal.",
    states:['West Bengal'],
    paths: siteBox(21.95, 88.90)
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
