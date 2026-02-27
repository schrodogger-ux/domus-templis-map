// --------------------
// 1️⃣ INIT MAP
// --------------------
const map = L.map('map', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 3 });
const bounds = [[0,0], [2000,2000]];
L.imageOverlay('images/map2.jpg', bounds).addTo(map);
map.fitBounds(bounds);

// --------------------
// 2️⃣ ICÔNES
// --------------------
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

// --------------------
// 3️⃣ FIREBASE
// --------------------
const firebaseConfig = {
  apiKey: "AIzaSyC3hUBH0d-fWZR-P4keDbXp9uZi0Spwc1w",
  authDomain: "domus-templis-map.firebaseapp.com",
  projectId: "domus-templis-map",
  storageBucket: "domus-templis-map.firebasestorage.app",
  messagingSenderId: "928690886299",
  appId: "1:928690886299:web:9c05973478fffc3bad983e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const pointsCol = db.collection("points");

// --------------------
// 4️⃣ CHARGER LES POINTS EXISTANTS
// --------------------
let points = {};
pointsCol.get().then(snapshot => {
  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const marker = L.marker(p.coords, { icon: icons[p.type] || icons.ACTI })
      .addTo(map)
      .bindPopup(`<b>${p.name}</b><br>${p.description}<br><i>${p.type}</i>`);

    marker.on('contextmenu', async () => {
      if (confirm("Supprimer ce point ?")) {
        await pointsCol.doc(docSnap.id).delete();
        map.removeLayer(marker);
        delete points[docSnap.id];
      }
    });

    points[docSnap.id] = marker;
  });
});

// --------------------
// 5️⃣ AJOUT DE POINTS
// --------------------
map.on('click', async e => {
  const name = prompt("Nom du lieu :");
  if (!name) return;
  const description = prompt("Description RP :") || "";
  const type = prompt(
    "Type (ACTI, ACTII, ACTIII, CAMPEMENT, FOURBE, HAND, MINE, POI, QUEST, TEMPLIS, SCIERIE) :",
    "ACTI"
  );

  const docRef = await pointsCol.add({
    name,
    description,
    type,
    coords: [e.latlng.lat, e.latlng.lng]
  });

  const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: icons[type] || icons.ACTI })
    .addTo(map)
    .bindPopup(`<b>${name}</b><br>${description}<br><i>${type}</i>`);

  marker.on('contextmenu', async () => {
    if (confirm("Supprimer ce point ?")) {
      await pointsCol.doc(docRef.id).delete();
      map.removeLayer(marker);
      delete points[docRef.id];
    }
  });

  points[docRef.id] = marker;
});

// --------------------
// 6️⃣ FILTRES avec icônes + propagation désactivée
// --------------------
const filterDiv = L.control({position: 'topright'});
filterDiv.onAdd = function () {
  const div = L.DomUtil.create('div', 'filters');
  div.innerHTML = "<b>Filtres :</b><br>" + 
    Object.keys(icons).map(t => {
      return `<input type="checkbox" class="filter" value="${t}" checked> 
              <img src="icons/${t}.png" width="20" style="vertical-align:middle;margin-right:4px"> ${t}<br>`;
    }).join('');

  // Empêche la map de réagir aux clics sur ce div
  L.DomEvent.disableClickPropagation(div);

  return div;
};
filterDiv.addTo(map);

document.querySelectorAll('.filter').forEach(cb => {
  cb.addEventListener('change', () => {
    Object.values(points).forEach(marker => {
      const type = marker.getPopup().getContent().match(/<i>(.*?)<\/i>/)[1];
      marker.setOpacity(document.querySelector(`.filter[value="${type}"]`).checked ? 1 : 0);
    });
  });
});
