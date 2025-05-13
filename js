// 1) Mapbox token + map setup
mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJoaWxsb3dlIiwiYSI6ImNtOWF2a3VhNjA4d2MyanB2d2NrN2w2d2MifQ.OjQvpqDjoukqqV_79_T_oQ';
const map = new mapboxgl.Map({
  container: 'map',
  style:     'mapbox://styles/mapbox/dark-v10',
  center:    [-95, 40],
  zoom:      3
});

// when the style is ready, switch to globe projection and start plotting
map.on('style.load', () => {
  map.setProjection({ name: 'globe' });
  init();
});

// 2) Full list of warehouse cities (with Delaware spelled out)
const cities = [
  "Seattle, WA","Spokane, WA","Portland, OR","Eugene, OR","Salem, OR",
  "Boise, ID","Missoula, MT","Butte, MT","Billings, MT","Casper, WY",
  "Rapid City, SD","Sioux Falls, SD","Fargo, ND","Bismarck, ND",
  "Omaha, NE","Lincoln, NE","Wichita, KS","Kansas City, KS",
  "Denver, CO","Colorado Springs, CO","Albuquerque, NM","Reno, NV",
  "Las Vegas, NV","Salt Lake City, UT","Phoenix, AZ","Tucson, AZ",
  "Redding, CA","Sacramento, CA","Stockton, CA","Modesto, CA",
  "Fresno, CA","Bakersfield, CA","San Francisco, CA","Oakland, CA",
  "San Jose, CA","Los Angeles, CA","Long Beach, CA","Anaheim, CA",
  "Riverside, CA","San Bernardino, CA","San Diego, CA","Dallas, TX",
  "Fort Worth, TX","Austin, TX","San Antonio, TX","Houston, TX",
  "El Paso, TX","Corpus Christi, TX","Waco, TX","Oklahoma City, OK",
  "Tulsa, OK","Little Rock, AR","Kansas City, MO","St. Louis, MO",
  "Springfield, MO","Des Moines, IA","Cedar Rapids, IA",
  "Minneapolis, MN","St. Paul, MN","Milwaukee, WI","Madison, WI",
  "Green Bay, WI","Chicago, IL","Peoria, IL","Springfield, IL",
  "Indianapolis, IN","Fort Wayne, IN","Detroit, MI","Grand Rapids, MI",
  "Cleveland, OH","Columbus, OH","Cincinnati, OH","Toledo, OH",
  "Louisville, KY","Lexington, KY","Nashville, TN","Memphis, TN",
  "Knoxville, TN","Jackson, MS","Birmingham, AL","Montgomery, AL",
  "Mobile, AL","Atlanta, GA","Macon, GA","Augusta, GA","Columbus, GA",
  "Charlotte, NC","Raleigh, NC","Greensboro, NC","Columbia, SC",
  "Charleston, SC","Miami, FL","Orlando, FL","Tampa, FL",
  "Jacksonville, FL","Richmond, VA","Norfolk, VA","Baltimore, MD",
  "Wilmington, Delaware","Philadelphia, PA","Pittsburgh, PA","Harrisburg, PA",
  "New York, NY","Buffalo, NY","Rochester, NY","Albany, NY",
  "Boston, MA","Worcester, MA","Springfield, MA","Manchester, NH"
];

// 3) Smaller inline SVG warehouse icon (12×12px)
const iconSVG = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="12" height="12" viewBox="0 0 24 24"
     fill="none" stroke="#23F2F5" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
  <path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>
</svg>`;

// 4) Storage for markers and zoom threshold
const markers = [];
const labelZoomThreshold = 6;

// 5) Initialize: geocode each city, plot markers, then set up zoom toggle
async function init() {
  const bounds = new mapboxgl.LngLatBounds();

  for (let name of cities) {
    // forward geocode
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(name)}.json?` +
      `access_token=${mapboxgl.accessToken}&limit=1`
    );
    const { features } = await res.json();
    if (!features.length) continue;

    const [lng, lat] = features[0].geometry.coordinates;
    bounds.extend([lng, lat]);

    // build marker element
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = iconSVG + `<span>${name}</span>`;

    // add to map and store reference
    const m = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map);

    markers.push(m);
  }

  // fit all dots into view
  map.fitBounds(bounds, { padding: 40, maxZoom: 6 });

  // initial label hide/show and zoom listener
  updateLabels();
  map.on('zoom', updateLabels);
}

// 6) toggle label visibility based on zoom
function updateLabels() {
  const z = map.getZoom();
  markers.forEach(m => {
    const lbl = m.getElement().querySelector('span');
    lbl.style.display = (z >= labelZoomThreshold ? 'block' : 'none');
  });
}
