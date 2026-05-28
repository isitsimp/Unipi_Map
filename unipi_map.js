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
  
  main: L.icon({
    iconUrl: 'images/main-pin.png',
    iconSize: [65, 65]
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

  const markerLookup = {};
  
/*Buildings*/
  fetch('buildings.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        const id = item.id;
        const icon = icons[item.icon] || icons.default;

        let building;
        if (flag === "Greek") {
          building = `<b>${item.title}</b><br>${item.street}<br>`;
        } else { //English fields
          building = `<b>${item.title_en}</b><br>${item.street_en}<br>`;
        }
        let popupContent = building;

        if (item.image) {
          popupContent += `<img src='${item.image}' style='width:100%; height:auto;'><br>`;
        }

        let information;
        if (flag === "Greek") {
          information = `${item.info}<br>`;
        } else { //English fields
          information = `${item.info_en}<br>`;
        }
        popupContent += information;
       
        if (item.amea === true) {
          popupContent += `<img src='/images/wheelchair.png' alt="Προσβάσιμο για αναπηρικές καρέκλες" style='width:27px; height:27px; position:relative; bottom:-5px;'><br>`;
        } else { //English fields
          popupContent += `<img src='/images/no-wheelchair.png' alt="Μη-προσβάσιμο για αναπηρικές καρέκλες" style='width:27px; height:27px; position:relative; bottom:-5px;'><br>`;
        }

        popupContent += `<a href="${item.googlemaps}" target="_blank">Google Maps</a><img src='/images/magnifying-glass-location-solid.png' alt="Googlemaps" style='width:27px; height:27px; position:relative; bottom:-5px;'> | <a href="${item.streetview}" target="_blank">StreetView</a><img src='/images/streetview-yellow.png' alt="Streetview" style='width:27px; height:27px; position:relative; bottom:-5px;'>`;
        
        let marker = L.marker([item.lat, item.lng], { icon })
          .bindPopup(popupContent);
        
        item.marker = marker;
        markerLookup[id] = marker;
        
        /*video*/
        const video = document.querySelector("video");
        const mapContainer = document.querySelector(".leaflet-map-pane");
        if (id === "01") { //unipi main building
          marker.on('mouseover', function (e) {//show vid
            video.style.visibility = 'visible';
          });
          marker.on('mouseout', function (e) {//hide vid
            video.style.visibility = 'hidden';
          });
          
          mapContainer.addEventListener('mousemove', function (e) {
            if (video.style.visibility === 'visible') {
              const offsetX = 0; 
              const offsetY = 200;
              video.style.left = (e.clientX + offsetX) + 'px';
              video.style.top = (e.clientY + offsetY) + 'px';
            }
          });
          
        }

        buildingMarkers.push(marker);
      });

      layers.buildings = L.layerGroup(buildingMarkers);
      map.addLayer(layers.buildings);
      updateControl();
    
    
    const drpdownlinks = document.querySelectorAll('.dropdown a');
    
    drpdownlinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault(); ///TRY_OUT
        
        const targetID = this.getAttribute('data-id');
        
        const targetMarker = markerLookup[targetID];
        
        if (targetMarker){
          map.flyTo(targetMarker.getLatLng(), 18, {
            duration: 1.5
          });
          targetMarker.openPopup();
          
          const details = this.closest('details');
          if (details) details.removeAttribute('open');
        }else{
          console.error('Marker not found');
        }
      });    
    });
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
            mmm = `<b>${item.title}</b><br>${item.info}<br><a href="${item.googlemaps}" target="_blank">Προβολή στο Google Maps</a> | <a href=${item.streetview} target="_blank">StreetView</a>`;
          } else {
            //English fields
            mmm = `<b>${item.title_en}</b><br>${item.info_en}<br><a href="${item.googlemaps}" target="_blank">Show in Google Maps</a> | <a href=${item.streetview} target="_blank">StreetView</a>`;
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
