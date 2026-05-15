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
  //English
  if (path.includes('en')) {
    flag = "English";
  } else {
    flag = "Greek";
  }

  let isFirst = true;
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

        let information;
        if (flag === "Greek") {
          information = `${item.info}<br>`;
        } else {
          //English fields
          information = `${item.info_en}<br>`;
        }
        popupContent += information;
       
        if (item.amea === true) {
          popupContent += `<img src='/images/wheelchair.png' alt="Προσβάσιμο για αναπηρικές καρέκλες" style='width:24px; height:24px; vertical-align:right;'><br>`;
        } else {
          popupContent += `<img src='/images/no-wheelchair.png' alt="Μη-προσβάσιμο για αναπηρικές καρέκλες" style='width:24px; height:24px; vertical-align:right;'><br>`;
        }

        let locations;
        if (flag === "Greek") {
          locations = `<a href="${item.googlemaps}" target="_blank">Προβολή στο Google Maps</a> | <a href="${item.streetview}">StreetView</a>`;
        } else {
          //English fields
          locations = `<a href="${item.googlemaps}" target="_blank">Show in Google Maps</a> | <a href="${item.streetview}">StreetView</a>`;
        }
        popupContent += locations;

        let marker = L.marker([item.lat, item.lng], { icon })
          .bindPopup(popupContent);
        
        if (isFirst) {
          console.log("ENTERED");
          marker.openPopup();
          isFirst = false;
        }
        
        buildingMarkers.push(marker);
      });

      layers.buildings = L.layerGroup(buildingMarkers);
      map.addLayer(layers.buildings);
      updateControl();
    })
    .catch(error => console.error('Error loading buildings:', error));
                         
/*Stops*/
  fetch('stops.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const icon = icons[item.icon] || icons.default;

        let mmm;
          if (flag === "Greek") {
            mmm = `<b>${item.title}</b><br>${item.info}<br><a href="${item.googlemaps}" target="_blank">Προβολή στο Google Maps</a> | <a href=${item.streetview}>StreetView</a>`;
          } else {
            //English fields
            mmm = `<b>${item.title_en}</b><br>${item.info_en}<br><a href="${item.googlemaps}" target="_blank">Show in Google Maps</a> | <a href=${item.streetview}>StreetView</a>`;
          }
          let popupContent = mmm;

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
});
/*layer control*/
function updateControl() {
  if (Object.keys(layers).length < 2) return;

  L.control.layers({}, layers).addTo(map);
}
