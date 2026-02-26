const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 3
});

const bounds = [[0,0], [2000,2000]];
L.imageOverlay('images/map2.jpg', bounds).addTo(map);
map.fitBounds(bounds);

// Icônes
const icons = {
  ACTI: L.icon({ iconUrl: 'icons/ACTI.png', iconSize: [28,28] }),
  ACTII: L.icon({ iconUrl: 'icons/ACTII.png', iconSize: [28,28] }),
  ACTIII: L.icon({ iconUrl: 'icons/ACTIII.png', iconSize: [28,28] }),
  CAMPEMENT: L.icon({ iconUrl: 'icons/CAMPEMENT.png', iconSize: [28,28] }),
  FOURBE: L.icon({ iconUrl: 'icons/FOURBE.png', iconSize: [28,28] }),
  HAND: L.icon({ iconUrl: 'icons/HAND.png', iconSize: [28,28] }),
  MINE: L.icon({ iconUrl: 'icons/MINE.png', iconSize: [28,28] }),
  POI: L.icon({ iconUrl: 'icons/POI.png', iconSize: [28,28] }),
  QUEST: L.icon({ iconUrl: 'icons/QUEST.png', iconSize: [28,28] }),
  TEMPLIS: L.icon({ iconUrl: 'icons/TEMPLIS.png', iconSize: [28,28] }),
  SCIERIE: L.icon({ iconUrl: 'icons/SCIERIE.png', iconSize: [28,28] })
};

let points = [];

// Charger les points existants
fetch('data/points.json')
  .then(res => res.json())
  .then(data => {
    points = data;
    points.forEach(addMarkerFromData);
  });

function addMarkerFromData(p) {
  const marker = L.marker(p.coords, {
    icon: icons[p.type] || icons.Libre1
  }).addTo(map);

  marker.bindPopup(
    `<b>${p.name}</b><br>${p.description}<br><i>${p.type}</i>`
  );
}

// Ajout par clic
map.on('click', function(e) {
  const name = prompt("Nom du lieu :");
  if (!name) return;

  const description = prompt("Description RP :") || "";
  const type = prompt(
    "Type (ACTI, ACTII, ACTIII, CAMPEMENT, FOURBE, HAND, MINE, POI, QUEST, TEMPLIS, SCIERIE) :",
    "Camp"
  );

  const point = {
    name,
    description,
    type,
    coords: [e.latlng.lat, e.latlng.lng]
  };

  points.push(point);
  addMarkerFromData(point);
});

// Export JSON
document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(points, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "points.json";
  a.click();

  URL.revokeObjectURL(url);
});