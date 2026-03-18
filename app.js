// Map Initialization
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false // custom placement or hiding
}).setView([64.8, 26.0], 5); // Center on Finland

L.control.zoom({
    position: 'bottomleft'
}).addTo(map);

// Add Dark Matter TileLayer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Alternative open API (ADSB.lol) via allOrigins CORS proxy
// Point: Lat 64.8, Lon 26.0, Radius 600 NM approx covering Finland
const TARGET_URL = 'https://api.adsb.lol/v2/lat/64.8/lon/26.0/dist/250';
const API_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(TARGET_URL)}`;

let markers = {};
let selectedIcao24 = null;

// SVG path for a sleek plane icon
function getPlaneSvg(heading) {
    const rot = heading !== null && heading !== undefined ? heading : 0;
    return `
    <svg class="plane-svg" style="transform: rotate(${rot}deg);" width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.4,3.2l-1,0.5v11.7l-9.1,6.8L5.1,23L15.3,18.3v7.4l-2.6,2.1v2L16,28.5L19.2,29.9v-2l-2.6-2.1v-7.4l10.2,4.7l-0.1-0.9l-9.1-6.8V3.7l-1-0.5C16.2,3.1,15.8,3.1,15.4,3.2z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
    </svg>`;
}

// Custom icon factory
const createPlaneIcon = (heading) => {
    return L.divIcon({
        html: getPlaneSvg(heading),
        className: 'plane-icon-container',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

function updateInfoPanel(flight) {
    const panel = document.getElementById('info-panel');
    if (!flight) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');
    document.getElementById('detail-callsign').textContent = (flight.callsign || 'N/A').trim();
    // Origin is not provided by ADSB.lol easily, so we hide it or show N/A
    document.getElementById('detail-country').textContent = 'N/A';
    document.getElementById('detail-altitude').textContent = flight.geo_altitude !== null && flight.geo_altitude !== undefined ? `${Math.round(flight.geo_altitude)} m` : 'N/A';
    document.getElementById('detail-velocity').textContent = flight.velocity !== null && flight.velocity !== undefined ? `${Math.round(flight.velocity * 1.852)} km/h` : 'N/A';
    document.getElementById('detail-heading').textContent = flight.true_track !== null && flight.true_track !== undefined ? `${Math.round(flight.true_track)}°` : 'N/A';
}

function updateStatus(message, isError = false) {
    document.getElementById('status-text').textContent = message;
    const ping = document.getElementById('status-ping');
    if (isError) {
        ping.classList.add('error');
    } else {
        ping.classList.remove('error');
    }
}

async function fetchFlightData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const proxyData = await response.json();
        // allOrigins returns the payload as a string in the 'contents' property
        const data = JSON.parse(proxyData.contents);
        processFlightData(data);
        updateStatus('Live');
        document.getElementById('last-updated-time').textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.error("Error fetching flight data:", error);
        updateStatus('Data Fetch Failed', true);
    }
}

function processFlightData(data) {
    if (!data || !data.ac) return;

    const currentIcao24s = new Set();
    let selectedFlightStillExists = false;
    let selectedFlightData = null;

    data.ac.forEach(state => {
        const icao24 = state.hex;
        const callsign = state.flight;
        const longitude = state.lon;
        const latitude = state.lat;
        const velocity = state.gs; // knots
        const true_track = state.track; // degrees
        const geo_altitude = state.alt_geom ? state.alt_geom * 0.3048 : (state.alt_baro ? state.alt_baro * 0.3048 : null); // feet to meters

        if (longitude === undefined || latitude === undefined) return;

        currentIcao24s.add(icao24);

        const flightData = { icao24, callsign, longitude, latitude, velocity, true_track, geo_altitude };

        if (icao24 === selectedIcao24) {
            selectedFlightStillExists = true;
            selectedFlightData = flightData;
        }

        const altitudeDisplay = geo_altitude !== null ? Math.round(geo_altitude) + 'm' : 'N/A';
        const popupText = `<div style="text-align:center;"><b>${callsign ? callsign.trim() : icao24}</b><br><span style="color:var(--text-secondary);font-size:0.85rem;">Alt: ${altitudeDisplay}</span></div>`;

        if (markers[icao24]) {
            // Update existing marker position smoothly
            markers[icao24].setLatLng([latitude, longitude]);

            // Update icon rotation
            const iconElement = markers[icao24].getElement();
            if (iconElement) {
                const svg = iconElement.querySelector('.plane-svg');
                if (svg) {
                    svg.style.transform = `rotate(${true_track || 0}deg)`;
                }
            }

            // Update popup if open
            if (markers[icao24].isPopupOpen()) {
                markers[icao24].setPopupContent(popupText);
            }
        } else {
            // Create new marker
            const marker = L.marker([latitude, longitude], { icon: createPlaneIcon(true_track) })
                .addTo(map)
                .bindPopup(popupText, {
                    closeButton: false,
                    className: 'glass-popup'
                });

            marker.on('click', () => {
                selectedIcao24 = icao24;
                updateInfoPanel(flightData);
            });

            markers[icao24] = marker;
        }
    });

    // Remove old markers
    Object.keys(markers).forEach(icao24 => {
        if (!currentIcao24s.has(icao24)) {
            map.removeLayer(markers[icao24]);
            delete markers[icao24];
        }
    });

    // Update panel for selected flight conditionally
    if (selectedIcao24) {
        if (selectedFlightStillExists) {
            updateInfoPanel(selectedFlightData);
        } else {
            selectedIcao24 = null;
            updateInfoPanel(null);
        }
    }
}

// Initial fetch
fetchFlightData();

// Refresh every 5 seconds (ADSB.lol updates frequently)
setInterval(fetchFlightData, 5000);

// Close info panel when clicking on the map
map.on('click', () => {
    selectedIcao24 = null;
    updateInfoPanel(null);
});
