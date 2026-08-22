/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'river-navigator-india';
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
   INDIA RIVERS DATA
   Each entry is a named river with an approximate course (an array
   of [lat,lng] points, roughly following its real path) and the
   states it flows through. On each round, the target river is drawn
   alongside 3 randomly-picked decoy rivers from the rest of the list
   — so with 6 rivers total, every round now shows 4 candidate lines
   on the map. To add more rivers later, just push a new object into
   ROUNDS with its own path/states/fact — no manual decoy wiring
   needed, decoys are chosen automatically at random each round.
   ============================================================ */
const ROUNDS = [

  { id:'ganga', name:'Ganga', region:'',
    fact:"India's most sacred river, rising at Gangotri in the Himalayas and flowing across the Gangetic Plain before meeting the Bay of Bengal through the Sundarbans delta — the largest river basin in the country.",
    states:['Uttarakhand','Uttar Pradesh','Bihar','Jharkhand','West Bengal'],
    path:[
      [30.99,78.93],[29.95,78.16],[28.65,79.30],[27.15,79.95],[26.45,80.35],
      [25.90,81.25],[25.43,81.85],[25.32,83.00],[25.61,85.14],[25.24,86.97],
      [24.80,87.93],[24.10,88.27],[23.20,88.42],[22.57,88.36],[21.70,88.10]
    ]
  },

  { id:'yamuna', name:'Yamuna', region:'',
    fact:"The largest tributary of the Ganga, rising at Yamunotri glacier and flowing past Delhi, Mathura and Agra before merging with the Ganga at the Triveni Sangam in Prayagraj.",
    states:['Uttarakhand','Himachal Pradesh','Haryana','Delhi','Uttar Pradesh'],
    path:[
      [31.02,78.45],[30.55,77.90],[30.13,77.65],[29.45,77.60],[28.95,77.45],
      [28.60,77.23],[27.90,77.55],[27.49,77.67],[27.18,78.02],[26.75,79.15],
      [26.45,79.90],[25.90,80.90],[25.43,81.85]
    ]
  },

  { id:'brahmaputra', name:'Brahmaputra', region:'',
    fact:"One of Asia's great rivers, entering India from Tibet through Arunachal Pradesh and flowing the length of the Assam valley before crossing into Bangladesh — known for its immense width and seasonal flooding.",
    states:['Arunachal Pradesh','Assam'],
    path:[
      [28.70,96.90],[28.15,95.85],[27.48,95.02],[27.05,94.55],[26.75,94.20],
      [26.60,93.40],[26.20,91.75],[26.05,90.70],[25.95,90.10],[25.90,89.85]
    ]
  },

  { id:'godavari', name:'Godavari', region:'',
    fact:"The longest river in peninsular India, sometimes called the 'Dakshin Ganga'. It rises at Trimbakeshwar near Nashik and flows southeast across the Deccan Plateau to the Bay of Bengal near Rajahmundry.",
    states:['Maharashtra','Telangana','Andhra Pradesh'],
    path:[
      [19.93,73.53],[19.70,74.60],[19.50,75.55],[19.10,77.20],[18.90,79.00],
      [18.60,80.05],[18.05,80.75],[17.60,81.20],[17.25,81.78],[16.95,82.25]
    ]
  },

  { id:'krishna', name:'Krishna', region:'',
    fact:"India's fourth-longest river, rising near Mahabaleshwar in Maharashtra and cutting east across the Deccan Plateau through Karnataka, Telangana and Andhra Pradesh before reaching the Bay of Bengal.",
    states:['Maharashtra','Karnataka','Telangana','Andhra Pradesh'],
    path:[
      [17.92,73.66],[17.35,74.15],[16.85,74.57],[16.60,75.60],[16.50,76.60],
      [16.30,77.50],[16.15,78.50],[16.20,79.50],[16.35,80.30],[16.05,80.90],[15.95,81.10]
    ]
  },

  { id:'narmada', name:'Narmada', region:'',
    fact:"The largest west-flowing river of peninsular India, rising at Amarkantak and running through a rift valley between the Vindhya and Satpura ranges before emptying into the Arabian Sea near Bharuch.",
    states:['Madhya Pradesh','Maharashtra','Gujarat'],
    path:[
      [22.72,81.75],[22.85,80.50],[22.90,79.50],[22.70,78.50],[22.35,77.50],
      [22.15,76.30],[22.00,75.30],[21.90,74.20],[21.85,73.50],[21.70,72.97],[21.60,72.60]
    ]
  },
  { id:'ramganga', name:'Ramganga', region:'',
  fact:"An important tributary of the Ganga, originating in the Kumaon Himalayas of Uttarakhand and flowing through Uttar Pradesh before joining the Ganga near Kannauj.",
  states:['Uttarakhand','Uttar Pradesh'],
  path:[
    [30.15,79.20],[29.80,79.05],[29.30,79.00],[28.80,79.20],[28.20,79.55],
    [27.75,79.90],[27.35,80.20],[27.05,80.55],[26.78,80.85]
  ]
},

{ id:'gomti', name:'Gomti', region:'',
  fact:"A major tributary of the Ganga, rising near Pilibhit in Uttar Pradesh and flowing through Lucknow before joining the Ganga near Ghazipur.",
  states:['Uttar Pradesh'],
  path:[
    [28.60,80.05],[28.15,80.45],[27.80,80.85],[27.45,81.10],[26.95,80.95],
    [26.85,80.95],[26.50,81.30],[26.15,82.15],[25.95,83.35]
  ]
},

{ id:'chambal', name:'Chambal', region:'',
  fact:"A major right-bank tributary of the Yamuna, originating in the Vindhya Range near Mhow and famous for its deep ravines.",
  states:['Madhya Pradesh','Rajasthan','Uttar Pradesh'],
  path:[
    [22.60,75.75],[23.15,75.95],[24.10,76.25],[24.95,76.95],[25.45,77.55],
    [25.95,78.30],[26.35,79.10],[26.75,79.35]
  ]
},

{ id:'betwa', name:'Betwa', region:'',
  fact:"A major tributary of the Yamuna, rising in the Vindhya Range near Bhopal and flowing through Madhya Pradesh and Uttar Pradesh.",
  states:['Madhya Pradesh','Uttar Pradesh'],
  path:[
    [23.25,77.45],[23.90,78.10],[24.55,78.55],[25.20,78.90],[25.75,79.25],
    [26.15,79.60],[26.45,79.90]
  ]
},

{ id:'ken', name:'Ken', region:'',
  fact:"A tributary of the Yamuna, originating in Madhya Pradesh and flowing through the Panna Tiger Reserve before entering Uttar Pradesh.",
  states:['Madhya Pradesh','Uttar Pradesh'],
  path:[
    [23.45,80.10],[24.10,80.00],[24.75,79.80],[25.15,79.60],[25.55,79.45],
    [25.95,79.75]
  ]
},

{ id:'tons', name:'Tons (Tamsa)', region:'',
  fact:"An important tributary of the Ganga, rising in the Kaimur Hills and flowing through Madhya Pradesh and Uttar Pradesh.",
  states:['Madhya Pradesh','Uttar Pradesh'],
  path:[
    [24.35,81.20],[24.60,81.55],[24.90,82.10],[25.15,82.55],[25.40,82.95]
  ]
},

{ id:'punpun', name:'Punpun', region:'',
  fact:"A tributary of the Ganga, originating in the Chota Nagpur Plateau and flowing through Jharkhand and Bihar.",
  states:['Jharkhand','Bihar'],
  path:[
    [24.05,84.35],[24.35,84.70],[24.70,85.10],[25.05,85.30],[25.45,85.25]
  ]
},

{ id:'burhi-gandak', name:'Burhi Gandak', region:'',
  fact:"A significant tributary of the Ganga flowing entirely through Bihar after originating in the Someshwar Hills near the Nepal border.",
  states:['Bihar'],
  path:[
    [27.05,84.95],[26.55,85.15],[26.10,85.35],[25.70,85.55],[25.25,85.75]
  ]
},

{ id:'damodar', name:'Damodar', region:'',
  fact:"Known as the 'Sorrow of Bengal' before the construction of dams, it rises in Jharkhand and joins the Hooghly River in West Bengal.",
  states:['Jharkhand','West Bengal'],
  path:[
    [23.75,84.70],[23.60,85.30],[23.55,86.00],[23.45,86.70],[23.25,87.30],
    [22.95,88.05]
  ]
},

{ id:'bagmati', name:'Bagmati', region:'',
  fact:"A Himalayan river originating in Nepal and flowing into Bihar, where it is an important tributary of the Kosi system.",
  states:['Bihar'],
  path:[
    [27.75,85.45],[27.10,85.25],[26.60,85.55],[26.15,85.80],[25.70,86.05]
  ]
},

{ id:'kamla-balan', name:'Kamla Balan', region:'',
  fact:"An important river of north Bihar originating in Nepal and joining the Kosi basin after flowing through the Mithila region.",
  states:['Bihar'],
  path:[
    [27.55,86.00],[27.00,86.05],[26.50,86.15],[26.05,86.30],[25.65,86.55]
  ]
},

{ id:'falgu', name:'Falgu', region:'',
  fact:"A sacred river formed by the confluence of the Lilajan and Mohana rivers at Bodh Gaya, associated with Hindu and Buddhist traditions.",
  states:['Jharkhand','Bihar'],
  path:[
    [24.40,84.75],[24.60,84.95],[24.80,85.15],[24.98,85.00],[25.10,85.25]
  ]
},

{ id:'kiul', name:'Kiul', region:'',
  fact:"A tributary of the Ganga originating in the Chota Nagpur Plateau and flowing through south Bihar.",
  states:['Jharkhand','Bihar'],
  path:[
    [24.15,85.70],[24.45,86.05],[24.75,86.30],[25.05,86.20],[25.35,86.15]
  ]
},

{ id:'karmanasa', name:'Karmanasa', region:'',
  fact:"A tributary of the Ganga rising in the Kaimur Hills and forming part of the boundary between Uttar Pradesh and Bihar.",
  states:['Uttar Pradesh','Bihar'],
  path:[
    [24.95,83.15],[25.20,83.35],[25.45,83.65],[25.65,83.95],[25.82,84.25]
  ]
},

{ id:'mahananda', name:'Mahananda', region:'',
  fact:"A transboundary river originating in the Darjeeling Hills and flowing through Bihar and West Bengal before joining the Ganga in Bangladesh.",
  states:['West Bengal','Bihar'],
  path:[
    [26.95,88.25],[26.45,88.20],[25.95,87.95],[25.55,87.65],[25.20,87.35]
  ]
},
  { id:'shyok', name:'Shyok', region:'',
  fact:"A major tributary of the Indus, originating from the Rimo Glacier in the Karakoram Range and flowing through Ladakh before joining the Indus in Baltistan.",
  states:['Ladakh'],
  path:[
    [35.25,77.90],[35.05,77.55],[34.90,77.20],[34.70,76.90],[34.45,76.60],
    [34.25,76.25],[34.10,76.00]
  ]
},

{ id:'zanskar', name:'Zanskar', region:'',
  fact:"One of the principal tributaries of the Indus, rising in the Zanskar Range and flowing through deep Himalayan gorges before joining the Indus near Nimmu.",
  states:['Ladakh'],
  path:[
    [33.85,76.95],[33.95,76.70],[34.05,76.45],[34.12,76.25],[34.17,76.05],
    [34.20,75.95]
  ]
},

{ id:'kishanganga', name:'Kishanganga', region:'',
  fact:"Known as the Neelum River in Pakistan, it originates near Sonamarg in Jammu and Kashmir and flows northwest before joining the Jhelum.",
  states:['Jammu and Kashmir'],
  path:[
    [34.45,75.10],[34.55,74.80],[34.60,74.45],[34.55,74.10],[34.45,73.85]
  ]
},

{ id:'chandra', name:'Chandra', region:'',
  fact:"A headstream of the Chenab, originating from the Chandra Glacier near Baralacha La and flowing through the Lahaul Valley.",
  states:['Himachal Pradesh'],
  path:[
    [32.72,77.55],[32.55,77.25],[32.40,76.95],[32.28,76.70],[32.18,76.50]
  ]
},

{ id:'bhaga', name:'Bhaga', region:'',
  fact:"A headstream of the Chenab, rising near Suraj Tal below Baralacha La and joining the Chandra River at Tandi to form the Chenab.",
  states:['Himachal Pradesh'],
  path:[
    [32.82,77.38],[32.65,77.10],[32.48,76.90],[32.32,76.70],[32.18,76.50]
  ]
},

{ id:'spiti', name:'Spiti', region:'',
  fact:"An important tributary of the Sutlej, originating from the Kunzum Range and flowing through the cold desert of Spiti Valley.",
  states:['Himachal Pradesh'],
  path:[
    [32.35,78.10],[32.15,78.00],[31.95,77.90],[31.75,77.75],[31.58,77.60]
  ]
},

{ id:'baspa', name:'Baspa', region:'',
  fact:"A Himalayan tributary of the Sutlej, originating near the Indo-Tibetan border and flowing through the scenic Sangla Valley.",
  states:['Himachal Pradesh'],
  path:[
    [31.45,78.55],[31.35,78.25],[31.28,78.00],[31.22,77.80],[31.18,77.62]
  ]
},

{ id:'ubin', name:'Ujh', region:'',
  fact:"A tributary of the Ravi, originating in the Shivalik Hills of Jammu and Kashmir and flowing southwest into Punjab before joining the Ravi.",
  states:['Jammu and Kashmir','Punjab'],
  path:[
    [32.75,75.45],[32.55,75.20],[32.30,75.05],[32.00,74.95],[31.75,74.88]
  ]
},
  { id:'lohit', name:'Lohit', region:'',
  fact:"A major eastern tributary of the Brahmaputra, originating in eastern Tibet and entering India through Arunachal Pradesh before joining the Brahmaputra in Assam.",
  states:['Arunachal Pradesh','Assam'],
  path:[
    [28.20,97.75],[28.00,97.35],[27.82,96.95],[27.65,96.55],[27.45,96.15],
    [27.28,95.80],[27.12,95.45]
  ]
},

{ id:'dibang', name:'Dibang', region:'',
  fact:"A major left-bank tributary of the Brahmaputra, originating in the Mishmi Hills of Arunachal Pradesh and joining the Lohit before forming the Brahmaputra.",
  states:['Arunachal Pradesh','Assam'],
  path:[
    [29.10,95.95],[28.75,95.70],[28.35,95.55],[27.95,95.45],[27.60,95.35],
    [27.30,95.28]
  ]
},

{ id:'manas', name:'Manas', region:'',
  fact:"A transboundary Himalayan river originating in Bhutan and flowing through the Manas National Park before joining the Brahmaputra in Assam.",
  states:['Assam'],
  path:[
    [27.25,91.10],[26.95,91.00],[26.75,90.92],[26.55,90.88],[26.35,90.82],
    [26.15,90.75]
  ]
},

{ id:'dhansiri', name:'Dhansiri', region:'',
  fact:"An important south-bank tributary of the Brahmaputra, rising in the Laisang Peak region of Nagaland and flowing through Assam.",
  states:['Nagaland','Assam'],
  path:[
    [26.45,94.55],[26.20,94.35],[26.00,94.15],[25.85,93.98],[25.72,93.82],
    [25.62,93.65]
  ]
},

{ id:'jia-bharali', name:'Jia Bharali', region:'',
  fact:"Also known as the Kameng River in Arunachal Pradesh, it originates in the Eastern Himalayas and joins the Brahmaputra near Tezpur.",
  states:['Arunachal Pradesh','Assam'],
  path:[
    [27.85,92.65],[27.55,92.45],[27.20,92.25],[26.95,92.05],[26.75,91.90],
    [26.55,91.82]
  ]
},

{ id:'sankosh', name:'Sankosh', region:'',
  fact:"A transboundary river originating in Bhutan and flowing along the Assam–West Bengal border before joining the Brahmaputra system in Bangladesh.",
  states:['Assam','West Bengal'],
  path:[
    [27.10,89.95],[26.80,89.85],[26.50,89.75],[26.20,89.65],[25.95,89.55]
  ]
},

{ id:'torsa', name:'Torsa', region:'',
  fact:"A Himalayan river rising in Tibet, flowing through Bhutan and northern West Bengal before entering Bangladesh as a tributary of the Brahmaputra system.",
  states:['West Bengal'],
  path:[
    [27.75,89.15],[27.35,89.05],[26.95,89.00],[26.60,89.05],[26.20,89.15]
  ]
},

{ id:'raidak', name:'Raidak', region:'',
  fact:"A transboundary river originating in Bhutan and flowing through the Dooars region of West Bengal before entering Bangladesh.",
  states:['West Bengal'],
  path:[
    [27.45,89.65],[27.10,89.70],[26.75,89.78],[26.40,89.85],[26.10,89.92]
  ]
},
  { id:'pranahita', name:'Pranahita', region:'',
  fact:"The largest tributary of the Godavari, formed by the confluence of the Wardha and Wainganga rivers and flowing along the Maharashtra–Telangana border.",
  states:['Maharashtra','Telangana'],
  path:[
    [19.85,79.85],[19.55,79.95],[19.20,80.05],[18.90,80.10],[18.60,80.15],
    [18.35,80.20],[18.10,80.30]
  ]
},

{ id:'manjira', name:'Manjira', region:'',
  fact:"An important right-bank tributary of the Godavari, originating in the Balaghat Range of Maharashtra and flowing through Karnataka and Telangana.",
  states:['Maharashtra','Karnataka','Telangana'],
  path:[
    [18.75,75.85],[18.35,76.40],[18.00,77.00],[17.75,77.50],[17.55,78.10],
    [17.35,78.45],[17.15,78.90]
  ]
},

{ id:'wardha', name:'Wardha', region:'',
  fact:"A major tributary of the Godavari, rising in the Satpura Range of Madhya Pradesh and flowing through Maharashtra before joining the Wainganga to form the Pranahita.",
  states:['Madhya Pradesh','Maharashtra'],
  path:[
    [21.55,78.45],[21.10,78.80],[20.70,79.05],[20.20,79.25],[19.75,79.40],
    [19.30,79.60],[18.95,79.80]
  ]
},

{ id:'wainganga', name:'Wainganga', region:'',
  fact:"One of the principal tributaries of the Godavari, originating in the Mahadeo Hills of Madhya Pradesh and flowing through Maharashtra.",
  states:['Madhya Pradesh','Maharashtra'],
  path:[
    [22.55,79.70],[22.05,79.95],[21.50,80.05],[20.95,80.00],[20.35,79.95],
    [19.75,79.90],[18.95,79.80]
  ]
},

{ id:'penganga', name:'Penganga', region:'',
  fact:"A significant tributary of the Wardha River, originating in the Ajanta Range and forming part of the boundary between Maharashtra and Telangana.",
  states:['Maharashtra','Telangana'],
  path:[
    [20.10,77.35],[19.85,77.80],[19.60,78.20],[19.35,78.60],[19.15,79.00],
    [18.98,79.35]
  ]
},

{ id:'indravati', name:'Indravati', region:'',
  fact:"The largest left-bank tributary of the Godavari, rising in the Eastern Ghats of Odisha and flowing through Chhattisgarh before joining the Godavari in Telangana.",
  states:['Odisha','Chhattisgarh','Telangana'],
  path:[
    [19.15,82.45],[19.00,81.85],[18.90,81.20],[18.75,80.70],[18.55,80.25],
    [18.35,80.00],[18.15,80.05]
  ]
},

{ id:'sabari', name:'Sabari', region:'',
  fact:"A major tributary of the Godavari, originating in the Eastern Ghats of Odisha and flowing through Chhattisgarh and Andhra Pradesh.",
  states:['Odisha','Chhattisgarh','Andhra Pradesh'],
  path:[
    [18.95,82.75],[18.70,82.30],[18.45,81.90],[18.15,81.55],[17.90,81.25],
    [17.65,81.05]
  ]
},

{ id:'purna', name:'Purna', region:'',
  fact:"An important tributary of the Godavari, rising in the Ajanta Hills of Maharashtra and joining the Godavari near Nanded.",
  states:['Maharashtra'],
  path:[
    [20.70,76.95],[20.40,77.20],[20.05,77.55],[19.75,77.90],[19.45,78.15],
    [19.20,78.40]
  ]
},
  { id:'bhima', name:'Bhima', region:'',
  fact:"The largest tributary of the Krishna, originating in the Bhimashankar Hills of Maharashtra and flowing through Karnataka before joining the Krishna in Telangana.",
  states:['Maharashtra','Karnataka','Telangana'],
  path:[
    [19.07,73.55],[18.65,74.10],[18.25,74.80],[17.90,75.45],[17.55,76.10],
    [17.20,76.70],[16.90,77.25],[16.55,77.85]
  ]
},

{ id:'tungabhadra', name:'Tungabhadra', region:'',
  fact:"A major tributary of the Krishna formed by the confluence of the Tunga and Bhadra rivers at Kudli, flowing east through Karnataka and Andhra Pradesh.",
  states:['Karnataka','Andhra Pradesh','Telangana'],
  path:[
    [13.82,75.55],[14.20,75.90],[14.55,76.35],[15.00,76.80],[15.35,77.20],
    [15.70,77.70],[15.95,78.20],[16.20,78.75],[16.35,79.25]
  ]
},

{ id:'koyna', name:'Koyna', region:'',
  fact:"An important tributary of the Krishna, originating in the Western Ghats and renowned for the Koyna Dam and hydroelectric project.",
  states:['Maharashtra'],
  path:[
    [17.40,73.80],[17.25,73.95],[17.10,74.15],[16.95,74.35],[16.85,74.55],
    [16.75,74.80]
  ]
},

{ id:'ghataprabha', name:'Ghataprabha', region:'',
  fact:"A northern tributary of the Krishna, rising in the Western Ghats near Amboli and flowing east across Karnataka.",
  states:['Maharashtra','Karnataka'],
  path:[
    [15.95,74.05],[15.85,74.45],[15.82,74.90],[15.82,75.45],[15.90,76.05],
    [16.00,76.75],[16.10,77.20]
  ]
},

{ id:'malaprabha', name:'Malaprabha', region:'',
  fact:"A major tributary of the Krishna originating in the Western Ghats near Kankumbi and flowing through northern Karnataka.",
  states:['Karnataka'],
  path:[
    [15.72,74.30],[15.68,74.75],[15.72,75.20],[15.80,75.75],[15.92,76.25],
    [16.02,76.85],[16.10,77.20]
  ]
},

{ id:'musi', name:'Musi', region:'',
  fact:"An important tributary of the Krishna, originating in the Ananthagiri Hills and flowing through Hyderabad before joining the Krishna.",
  states:['Telangana'],
  path:[
    [17.32,77.85],[17.38,78.05],[17.40,78.30],[17.39,78.50],[17.30,78.85],
    [17.10,79.30],[16.82,79.75]
  ]
},

{ id:'tunga', name:'Tunga', region:'',
  fact:"One of the two headstreams of the Tungabhadra, rising in the Western Ghats at Gangamoola and flowing through Sringeri before meeting the Bhadra.",
  states:['Karnataka'],
  path:[
    [13.25,75.15],[13.45,75.30],[13.65,75.45],[13.82,75.55]
  ]
},

{ id:'bhadra', name:'Bhadra', region:'',
  fact:"One of the two headstreams of the Tungabhadra, originating in the Western Ghats and joining the Tunga at Kudli.",
  states:['Karnataka'],
  path:[
    [13.42,75.40],[13.55,75.52],[13.68,75.55],[13.82,75.55]
  ]
},
  { id:'kabini', name:'Kabini', region:'',
  fact:"The largest tributary of the Kaveri, originating in the Wayanad Hills of Kerala and flowing through Karnataka before joining the Kaveri at Tirumakudal Narasipura.",
  states:['Kerala','Karnataka'],
  path:[
    [11.72,76.10],[11.82,76.28],[11.95,76.50],[12.05,76.72],[12.15,76.90],
    [12.22,77.02],[12.30,77.10]
  ]
},

{ id:'hemavati', name:'Hemavati', region:'',
  fact:"A major tributary of the Kaveri, rising in the Western Ghats near Chikmagalur and flowing southeast through Karnataka before joining the Kaveri near Krishnarajasagara.",
  states:['Karnataka'],
  path:[
    [13.15,75.70],[12.95,75.95],[12.78,76.25],[12.60,76.55],[12.45,76.80],
    [12.32,76.98],[12.22,77.10]
  ]
},

{ id:'bhavani', name:'Bhavani', region:'',
  fact:"An important tributary of the Kaveri, originating in the Nilgiri Hills and flowing through Kerala and Tamil Nadu before joining the Kaveri at Bhavani.",
  states:['Kerala','Tamil Nadu'],
  path:[
    [11.48,76.62],[11.35,76.82],[11.22,77.08],[11.12,77.32],[11.05,77.58],
    [11.00,77.82]
  ]
},

{ id:'amaravati', name:'Amaravati', region:'',
  fact:"A major tributary of the Kaveri, rising in the Anamalai Hills of the Western Ghats and flowing east across Tamil Nadu.",
  states:['Kerala','Tamil Nadu'],
  path:[
    [10.42,77.18],[10.55,77.48],[10.68,77.82],[10.78,78.15],[10.88,78.45],
    [10.95,78.72]
  ]
},

{ id:'noyyal', name:'Noyyal', region:'',
  fact:"A tributary of the Kaveri originating in the Western Ghats near Vellingiri Hills and flowing through Coimbatore and Tiruppur districts.",
  states:['Tamil Nadu'],
  path:[
    [10.98,76.72],[10.95,76.98],[10.92,77.22],[10.90,77.48],[10.92,77.72],
    [10.95,77.95]
  ]
},

{ id:'shimsha', name:'Shimsha', region:'',
  fact:"A tributary of the Kaveri, rising in the Devarayanadurga Hills and known for the historic Shivanasamudra hydroelectric project.",
  states:['Karnataka'],
  path:[
    [13.35,77.10],[13.05,77.12],[12.82,77.18],[12.58,77.15],[12.38,77.10],
    [12.22,77.10]
  ]
},

{ id:'arkavati', name:'Arkavati', region:'',
  fact:"A tributary of the Kaveri, originating in the Nandi Hills of Karnataka and flowing through the Bengaluru region before joining the Kaveri near Kanakapura.",
  states:['Karnataka'],
  path:[
    [13.42,77.68],[13.25,77.62],[13.05,77.58],[12.88,77.55],[12.70,77.45],
    [12.48,77.30],[12.22,77.10]
  ]
}

];
const ROUNDS_PER_GAME = 10; // solo runs pick up to 10 at random each time; with only a handful of rivers so far, every round gets used.
const CANDIDATES_PER_ROUND = 4; // how many river-line options (1 correct + decoys) are shown each round.

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
   Highlights each STATE a river flows through in its own distinct color — more useful
   for UPSC-style map practice than one blanket color. Tries a couple of mirrors of a
   standard India-states GeoJSON. */
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

