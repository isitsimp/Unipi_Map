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



let flag = "Greek"; // Default

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  // If the URL contains 'en', set flag to English
  if (path.includes('en')) {
    flag = "English";
  } else {
    flag = "Greek";
  }

/*Buildings*/
  fetch('buildings.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const icon = icons[item.icon] || icons.default;

        let building;
        if (flag === "Greek") {
          building = `<b>${item.title}</b><br>${item.street}<br>`;
        } else {
          //English fields
          building = `<b>${item.title_en}</b><br>${item.street_en}<br>`;
        }
        let popupContent = building;

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

        if (item.id === "01") { //FIX
          let marker = L.marker([item.lat, item.lng], { icon })
          .bindPopup(popupContent).openPopup();
          }
        buildingMarkers.push(marker);


      });

      layers.buildings = L.layerGroup(buildingMarkers);
      map.addLayer(layers.buildings);
      updateControl();
    })
    .catch(error => console.error('Error loading buildings:', error));
});
                          
                          
/*Stops*/
fetch('stops.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      const icon = icons[item.icon] || icons.default;
      
      let popupContent = `<b>${item.title}</b><br>${item.info}<br><a href="${item.googlemaps}" target="_blank">Προβολή στο Google Maps</a> | <a href=${item.streetview}>StreetView</a>`;

      if (item.arrivals) {
        popupContent += `<br><a href="${item.arrivals}" target="_blank">Δρομολόγια</a>`;
      }
      
      const marker = L.marker([item.lat, item.lng], { icon })
        .bindPopup(popupContent);
      
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

