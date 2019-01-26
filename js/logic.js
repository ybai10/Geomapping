function toColor(mag) {
  if (mag < 1) return '#7AAC4B';
  if (mag < 2) return '#FDB03C';
  if (mag < 3) return '#F15A25';
  if (mag < 4) return '#F0452B';
  if (mag < 5) return '#EB1B2B';
  return '#A11252'; //5+
}

function toRadius(mag) {
  if (mag < 1) return 5;
  if (mag < 2) return 10; 
  if (mag < 3) return 16;
  if (mag < 4) return 25;
  if (mag < 5) return 35;
  return 50;
}

// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

// Create the map with our layers
var map = L.map("map-id", {
  center: [33,67],
  zoom: 6,
});

// Add our 'lightmap' tile layer to the map
lightmap.addTo(map);

// Create a legend to display information about our map
var info = L.control({
  position: "bottomright"
});

info.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend");
  var mags = [0, 1, 2, 3, 4, 5];
  var labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];

  for (var i = 0; i < mags.length; i++) {
    div.innerHTML +=
      `<i style="background: ${toColor(mags[i])}"></i>${labels[i]}<br>`;
  }
  return div;
}

// Add the info legend to the map
info.addTo(map);

var jsonUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
d3.json(jsonUrl, function (json) {
  var panned = false;
  // console.log(json);
  for (feature of json.features) {
    var prop = feature.properties;
    if (prop.type != "earthquake") continue;

    var color = toColor(prop.mag);
    var coord = feature.geometry.coordinates;

    // Create a new marker
    // Pass in some initial options, and then add it to the map using the addTo method
    var marker = L.circleMarker([coord[1], coord[0]], {
      color: "grey",
      fillColor: color,
      title: prop.title,
      fillOpacity: 0.75,
      radius: toRadius(prop.mag),
      weight: 1, // stroke weight
    }).addTo(map);

    marker.bindPopup(`<a href="${prop.url}" target="_blank">${prop.title}</a>`);
  }
});

// Update the legend's innerHTML with the last updated time and station count
function updateLegend(time, stationCount) {
  document.querySelector(".legend").innerHTML = [
    "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
    "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
    "<p class='coming-soon'>Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
    "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
    "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
    "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>"
  ].join("");
}
