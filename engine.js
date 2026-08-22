/* ============================================================
   MapiDesk Navigator — SHARED GAME ENGINE
   ------------------------------------------------------------
   One file, loaded by every navigator game via:
     <script src="https://yourdomain.com/engine.js"></script>

   Each game's HTML supplies a small config object BEFORE loading
   this file:

     <script>
       const ROUNDS = [ ... ];               // this game's places
       const GAME_CONFIG = {
         gameType: 'coast-navigator-india',   // unique per game
         rounds: ROUNDS,
         mapHome: { center:[22.6,80.0], zoom:4.4 },
         // ...only the fields that differ from defaults, see below
       };
     </script>
     <script src="https://yourdomain.com/engine.js"></script>

   engine.js reads window.GAME_CONFIG and calls MapGame.init()
   automatically once the DOM + Leaflet are ready. Nothing else
   to wire up on the page side.

   ============================================================
   CONFIG REFERENCE (only `gameType` and `rounds` are required —
   everything else has a sane default matching the original
   Coastlines / Canals / Places-in-News games):

   gameType         string   REQUIRED. Unique id, used to namespace
                              challenge links & localStorage.
   rounds           array    REQUIRED. See ROUND SHAPE below.
   apiBase          string   Worker API base URL.
   roundsPerGame    number   How many rounds per solo run (default 10).

   mapHome          either:
                       { center:[lat,lng], zoom:n }                (single-scope games)
                     or
                       { india:{center,zoom}, world:{center,zoom} } (dual-scope games —
                                                                      picked per-round via round.scope)

   showIndiaBoundary  bool    Draw the India outline overlay (default true).
   boundaryDataUrls   array   Override GeoJSON source(s) for the boundary.
   statesDataUrls     array   Override GeoJSON source(s) for Indian states
                               (only fetched if some round uses region.type 'state').
   countriesDataUrls  array   Override GeoJSON source(s) for world countries
                               (only fetched if some round uses region.type 'country').
   aliases            { state:{name:[aliases]}, country:{name:[aliases]} }
                               Extra name-matching aliases merged with the built-in ones.

   scoring            { mode:'fixed' | 'byScope', scale:{...}, scales:{india:{...}, world:{...}} }
                               Default is a single fixed scale (divisor 5, thresholds
                               15/60/150/350 km). Pass mode:'byScope' + `scales.india` /
                               `scales.world` for games like Places-in-News that mix
                               state-sized and country-sized answers.
                               A scale object: { divisor, thresholds:[{max,label,cls,icon}, ...],
                               fallback:{label,cls,icon}, insideCap }

   shareTitle         string  Used in the WhatsApp/Telegram share text (default 'Navigator').
   shareEmoji         string  Emoji prefix for share text (default '🗺️').
   legendLine         string  Text under the feedback card after locking a guess.
   outroMessages      array   [{min, text}], highest matching `min` wins (sorted desc by min).

   ROUND SHAPE (each entry in `rounds`):
     {
       id: 'gujarat_coast',
       name: 'Gujarat Coast',            // shown in the top HUD + reveal line label
       question: '...',                  // optional — overrides `name` in the HUD (Places-in-News style)
       subtitle: '',                     // optional — small line under the title
       fact: '...',                      // shown in the feedback card after locking
       region: { type:'state'|'country', names:['Gujarat'] },  // for highlight + inside-region scoring
       scope: 'india'|'world',           // optional — only needed for dual-scope games
       paths: [[ [lat,lng], [lat,lng], ... ]]   // polygon ring(s) — build with MapGame.siteBox() / MapGame.coastStrip()
     }

   Build ROUNDS paths with the same helpers the original games used —
   these are exposed as MapGame.siteBox(lat,lng,half) and
   MapGame.coastStrip(latA,lngA,latB,lngB,halfWidth).
   ============================================================ */

