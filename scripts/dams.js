/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'Dams-navigator-india';
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

  { id:'bhakra', name:'Bhakra Dam', region:'',
    fact:"Bhakra Dam is built across the Sutlej River in Himachal Pradesh. It is one of India's most important multipurpose projects, providing irrigation and hydroelectric power to Punjab, Haryana, Rajasthan and Himachal Pradesh.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.41, 76.44, 0.12)
  },

  { id:'tehri', name:'Tehri Dam', region:'',
    fact:"Tehri Dam is built across the Bhagirathi River in Uttarakhand and is one of India's tallest dams. It provides hydropower, irrigation and drinking water, serving the wider Ganga basin.",
    states:['Uttarakhand'],
    paths: siteBox(30.38, 78.48, 0.12)
  },

  { id:'hirakud', name:'Hirakud Dam', region:'',
    fact:"Hirakud Dam is built across the Mahanadi River near Sambalpur in Odisha. It is one of India's earliest major multipurpose river-valley projects and provides irrigation, flood control and hydroelectric power.",
    states:['Odisha'],
    paths: siteBox(21.52, 83.87, 0.15)
  },

  { id:'sardar_sarovar', name:'Sardar Sarovar Dam', region:'',
    fact:"Sardar Sarovar Dam is built across the Narmada River in Gujarat. It is the largest multipurpose project of the Narmada Valley system and provides irrigation and water supply mainly to Gujarat, Rajasthan, Madhya Pradesh and Maharashtra.",
    states:['Gujarat'],
    paths: siteBox(21.83, 73.75, 0.13)
  },

  { id:'nagarjuna_sagar', name:'Nagarjuna Sagar Dam', region:'',
    fact:"Nagarjuna Sagar Dam is built across the Krishna River on the Telangana–Andhra Pradesh border. It is one of India's major masonry dams and provides irrigation and hydroelectric power to both states.",
    states:['Telangana'],
    paths: siteBox(16.57, 79.31, 0.15)
  },

  { id:'srisailam', name:'Srisailam Dam', region:'',
    fact:"Srisailam Dam is built across the Krishna River in the Nallamala hills. The reservoir and hydropower project serve both Telangana and Andhra Pradesh and form an important part of the Krishna river system.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.07, 78.87, 0.14)
  },

  { id:'tungabhadra', name:'Tungabhadra Dam', region:'',
    fact:"Tungabhadra Dam is built across the Tungabhadra River in Karnataka. It provides irrigation and hydropower to Karnataka and Andhra Pradesh and is an important tributary project of the Krishna basin.",
    states:['Karnataka'],
    paths: siteBox(15.27, 76.34, 0.14)
  },

  { id:'almatti', name:'Almatti Dam', region:'',
    fact:"Almatti Dam is built across the Krishna River in Karnataka and is a key component of the Upper Krishna Project. It supports irrigation and water management in northern Karnataka.",
    states:['Karnataka'],
    paths: siteBox(16.33, 75.89, 0.13)
  },

  { id:'krishnaraja_sagar', name:'Krishnaraja Sagar Dam', region:'',
    fact:"Krishnaraja Sagar Dam is built across the Cauvery River in Karnataka near Mysuru. It is a historic irrigation and water-supply project and serves the Cauvery basin of Karnataka.",
    states:['Karnataka'],
    paths: siteBox(12.42, 76.57, 0.12)
  },

  { id:'mettur', name:'Mettur Dam', region:'',
    fact:"Mettur Dam is built across the Cauvery River in Tamil Nadu. Its Stanley Reservoir is crucial for irrigation and water supply in the Cauvery delta and other parts of Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(11.80, 77.80, 0.13)
  },

  { id:'koyna', name:'Koyna Dam', region:'',
    fact:"Koyna Dam is built across the Koyna River in Maharashtra and forms the Koyna Hydroelectric Project. It is one of India's most important hydroelectric projects and is located in the Western Ghats.",
    states:['Maharashtra'],
    paths: siteBox(17.40, 73.75, 0.13)
  },

  { id:'ujjani', name:'Ujjani Dam', region:'',
    fact:"Ujjani Dam is built across the Bhima River in Maharashtra. It is an important irrigation and water-storage project serving the drought-prone regions of Solapur and surrounding areas.",
    states:['Maharashtra'],
    paths: siteBox(17.96, 75.10, 0.15)
  },

  { id:'jaikwadi', name:'Jayakwadi Dam', region:'',
    fact:"Jayakwadi Dam is built across the Godavari River in Maharashtra. Its huge reservoir, Nath Sagar, provides irrigation and water supply to large parts of Marathwada.",
    states:['Maharashtra'],
    paths: siteBox(19.48, 75.38, 0.14)
  },

  { id:'indira_sagar', name:'Indira Sagar Dam', region:'',
    fact:"Indira Sagar Dam is built across the Narmada River in Madhya Pradesh. It has one of the largest reservoirs in India and is a major multipurpose hydropower and irrigation project.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.29, 76.47, 0.14)
  },

  { id:'omkareshwar', name:'Omkareshwar Dam', region:'',
    fact:"Omkareshwar Dam is built across the Narmada River in Madhya Pradesh. It forms an important hydropower and irrigation project downstream of the Indira Sagar project.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.25, 76.15, 0.12)
  },

  { id:'bargi', name:'Bargi Dam', region:'',
    fact:"Bargi Dam, officially Rani Avanti Bai Sagar, is built across the Narmada River in Madhya Pradesh. It provides irrigation, water storage and hydropower in the Narmada basin.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.99, 79.92, 0.13)
  },

  { id:'gandhi_sagar', name:'Gandhi Sagar Dam', region:'',
    fact:"Gandhi Sagar Dam is built across the Chambal River in Madhya Pradesh. It is the first major dam of the Chambal Valley Project, followed downstream by Rana Pratap Sagar, Jawahar Sagar and Kota Barrage.",
    states:['Madhya Pradesh'],
    paths: siteBox(24.71, 75.55, 0.14)
  },

  { id:'rana_pratap_sagar', name:'Rana Pratap Sagar Dam', region:'',
    fact:"Rana Pratap Sagar Dam is built across the Chambal River in Rajasthan. It is the second major dam of the Chambal Valley Project after Gandhi Sagar.",
    states:['Rajasthan'],
    paths: siteBox(24.93, 75.64, 0.12)
  },

  { id:'jawahar_sagar', name:'Jawahar Sagar Dam', region:'',
    fact:"Jawahar Sagar Dam is built across the Chambal River in Rajasthan and forms the third major hydroelectric project of the Chambal Valley system after Gandhi Sagar and Rana Pratap Sagar.",
    states:['Rajasthan'],
    paths: siteBox(25.05, 75.75, 0.12)
  },

  { id:'bisalpur', name:'Bisalpur Dam', region:'',
    fact:"Bisalpur Dam is built across the Banas River in Rajasthan. It is an important drinking-water and irrigation project supplying water to Jaipur, Ajmer, Tonk and surrounding areas.",
    states:['Rajasthan'],
    paths: siteBox(25.95, 75.48, 0.13)
  },

  { id:'mahi_bajaj_sagar', name:'Mahi Bajaj Sagar Dam', region:'',
    fact:"Mahi Bajaj Sagar Dam is built across the Mahi River in Rajasthan near Banswara. It is a major multipurpose project providing irrigation and hydroelectric power in southern Rajasthan.",
    states:['Rajasthan'],
    paths: siteBox(23.55, 74.45, 0.14)
  },

  { id:'bansagar', name:'Bansagar Dam', region:'',
    fact:"Bansagar Dam is built across the Son River in Madhya Pradesh. It is a multipurpose project involving Madhya Pradesh, Uttar Pradesh and Bihar, mainly for irrigation and power generation.",
    states:['Madhya Pradesh'],
    paths: siteBox(24.18, 81.30, 0.15)
  },

  { id:'ramganga', name:'Ramganga Dam', region:'',
    fact:"Ramganga Dam is built across the Ramganga River in Uttarakhand and forms the Ramganga reservoir. It is part of the Ramganga multipurpose project and supports irrigation and hydropower.",
    states:['Uttarakhand'],
    paths: siteBox(29.55, 79.00, 0.13)
  },

  { id:'ranjit_sagar', name:'Ranjit Sagar Dam', region:'',
    fact:"Ranjit Sagar Dam, also known as Thein Dam, is built across the Ravi River on the Punjab–Jammu and Kashmir border. It provides hydroelectric power and irrigation benefits to Punjab and Jammu and Kashmir.",
    states:['Punjab'],
    paths: siteBox(32.45, 75.75, 0.13)
  },

  { id:'pong', name:'Pong Dam', region:'',
    fact:"Pong Dam, also called Beas Dam, is built across the Beas River in Himachal Pradesh. Its reservoir is important for irrigation and hydropower and forms part of the Beas Project.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.98, 76.10, 0.13)
  },

  { id:'pandoh', name:'Pandoh Dam', region:'',
    fact:"Pandoh Dam is built across the Beas River in Himachal Pradesh and diverts water toward the Dehar Power House as part of the Beas–Sutlej Link Project.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.72, 77.05, 0.12)
  },

  { id:'koldam', name:'Koldam Dam', region:'',
    fact:"Koldam Dam is built across the Sutlej River in Himachal Pradesh and forms an important hydroelectric project. It contributes power to the northern Indian grid.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.38, 76.95, 0.12)
  },

  { id:'ramganga', name:'Ramganga Dam', region:'',
    fact:"Ramganga Dam is an important multipurpose project on the Ramganga River in Uttarakhand, providing irrigation, hydropower and flood moderation benefits downstream.",
    states:['Uttarakhand'],
    paths: siteBox(29.55, 79.00, 0.13)
  },

  { id:'rengali', name:'Rengali Dam', region:'',
    fact:"Rengali Dam is built across the Brahmani River in Odisha. It is a multipurpose project providing flood control, irrigation and hydroelectric power in the Brahmani basin.",
    states:['Odisha'],
    paths: siteBox(21.42, 85.12, 0.14)
  },

  { id:'balimela', name:'Balimela Dam', region:'',
    fact:"Balimela Dam is built across the Sileru River in Odisha. It forms an important hydroelectric project in the Eastern Ghats and contributes to power generation in Odisha and Andhra Pradesh.",
    states:['Odisha'],
    paths: siteBox(18.13, 82.10, 0.13)
  },

  { id:'ukai', name:'Ukai Dam', region:'',
    fact:"Ukai Dam is built across the Tapi River in Gujarat. It is one of Gujarat's largest multipurpose projects, providing irrigation, flood control and hydroelectric power.",
    states:['Gujarat'],
    paths: siteBox(21.24, 73.58, 0.14)
  },

  { id:'kadana', name:'Kadana Dam', region:'',
    fact:"Kadana Dam is built across the Mahi River in Gujarat. It is an important multipurpose project providing irrigation and hydroelectric power in the Mahi basin.",
    states:['Gujarat'],
    paths: siteBox(23.02, 73.72, 0.13)
  },

  { id:'dharoi', name:'Dharoi Dam', region:'',
    fact:"Dharoi Dam is built across the Sabarmati River in Gujarat. It provides irrigation and water-supply benefits to northern Gujarat and contributes to management of the Sabarmati basin.",
    states:['Gujarat'],
    paths: siteBox(23.75, 72.88, 0.13)
  },

  { id:'mullaperiyar', name:'Mullaperiyar Dam', region:'',
    fact:"Mullaperiyar Dam is built across the Periyar River in Kerala. The reservoir water is diverted eastward to the Vaigai basin in Tamil Nadu, making it an important and politically significant inter-state water project.",
    states:['Kerala'],
    paths: siteBox(9.53, 77.15, 0.12)
  },

  { id:'idukki', name:'Idukki Dam', region:'',
    fact:"Idukki Dam is built across the Periyar River in Kerala and is one of India's major arch dams. It forms part of the Idukki Hydroelectric Project and is important for power generation in Kerala.",
    states:['Kerala'],
    paths: siteBox(9.85, 76.97, 0.12)
  },

  { id:'malampuzha', name:'Malampuzha Dam', region:'',
    fact:"Malampuzha Dam is built across the Malampuzha River in Kerala. It is an important irrigation and drinking-water project serving the Palakkad region.",
    states:['Kerala'],
    paths: siteBox(10.82, 76.69, 0.12)
  },

  { id:'krishna_raja_sagar', name:'Krishna Raja Sagara Dam', region:'',
    fact:"Krishna Raja Sagara Dam is built across the Cauvery River in Karnataka and is associated with the historic irrigation development of the Cauvery basin. Tamil Nadu is the major downstream state benefiting from the river.",
    states:['Karnataka'],
    paths: siteBox(12.42, 76.57, 0.12)
  },

  { id:'harangi', name:'Harangi Dam', region:'',
    fact:"Harangi Dam is built across the Harangi River, a tributary of the Cauvery, in Karnataka. It is an important irrigation reservoir serving the Cauvery basin.",
    states:['Karnataka'],
    paths: siteBox(12.55, 75.95, 0.12)
  },

  { id:'kabini', name:'Kabini Dam', region:'',
    fact:"Kabini Dam is built across the Kabini River in Karnataka. The reservoir is important for irrigation and is also closely associated with the wildlife-rich forests of the Nagarhole–Wayanad landscape.",
    states:['Karnataka'],
    paths: siteBox(11.95, 76.35, 0.13)
  },

  { id:'hemavathy', name:'Hemavathy Dam', region:'',
    fact:"Hemavathy Dam, also called Gorur Dam, is built across the Hemavathy River in Karnataka. It is an important irrigation project in the Cauvery basin.",
    states:['Karnataka'],
    paths: siteBox(12.82, 76.15, 0.12)
  },

  { id:'krishnagiri', name:'Krishnagiri Dam', region:'',
    fact:"Krishnagiri Dam is built across the Thenpennai River in Tamil Nadu. It is an important irrigation project serving the agricultural areas of northern Tamil Nadu.",
    states:['Tamil Nadu'],
    paths: siteBox(12.48, 78.21, 0.12)
  },

  { id:'bhavanisagar', name:'Bhavanisagar Dam', region:'',
    fact:"Bhavanisagar Dam is built across the Bhavani River in Tamil Nadu. It is one of the important irrigation reservoirs of the state and supports agriculture in the western Cauvery basin.",
    states:['Tamil Nadu'],
    paths: siteBox(11.48, 77.13, 0.14)
  },

  { id:'vaigai', name:'Vaigai Dam', region:'',
    fact:"Vaigai Dam is built across the Vaigai River in Tamil Nadu. It provides irrigation and drinking water to the southern districts of the state and is linked to the wider Vaigai basin.",
    states:['Tamil Nadu'],
    paths: siteBox(10.00, 77.60, 0.13)
  },

  { id:'nizam_sagar', name:'Nizam Sagar Dam', region:'',
    fact:"Nizam Sagar Dam is built across the Manjira River in Telangana. It is an important irrigation and water-supply project and a tributary project within the Godavari basin.",
    states:['Telangana'],
    paths: siteBox(18.10, 78.10, 0.13)
  },

  { id:'sriram_sagar', name:'Sri Ram Sagar Dam', region:'',
    fact:"Sri Ram Sagar Project is built across the Godavari River in Telangana. It is one of the state's major irrigation projects and supplies water to large agricultural areas.",
    states:['Telangana'],
    paths: siteBox(18.95, 78.35, 0.14)
  },

  { id:'somasila', name:'Somasila Dam', region:'',
    fact:"Somasila Dam is built across the Pennar River in Andhra Pradesh. It is an important irrigation reservoir serving the Pennar basin and agricultural areas of southern Andhra Pradesh.",
    states:['Andhra Pradesh'],
    paths: siteBox(14.45, 79.00, 0.13)
  },

  { id:'pulichintala', name:'Pulichintala Dam', region:'',
    fact:"Pulichintala Dam is built across the Krishna River in Andhra Pradesh. It is an important balancing reservoir for the Krishna irrigation system and supports irrigation and water regulation downstream.",
    states:['Andhra Pradesh'],
    paths: siteBox(16.75, 80.08, 0.13)
  },

  { id:'polavaram', name:'Polavaram Dam', region:'',
    fact:"Polavaram Project is being constructed across the Godavari River in Andhra Pradesh. It is a major multipurpose inter-state project involving irrigation, hydropower and water transfer, with benefits extending to Andhra Pradesh and the wider Godavari–Krishna system.",
    states:['Andhra Pradesh'],
    paths: siteBox(17.25, 81.64, 0.14)
  },

  { id:'maithon', name:'Maithon Dam', region:'',
    fact:"Maithon Dam is built across the Barakar River on the Jharkhand–West Bengal border. It is part of the Damodar Valley Corporation system and provides flood control, irrigation and hydropower.",
    states:['Jharkhand'],
    paths: siteBox(23.78, 86.78, 0.13)
  },

  { id:'panchet', name:'Panchet Dam', region:'',
    fact:"Panchet Dam is built across the Damodar River on the Jharkhand–West Bengal border. It is one of the major multipurpose projects of the Damodar Valley Corporation.",
    states:['Jharkhand'],
    paths: siteBox(23.65, 86.73, 0.13)
  },

  { id:'tilaiya', name:'Tilaiya Dam', region:'',
    fact:"Tilaiya Dam is built across the Barakar River in Jharkhand and was the first dam constructed by the Damodar Valley Corporation. It contributes to flood control and hydropower generation.",
    states:['Jharkhand'],
    paths: siteBox(24.38, 85.53, 0.12)
  },

  { id:'konar', name:'Konar Dam', region:'',
    fact:"Konar Dam is built across the Konar River in Jharkhand and is part of the Damodar Valley Corporation system. It contributes to irrigation, water storage and industrial water supply.",
    states:['Jharkhand'],
    paths: siteBox(23.80, 85.65, 0.12)
  },

  { id:'tenughat', name:'Tenughat Dam', region:'',
    fact:"Tenughat Dam is built across the Damodar River in Jharkhand. It is an important water-storage project serving industrial and domestic water requirements in the Damodar valley.",
    states:['Jharkhand'],
    paths: siteBox(23.70, 85.80, 0.12)
  },

  { id:'gobind_sagar', name:'Gobind Sagar Dam', region:'',
    fact:"Gobind Sagar is the reservoir created by Bhakra Dam on the Sutlej River in Himachal Pradesh. It is important for irrigation, hydropower and water regulation across the Sutlej system.",
    states:['Himachal Pradesh'],
    paths: siteBox(31.41, 76.44, 0.15)
  },

  { id:'salal', name:'Salal Dam', region:'',
    fact:"Salal Dam is built across the Chenab River in Jammu and Kashmir. It is an important hydroelectric project on the Chenab and forms part of the Indus river system.",
    states:['Jammu & Kashmir'],
    paths: siteBox(33.15, 74.83, 0.13)
  },

  { id:'dulhasti', name:'Dulhasti Dam', region:'',
    fact:"Dulhasti Hydroelectric Project is located on the Chenab River in Jammu and Kashmir. It is an important run-of-river hydropower project in the upper Chenab basin.",
    states:['Jammu & Kashmir'],
    paths: siteBox(33.58, 76.00, 0.13)
  },

  { id:'baglihar', name:'Baglihar Dam', region:'',
    fact:"Baglihar Dam is built across the Chenab River in Jammu and Kashmir. It is a major hydropower project and is significant in the context of the Indus Waters Treaty.",
    states:['Jammu & Kashmir'],
    paths: siteBox(33.15, 75.32, 0.13)
  },

  { id:'kishanganga', name:'Kishanganga Dam', region:'',
    fact:"Kishanganga Hydroelectric Project is built on the Kishanganga River, known as the Neelum River downstream, in Jammu and Kashmir. It is a major hydropower project within the Jhelum basin.",
    states:['Jammu & Kashmir'],
    paths: siteBox(34.60, 74.70, 0.13)
  },

  { id:'uri', name:'Uri Dam', region:'',
    fact:"Uri Hydroelectric Project is located on the Jhelum River in Jammu and Kashmir. It is an important hydropower project in the Jhelum basin close to the Line of Control.",
    states:['Jammu & Kashmir'],
    paths: siteBox(34.10, 74.05, 0.13)
  },

  { id:'kota_barrage', name:'Kota Barrage', region:'',
    fact:"Kota Barrage is built across the Chambal River in Rajasthan and is the downstream irrigation structure of the Chambal Valley Project. It distributes Chambal water into irrigation canals in Rajasthan and Madhya Pradesh.",
    states:['Rajasthan'],
    paths: siteBox(25.18, 75.85, 0.12)
  },

  { id:'tawa', name:'Tawa Dam', region:'',
    fact:"Tawa Dam is built across the Tawa River in Madhya Pradesh. It is an important irrigation and water-storage project and its reservoir is one of the major water bodies of the Narmada basin.",
    states:['Madhya Pradesh'],
    paths: siteBox(22.62, 77.90, 0.14)
  },

  { id:'rajghat', name:'Rajghat Dam', region:'',
    fact:"Rajghat Dam is built across the Betwa River on the Madhya Pradesh–Uttar Pradesh border. It is an important multipurpose project of the Betwa basin.",
    states:['Madhya Pradesh'],
    paths: siteBox(24.63, 78.93, 0.13)
  },

  { id:'matatila', name:'Matatila Dam', region:'',
    fact:"Matatila Dam is built across the Betwa River on the Madhya Pradesh–Uttar Pradesh border. It provides irrigation, hydropower and water storage for the Bundelkhand region.",
    states:['Uttar Pradesh'],
    paths: siteBox(25.18, 78.53, 0.13)
  },

  { id:'ramganga_project', name:'Ramganga Dam', region:'',
    fact:"Ramganga Dam is located in Uttarakhand on the Ramganga River. The multipurpose project provides irrigation and hydropower benefits to Uttarakhand and downstream Uttar Pradesh.",
    states:['Uttarakhand'],
    paths: siteBox(29.55, 79.00, 0.13)
  },

  { id:'teesta_v', name:'Teesta-V Dam', region:'',
    fact:"Teesta-V Hydroelectric Project is located on the Teesta River in Sikkim. It is an important hydropower project in the Teesta basin, with the river continuing downstream into West Bengal and Bangladesh.",
    states:['Sikkim'],
    paths: siteBox(27.35, 88.57, 0.13)
  },

  { id:'rangit', name:'Rangit Dam', region:'',
    fact:"Rangit Dam is built across the Great Rangit River in Sikkim. It is a major hydropower project and the river is an important tributary of the Teesta.",
    states:['Sikkim'],
    paths: siteBox(27.25, 88.34, 0.12)
  },

  { id:'doyang', name:'Doyang Dam', region:'',
    fact:"Doyang Dam is built across the Doyang River in Nagaland. It is an important hydroelectric project and one of the major water-storage structures in northeastern India.",
    states:['Nagaland'],
    paths: siteBox(26.25, 94.45, 0.13)
  },

  { id:'khuga', name:'Khuga Dam', region:'',
    fact:"Khuga Dam is built across the Khuga River in Manipur. It is an important multipurpose irrigation and water-supply project serving the surrounding agricultural areas.",
    states:['Manipur'],
    paths: siteBox(24.50, 93.78, 0.13)
  },

  { id:'tippi', name:'Ranganadi Dam', region:'',
    fact:"Ranganadi Hydroelectric Project is built on the Ranganadi River in Arunachal Pradesh. It is an important hydropower project in the eastern Himalayan river system.",
    states:['Arunachal Pradesh'],
    paths: siteBox(27.25, 93.95, 0.13)
  },

  { id:'dams_of_damodar', name:'Durgapur Barrage', region:'',
    fact:"Durgapur Barrage is built across the Damodar River in West Bengal and forms part of the Damodar Valley irrigation system. It distributes water to the extensive canal network of southern West Bengal.",
    states:['West Bengal'],
    paths: siteBox(23.48, 87.31, 0.12)
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