/* Distinct palette cycled across the states a river passes through — deliberately NOT
   tied to correct/incorrect, since every one of these states is part of the answer. */
const STATE_HIGHLIGHT_PALETTE = ['#4A9E7A','#5B7FFF','#8B7CF6','#D4A853','#F2545F','#EAC072','#3AA0A0','#B4739E'];

function highlightStatesMulti(names){
  if(!indiaStatesGeo || !Array.isArray(names) || !names.length) return;
  names.forEach((name, i)=>{
    const color = STATE_HIGHLIGHT_PALETTE[i % STATE_HIGHLIGHT_PALETTE.length];
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

/* ---------------- Game state ---------------- */
let order = [];
let roundIdx = 0;
let scores = [];
let results = [];
let guessed = false;
let revealLayers = [];
let candidates = [];
let selectedId = null;
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
function shuffleArr(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
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

/* Fill the "N targets" mini-stat on the start screen from the live round count. */
document.addEventListener('DOMContentLoaded', function(){
  const n = Math.min(ROUNDS_PER_GAME, ROUNDS.length);
  const el = document.getElementById('targets-count-label');
  if(el) el.textContent = n + (n === 1 ? ' target' : ' targets');
});

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

function findRound(id){ return ROUNDS.find(r=>r.id===id); }

/* Pick `count` random decoy rivers (excluding the target) to pair alongside it. */
function getDecoysFor(targetRound, count){
  const others = ROUNDS.filter(r => r.id !== targetRound.id);
  return shuffleArr(others).slice(0, count);
}

/* ---------------- Draw the candidate river lines for a round ---------------- */
const CANDIDATE_COLORS = ['#5B7FFF','#8B7CF6','#3AA0A0','#B4739E','#E08E45','#5C9BD1'];

function renderCandidates(targetRound){
  candidates = [];
  selectedId = null;
  const decoyCount = Math.min(CANDIDATES_PER_ROUND - 1, ROUNDS.length - 1);
  const decoys = getDecoysFor(targetRound, decoyCount);
  const pair = shuffleArr([targetRound, ...decoys]); // randomize which color/position is correct

  pair.forEach((round, i)=>{
    const color = CANDIDATE_COLORS[i % CANDIDATE_COLORS.length];
    const latlngs = round.path;
    const hit = L.polyline(latlngs, { color:color, weight:22, opacity:0 }).addTo(map);
    const line = L.polyline(latlngs, { color:color, weight:5, opacity:0.85, lineCap:'round', lineJoin:'round' }).addTo(map);
    const mid = latlngs[Math.floor(latlngs.length/2)];
    const dot = L.marker(mid, {
      icon: L.divIcon({
        className:'',
        html:`<div class="river-dot-outer"><div class="core" style="width:18px;height:18px;background:${color};"></div></div>`,
        iconSize:[22,22], iconAnchor:[11,11]
      })
    }).addTo(map);
    const pick = ()=> selectCandidate(round.id);
    hit.on('click', pick); line.on('click', pick); dot.on('click', pick);
    revealLayers.push(hit, line, dot);
    candidates.push({ id:round.id, color, line, dot });
  });
}

function selectCandidate(rid){
  if(guessed) return;
  selectedId = rid;
  candidates.forEach(c=>{
    const isSel = c.id === rid;
    c.line.setStyle({ weight: isSel ? 7 : 4, opacity: isSel ? 1 : 0.4 });
  });
  document.getElementById('tap-hint').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'inline-block';
}

function loadRound(){
  guessed = false;
  clearRevealLayers();
  selectedId = null;
  map.stop();
  map.flyTo([22.6, 80.0], 4.4, { duration: 0.6, easeLinearity: 0.25 });
  document.getElementById('feedback').classList.remove('show');
  document.getElementById('legend-line').style.display = 'none';
  document.getElementById('rival-line').style.display = 'none';
  document.getElementById('lock-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('tap-hint').style.display = 'flex';
  document.getElementById('round-label').textContent = `Round ${roundIdx+1} of ${order.length}`;
  const round = ROUNDS[order[roundIdx]];
  document.getElementById('strait-name').textContent = round.name;
  document.getElementById('strait-region').textContent = 'Which line is this river?';
  updateDots();
  renderCandidates(round);
}

/* ---------------- Scoring (binary: right river / wrong river) ---------------- */
function scoreFor(correct){ return correct ? 100 : 0; }

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

function lockGuess(){
  if(guessed || !selectedId) return;
  guessed = true;

  const round = ROUNDS[order[roundIdx]];
  const correct = selectedId === round.id;
  const pts = scoreFor(correct);
  scores.push(pts);
  results.push({ name:round.name, correct, pts });

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit all candidate courses so the player sees the full picture.
  const boundsPoints = [];
  candidates.forEach(c=> c.line.getLatLngs().forEach(pt=> boundsPoints.push(pt)));
  const bounds = L.latLngBounds(boundsPoints);

  let revealed = false;
  function fireReveal(){
    if(revealed) return;
    revealed = true;
    revealResult(round, correct, pts, selectedId);
  }
  map.once('moveend', fireReveal);
  map.flyToBounds(bounds, { padding:[80,80], maxZoom:8, duration:1.1, easeLinearity:0.25 });
  setTimeout(fireReveal, 1600); // fallback in case flyToBounds doesn't fire moveend
}

function revealResult(round, correct, pts, pickedId){
  clearRevealLayers();

  const line = L.polyline(round.path, { color:'#D4A853', weight:5, opacity:0.95, lineCap:'round', lineJoin:'round' }).addTo(map);
  revealLayers.push(line);
  const mid = round.path[Math.floor(round.path.length/2)];
  const label = L.marker(mid, {
    icon: L.divIcon({ className:'', html:`<div class="line-label">${round.name}</div>`, iconSize:[0,0] }),
    interactive:false
  }).addTo(map);
  revealLayers.push(label);

  if(!correct){
    const wrongRound = findRound(pickedId);
    if(wrongRound){
      const wLine = L.polyline(wrongRound.path, { color:'#F2545F', weight:4, opacity:0.85, dashArray:'8,6' }).addTo(map);
      revealLayers.push(wLine);
      const wMid = wrongRound.path[Math.floor(wrongRound.path.length/2)];
      const wLabel = L.marker(wMid, {
        icon: L.divIcon({ className:'', html:`<div class="guess-label">${wrongRound.name} — your pick</div>`, iconSize:[0,0] }),
        interactive:false
      }).addTo(map);
      revealLayers.push(wLabel);
    }
  }

  highlightStatesMulti(round.states);

  const v = correct
    ? { label:'Correct — well navigated!', cls:'good', icon:'check' }
    : { label:'Not quite — that was a different river.', cls:'bad', icon:'x' };

  document.getElementById('verdict-text').innerHTML = `${VERDICT_ICONS[v.icon]} ${v.label}  (+${pts} pts)`;
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
  if(avg >= 85) msg = "Master of Indian river geography. UPSC map-based questions won't stand a chance.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of India's major rivers.";
  else if(avg >= 40) msg = "Solid run. These rivers can look alike from a distance — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the rivers closer. Chart again!';
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
      <span class="b-dist">${r.correct ? 'Correctly identified' : 'Missed'}</span>
      <span class="b-pts ${r.correct ? 'good' : 'bad'}">+${r.pts}</span>`;
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

  // Prune anything past the worker's TTL before adding the new one, so the
  // object can't grow unbounded across a player's history.
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the rivers closer this time.';
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
    const msg = `🏞️ I just charted the River Navigator (India) and scored ${currentAvgScore}%. Think you can read the rivers closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🏞️ Think you can beat my River Navigator score of ${currentAvgScore}%?`);
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