(function () {
  'use strict';

  var MapGame = window.MapGame = window.MapGame || {};

  /* ---------------- Geometry helpers (exposed for building ROUNDS) ---------------- */
  function siteBox(lat, lng, half) {
    half = half || 0.07;
    return [[
      [lat + half, lng - half], [lat + half, lng + half],
      [lat - half, lng + half], [lat - half, lng - half],
      [lat + half, lng - half]
    ]];
  }
  function coastStrip(latA, lngA, latB, lngB, halfWidth) {
    var dLat = latB - latA, dLng = lngB - lngA;
    var len = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
    var perpLat = -dLng / len, perpLng = dLat / len;
    var oLat = perpLat * halfWidth, oLng = perpLng * halfWidth;
    return [[
      [latA + oLat, lngA + oLng], [latB + oLat, lngB + oLng],
      [latB - oLat, lngB - oLng], [latA - oLat, lngA - oLng],
      [latA + oLat, lngA + oLng]
    ]];
  }
  function centerOfPaths(paths) {
    var latSum = 0, lngSum = 0, n = 0;
    paths.forEach(function (ring) {
      for (var i = 0; i < ring.length - 1; i++) { latSum += ring[i][0]; lngSum += ring[i][1]; n++; }
    });
    return n ? [latSum / n, lngSum / n] : [0, 0];
  }
  MapGame.siteBox = siteBox;
  MapGame.coastStrip = coastStrip;

  /* ---------------- Default scoring scales ---------------- */
  function defaultScale() {
    return {
      divisor: 5,
      thresholds: [
        { max: 15, label: 'Bullseye — right on it!', cls: 'good', icon: 'target' },
        { max: 60, label: 'Excellent placement!', cls: 'good', icon: 'check' },
        { max: 150, label: 'Nearby — solid instinct.', cls: 'mid', icon: 'compass' },
        { max: 350, label: 'Right general zone.', cls: 'mid', icon: 'compass' }
      ],
      fallback: { label: 'Way off course — but noted.', cls: 'bad', icon: 'x' },
      insideCap: 100
    };
  }
  function worldScale() {
    return {
      divisor: 40,
      thresholds: [
        { max: 80, label: 'Bullseye — right on it!', cls: 'good', icon: 'target' },
        { max: 250, label: 'Excellent placement!', cls: 'good', icon: 'check' },
        { max: 700, label: 'Nearby — solid instinct.', cls: 'mid', icon: 'compass' },
        { max: 1800, label: 'Right general region.', cls: 'mid', icon: 'compass' }
      ],
      fallback: { label: 'Way off course — but noted.', cls: 'bad', icon: 'x' },
      insideCap: 600
    };
  }

  var VERDICT_ICONS = {
    target: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" style="fill:currentColor"/></svg>',
    check: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
    compass: '<svg class="v-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8l-5 3-1 5 5-3z"/></svg>',
    x: '<svg class="v-ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  var TROPHY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 4h8v3a4 4 0 01-4 4 4 4 0 01-4-4V4z"/><path d="M8 4H5a3 3 0 003 3M16 4h3a3 3 0 01-3 3"/><path d="M12 11v4"/><path d="M9 20h6"/><path d="M10 17h4v3h-4z"/></svg>';
  var VERDICT_HIGHLIGHT_COLOR = { good: '#4A9E7A', mid: '#D4A853', bad: '#F2545F' };

  var DEFAULT_STATE_ALIASES = {
    'delhi': ['delhi', 'nct of delhi', 'national capital territory of delhi'],
    'odisha': ['odisha', 'orissa'],
    'uttarakhand': ['uttarakhand', 'uttaranchal']
  };
  var DEFAULT_COUNTRY_ALIASES = {
    'united states of america': ['united states of america', 'united states', 'usa', 'us'],
    'south korea': ['south korea', 'republic of korea', 'korea, south'],
    'north korea': ['north korea', "democratic people's republic of korea", 'korea, north', 'dem. rep. korea'],
    'russia': ['russia', 'russian federation'],
    'democratic republic of the congo': ['democratic republic of the congo', 'dem. rep. congo', 'congo, dem. rep.', 'dr congo'],
    'myanmar': ['myanmar', 'burma'],
    'vietnam': ['vietnam', 'viet nam'],
    'laos': ['laos', "lao people's democratic republic", 'lao pdr']
  };

  /* ============================================================
     MapGame.init(config) — call this once, after ROUNDS + config
     are defined on the page. Wires up the entire game.
     ============================================================ */
  MapGame.init = function (userConfig) {
    var CFG = Object.assign({
      apiBase: 'https://game-api.abhikr18996.workers.dev',
      roundsPerGame: 10,
      mapHome: { center: [22.6, 80.0], zoom: 4.4 },
      showIndiaBoundary: true,
      boundaryDataUrls: ['/data/india-boundary.geojson'],
      statesDataUrls: ['/data/india-states-source-a.geojson', '/data/india-states-source-b.geojson'],
      countriesDataUrls: [
        '/data/world-boundaries.geojson',
        'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
        'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json'
      ],
      aliases: { state: {}, country: {} },
      scoring: { mode: 'fixed', scale: defaultScale(), scales: { india: defaultScale(), world: worldScale() } },
      shareTitle: 'Navigator',
      shareEmoji: '🗺️',
      legendLine: 'Red pin = your guess · Gold outline = the real answer',
      outroMessages: [
        { min: 85, text: 'Master of this map. Chart again and prove it wasn\u2019t luck.' },
        { min: 65, text: 'Sharp sense of the map — a seasoned reading.' },
        { min: 40, text: 'Solid run. Chart again to sharpen your eye.' },
        { min: 0, text: '' }
      ]
    }, userConfig);

    if (!CFG.gameType) { console.error('MapGame.init: gameType is required'); return; }
    if (!CFG.rounds || !CFG.rounds.length) { console.error('MapGame.init: rounds is required'); return; }

    var STATE_ALIASES = Object.assign({}, DEFAULT_STATE_ALIASES, CFG.aliases.state || {});
    var COUNTRY_ALIASES = Object.assign({}, DEFAULT_COUNTRY_ALIASES, CFG.aliases.country || {});

    var needsStates = CFG.rounds.some(function (r) { return r.region && r.region.type === 'state'; });
    var needsCountries = CFG.rounds.some(function (r) { return r.region && r.region.type === 'country'; });
    var isDualScope = !!(CFG.mapHome.india || CFG.mapHome.world);

    /* ---------------- Nav / theme / exit dialog ---------------- */
    function syncNavHeight() {
      var nav = document.getElementById('siteNav');
      if (!nav || nav.classList.contains('header-hidden')) return;
      document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
    }
    document.addEventListener('DOMContentLoaded', syncNavHeight);
    window.addEventListener('load', syncNavHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncNavHeight);
    setTimeout(syncNavHeight, 300);
    setTimeout(syncNavHeight, 900);

    document.addEventListener('DOMContentLoaded', function () {
      var themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', function () {
          var html = document.documentElement;
          var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
          html.setAttribute('data-theme', next);
          try { localStorage.setItem('terra-site-theme', next); } catch (e) {}
          setTimeout(function () { try { map.invalidateSize(); } catch (e) {} }, 320);
        });
      }
    });

    window.showExitDialog = function () { document.getElementById('exit-dialog-overlay').classList.add('show'); };
    window.closeExitDialog = function () { document.getElementById('exit-dialog-overlay').classList.remove('show'); };
    window.confirmExit = function () { window.location.href = 'index.html'; };

    function setHeaderVisible(visible) {
      var nav = document.getElementById('siteNav');
      if (!nav) return;
      nav.classList.toggle('header-hidden', !visible);
      if (visible) syncNavHeight();
      requestAnimationFrame(function () { try { map.invalidateSize(); } catch (e) {} });
    }

    /* ---------------- Map setup ---------------- */
    function singleHome() { return CFG.mapHome.center ? CFG.mapHome : { center: [22.6, 80.0], zoom: 4.4 }; }
    function homeViewFor(scope) {
      if (isDualScope) return (scope === 'world' ? CFG.mapHome.world : CFG.mapHome.india) || CFG.mapHome.india || CFG.mapHome.world;
      return singleHome();
    }
    var initialHome = homeViewFor(null);

    var map = L.map('map', {
      worldCopyJump: false, dragging: true, touchZoom: true, doubleClickZoom: false,
      scrollWheelZoom: true, minZoom: 2, maxZoom: 9, zoomControl: true, attributionControl: true
    }).setView(initialHome.center, initialHome.zoom);

    L.tileLayer('https://mapidesk-tile-cache.abhikr18996.workers.dev/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19, keepBuffer: 4, updateWhenZooming: false, crossOrigin: true
    }).addTo(map);
    L.tileLayer('https://mapidesk-tile-cache.abhikr18996.workers.dev/light_only_labels/{z}/{x}/{y}{r}.png', {
      minZoom: 4, maxZoom: 19, keepBuffer: 4, updateWhenZooming: false, crossOrigin: true
    }).addTo(map);

    var tilesLoaded = false;
    map.eachLayer(function (l) { if (l._url && l._url.indexOf('light_nolabels') > -1) l.on('load', function () { tilesLoaded = true; hideLoader(); }); });
    function hideLoader() { var el = document.getElementById('map-loading'); if (el) el.classList.add('hidden'); }
    setTimeout(function () { if (!tilesLoaded) hideLoader(); }, 2500);

    if (CFG.showIndiaBoundary) {
      (function loadBoundary() {
        (function tryNext(i) {
          if (i >= CFG.boundaryDataUrls.length) { console.warn('India boundary: all sources failed.'); return; }
          fetch(CFG.boundaryDataUrls[i]).then(function (res) {
            if (!res.ok) throw new Error('bad response');
            return res.json();
          }).then(function (geo) {
            L.geoJSON(geo, { interactive: false, style: { color: '#D4A853', weight: 2.2, opacity: 1, fillColor: '#D4A853', fillOpacity: 0.06 } }).addTo(map);
          }).catch(function () { tryNext(i + 1); });
        })(0);
      })();
    }

    var indiaStatesGeo = null, worldCountriesGeo = null;
    function loadGeoSet(urls, assign) {
      (function tryNext(i) {
        if (i >= urls.length) { console.warn('Region overlay: all sources failed for', urls); return; }
        fetch(urls[i]).then(function (res) {
          if (!res.ok) throw new Error('bad response');
          return res.json();
        }).then(function (geo) { assign(geo); }).catch(function () { tryNext(i + 1); });
      })(0);
    }
    if (needsStates) loadGeoSet(CFG.statesDataUrls, function (g) { indiaStatesGeo = g; });
    if (needsCountries) loadGeoSet(CFG.countriesDataUrls, function (g) { worldCountriesGeo = g; });

    function stateFeatureMatches(feature, targetName) {
      var props = (feature && feature.properties) || {};
      var raw = props.NAME_1 || props.ST_NM || props.st_nm || props.name || props.NAME || props.State || props.state || '';
      var fn = String(raw).toLowerCase().trim(), tgt = targetName.toLowerCase().trim();
      if (fn === tgt) return true;
      var aliases = STATE_ALIASES[tgt];
      return !!(aliases && aliases.indexOf(fn) > -1);
    }
    function countryFeatureMatches(feature, targetName) {
      var props = (feature && feature.properties) || {};
      var raw = props.name || props.NAME || props.ADMIN || props.admin || '';
      var fn = String(raw).toLowerCase().trim(), tgt = targetName.toLowerCase().trim();
      if (fn === tgt) return true;
      var aliases = COUNTRY_ALIASES[tgt];
      return !!(aliases && aliases.indexOf(fn) > -1);
    }
    function geoAndMatcherFor(regionType) {
      return regionType === 'country'
        ? { geo: worldCountriesGeo, matcher: countryFeatureMatches }
        : { geo: indiaStatesGeo, matcher: stateFeatureMatches };
    }

    function highlightAnswer(round, cls) {
      if (!round.region || !round.region.names || !round.region.names.length) return;
      var gm = geoAndMatcherFor(round.region.type);
      if (!gm.geo) return;
      var color = VERDICT_HIGHLIGHT_COLOR[cls] || '#D4A853';
      round.region.names.forEach(function (name) {
        var feature = gm.geo.features.find(function (f) { return gm.matcher(f, name); });
        if (!feature) return;
        var layer;
        try {
          layer = L.geoJSON(feature, { interactive: false, style: { color: color, weight: 2, opacity: 0.9, fillColor: color, fillOpacity: 0.16 } }).addTo(map);
        } catch (e) { return; }
        revealLayers.push(layer);
        try {
          var center = layer.getBounds().getCenter();
          var label = L.marker(center, {
            icon: L.divIcon({ className: '', html: '<div class="country-label" style="--clabel-color:' + color + '">' + name + '</div>', iconSize: [0, 0] }),
            interactive: false
          }).addTo(map);
          revealLayers.push(label);
        } catch (e) {}
      });
    }

    function isInsideAnswerRegion(gLatLng, round) {
      if (!round.region) return false;
      var gm = geoAndMatcherFor(round.region.type);
      if (!gm.geo) return false;
      var lat = gLatLng[0], lng = gLatLng[1];
      return round.region.names.some(function (name) {
        var feature = gm.geo.features.find(function (f) { return gm.matcher(f, name); });
        return feature ? pointInGeoJSONPolygon(lng, lat, feature.geometry) : false;
      });
    }

    /* ---------------- Icons ---------------- */
    function pinIcon(color) {
      return L.divIcon({
        className: '',
        html: '<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">' +
          '<path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="' + color + '"/>' +
          '<circle cx="13" cy="13" r="5" fill="#fff"/></svg>',
        iconSize: [26, 34], iconAnchor: [13, 34]
      });
    }
    var GUESS_ICON = pinIcon('#F2545F');

    function siteDivIcon(color) {
      var html = '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.28));">' +
        '<svg width="36" height="26" viewBox="0 0 36 26" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M1 9c3-4 6-4 9 0s6 4 9 0 6-4 9 0 6 4 7 4" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M1 16c3-4 6-4 9 0s6 4 9 0 6-4 9 0 6 4 7 4" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>' +
        '</svg></div>';
      return L.divIcon({ className: '', html: html, iconSize: [36, 26], iconAnchor: [18, 13] });
    }

    /* ---------------- Game state ---------------- */
    var order = [], roundIdx = 0, scores = [], results = [];
    var guessed = false, guessMarker = null, revealLayers = [];
    var mode = 'own', rival = null, currentGameCode = null, challengeCreated = false, resultPosted = false;
    var currentAvgScore = 0, pendingChallenge = null;

    function shuffleIdx(n, count) {
      var a = Array.from({ length: n }, function (_, i) { return i; });
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return typeof count === 'number' ? a.slice(0, count) : a;
    }
    function setupDots() {
      var dots = document.getElementById('dots');
      dots.innerHTML = order.map(function (_, i) { return '<div class="dot" id="dot-' + i + '"></div>'; }).join('');
    }
    function updateDots() {
      order.forEach(function (_, i) {
        var d = document.getElementById('dot-' + i);
        d.classList.toggle('done', i < roundIdx);
        d.classList.toggle('now', i === roundIdx);
      });
    }
    function setMapVisible(visible) { document.getElementById('map-viewport').classList.toggle('screen-covered', !visible); }
    setMapVisible(false);

    window.startFreshGame = function () {
      mode = 'own'; rival = null; currentGameCode = null; challengeCreated = false; resultPosted = false;
      order = shuffleIdx(CFG.rounds.length, Math.min(CFG.roundsPerGame, CFG.rounds.length));
      beginRound();
    };

    function beginRound() {
      roundIdx = 0; scores = []; results = [];
      document.getElementById('screen-start').classList.add('hidden');
      document.getElementById('screen-end').classList.add('hidden');
      document.getElementById('challenge-flag').classList.toggle('show', mode === 'challenge');
      setMapVisible(true);
      setHeaderVisible(false);
      setupDots();
      loadRound();
      setTimeout(function () { map.invalidateSize(); }, 50);
    }

    function clearRevealLayers() {
      revealLayers.forEach(function (l) { try { map.removeLayer(l); } catch (e) {} });
      revealLayers = [];
    }

    function loadRound() {
      guessed = false;
      clearRevealLayers();
      if (guessMarker) { map.removeLayer(guessMarker); guessMarker = null; }
      var round = CFG.rounds[order[roundIdx]];
      var home = homeViewFor(round.scope);
      map.stop();
      map.flyTo(home.center, home.zoom, { duration: 0.6, easeLinearity: 0.25 });
      document.getElementById('feedback').classList.remove('show');
      document.getElementById('legend-line').style.display = 'none';
      document.getElementById('rival-line').style.display = 'none';
      document.getElementById('lock-btn').style.display = 'none';
      document.getElementById('next-btn').style.display = 'none';
      document.getElementById('tap-hint').style.display = 'flex';
      document.getElementById('round-label').textContent = 'Round ' + (roundIdx + 1) + ' of ' + order.length;
      document.getElementById('strait-name').textContent = round.question || round.name;
      document.getElementById('strait-region').textContent = round.subtitle || '';
      var badge = document.getElementById('scope-badge');
      if (badge) {
        if (isDualScope) {
          if (round.scope === 'world') { badge.textContent = '🌍 World Focus'; badge.className = 'scope-badge world'; }
          else { badge.textContent = '🇮🇳 India Focus'; badge.className = 'scope-badge india'; }
          badge.style.display = '';
        } else { badge.style.display = 'none'; }
      }
      updateDots();
    }

    function onMapClick(e) {
      if (guessed) return;
      if (!guessMarker) guessMarker = L.marker(e.latlng, { icon: GUESS_ICON, draggable: true, autoPan: true }).addTo(map);
      else guessMarker.setLatLng(e.latlng);
      document.getElementById('tap-hint').style.display = 'none';
      document.getElementById('lock-btn').style.display = 'inline-block';
    }
    map.on('click', onMapClick);

    /* ---------------- Distance / geometry math ---------------- */
    function toXY(lat, lng, refLat) {
      var R = 6371;
      return { x: (lng * Math.PI / 180) * R * Math.cos(refLat * Math.PI / 180), y: (lat * Math.PI / 180) * R };
    }
    function nearestOnSegment(p, a, b) {
      var refLat = (p[0] + a[0] + b[0]) / 3;
      var P = toXY(p[0], p[1], refLat), A = toXY(a[0], a[1], refLat), B = toXY(b[0], b[1], refLat);
      var ABx = B.x - A.x, ABy = B.y - A.y, APx = P.x - A.x, APy = P.y - A.y;
      var len2 = ABx * ABx + ABy * ABy;
      var t = len2 === 0 ? 0 : (APx * ABx + APy * ABy) / len2;
      t = Math.max(0, Math.min(1, t));
      var Cx = A.x + t * ABx, Cy = A.y + t * ABy, dx = P.x - Cx, dy = P.y - Cy;
      return { dist: Math.sqrt(dx * dx + dy * dy), latlng: [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] };
    }
    function pointInPolygon(point, vs) {
      var x = point[1], y = point[0], inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][1], yi = vs[i][0], xj = vs[j][1], yj = vs[j][0];
        var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }
    function pointInGeoJSONPolygon(lng, lat, geometry) {
      function ringContains(ring, x, y) {
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
          var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }
      function polygonContains(coords, x, y) {
        if (!ringContains(coords[0], x, y)) return false;
        for (var k = 1; k < coords.length; k++) if (ringContains(coords[k], x, y)) return false;
        return true;
      }
      if (geometry.type === 'Polygon') return polygonContains(geometry.coordinates, lng, lat);
      if (geometry.type === 'MultiPolygon') return geometry.coordinates.some(function (poly) { return polygonContains(poly, lng, lat); });
      return false;
    }
    function nearestOnPaths(p, paths) {
      for (var i = 0; i < paths.length; i++) if (pointInPolygon(p, paths[i])) return { dist: 0, latlng: p };
      var best = null;
      paths.forEach(function (path) {
        for (var i = 0; i < path.length - 1; i++) {
          var r = nearestOnSegment(p, path[i], path[i + 1]);
          if (!best || r.dist < best.dist) best = r;
        }
      });
      return best;
    }

    /* ---------------- Scoring ---------------- */
    function scaleFor(round) {
      if (CFG.scoring.mode === 'byScope' && round.scope && CFG.scoring.scales[round.scope]) return CFG.scoring.scales[round.scope];
      return CFG.scoring.scale || defaultScale();
    }
    function scoreFor(km, scale) { return Math.max(0, Math.round(100 - km / scale.divisor)); }
    function verdictFor(km, scale) {
      for (var i = 0; i < scale.thresholds.length; i++) {
        var t = scale.thresholds[i];
        if (i === 0 ? km <= t.max : km < t.max) return t;
      }
      return scale.fallback;
    }

    function animateCount(el, to, duration) {
      duration = duration || 900;
      var startTime = performance.now();
      function tick(now) {
        var p = Math.min(1, (now - startTime) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased) + '%';
        if (p < 1) requestAnimationFrame(tick); else el.textContent = to + '%';
      }
      requestAnimationFrame(tick);
    }

    function triggerRoundEffect(cls) {
      var feedback = document.getElementById('feedback');
      var scorePill = document.querySelector('.score-pill');
      var mapViewport = document.getElementById('map-viewport');
      if (cls === 'good') {
        fireConfetti({ count: 26, maxFrames: 90, spread: 0.35 });
        [feedback, scorePill].forEach(function (el) {
          if (!el) return;
          el.classList.remove('fx-pulse-good'); void el.offsetWidth;
          el.classList.add('fx-pulse-good');
          setTimeout(function () { el.classList.remove('fx-pulse-good'); }, 900);
        });
      } else if (cls === 'bad') {
        [mapViewport, feedback].forEach(function (el) {
          if (!el) return;
          el.classList.remove('fx-shake'); void el.offsetWidth;
          el.classList.add('fx-shake');
          setTimeout(function () { el.classList.remove('fx-shake'); }, 550);
        });
        feedback.classList.remove('fx-flash-bad'); void feedback.offsetWidth;
        feedback.classList.add('fx-flash-bad');
        setTimeout(function () { feedback.classList.remove('fx-flash-bad'); }, 550);
      } else if (feedback) {
        feedback.classList.remove('fx-pulse-mid'); void feedback.offsetWidth;
        feedback.classList.add('fx-pulse-mid');
        setTimeout(function () { feedback.classList.remove('fx-pulse-mid'); }, 700);
      }
    }

    window.lockGuess = function () {
      if (guessed || !guessMarker) return;
      guessed = true;
      var round = CFG.rounds[order[roundIdx]];
      var gll = guessMarker.getLatLng();
      var gLatLng = [gll.lat, gll.lng];
      var nearest = nearestOnPaths(gLatLng, round.paths);
      var km = Math.round(nearest.dist);
      var scale = scaleFor(round);
      var insideRegion = km > 0 && isInsideAnswerRegion(gLatLng, round);
      var scoringKm = insideRegion ? Math.min(km, scale.insideCap) : km;
      var v = verdictFor(scoringKm, scale);
      var pts = scoreFor(scoringKm, scale);
      scores.push(pts);
      results.push({ name: round.name, km: km, pts: pts, cls: v.cls });

      document.getElementById('lock-btn').style.display = 'none';
      var boundsPoints = [gLatLng];
      round.paths.forEach(function (path) { path.forEach(function (pt) { boundsPoints.push(pt); }); });
      var bounds = L.latLngBounds(boundsPoints);

      var revealed = false;
      function fireReveal() {
        if (revealed) return;
        revealed = true;
        revealResult(round, gLatLng, nearest, km, v, pts);
      }
      map.once('moveend', fireReveal);
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: round.scope === 'world' ? 7 : 8, duration: 1.1, easeLinearity: 0.25 });
      setTimeout(fireReveal, 1600);
    };

    function revealResult(round, gLatLng, nearest, km, v, pts) {
      clearRevealLayers();
      round.paths.forEach(function (path, i) {
        var line = L.polyline(path, { color: '#D4A853', weight: 4, opacity: 0.92 }).addTo(map);
        revealLayers.push(line);
        if (i === 0) {
          var mid = path[Math.floor(path.length / 2)];
          var label = L.marker(mid, { icon: L.divIcon({ className: '', html: '<div class="line-label">' + round.name + '</div>', iconSize: [0, 0] }), interactive: false }).addTo(map);
          revealLayers.push(label);
        }
      });

      highlightAnswer(round, v.cls);

      var centerColor = VERDICT_HIGHLIGHT_COLOR[v.cls] || '#D4A853';
      var siteMarker = L.marker(centerOfPaths(round.paths), { icon: siteDivIcon(centerColor), interactive: false }).addTo(map);
      revealLayers.push(siteMarker);

      var connector = L.polyline([gLatLng, nearest.latlng], { color: '#F2545F', weight: 2, opacity: 0.85, dashArray: '6,6' }).addTo(map);
      revealLayers.push(connector);

      document.getElementById('verdict-text').innerHTML = VERDICT_ICONS[v.icon] + ' ' + v.label + '  (' + (km === 0 ? 'right on it' : km + ' km off') + ' · +' + pts + ' pts)';
      document.getElementById('verdict-text').className = 'verdict ' + v.cls;
      document.getElementById('fact-text').textContent = round.fact;
      document.getElementById('legend-line').textContent = CFG.legendLine;
      document.getElementById('legend-line').style.display = 'flex';

      var rivalLine = document.getElementById('rival-line');
      if (mode === 'challenge' && rival && Array.isArray(rival.pts)) {
        var theirPts = rival.pts[roundIdx];
        if (pts > theirPts) rivalLine.textContent = 'You beat your rival on this one — they scored +' + theirPts + ' pts here.';
        else if (pts < theirPts) rivalLine.textContent = 'Your rival had the edge here — they scored +' + theirPts + ' pts.';
        else rivalLine.textContent = 'Dead even with your rival on this target — +' + theirPts + ' pts each.';
        rivalLine.style.display = 'block';
      }

      document.getElementById('feedback').classList.add('show');
      document.getElementById('next-btn').style.display = 'inline-block';
      document.getElementById('next-btn').textContent = roundIdx === order.length - 1 ? 'See Results →' : 'Next Target →';

      var avg = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
      document.getElementById('score-live').textContent = avg + '%';

      updateDots();
      triggerRoundEffect(v.cls);
    }

    window.nextRound = function () {
      roundIdx++;
      if (roundIdx >= order.length) { endGame(); return; }
      loadRound();
    };

    function endGame() {
      var avg = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
      currentAvgScore = avg;
      animateCount(document.getElementById('final-score'), avg);

      var heroIcon = document.getElementById('score-hero-icon');
      if (heroIcon) heroIcon.innerHTML = avg >= 65 ? TROPHY_ICON : '<svg viewBox="0 0 24 24"><path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z"/></svg>';

      var sorted = CFG.outroMessages.slice().sort(function (a, b) { return b.min - a.min; });
      var msg = (sorted.find(function (m) { return avg >= m.min; }) || { text: '' }).text;
      document.getElementById('final-msg').textContent = msg;

      var vsBlock = document.getElementById('vs-block');
      var vsCard = document.getElementById('vs-card');
      vsCard.classList.remove('fx-winner');

      var scoreHeroEl = document.getElementById('score-hero');
      var endKickerEl = document.getElementById('end-kicker');
      var finalMsgEl = document.getElementById('final-msg');

      if (mode === 'challenge') {
        if (scoreHeroEl) scoreHeroEl.style.display = 'none';
        if (finalMsgEl) finalMsgEl.style.marginTop = '28px';
      } else {
        if (scoreHeroEl) scoreHeroEl.style.display = '';
        if (endKickerEl) endKickerEl.textContent = 'Mission Complete';
        if (finalMsgEl) finalMsgEl.style.marginTop = '';
      }

      if (mode === 'challenge' && rival) {
        vsBlock.style.display = 'block';
        document.getElementById('vs-rival-name').textContent = rival.name;
        animateCount(document.getElementById('vs-rival-score'), rival.score, 700);
        setTimeout(function () { animateCount(document.getElementById('vs-you-score'), avg, 700); }, 250);

        var vb = document.getElementById('verdict-box');
        vb.classList.remove('win', 'lose', 'tie');
        if (avg > rival.score) {
          vb.innerHTML = TROPHY_ICON + ' You out-read your rival!';
          vb.classList.add('win'); vsCard.classList.add('fx-winner');
          fireConfetti({ count: 110, maxFrames: 230, spread: 1 });
        } else if (avg < rival.score) {
          vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> Your rival read it closer. Chart again!';
          vb.classList.add('lose');
        } else {
          vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/></svg> Dead even — perfectly matched navigators.';
          vb.classList.add('tie');
        }
        renderBreakdown(scores, rival.pts);
        postMyResultOnce(currentGameCode, avg, scores);
      } else {
        vsBlock.style.display = 'none';
        renderSoloBreakdown();
        if (avg >= 85) fireConfetti({ count: 70, maxFrames: 200, spread: 1 });
      }

      resetChallengeLinkUI();
      document.getElementById('screen-end').classList.remove('hidden');
      setMapVisible(false);
      setHeaderVisible(true);
    }

    function renderBreakdown(myPts, theirPts) {
      var box = document.getElementById('breakdown-list');
      box.innerHTML = '';
      order.forEach(function (rIdx, i) {
        var mine = myPts[i], theirs = Array.isArray(theirPts) ? theirPts[i] : null;
        var row = document.createElement('div');
        row.className = 'b-row';
        row.style.animationDelay = (i * 0.05) + 's';
        if (theirs === null || theirs === undefined) {
          row.innerHTML = '<span class="b-name">' + CFG.rounds[rIdx].name + '</span><span class="b-marks"><span class="b-mk ok">' + mine + '</span></span>';
        } else {
          row.innerHTML = '<span class="b-name">' + CFG.rounds[rIdx].name + '</span><span class="b-marks">' +
            '<span class="b-mk ' + (theirs > mine ? 'ok' : 'no') + '" title="Rival">' + theirs + '</span>' +
            '<span class="b-mk ' + (mine >= theirs ? 'ok' : 'no') + '" title="You">' + mine + '</span></span>';
        }
        box.appendChild(row);
      });
    }
    function renderSoloBreakdown() {
      var box = document.getElementById('breakdown-list');
      box.innerHTML = '';
      results.forEach(function (r, i) {
        var row = document.createElement('div');
        row.className = 'b-row';
        row.style.animationDelay = (i * 0.05) + 's';
        row.innerHTML = '<span class="b-idx">' + (i + 1) + '</span><span class="b-name">' + r.name + '</span>' +
          '<span class="b-dist">' + r.km + ' km off</span><span class="b-pts ' + r.cls + '">+' + r.pts + '</span>';
        box.appendChild(row);
      });
    }

    /* ============================================================
       API HELPERS — Cloudflare Worker (shared KV across all games)
       ============================================================ */
    function randomCode() {
      var chars = 'abcdefghijklmnopqrstuvwxyz0123456789', out = '';
      for (var i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
      return out;
    }
    function namespacedCode(rawCode) { return CFG.gameType + ':' + rawCode; }

    function createChallengeOnDemand(avgScore, myScores) {
      if (challengeCreated && currentGameCode) return Promise.resolve(currentGameCode);
      var gameCode = namespacedCode(randomCode());
      return fetch(CFG.apiBase + '/game/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode: gameCode, challengerName: 'A navigator', challengerScore: avgScore, challengerResults: myScores, order: order })
      }).then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
        .then(function (r) {
          if (!r.res.ok) throw new Error(r.data.error || 'Could not create challenge link.');
          challengeCreated = true; currentGameCode = gameCode;
          return gameCode;
        });
    }

    function postMyResultOnce(gameCode, avgScore, myScores) {
      if (!gameCode) return;
      var flagKey = 'posted-' + gameCode;
      if (resultPosted || sessionStorage.getItem(flagKey)) return;
      resultPosted = true;
      sessionStorage.setItem(flagKey, '1');
      fetch(CFG.apiBase + '/game/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode: gameCode, challengedName: 'A navigator', challengedScore: avgScore, challengedResults: myScores })
      }).catch(function (e) { console.warn('Could not post result:', e); });
    }

    function fetchGame(gameCode) {
      var cacheKey = 'game-' + gameCode;
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) { try { return Promise.resolve(JSON.parse(cached)); } catch (e) {} }
      return fetch(CFG.apiBase + '/game/get?gameCode=' + encodeURIComponent(gameCode))
        .then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
        .then(function (r) {
          if (!r.res.ok) throw new Error(r.data.error || 'Challenge not found.');
          sessionStorage.setItem(cacheKey, JSON.stringify(r.data));
          return r.data;
        });
    }

    var MY_CHALLENGES_KEY = 'my-challenges-' + CFG.gameType;
    var CHALLENGE_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000;
    function myChallenges() { try { return JSON.parse(localStorage.getItem(MY_CHALLENGES_KEY) || '{}'); } catch (e) { return {}; } }
    function saveMyChallenge(gameCode, avg, scoreArr) {
      var all = myChallenges();
      var now = Date.now();
      Object.keys(all).forEach(function (key) {
        if (!all[key].savedAt || (now - all[key].savedAt) > CHALLENGE_MAX_AGE_MS) delete all[key];
      });
      all[gameCode] = { avg: avg, scores: scoreArr, savedAt: now };
      try { localStorage.setItem(MY_CHALLENGES_KEY, JSON.stringify(all)); }
      catch (e) { console.warn('Could not save challenge locally (storage quota?):', e); }
    }

    window.checkForReply = function () {
      if (!currentGameCode) return;
      var btn = document.getElementById('check-reply-btn');
      btn.disabled = true; btn.textContent = 'Checking…';
      sessionStorage.removeItem('game-' + currentGameCode);
      fetchGame(currentGameCode).then(function (data) {
        if (data.status === 'completed' && data.challengedResults) showReplyComparison(data);
        else showToast("They haven't played yet — check back later");
      }).catch(function () { showToast('Could not check right now'); })
        .then(function () { btn.disabled = false; btn.textContent = "Check if they've replied"; });
    };

    function showReplyComparison(data) {
      rival = { name: data.challengedName || 'A navigator', score: data.challengedScore, pts: data.challengedResults };
      document.getElementById('vs-block').style.display = 'block';
      document.getElementById('vs-rival-name').textContent = rival.name;
      animateCount(document.getElementById('vs-rival-score'), rival.score, 700);
      animateCount(document.getElementById('vs-you-score'), currentAvgScore, 700);
      var vb = document.getElementById('verdict-box');
      vb.classList.remove('win', 'lose', 'tie');
      var vsCard = document.getElementById('vs-card');
      vsCard.classList.remove('fx-winner');
      if (currentAvgScore > rival.score) {
        vb.innerHTML = TROPHY_ICON + ' You out-read them!';
        vb.classList.add('win'); vsCard.classList.add('fx-winner');
        fireConfetti({ count: 110, maxFrames: 230, spread: 1 });
      } else if (currentAvgScore < rival.score) {
        vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 8l-5 3-1 5 5-3z"/><circle cx="12" cy="12" r="9"/></svg> They read it closer this time.';
        vb.classList.add('lose');
      } else {
        vb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/></svg> Dead even!';
        vb.classList.add('tie');
      }
      renderBreakdown(scores, rival.pts);
      document.getElementById('check-reply-btn').style.display = 'none';
    }

    /* ---------------- Challenge link build / share ---------------- */
    function resetChallengeLinkUI() {
      var linkInput = document.getElementById('challenge-link');
      var copyBtn = document.getElementById('copy-link-btn');
      linkInput.value = '';
      linkInput.placeholder = 'Tap Copy to generate your link…';
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('copied');
      copyBtn.disabled = false;
      ['wa-share', 'tg-share'].forEach(function (id) { document.getElementById(id).classList.add('disabled'); });
    }
    function buildLinkFromGameCode(gameCode) {
      return window.location.origin + window.location.pathname + '?g=' + encodeURIComponent(gameCode);
    }

    function ensureChallengeLinkReady() {
      var linkInput = document.getElementById('challenge-link');
      if (linkInput.value) return Promise.resolve(linkInput.value);
      var copyBtn = document.getElementById('copy-link-btn');
      copyBtn.disabled = true; copyBtn.textContent = '...';
      return createChallengeOnDemand(currentAvgScore, scores).then(function (gameCode) {
        saveMyChallenge(gameCode, currentAvgScore, scores);
        document.getElementById('check-reply-btn').style.display = 'inline-block';
        var link = buildLinkFromGameCode(gameCode);
        linkInput.value = link;
        var msg = CFG.shareEmoji + ' I just charted the ' + CFG.shareTitle + ' and scored ' + currentAvgScore + '%. Think you can pin it closer? Take the same targets: ' + link;
        document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
        document.getElementById('tg-share').href = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(CFG.shareEmoji + ' Think you can beat my ' + CFG.shareTitle + ' score of ' + currentAvgScore + '%?');
        ['wa-share', 'tg-share'].forEach(function (id) { document.getElementById(id).classList.remove('disabled'); });
        copyBtn.disabled = false; copyBtn.textContent = 'Copy';
        return link;
      }).catch(function (e) {
        copyBtn.disabled = false; copyBtn.textContent = 'Copy';
        showToast('Could not create link — try again');
        throw e;
      });
    }

    window.copyChallengeLink = function () {
      var copyBtn = document.getElementById('copy-link-btn');
      ensureChallengeLinkReady().then(function (link) {
        var input = document.getElementById('challenge-link');
        input.select();
        function done() {
          showToast('Challenge link copied');
          copyBtn.textContent = 'Copied ✓';
          copyBtn.classList.add('copied');
          setTimeout(function () { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1800);
        }
        navigator.clipboard.writeText(link).then(done).catch(function () { document.execCommand('copy'); done(); });
      }).catch(function () {});
    };

    window.handleShareIconClick = function (evt, which) {
      evt.preventDefault();
      ensureChallengeLinkReady().then(function () {
        var href = document.getElementById(which === 'wa' ? 'wa-share' : 'tg-share').href;
        window.open(href, '_blank', 'noopener');
      }).catch(function () {});
      return false;
    };

    function showToast(msg) {
      var t = document.getElementById('toast');
      t.textContent = msg || 'Copied to clipboard';
      t.classList.add('show');
      setTimeout(function () { t.classList.remove('show'); }, 1800);
    }

    /* ---------------- Accepting a challenge ---------------- */
    function parseChallengeString(raw) {
      raw = (raw || '').trim();
      if (!raw) throw new Error('Paste a challenge link first.');
      var g;
      if (raw.indexOf('?') > -1) {
        var qs = raw.split('?').slice(1).join('?');
        g = new URLSearchParams(qs).get('g');
      } else if (/(^|[&?])g=/.test(raw)) {
        g = new URLSearchParams(raw).get('g');
      } else { g = raw; }
      if (!g) throw new Error('This link is missing its challenge code.');
      return g;
    }

    function loadChallengeGame(gameCode, gameData) {
      mode = 'challenge';
      rival = { name: gameData.challengerName || 'A navigator', score: gameData.challengerScore, pts: gameData.challengerResults };
      order = gameData.order;
      currentGameCode = gameCode;
      resultPosted = false;
      beginRound();
    }

    function showChallengeInvite(gameCode, gameData) {
      pendingChallenge = { gameCode: gameCode, gameData: gameData };
      document.getElementById('screen-start').classList.add('hidden');
      document.getElementById('screen-end').classList.add('hidden');
      document.getElementById('invite-rival-name').textContent = gameData.challengerName || 'A navigator';
      document.getElementById('screen-invite').classList.remove('hidden');
      setMapVisible(false);
      setHeaderVisible(true);
    }

    window.acceptChallengeInvite = function () {
      if (!pendingChallenge) return;
      var p = pendingChallenge; pendingChallenge = null;
      document.getElementById('screen-invite').classList.add('hidden');
      loadChallengeGame(p.gameCode, p.gameData);
    };
    window.declineChallengeInvite = function () {
      pendingChallenge = null;
      document.getElementById('screen-invite').classList.add('hidden');
      document.getElementById('screen-start').classList.remove('hidden');
      setHeaderVisible(true);
      try {
        var url = new URL(window.location.href);
        url.searchParams.delete('g');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    };
    window.acceptPastedChallenge = function () {
      var raw = document.getElementById('paste-input').value;
      var errBox = document.getElementById('paste-err');
      errBox.style.display = 'none';
      try {
        var gameCode = parseChallengeString(raw);
        fetchGame(gameCode).then(function (gameData) { showChallengeInvite(gameCode, gameData); })
          .catch(function (e) { errBox.textContent = e.message || 'Could not read that challenge link.'; errBox.style.display = 'block'; });
      } catch (e) {
        errBox.textContent = e.message || 'Could not read that challenge link.';
        errBox.style.display = 'block';
      }
    };

    (function autoDetectChallenge() {
      try {
        var g = new URLSearchParams(window.location.search).get('g');
        if (!g) return;
        var mine = myChallenges();
        if (mine[g]) {
          fetchGame(g).then(function (data) {
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
            if (data.status === 'completed' && data.challengedResults) showReplyComparison(data);
            else { document.getElementById('check-reply-btn').style.display = 'inline-block'; showToast('Still waiting on your friend to play'); }
          }).catch(function (e) { console.warn('Could not load your challenge:', e); });
          return;
        }
        fetchGame(g).then(function (gameData) { showChallengeInvite(g, gameData); })
          .catch(function (e) { console.warn('Could not load challenge from URL:', e); });
      } catch (e) {}
    })();

    /* ---------------- Confetti ---------------- */
    function fireConfetti(opts) {
      opts = opts || {};
      var count = opts.count || 70, maxFrames = opts.maxFrames || 200, spread = opts.spread || 1;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var colors = ['#D4A853', '#EAC072', '#4A9E7A', '#F2545F'];
      var canvas = document.createElement('canvas');
      canvas.id = 'confettiCanvas';
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var midX = canvas.width / 2, halfSpread = (canvas.width * spread) / 2;
      var pieces = Array.from({ length: count }, function () {
        return {
          x: midX + (Math.random() * 2 - 1) * halfSpread, y: -20 - Math.random() * canvas.height * 0.3,
          w: 5 + Math.random() * 4, h: 7 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3, rot: Math.random() * Math.PI, vrot: (Math.random() - 0.5) * 0.3
        };
      });
      var frame = 0;
      function loop() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.rot += p.vrot;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (frame < maxFrames) requestAnimationFrame(loop); else canvas.remove();
      }
      requestAnimationFrame(loop);
    }

    /* ---------------- Resize handling ---------------- */
    var lastKnownWidth = window.innerWidth, resizeSettleTimer = null;
    function handleViewportSettle() {
      clearTimeout(resizeSettleTimer);
      resizeSettleTimer = setTimeout(function () {
        var widthChanged = window.innerWidth !== lastKnownWidth;
        lastKnownWidth = window.innerWidth;
        if (widthChanged) syncNavHeight();
        try { map.invalidateSize(); } catch (e) {}
      }, 150);
    }
    window.addEventListener('resize', handleViewportSettle);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', handleViewportSettle);
    setTimeout(function () { try { map.invalidateSize(); } catch (e) {} }, 200);

    /* ---------------- AdSense ---------------- */
    window.addEventListener('load', function () {
      try {
        document.querySelectorAll('.ad-slot .adsbygoogle').forEach(function () {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      } catch (e) { console.warn('AdSense not ready yet:', e); }
    });
    document.querySelectorAll('.ad-slot').forEach(function (slot) {
      var ins = slot.querySelector('.adsbygoogle');
      if (!ins) return;
      var check = function () { if (ins.getAttribute('data-ad-status') === 'filled') slot.classList.add('ad-filled'); };
      check();
      new MutationObserver(check).observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    });

    /* expose a couple of internals in case a page needs to hook in (rare) */
    MapGame._internal = { map: map, get order() { return order; }, get mode() { return mode; } };
  };
})();
