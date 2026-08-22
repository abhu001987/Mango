/* ============================================================
   GAME / API CONFIG
   ============================================================ */
const GAME_TYPE = 'forest-navigator';
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
   LAKE DATA
   Coordinates are representative waypoints tracing each lake's
   general outline — educational approximations, not survey-grade
   GIS data.
   ============================================================ */
const ROUNDS = [

  { id:'amazon', name:'Amazon Rainforest', region:'',
    fact:"The world's largest tropical rainforest, covering much of the Amazon Basin. It contains exceptional biodiversity and plays a major role in the global carbon and water cycles.",
    countries:['Brazil','Peru','Colombia','Bolivia','Venezuela','Ecuador','Guyana','Suriname','France'],
    paths:[[[-5.0,-78.0],[-1.0,-73.0],[3.5,-67.0],[4.0,-55.0],[-1.0,-48.0],[-7.5,-50.0],[-12.0,-60.0],[-14.0,-70.0],[-10.0,-76.0],[-5.0,-78.0]]]
  },

  { id:'congo', name:'Congo Rainforest', region:'',
    fact:"The Congo Basin contains the world's second-largest tropical rainforest after the Amazon and is a major carbon sink with exceptionally rich wildlife.",
    countries:['Democratic Republic of the Congo','Republic of the Congo','Cameroon','Central African Republic','Gabon','Equatorial Guinea'],
    paths:[[[5.5,9.0],[5.0,18.0],[3.0,27.0],[-5.0,29.0],[-8.5,24.0],[-5.0,14.0],[-2.0,9.0],[5.5,9.0]]]
  },

  { id:'guiana', name:'Guiana Shield Forests', region:'',
    fact:"One of the world's largest blocks of relatively intact tropical forest, covering the Guiana Shield north of the Amazon Basin and containing exceptionally high biodiversity.",
    countries:['Guyana','Suriname','France','Venezuela','Brazil'],
    paths:[[[8.5,-67.5],[8.5,-58.0],[6.0,-51.0],[2.0,-50.0],[0.0,-55.0],[1.0,-63.0],[3.5,-68.0],[8.5,-67.5]]]
  },

  { id:'atlantic', name:'Atlantic Forest', region:'',
    fact:"A major tropical and subtropical forest along Brazil's Atlantic coast, recognized as a global biodiversity hotspot with very high levels of endemism.",
    countries:['Brazil','Argentina','Paraguay'],
    paths:[[[8.0,-35.0],[2.0,-40.0],[-5.0,-42.0],[-15.0,-40.0],[-25.0,-48.0],[-30.0,-52.0],[-25.0,-58.0],[-15.0,-55.0],[-5.0,-48.0],[8.0,-35.0]]]
  },

  { id:'choco', name:'Chocó–Darién Rainforest', region:'',
    fact:"One of the wettest tropical forest regions on Earth, extending along the Pacific coast of Panama, Colombia and Ecuador and known for exceptional biodiversity.",
    countries:['Panama','Colombia','Ecuador'],
    paths:[[[9.5,-78.0],[8.5,-75.0],[5.0,-77.0],[1.0,-79.0],[-3.0,-80.0],[0.0,-82.0],[5.0,-81.0],[9.5,-78.0]]]
  },

  { id:'central_america', name:'Central American Rainforests', region:'',
    fact:"Tropical forests extending from southern Mexico through Central America, forming an important biological corridor between North and South America.",
    countries:['Mexico','Guatemala','Belize','Honduras','El Salvador','Nicaragua','Costa Rica','Panama'],
    paths:[[[21.5,-89.0],[19.0,-92.0],[16.0,-91.0],[13.0,-88.0],[10.0,-85.0],[8.0,-82.0],[10.0,-78.0],[15.0,-84.0],[18.0,-88.0],[21.5,-89.0]]]
  },

  { id:'sundaland', name:'Sundaland Rainforest', region:'',
    fact:"A biodiversity-rich tropical forest region covering the Malay Peninsula and much of the Sunda Islands, including Sumatra, Java and Borneo.",
    countries:['Indonesia','Malaysia','Brunei','Thailand','Singapore'],
    paths:[[[7.0,95.0],[8.0,105.0],[5.0,115.0],[2.0,119.0],[-5.0,117.0],[-9.0,105.0],[-7.0,96.0],[0.0,94.0],[7.0,95.0]]]
  },

  { id:'borneo', name:'Borneo Rainforest', region:'',
    fact:"One of the world's oldest tropical rainforest regions, famous for orangutans, proboscis monkeys and exceptional plant diversity.",
    countries:['Indonesia','Malaysia','Brunei'],
    paths:[[[7.0,109.0],[7.0,118.0],[3.0,119.5],[-4.0,117.5],[-4.5,110.0],[0.0,108.0],[7.0,109.0]]]
  },

  { id:'sumatra', name:'Sumatra Rainforest', region:'',
    fact:"Sumatra's tropical forests contain some of the world's most endangered species, including the Sumatran tiger, rhinoceros and orangutan.",
    countries:['Indonesia'],
    paths:[[[5.8,95.0],[5.5,101.5],[1.0,104.0],[-5.5,105.0],[-5.8,100.0],[-2.0,96.0],[5.8,95.0]]]
  },

  { id:'new_guinea', name:'New Guinea Rainforest', region:'',
    fact:"The forests of New Guinea are among the world's most biologically diverse, with many species found nowhere else on Earth.",
    countries:['Indonesia','Papua New Guinea'],
    paths:[[[-1.5,131.0],[-1.0,142.0],[-3.0,151.5],[-7.0,153.5],[-10.0,146.0],[-9.0,136.0],[-5.0,130.0],[-1.5,131.0]]]
  },

  { id:'southeast_asia', name:'Southeast Asian Rainforests', region:'',
    fact:"A major tropical forest zone of mainland Southeast Asia containing evergreen, monsoon and seasonal forests and important habitats for Asian elephants and other wildlife.",
    countries:['Myanmar','Thailand','Laos','Cambodia','Vietnam'],
    paths:[[[28.5,92.0],[27.0,100.0],[23.0,105.0],[18.0,109.0],[10.0,105.0],[11.0,99.0],[16.0,94.0],[22.0,91.0],[28.5,92.0]]]
  },

  { id:'western_ghats', name:'Western Ghats Forests', region:'',
    fact:"A global biodiversity hotspot running parallel to India's western coast, containing tropical evergreen forests and many endemic species while strongly influencing the Indian monsoon.",
    countries:['India'],
    paths:[[[21.0,73.0],[18.0,74.0],[15.0,75.0],[12.0,76.0],[9.0,77.0],[8.0,76.5],[10.0,74.5],[15.0,73.0],[21.0,73.0]]]
  },

  { id:'eastern_ghats', name:'Eastern Ghats Forests', region:'',
    fact:"Discontinuous hill forests along eastern India, containing dry deciduous, moist deciduous and patches of evergreen vegetation and important wildlife habitats.",
    countries:['India'],
    paths:[[[20.5,82.5],[19.0,84.5],[17.0,82.5],[14.0,80.5],[12.5,79.5],[15.0,79.0],[18.0,80.0],[20.5,82.5]]]
  },

  { id:'himalayan', name:'Himalayan Forests', region:'',
    fact:"A major mountain forest system ranging from subtropical forests to temperate conifers and alpine vegetation, with enormous biodiversity and importance for Asian river systems.",
    countries:['India','Nepal','Bhutan','Pakistan','China'],
    paths:[[[35.0,70.0],[35.5,78.0],[31.5,89.0],[27.0,92.0],[26.0,84.0],[29.0,76.0],[35.0,70.0]]]
  },

  { id:'northeast_india', name:'Northeast Indian Forests', region:'',
    fact:"One of India's richest forest and biodiversity regions, containing tropical evergreen, semi-evergreen and bamboo forests influenced by very high rainfall.",
    countries:['India'],
    paths:[[[29.5,89.5],[29.5,96.5],[27.0,97.5],[22.0,94.0],[22.0,91.0],[25.0,88.5],[29.5,89.5]]]
  },

  { id:'andaman', name:'Andaman and Nicobar Forests', region:'',
    fact:"Tropical evergreen and mangrove forests covering the Andaman and Nicobar Islands, noted for high endemism and rich island biodiversity.",
    countries:['India'],
    paths:[[[13.8,92.2],[13.0,93.5],[10.0,93.0],[7.0,93.5],[6.5,92.5],[10.0,92.0],[13.8,92.2]]]
  },

  { id:'siberian_taiga', name:'Siberian Taiga', region:'',
    fact:"One of the world's largest continuous forest regions, forming a huge part of the Eurasian boreal forest belt and dominated by conifers such as larch, pine and spruce.",
    countries:['Russia'],
    paths:[[[68.0,30.0],[69.0,70.0],[67.0,110.0],[64.0,145.0],[56.0,150.0],[52.0,120.0],[54.0,80.0],[55.0,45.0],[68.0,30.0]]]
  },

  { id:'russian_far_east', name:'Russian Far East Taiga', region:'',
    fact:"A vast boreal and temperate forest region extending across the Russian Far East, known for species such as the Siberian tiger and Amur leopard.",
    countries:['Russia'],
    paths:[[[62.0,120.0],[65.0,145.0],[62.0,170.0],[52.0,170.0],[45.0,150.0],[48.0,130.0],[55.0,120.0],[62.0,120.0]]]
  },

  { id:'scandinavian_boreal', name:'Scandinavian Boreal Forest', region:'',
    fact:"Part of the Eurasian boreal forest belt, dominated by conifers such as spruce and pine and extending across much of Scandinavia.",
    countries:['Norway','Sweden','Finland'],
    paths:[[[70.0,18.0],[69.5,30.0],[65.0,31.5],[60.0,30.0],[58.0,20.0],[60.0,12.0],[65.0,14.0],[70.0,18.0]]]
  },

  { id:'canadian_boreal', name:'Canadian Boreal Forest', region:'',
    fact:"A vast belt of coniferous and mixed forests stretching across Canada and Alaska, forming one of Earth's largest terrestrial ecosystems and an important carbon store.",
    countries:['Canada','United States of America'],
    paths:[[[68.0,-140.0],[68.0,-100.0],[66.0,-65.0],[58.0,-55.0],[48.0,-70.0],[48.0,-95.0],[50.0,-120.0],[55.0,-140.0],[68.0,-140.0]]]
  },

  { id:'alaska_boreal', name:'Alaskan Boreal Forest', region:'',
    fact:"A major North American boreal forest region dominated by spruce and other cold-adapted trees, extending across much of interior Alaska.",
    countries:['United States of America'],
    paths:[[[69.0,-165.0],[69.0,-140.0],[65.0,-135.0],[60.0,-140.0],[58.0,-155.0],[60.0,-165.0],[65.0,-170.0],[69.0,-165.0]]]
  },

  { id:'pacific_northwest', name:'Pacific Northwest Temperate Rainforest', region:'',
    fact:"A cool, extremely wet temperate rainforest along the Pacific coast of British Columbia, Washington and Oregon, famous for giant conifers.",
    countries:['Canada','United States of America'],
    paths:[[[54.0,-130.0],[53.0,-123.0],[49.0,-122.0],[45.0,-123.0],[42.0,-124.0],[46.0,-130.0],[54.0,-130.0]]]
  },

  { id:'valdivian', name:'Valdivian Temperate Rainforest', region:'',
    fact:"A temperate rainforest of southern Chile and parts of Argentina, known for ancient forests, high rainfall and distinctive Gondwanan flora.",
    countries:['Chile','Argentina'],
    paths:[[[-37.0,-73.5],[-40.0,-72.0],[-44.0,-72.0],[-48.0,-74.0],[-44.0,-76.0],[-39.0,-75.0],[-37.0,-73.5]]]
  },

  { id:'tasmanian', name:'Tasmanian Temperate Forests', region:'',
    fact:"Tasmania contains extensive temperate forests, including cool temperate rainforests and ancient Gondwanan vegetation such as myrtle beech and Huon pine.",
    countries:['Australia'],
    paths:[[[-40.5,144.5],[-40.5,148.5],[-42.0,148.8],[-43.7,146.5],[-43.5,144.5],[-40.5,144.5]]]
  },

  { id:'new_zealand', name:'New Zealand Temperate Rainforests', region:'',
    fact:"New Zealand's temperate forests include podocarp-broadleaf forests and southern beech forests, with many unique species shaped by long geographic isolation.",
    countries:['New Zealand'],
    paths:[[[-34.5,172.0],[-36.0,178.0],[-41.0,176.5],[-47.0,167.0],[-46.0,165.0],[-39.0,167.0],[-34.5,172.0]]]
  },

  { id:'japanese', name:'Japanese Temperate Forests', region:'',
    fact:"Japan has extensive temperate and subtropical forests ranging from evergreen forests in the south to deciduous and coniferous forests in the north.",
    countries:['Japan'],
    paths:[[[45.5,140.0],[43.5,145.5],[38.0,141.0],[34.0,135.0],[31.0,130.0],[34.0,129.0],[39.0,135.0],[45.5,140.0]]]
  },

  { id:'mediterranean', name:'Mediterranean Forests and Woodlands', region:'',
    fact:"A fire-adapted forest and shrubland biome surrounding the Mediterranean Sea, characterized by hot dry summers and mild wet winters.",
    countries:['Spain','France','Italy','Greece','Turkey','Croatia','Albania','Morocco','Algeria','Tunisia','Lebanon','Israel'],
    paths:[[[44.5,-6.0],[45.0,10.0],[42.0,25.0],[36.0,35.0],[30.0,35.0],[32.0,10.0],[35.0,-5.0],[44.5,-6.0]]]
  },

  { id:'california_chaparral', name:'California Chaparral and Woodlands', region:'',
    fact:"A Mediterranean-type vegetation region with drought-resistant shrubs and woodland, adapted to dry summers, wet winters and periodic wildfires.",
    countries:['United States of America'],
    paths:[[[42.0,-124.5],[40.0,-120.0],[35.0,-117.0],[32.5,-116.0],[32.0,-120.0],[35.0,-123.0],[42.0,-124.5]]]
  },

  { id:'chilean_matorral', name:'Chilean Matorral', region:'',
    fact:"A Mediterranean-type forest and shrubland ecosystem of central Chile, characterized by dry summers, winter rainfall and high levels of plant endemism.",
    countries:['Chile'],
    paths:[[[-30.0,-72.0],[-32.0,-70.0],[-36.0,-70.5],[-38.0,-73.0],[-35.0,-74.0],[-30.0,-72.0]]]
  },

  { id:'cape_floristic', name:'Cape Floristic Region', region:'',
    fact:"A globally important Mediterranean-type biodiversity hotspot in southwestern South Africa, famous for extraordinary plant diversity and fynbos vegetation.",
    countries:['South Africa'],
    paths:[[[-30.0,17.0],[-31.0,25.0],[-34.0,28.0],[-35.5,22.0],[-34.5,17.0],[-30.0,17.0]]]
  },

  { id:'southwest_australia', name:'Southwest Australian Forests', region:'',
    fact:"A Mediterranean-climate biodiversity hotspot containing eucalyptus forests, woodlands and shrublands with exceptionally high plant endemism.",
    countries:['Australia'],
    paths:[[[-30.0,114.0],[-30.0,123.0],[-35.0,123.5],[-35.5,115.0],[-32.0,113.0],[-30.0,114.0]]]
  },

  { id:'sundarbans', name:'Sundarbans Mangrove Forest', region:'',
    fact:"The world's largest contiguous mangrove forest, located in the Ganges–Brahmaputra–Meghna delta and famous as a habitat of the Bengal tiger.",
    countries:['India','Bangladesh'],
    paths:[[[22.5,88.0],[22.5,90.5],[21.5,92.0],[20.0,91.0],[21.0,88.0],[22.5,88.0]]]
  },

  { id:'niger_delta', name:'Niger Delta Mangrove Forests', region:'',
    fact:"One of Africa's largest mangrove regions, occupying the vast Niger Delta and providing important coastal wetlands and fish nurseries.",
    countries:['Nigeria','Cameroon'],
    paths:[[[6.5,3.5],[7.0,8.0],[5.5,9.5],[4.0,8.0],[4.0,5.0],[6.5,3.5]]]
  },

  { id:'mekong_mangroves', name:'Mekong Delta Mangroves', region:'',
    fact:"Important mangrove and wetland ecosystems around the Mekong Delta, protecting coastlines and providing breeding grounds for fish and other aquatic species.",
    countries:['Vietnam','Cambodia'],
    paths:[[[11.0,103.5],[11.5,106.5],[9.0,107.5],[8.0,105.0],[9.0,103.5],[11.0,103.5]]]
  },

  { id:'florida_mangroves', name:'Florida Mangrove Forests', region:'',
    fact:"Extensive mangrove ecosystems along southern Florida and the Florida Keys, providing coastal protection and important nursery habitats for marine life.",
    countries:['United States of America'],
    paths:[[[27.0,-83.0],[26.0,-80.0],[24.0,-80.0],[24.0,-82.5],[25.0,-83.5],[27.0,-83.0]]]
  },

  { id:'guiana_mangroves', name:'Guiana Mangrove Forests', region:'',
    fact:"Mangrove forests along the low-lying Atlantic coast of the Guianas, strongly influenced by sediment carried from the Amazon and other South American rivers.",
    countries:['Guyana','Suriname','France'],
    paths:[[[8.5,-61.0],[8.5,-53.0],[6.0,-50.0],[4.0,-52.0],[5.0,-58.0],[8.5,-61.0]]]
  },

  { id:'queensland_wet_tropics', name:'Queensland Wet Tropics', region:'',
    fact:"A World Heritage tropical rainforest region in northeastern Queensland containing ancient rainforest ecosystems and exceptional biodiversity.",
    countries:['Australia'],
    paths:[[[-15.0,143.5],[-15.0,146.5],[-18.5,147.0],[-19.0,145.0],[-17.0,143.5],[-15.0,143.5]]]
  },

  { id:'daintree', name:'Daintree Rainforest', region:'',
    fact:"One of the world's oldest tropical rainforest regions, located in northeastern Queensland and part of the Wet Tropics World Heritage Area.",
    countries:['Australia'],
    paths:[[[-15.0,145.0],[-15.5,146.0],[-17.0,146.0],[-17.5,145.0],[-16.5,144.5],[-15.0,145.0]]]
  },
  { id:'miombo', name:'Miombo Woodlands', region:'',
    fact:"One of Africa's largest tropical woodland systems, dominated by miombo trees and important for wildlife, local livelihoods and carbon storage.",
    countries:['Tanzania','Zambia','Zimbabwe','Mozambique','Malawi','Angola','Democratic Republic of the Congo'],
    paths:[[[-5.0,20.0],[-4.0,30.0],[-8.0,36.0],[-18.0,36.0],[-23.0,30.0],[-20.0,23.0],[-12.0,20.0],[-5.0,20.0]]]
  },

  { id:'east_african_montane', name:'East African Montane Forests', region:'',
    fact:"Mountain forests of eastern Africa occurring around highland areas such as Mount Kenya, Mount Kilimanjaro and the Ethiopian Highlands, with strong altitudinal variation in vegetation.",
    countries:['Kenya','Tanzania','Uganda','Rwanda','Burundi','Ethiopia'],
    paths:[[[15.0,34.0],[12.0,42.0],[5.0,43.0],[-5.0,41.0],[-8.0,34.0],[-2.0,29.0],[5.0,30.0],[15.0,34.0]]]
  },

  { id:'albertine_rift', name:'Albertine Rift Forests', region:'',
    fact:"A biodiversity-rich mountain forest region along the Albertine Rift in East-Central Africa, containing many endemic species and important highland habitats.",
    countries:['Uganda','Rwanda','Burundi','Democratic Republic of the Congo','Tanzania'],
    paths:[[[-1.0,28.0],[3.0,31.0],[2.0,34.0],[-5.0,35.0],[-7.0,31.0],[-5.0,28.0],[-1.0,28.0]]]
  },

  { id:'madagascar_rainforest', name:'Madagascar Eastern Rainforests', region:'',
    fact:"Madagascar's eastern forests contain extraordinary levels of endemism, with many plants and animals found nowhere else on Earth.",
    countries:['Madagascar'],
    paths:[[[ -11.0,49.0],[-12.0,51.0],[-18.0,50.5],[-25.0,50.0],[-26.0,47.5],[-20.0,47.0],[-14.0,48.0],[-11.0,49.0]]]
  },

  { id:'upper_guinea', name:'Upper Guinean Forests', region:'',
    fact:"A major West African tropical forest region and biodiversity hotspot, now highly fragmented by agriculture, logging and settlement.",
    countries:['Guinea','Sierra Leone','Liberia',"Côte d'Ivoire",'Ghana'],
    paths:[[[12.0,-15.0],[11.0,-8.0],[10.0,-3.0],[6.0,1.0],[4.0,-2.0],[5.0,-10.0],[7.0,-15.0],[12.0,-15.0]]]
  },

  { id:'lower_guinea', name:'Lower Guinean Forests', region:'',
    fact:"Tropical forests along the Gulf of Guinea and western Congo Basin, forming one of Africa's major rainforest regions.",
    countries:['Nigeria','Cameroon','Gabon','Equatorial Guinea','Republic of the Congo'],
    paths:[[[8.0,3.0],[8.0,14.0],[5.0,18.0],[-5.0,16.0],[-5.0,8.0],[0.0,5.0],[8.0,3.0]]]
  },

  { id:'mesoamerican_pine_oak', name:'Mesoamerican Pine–Oak Forests', region:'',
    fact:"Mountain forests extending from Mexico into Central America, dominated by pine and oak and supporting high biodiversity across varied elevations.",
    countries:['Mexico','Guatemala','Honduras','El Salvador','Nicaragua'],
    paths:[[[24.0,-105.0],[22.0,-97.0],[18.0,-89.0],[13.0,-87.0],[12.0,-91.0],[16.0,-96.0],[20.0,-105.0],[24.0,-105.0]]]
  },

  { id:'appalachian', name:'Appalachian Forests', region:'',
    fact:"Extensive temperate forests of the Appalachian Mountains, containing exceptionally diverse hardwood communities and some of the oldest mountain ecosystems in North America.",
    countries:['United States of America','Canada'],
    paths:[[[48.0,-82.0],[45.0,-76.0],[40.0,-75.0],[35.0,-79.0],[32.0,-84.0],[35.0,-87.0],[42.0,-83.0],[48.0,-82.0]]]
  },

  { id:'eastern_deciduous', name:'Eastern Deciduous Forests', region:'',
    fact:"A vast temperate forest region dominated by deciduous trees such as oak, maple, beech and hickory, covering much of eastern North America.",
    countries:['United States of America','Canada'],
    paths:[[[50.0,-95.0],[48.0,-82.0],[42.0,-70.0],[34.0,-75.0],[29.0,-88.0],[32.0,-100.0],[40.0,-100.0],[50.0,-95.0]]]
  },

  { id:'rocky_mountain', name:'Rocky Mountain Conifer Forests', region:'',
    fact:"Mountain conifer forests extending along the Rocky Mountains, dominated by species such as spruce, fir, pine and Douglas fir.",
    countries:['Canada','United States of America'],
    paths:[[[60.0,-140.0],[55.0,-125.0],[49.0,-114.0],[40.0,-105.0],[32.0,-108.0],[35.0,-115.0],[45.0,-120.0],[55.0,-135.0],[60.0,-140.0]]]
  },

  { id:'cerrado', name:'Cerrado Woodlands and Savanna', region:'',
    fact:"Brazil's vast tropical savanna region, containing woodland, grassland and shrub vegetation. It is one of the world's major biodiversity hotspots and an important source region for several South American rivers.",
    countries:['Brazil'],
    paths:[[[-5.0,-48.0],[-5.0,-42.0],[-12.0,-40.0],[-20.0,-44.0],[-24.0,-52.0],[-20.0,-58.0],[-10.0,-56.0],[-5.0,-48.0]]]
  },

  { id:'caatinga', name:'Caatinga', region:'',
    fact:"A semi-arid tropical vegetation region unique to Brazil, dominated by drought-adapted thorny woodland, shrubs and seasonal vegetation.",
    countries:['Brazil'],
    paths:[[[-3.0,-44.0],[-3.0,-37.0],[-8.0,-35.0],[-15.0,-39.0],[-17.0,-45.0],[-12.0,-48.0],[-5.0,-47.0],[-3.0,-44.0]]]
  },

  { id:'pantanal', name:'Pantanal Wetland Forests and Woodlands', region:'',
    fact:"One of the world's largest tropical wetlands, containing seasonally flooded forests, grasslands and savannas and supporting exceptional wildlife diversity.",
    countries:['Brazil','Bolivia','Paraguay'],
    paths:[[[-14.0,-59.0],[-14.0,-54.0],[-17.0,-54.0],[-20.0,-57.0],[-22.0,-59.0],[-19.0,-62.0],[-15.0,-62.0],[-14.0,-59.0]]]
  },

  { id:'llanos', name:'Llanos', region:'',
    fact:"A vast tropical savanna plain of the Orinoco Basin, characterized by seasonally flooded grasslands with patches of gallery forest.",
    countries:['Venezuela','Colombia'],
    paths:[[[10.0,-73.0],[10.0,-66.0],[8.0,-61.0],[4.0,-62.0],[3.0,-68.0],[5.0,-72.0],[10.0,-73.0]]]
  },

  { id:'murray_darling', name:'Murray–Darling Woodlands', region:'',
    fact:"A major woodland and dry forest region associated with the Murray–Darling Basin, dominated by eucalyptus species and adapted to Australia's variable rainfall.",
    countries:['Australia'],
    paths:[[[-28.0,137.0],[-28.0,150.0],[-33.0,151.5],[-38.0,147.0],[-37.0,140.0],[-33.0,135.0],[-28.0,137.0]]]
  },

  { id:'south_island_beech', name:'South Island Beech Forests', region:'',
    fact:"Temperate forests dominated by southern beech species across much of New Zealand's South Island, especially in the mountainous west and south.",
    countries:['New Zealand'],
    paths:[[[-40.5,167.0],[-41.5,174.0],[-44.0,171.5],[-47.5,168.0],[-46.5,165.0],[-43.0,166.0],[-40.5,167.0]]]
  },
  { id:'european_temperate', name:'European Temperate Broadleaf Forests', region:'',
  fact:"A vast temperate broadleaf and mixed forest region extending across much of Western and Central Europe, dominated by oak, beech, maple and hornbeam, and supporting diverse wildlife despite centuries of human land use.",
  countries:['Germany','France','Poland','Belgium','Netherlands','Luxembourg','Czech Republic','Austria','Switzerland','Denmark'],
  paths:[[[55.0,5.0],[55.0,18.0],[51.0,24.0],[46.0,19.0],[45.0,7.0],[48.0,-1.0],[55.0,5.0]]]
},

{ id:'carpathian', name:'Carpathian Forests', region:'',
  fact:"A major mountain forest system centered on the Carpathian Mountains, dominated by beech, fir and spruce forests and providing habitat for Europe's largest populations of brown bears, wolves and lynx.",
  countries:['Romania','Slovakia','Poland','Ukraine','Czech Republic','Hungary','Serbia'],
  paths:[[[50.0,17.0],[50.0,25.0],[47.0,26.5],[44.5,24.0],[46.0,18.0],[50.0,17.0]]]
},

{ id:'caucasus', name:'Caucasus Forests', region:'',
  fact:"A biodiversity hotspot located between the Black and Caspian Seas, containing temperate broadleaf, mixed and montane forests with many endemic plant and animal species.",
  countries:['Georgia','Armenia','Azerbaijan','Russia'],
  paths:[[[45.0,38.0],[45.5,49.0],[41.0,49.5],[40.0,43.0],[42.5,38.0],[45.0,38.0]]]
},

{ id:'korean', name:'Korean Forests', region:'',
  fact:"Temperate forests covering much of the Korean Peninsula, characterized by mixed deciduous and coniferous woodlands with rich seasonal biodiversity.",
  countries:['South Korea','North Korea'],
  paths:[[[43.5,124.0],[43.5,131.0],[34.0,129.5],[34.0,125.0],[43.5,124.0]]]
},

{ id:'china_temperate', name:'Chinese Temperate and Subtropical Forests', region:'',
  fact:"An extensive forest region ranging from temperate deciduous forests in northern China to evergreen subtropical forests in the south, supporting giant pandas and many endemic species.",
  countries:['China'],
  paths:[[[42.0,105.0],[42.0,123.0],[33.0,123.5],[21.0,112.0],[23.0,100.0],[33.0,98.0],[42.0,105.0]]]
},

{ id:'taiwan', name:'Taiwan Forests', region:'',
  fact:"Mountainous subtropical and temperate forests covering much of Taiwan, containing exceptionally high endemism due to the island's isolation and varied elevations.",
  countries:['Taiwan'],
  paths:[[[25.5,121.0],[25.5,122.2],[21.8,121.8],[21.8,120.5],[25.5,121.0]]]
},

{ id:'balkan', name:'Balkan Forests', region:'',
  fact:"A diverse temperate forest region extending across the Balkan Peninsula, containing broadleaf, mixed and montane forests with many relict and endemic species.",
  countries:['Slovenia','Croatia','Bosnia and Herzegovina','Serbia','Montenegro','Kosovo','North Macedonia','Albania','Bulgaria','Greece'],
  paths:[[[46.5,13.0],[46.0,28.0],[39.0,28.5],[39.0,19.0],[46.5,13.0]]]
},

{ id:'mexican_tropical', name:'Mexican Tropical Forests', region:'',
  fact:"Tropical rainforests and seasonal forests of southern Mexico, forming the northernmost extension of the Neotropical rainforest biome and supporting exceptional biodiversity.",
  countries:['Mexico'],
  paths:[[[20.5,-98.0],[20.0,-86.5],[14.0,-86.5],[14.0,-95.5],[20.5,-98.0]]]
},

{ id:'afromontane', name:'Afromontane Forests', region:'',
  fact:"A chain of mountain forests scattered across Africa's highlands, characterized by cool, moist conditions and high levels of endemism.",
  countries:['Ethiopia','Kenya','Uganda','Tanzania','Malawi','Mozambique','Zimbabwe','South Africa','Cameroon'],
  paths:[[[14.0,37.0],[8.0,40.0],[-5.0,39.0],[-16.0,35.0],[-30.0,30.0],[-5.0,28.0],[14.0,37.0]]]
},

{ id:'andean_cloud', name:'Andean and Central American Cloud Forests', region:'',
  fact:"High-elevation cloud forests characterized by persistent mist, abundant epiphytes and exceptional biodiversity, forming one of the world's richest montane ecosystems.",
  countries:['Mexico','Guatemala','Costa Rica','Panama','Colombia','Ecuador','Peru','Bolivia','Venezuela'],
  paths:[[[20.0,-99.0],[10.0,-84.0],[7.0,-78.0],[-5.0,-77.0],[-18.0,-68.0],[-15.0,-74.0],[2.0,-79.0],[12.0,-74.0],[20.0,-99.0]]]
},

{ id:'island_forests', name:'Oceanic Island Forests', region:'',
  fact:"A collection of ecologically important island forests featuring high endemism, unique evolutionary histories and diverse subtropical to tropical ecosystems.",
  countries:['United States of America','Spain','Portugal'],
  paths:[
    [[[22.0,-160.5],[22.0,-154.0],[18.5,-154.0],[18.5,-160.5],[22.0,-160.5]]],
    [[[29.8,-18.5],[29.8,-13.0],[27.5,-13.0],[27.5,-18.5],[29.8,-18.5]]],
    [[[40.5,-32.5],[40.5,-24.0],[36.0,-24.0],[36.0,-32.5],[40.5,-32.5]]]
  ]
},
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
  // Inside the lake's outline? Full credit — distance 0.
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

  // If you're outside the drawn lake shape but inside a country the lake
  // actually borders, don't torch the score for it — cap the *scoring* distance.
  const insideCountry = km > 0 && isInsideAnyCountry(gLatLng, round.countries);
  const scoringKm = insideCountry ? Math.min(km, 100) : km;

  const v = verdictFor(scoringKm);
  const pts = scoreFor(scoringKm);
  scores.push(pts);
  results.push({name:round.name, km, pts, cls:v.cls});

  document.getElementById('lock-btn').style.display = 'none';

  // Fly the map to fit both the guess and the real lake's full extent, so the
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
  if(avg >= 85) msg = "Master of world geography. You could redraw these lakes from memory.";
  else if(avg >= 65) msg = "Sharp sense of the map — a seasoned reading of the world's freshwater.";
  else if(avg >= 40) msg = "Solid run. These lakes are tricky — chart again to sharpen your eye.";
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
      vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read the lakes closer. Chart again!';
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
    vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read the lakes closer this time.';
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
    const msg = `🗺️ I just charted the Lake Navigator and scored ${currentAvgScore}%. Think you can pin the lakes closer? Take the same targets: ${link}`;
    document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(`🗺️ Think you can beat my Lake Navigator score of ${currentAvgScore}%?`);
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
