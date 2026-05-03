var map = L.map('map').setView([37.941658,23.652946],18.5); /*map tiles creation and centering*/
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.zoomControl.remove();
L.control.zoom({
    position: 'bottomleft'
}).addTo(map);
/*custom icons*/
const icons = {
  bus: L.icon({
    iconUrl: 'images/busblue.png',
    iconSize: [40, 40]
  }),

  metroB: L.icon({
    iconUrl: 'images/metro-blue.png',
    iconSize: [40, 40]
  }),

  metroG: L.icon({
    iconUrl: 'images/metro-green.png',
    iconSize: [40, 40]
  }),

  tram: L.icon({
    iconUrl: 'images/tram-orange.png',
    iconSize: [40, 40]
  }),

  proastiakos: L.icon({
    iconUrl: 'images/proastiakos-r.png',
    iconSize: [40, 40]
  }),

  lesxh: L.icon({
    iconUrl: 'images/lesxh.png',
    iconSize: [40, 40]
  }),

  default: L.icon({
    iconUrl: 'images/marker-blue-icon.png',
    iconSize: [25, 41]
  })
};

/*markers*/
let buildingMarkers = [];
let stopMarkers = [];

let layers = {};

/*Buildings*/
fetch('buildings.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      const icon = icons[item.icon] || icons.default;

      let popupContent = `<b>${item.title}</b><br>${item.street}<br>`;
      
      if (item.image) {
        popupContent += `<img src='${item.image}' style='width:100%; height:auto;'><br>`;
      }

      if (item.info) {
        popupContent += `${item.info}<br>`;
      }

      if (item.amea === true) {
        popupContent += `<img src='/images/wheelchair.png' alt="Προσβάσιμο για αναπηρικές καρέκλες" style='width:24px; height:24px; vertical-align:right;'><br>`;
      } else {
        popupContent += `<img src='/images/no-wheelchair.png' alt="Μη-προσβάσιμο για αναπηρικές καρέκλες" style='width:24px; height:24px; vertical-align:right;'><br>`;
      }

      popupContent += `<a href="${item.googlemaps}" target="_blank">Προβολή στο Google Maps</a> | <a href="${item.streetview}">StreetView</a>`;

      let marker = L.marker([item.lat, item.lng], { icon })
        .bindPopup(popupContent);
      
      
      buildingMarkers.push(marker);
      
      if (item.id === "01") { //FIX
        marker = marker.openPopup();
          }
      
    });

    layers.buildings = L.layerGroup(buildingMarkers);
    map.addLayer(layers.buildings);
    updateControl();
});

/*Stops*/
fetch('stops.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      const icon = icons[item.icon] || icons.default;

      const marker = L.marker([item.lat, item.lng], { icon })
        .bindPopup(`<b>${item.title}</b><br>${item.info}<br><a href="${item.googlemaps}" target="_blank">Προβολή στο Google Maps</a> | <a href=${item.streetview}>StreetView</a>`);
      
      stopMarkers.push(marker);
      
    });

    layers.stops = L.layerGroup(stopMarkers);
    map.addLayer(layers.stops);

    updateControl();
});
/*layer control*/
function updateControl() {
  if (Object.keys(layers).length < 2) return;

  L.control.layers({}, layers).addTo(map);
}

