// Map + POI logic

// ---- CONFIG ----
// Provide your Mapbox access token at runtime. You can set this in the browser console as:
//   window.MAPBOX_TOKEN = "your_token_here";
// Or replace the placeholder below.
window.MAPBOX_TOKEN = window.MAPBOX_TOKEN || "pk.eyJ1IjoibWFobW91ZGFsaTEiLCJhIjoiY2x0cW1rc3dhMDd4dTJpbW8wemp0ZHRyMyJ9.OFxJ3NcR8gGBVzlgVZ_ADw";

// Mapbox raster tiles URL (Leaflet compatible)
const MAPBOX_STYLE_ID = "satellite-v9"; // change to your preferred style
const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(window.MAPBOX_TOKEN)}`;

// ---- UTIL: DMS to decimal degrees ----
/**
 * Convert DMS string like 53°24'15.62"N, 116°20'10.09"W to { lat, lng }
 */
function parseDmsPairToLatLng(dmsPair) {
  if (!dmsPair) return null;
  const [latStr, lngStr] = dmsPair.split(/\s*,\s*/);
  if (!latStr || !lngStr) return null;
  return {
    lat: dmsToDecimal(latStr),
    lng: dmsToDecimal(lngStr),
  };
}

function dmsToDecimal(dms) {
  // Example: 53°24'15.62"N
  const match = dms.trim().match(
    /^(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2}(?:\.\d+)?)"\s*([NSEW])$/i
  );
  if (!match) return NaN;
  const deg = Number(match[1]);
  const min = Number(match[2]);
  const sec = Number(match[3]);
  const hem = match[4].toUpperCase();
  let dec = deg + min / 60 + sec / 3600;
  if (hem === "S" || hem === "W") dec *= -1;
  return dec;
}

// ---- DATA ----
// Each item: { id, name, dms, sv2, mk1, images: [url] }
const POIS = [
  { id: "SE1", name: "SE1", dms: "53°24'15.62\"N, 116°20'10.09\"W", sv2: "2569074", mk1: "953T", images: ['./images/se1.jpg'] },
  { id: "SE2_SLB6", name: "SE2/SLB-6", dms: "53°24'15.70\"N, 116°20'8.82\"W", sv2: "2569135", mk1: "Y8AV", slb: "SN461", images: ['./images/se2.jpg'] },
  { id: "SE3", name: "SE3", dms: "53°24'15.78\"N, 116°20'7.55\"W", sv2: "2569138", mk1: "GBR7", images: ['./images/se3.jpg'] },
  { id: "NE1", name: "NE1", dms: "53°24'18.02\"N, 116°20'9.94\"W", sv2: "2569083", mk1: "PS3R", images: ['./images/ne1.jpg'] },
  { id: "NE2", name: "NE2", dms: "53°24'17.66\"N, 116°20'9.31\"W", sv2: "2569080", mk1: "J4HB", images: ['./images/ne2.jpg'] },
  { id: "NE3", name: "NE3", dms: "53°24'17.17\"N, 116°20'9.19\"W", sv2: "2569145", mk1: "V4M7", images: ['./images/ne3.jpg'] },
  { id: "NE4B_SLB5", name: "NE4B/SLB-5", dms: "53°24'16.69\"N, 116°20'9.95\"W", sv2: "2569137", mk1: "VN5T", slb: "SN457", images: ['./images/ne4.jpg'] },
  { id: "NE5", name: "NE5", dms: "53°24'16.65\"N, 116°20'8.26\"W", sv2: "2569141", mk1: "A46D", images: ['./images/ne5.jpg'] },
  { id: "NE6", name: "NE6", dms: "53°24'16.87\"N, 116°20'7.48\"W", sv2: "2569143", mk1: "6PMU", images: ['./images/ne6.jpg'] },
  { id: "NE7", name: "NE7", dms: "53°24'17.37\"N, 116°20'7.55\"W", sv2: "2569129", mk1: "SEF6", images: ['./images/ne7.jpg'] },
  { id: "NE8", name: "NE8", dms: "53°24'17.87\"N, 116°20'7.61\"W", sv2: "2569126", mk1: "4XA9", images: ['./images/ne8.jpg'] },
  { id: "NE9", name: "NE9", dms: "53°24'18.30\"N, 116°20'7.71\"W", sv2: "2569119", mk1: "YLEC", images: ['./images/ne9.jpg'] },
  { id: "NE10", name: "NE10", dms: "53°24'18.78\"N, 116°20'7.91\"W", sv2: "2569140", mk1: "FWNM", images: ['./images/ne10.jpg'] },
  { id: "NW1", name: "NW1", dms: "53°24'17.27\"N, 116°20'14.03\"W", sv2: "2569085", mk1: "BGFV", images: ['./images/nw1.jpg'] },
  { id: "NW2_SLB3", name: "NW2/SLB-3", dms: "53°24'17.76\"N, 116°20'12.89\"W", sv2: "2569075", mk1: "2VNP", slb: "SN361", images: ['./images/nw2.jpg'] },
  { id: "NE4A_SLB4", name: "NE4A/SLB-4", dms: "53°24'16.96\"N, 116°20'10.00\"W", sv2: "2569084", mk1: "BUNT", slb: "SN460", images: ['./images/ne4a.jpg'] },
  { id: "SW1", name: "SW1", dms: "53°24'14.33\"N, 116°20'15.06\"W", sv2: "2569131", mk1: "P9NJ", images: ['./images/sw1.jpg'] },
  { id: "SW2_SLB1", name: "SW2/SLB-1", dms: "53°24'14.69\"N, 116°20'13.84\"W", sv2: "2569073", mk1: null, slb: "SN362", images: ['./images/sw2.jpg'] },
  { id: "SW3", name: "SW3", dms: "53°24'15.14\"N, 116°20'12.74\"W", sv2: "2569157", mk1: "39BJ", images: ['./images/sw3.jpg'] },
  { id: "SW4", name: "SW4", dms: "53°24'15.69\"N, 116°20'15.10\"W", sv2: "2569130", mk1: "JRW8", images: ['./images/sw4.jpg'] },
  { id: "SW5_SLB2", name: "SW5/SLB-2", dms: "53°24'16.37\"N, 116°20'13.02\"W", sv2: "2569136", mk1: "69BL", slb: "SN462", images: ['./images/sw5.jpg'] },
  { id: "SW6", name: "SW6", dms: "53°24'16.09\"N, 116°20'12.26\"W", sv2: "2592359", mk1: "NMFX", images: ['./images/sw6.jpg'] },
];

// Tree POIs - separate array for different symbology and modal
const TREE_POIS = [
  { id: "NORTH_TREE", name: "North Tree", dms: "53°24'19.08\"N, 116°20'11.77\"W", height: "15m / 50 ft", images: ['./images/north.jpg'] },
  { id: "WEST_TREE", name: "West Tree", dms: "53°24'16.75\"N, 116°20'16.00\"W", height: "12m / 40 ft", images: ['./images/west.jpg'] },
];

// Polygon POIs - buildings and structures
const POLYGON_POIS = [
  {
    id: "GREEN_BUILDING",
    name: "Building",
    coordinates: [
      [ 53.404686, -116.336593],
      [ 53.404686, -116.336525],
      [ 53.404661, -116.336527],
      [ 53.404661, -116.336593]
    ],
    center: [53.4046639, -116.3366145], // Calculated center
    images: ['./images/ngif.jpg']
  },
  {
    id: "TANK",
    name: "Tank",
    coordinates: [
      [53.4045983, -116.3365376],
      [53.4046411, -116.3365325],
      [53.4046145, -116.3366046],
      [53.4045861, -116.3365691]
    ],
    center: [53.4046100, -116.3365610], // Calculated center
    images: ['./images/tank.jpg']
  },
  {
    id: "OFFICE",
    name: "Office",
    coordinates: [
      [53.4044352, -116.3365952],
      [53.4043897, -116.3365979],
      [53.4043889, -116.3364558],
      [53.4044266, -116.3364678]
    ],
    center: [53.4044101, -116.3365292], // Calculated center
    images: ['./images/office.jpg']
  }
];

// ---- GEOTIFF OVERLAY ----
async function loadGeoTiffOverlay(map) {
  try {
    console.log('Loading GeoTIFF overlay...');
    
    // Fetch the GeoTIFF file
    const response = await fetch('./tourmaline_georeferenced (5).tif');
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoTIFF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('GeoTIFF file loaded, parsing...');
    
    // Parse the GeoTIFF using the correct function name
    const georaster = await window.parseGeoraster(arrayBuffer);
    console.log('GeoTIFF parsed successfully:', georaster);
    
    // Create the layer with some styling options
    const layer = new window.GeoRasterLayer({
      georaster: georaster,
      opacity: 0.9, // Make it more opaque for better visibility
      resolution: 256, // Adjust resolution for performance
      debugLevel: 1,
      pixelValuesToColorFn: function(pixelValues) {
        // Handle RGB color bands properly
        if (!pixelValues || pixelValues.length === 0) {
          return null; // Transparent for no-data values
        }
        
        // Check if we have RGB bands (3 or 4 bands for RGBA)
        if (pixelValues.length >= 3) {
          const red = Math.min(255, Math.max(0, pixelValues[0] || 0));
          const green = Math.min(255, Math.max(0, pixelValues[1] || 0));
          const blue = Math.min(255, Math.max(0, pixelValues[2] || 0));
          
          // Check for no-data values (all zeros or nulls)
          if (red === 0 && green === 0 && blue === 0) {
            return null; // Transparent for no-data
          }
          
          return `rgb(${red}, ${green}, ${blue})`;
        } else {
          // Fallback to grayscale if only one band
          const intensity = Math.min(255, Math.max(0, pixelValues[0] || 0));
          if (intensity === 0) {
            return null; // Transparent for no-data
          }
          return `rgb(${intensity}, ${intensity}, ${intensity})`;
        }
      }
    });
    
    // Add the layer to the map
    layer.addTo(map);
    console.log('GeoTIFF overlay added to map');
    
  } catch (error) {
    console.error('Error loading GeoTIFF overlay:', error);
    // Continue without the overlay if there's an error
  }
}

// ---- MAP INIT ----
window.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map", {
    zoomControl: false, // Remove default zoom controls
    minZoom: 15,
    maxZoom: 20,
  });

  // Center/zoom to overall area using bounds from all points (POIs + Trees + Polygons)
  const poiLatLngs = [...POIS, ...TREE_POIS].map((p) => parseDmsPairToLatLng(p.dms)).filter(Boolean);
  const polygonLatLngs = POLYGON_POIS.map(p => ({ lat: p.center[0], lng: p.center[1] }));
  const allLatLngs = [...poiLatLngs, ...polygonLatLngs];
  const bounds = L.latLngBounds(allLatLngs);
  const center = bounds.isValid() ? bounds.getCenter() : { lat: 53.4043, lng: -116.336 };
  map.setView(center, 17);

  const tileLayer = L.tileLayer(MAPBOX_TILE_URL, {
    attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    tileSize: 512, // Mapbox retina tiles; adjust with @2x in URL
    zoomOffset: -1,
    maxZoom: 20,
  });
  tileLayer.addTo(map);

  // Add GeoTIFF overlay
  loadGeoTiffOverlay(map);

  // Add markers with color coding and labels
  const markers = [];
  for (const poi of POIS) {
    const latLng = parseDmsPairToLatLng(poi.dms);
    if (!latLng || Number.isNaN(latLng.lat) || Number.isNaN(latLng.lng)) continue;
    
    // Determine color based on POI region
    let color = '#666666'; // default gray
    if (poi.id.startsWith('NE')) color = '#ff0000'; // red
    else if (poi.id.startsWith('NW')) color = '#00ff00'; // green  
    else if (poi.id.startsWith('SE')) color = '#ffff00'; // yellow
    else if (poi.id.startsWith('SW')) color = '#0000ff'; // blue
    
    // Create circle marker instead of default marker
    const marker = L.circleMarker(latLng, {
      radius: 8,
      fillColor: color,
      color: '#000000', // black border
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
      title: poi.name
    });
    
    marker.addTo(map);
    marker.on("click", () => openModalForPoi(poi));
    
    // Add label beside the marker
    const label = L.marker(latLng, {
      icon: L.divIcon({
        className: 'marker-label',
        html: `<span style="
          font-size: 12px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          white-space: nowrap;
          display: inline-block;
          margin-left: 15px;
          margin-top: -6px;
        ">${poi.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      })
    });
    
    label.addTo(map);
    markers.push(marker);
    markers.push(label);
  }

  // Add tree markers with tree symbology
  for (const tree of TREE_POIS) {
    const latLng = parseDmsPairToLatLng(tree.dms);
    if (!latLng || Number.isNaN(latLng.lat) || Number.isNaN(latLng.lng)) continue;
    
    // Create tree marker with custom SVG icon
    const treeMarker = L.marker(latLng, {
      icon: L.divIcon({
        className: 'tree-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background: #2E7D32;
          border: 3px solid #1B5E20;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <div style="
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 15px;
            background: #5D4037;
            border: 1px solid #3E2723;
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          "></div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
      title: tree.name
    });
    
    treeMarker.addTo(map);
    treeMarker.on("click", () => openTreeModal(tree));
    
    // Add tree label
    const treeLabel = L.marker(latLng, {
      icon: L.divIcon({
        className: 'tree-label',
        html: `<span style="
          font-size: 12px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          white-space: nowrap;
          display: inline-block;
          margin-left: 20px;
          margin-top: -6px;
        ">${tree.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      })
    });
    
    treeLabel.addTo(map);
    markers.push(treeMarker);
    markers.push(treeLabel);
  }

  // Add polygon markers
  for (const polygon of POLYGON_POIS) {
    // Create polygon shape
    const polygonCoords = polygon.coordinates.map(coord => [coord[0], coord[1]]);
    const leafletPolygon = L.polygon(polygonCoords, {
      color: '#FF6B35',
      weight: 3,
      opacity: 0.8,
      fillColor: '#FF6B35',
      fillOpacity: 0.3
    });
    
    leafletPolygon.addTo(map);
    leafletPolygon.on("click", () => openPolygonModal(polygon));
    
    // Add label directly on the polygon using tooltip
    leafletPolygon.bindTooltip(polygon.name, {
      permanent: true,
      direction: 'center',
      className: 'polygon-tooltip',
      offset: [0, 0]
    });
    
    markers.push(leafletPolygon);
  }

  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.2));
  }

  // Modal handlers
  const modal = document.getElementById("poi-modal");
  const closeBtn = document.getElementById("modal-close");
  closeBtn.addEventListener("click", () => hideModal());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  // Tree modal handlers
  const treeModal = document.getElementById("tree-modal");
  const treeCloseBtn = document.getElementById("tree-modal-close");
  treeCloseBtn.addEventListener("click", () => hideTreeModal());
  treeModal.addEventListener("click", (e) => {
    if (e.target === treeModal) hideTreeModal();
  });

  // Polygon modal handlers
  const polygonModal = document.getElementById("polygon-modal");
  const polygonCloseBtn = document.getElementById("polygon-modal-close");
  polygonCloseBtn.addEventListener("click", () => hidePolygonModal());
  polygonModal.addEventListener("click", (e) => {
    if (e.target === polygonModal) hidePolygonModal();
  });


});

// ---- MODAL RENDERING ----
function openModalForPoi(poi) {
  const modal = document.getElementById("poi-modal");
  const titleEl = document.getElementById("modal-title");
  const nameEl = document.getElementById("modal-name");
  const locationEl = document.getElementById("modal-location");
  const sv2El = document.getElementById("modal-sv2");
  const mk1El = document.getElementById("modal-mk1");
  const slbEl = document.getElementById("modal-slb");
  const imagesEl = document.getElementById("modal-images");
  const imagesEmptyEl = document.getElementById("modal-images-empty");

  titleEl.textContent = poi.name;
  nameEl.textContent = poi.name;
  locationEl.textContent = poi.dms;
  sv2El.textContent = poi.sv2 || "—";
  mk1El.textContent = poi.mk1 || "—";
  slbEl.textContent = poi.slb || "—";

  imagesEl.innerHTML = "";
  const hasImages = Array.isArray(poi.images) && poi.images.length > 0;
  if (hasImages) {
    imagesEmptyEl.classList.add("hidden");
    for (const url of poi.images) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = `${poi.name} image`;
      img.style.cursor = "pointer";
      img.onclick = function() {
        showImageOverlay(url);
      };
      imagesEl.appendChild(img);
    }
  } else {
    imagesEmptyEl.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
}

function hideModal() {
  const modal = document.getElementById("poi-modal");
  modal.classList.add("hidden");
}

// ---- TREE MODAL RENDERING ----
function openTreeModal(tree) {
  const modal = document.getElementById("tree-modal");
  const titleEl = document.getElementById("tree-modal-title");
  const nameEl = document.getElementById("tree-modal-name");
  const locationEl = document.getElementById("tree-modal-location");
  const heightEl = document.getElementById("tree-modal-height");
  const imagesEl = document.getElementById("tree-modal-images");
  const imagesEmptyEl = document.getElementById("tree-modal-images-empty");

  titleEl.textContent = tree.name;
  nameEl.textContent = tree.name;
  locationEl.textContent = tree.dms;
  heightEl.textContent = tree.height || "—";

  imagesEl.innerHTML = "";
  const hasImages = Array.isArray(tree.images) && tree.images.length > 0;
  if (hasImages) {
    imagesEmptyEl.classList.add("hidden");
    for (const url of tree.images) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = `${tree.name} image`;
      img.style.cursor = "pointer";
      img.onclick = function() {
        showImageOverlay(url);
      };
      imagesEl.appendChild(img);
    }
  } else {
    imagesEmptyEl.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
}

function hideTreeModal() {
  const modal = document.getElementById("tree-modal");
  modal.classList.add("hidden");
}

// ---- POLYGON MODAL RENDERING ----
function openPolygonModal(polygon) {
  const modal = document.getElementById("polygon-modal");
  const titleEl = document.getElementById("polygon-modal-title");
  const nameEl = document.getElementById("polygon-modal-name");
  const centerEl = document.getElementById("polygon-modal-center");
  const imagesEl = document.getElementById("polygon-modal-images");
  const imagesEmptyEl = document.getElementById("polygon-modal-images-empty");

  titleEl.textContent = polygon.name;
  nameEl.textContent = polygon.name;
  centerEl.textContent = `${polygon.center[0].toFixed(7)}, ${polygon.center[1].toFixed(7)}`;

  imagesEl.innerHTML = "";
  const hasImages = Array.isArray(polygon.images) && polygon.images.length > 0;
  if (hasImages) {
    imagesEmptyEl.classList.add("hidden");
    for (const url of polygon.images) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = `${polygon.name} image`;
      img.style.cursor = "pointer";
      img.onclick = function() {
        showImageOverlay(url);
      };
      imagesEl.appendChild(img);
    }
  } else {
    imagesEmptyEl.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
}

function hidePolygonModal() {
  const modal = document.getElementById("polygon-modal");
  modal.classList.add("hidden");
}

function showImageOverlay(imageSrc) {
  const overlay = document.getElementById("image-overlay");
  const overlayImage = document.getElementById("overlay-image");
  
  overlayImage.src = imageSrc;
  overlay.classList.remove("hidden");
}

function hideImageOverlay() {
  const overlay = document.getElementById("image-overlay");
  overlay.classList.add("hidden");
}

// Set up overlay close handlers
document.addEventListener("DOMContentLoaded", function() {
  const closeBtn = document.getElementById("image-overlay-close");
  const overlay = document.getElementById("image-overlay");
  
  closeBtn.onclick = hideImageOverlay;
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      hideImageOverlay();
    }
  };
  
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      hideImageOverlay();
    }
  });
});



