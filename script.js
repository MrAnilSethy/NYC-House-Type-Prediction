(() => {
  "use strict";

  /* =========================================================
     Static reference data
     ========================================================= */

  // Exact category values the trained OneHotEncoder saw, grouped by borough.
  const BOROUGH_NEIGHBOURHOODS = {"Bronx": ["Allerton", "Baychester", "Belmont", "Bronxdale", "Castle Hill", "City Island", "Claremont Village", "Clason Point", "Co-op City", "Concourse", "Concourse Village", "East Morrisania", "Eastchester", "Edenwald", "Fieldston", "Fordham", "Highbridge", "Hunts Point", "Kingsbridge", "Longwood", "Melrose", "Morris Heights", "Morris Park", "Morrisania", "Mott Haven", "Mount Eden", "Mount Hope", "North Riverdale", "Norwood", "Olinville", "Parkchester", "Pelham Bay", "Pelham Gardens", "Port Morris", "Riverdale", "Schuylerville", "Soundview", "Spuyten Duyvil", "Throgs Neck", "Tremont", "Unionport", "University Heights", "Van Nest", "Wakefield", "West Farms", "Westchester Square", "Williamsbridge", "Woodlawn"], "Brooklyn": ["Bath Beach", "Bay Ridge", "Bedford-Stuyvesant", "Bensonhurst", "Bergen Beach", "Boerum Hill", "Borough Park", "Brighton Beach", "Brooklyn Heights", "Brownsville", "Bushwick", "Canarsie", "Carroll Gardens", "Clinton Hill", "Cobble Hill", "Columbia St", "Coney Island", "Crown Heights", "Cypress Hills", "DUMBO", "Downtown Brooklyn", "Dyker Heights", "East Flatbush", "East New York", "Flatbush", "Flatlands", "Fort Greene", "Fort Hamilton", "Gowanus", "Gravesend", "Greenpoint", "Kensington", "Manhattan Beach", "Midwood", "Mill Basin", "Navy Yard", "Park Slope", "Prospect Heights", "Prospect-Lefferts Gardens", "Red Hook", "Sea Gate", "Sheepshead Bay", "South Slope", "Sunset Park", "Vinegar Hill", "Williamsburg", "Windsor Terrace"], "Manhattan": ["Battery Park City", "Chelsea", "Chinatown", "Civic Center", "East Harlem", "East Village", "Financial District", "Flatiron District", "Gramercy", "Greenwich Village", "Harlem", "Hell's Kitchen", "Inwood", "Kips Bay", "Little Italy", "Lower East Side", "Marble Hill", "Midtown", "Morningside Heights", "Murray Hill", "NoHo", "Nolita", "Roosevelt Island", "SoHo", "Stuyvesant Town", "Theater District", "Tribeca", "Two Bridges", "Upper East Side", "Upper West Side", "Washington Heights", "West Village"], "Queens": ["Arverne", "Astoria", "Bay Terrace", "Bayside", "Bayswater", "Belle Harbor", "Bellerose", "Breezy Point", "Briarwood", "Cambria Heights", "College Point", "Corona", "Ditmars Steinway", "Douglaston", "East Elmhurst", "Edgemere", "Elmhurst", "Far Rockaway", "Flushing", "Forest Hills", "Fresh Meadows", "Glendale", "Hollis", "Holliswood", "Howard Beach", "Jackson Heights", "Jamaica", "Jamaica Estates", "Jamaica Hills", "Kew Gardens", "Kew Gardens Hills", "Laurelton", "Little Neck", "Long Island City", "Maspeth", "Middle Village", "Neponsit", "Ozone Park", "Queens Village", "Rego Park", "Richmond Hill", "Ridgewood", "Rockaway Beach", "Rosedale", "South Ozone Park", "Springfield Gardens", "St. Albans", "Sunnyside", "Whitestone", "Woodhaven", "Woodside"], "Staten Island": ["Arden Heights", "Arrochar", "Bay Terrace, Staten Island", "Bull's Head", "Castleton Corners", "Clifton", "Concord", "Dongan Hills", "Eltingville", "Emerson Hill", "Graniteville", "Grant City", "Great Kills", "Grymes Hill", "Howland Hook", "Huguenot", "Lighthouse Hill", "Mariners Harbor", "Midland Beach", "New Brighton", "New Dorp", "New Dorp Beach", "New Springville", "Oakwood", "Port Richmond", "Prince's Bay", "Randall Manor", "Rosebank", "Rossville", "Shore Acres", "Silver Lake", "South Beach", "St. George", "Stapleton", "Todt Hill", "Tompkinsville", "Tottenville", "West Brighton", "Westerleigh", "Willowbrook"]};

  const BOROUGH_CENTERS = {
    "Manhattan": { lat: 40.7831, lon: -73.9712 },
    "Brooklyn": { lat: 40.6782, lon: -73.9442 },
    "Queens": { lat: 40.7282, lon: -73.7949 },
    "Bronx": { lat: 40.8448, lon: -73.8648 },
    "Staten Island": { lat: 40.5795, lon: -74.1502 }
  };

  const BOROUGH_ORDER = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

  const ROOM_CLASS_META = {
    "Entire home/apt": { short: "Entire", css: "entire" },
    "Private room": { short: "Private", css: "private" },
    "Shared room": { short: "Shared", css: "shared" }
  };

  // Bounding box used only to place the pin on the stylized map.
  const MAP_BOUNDS = { latMin: 40.49, latMax: 40.92, lonMin: -74.26, lonMax: -73.68 };

  const STORAGE_KEYS = { apiUrl: "rtp_api_url", history: "rtp_history" };
  const MAX_HISTORY = 8;

  /* =========================================================
     Element refs
     ========================================================= */
  const form = document.getElementById("predictForm");
  const groupSelect = document.getElementById("neighbourhood_group");
  const neighSelect = document.getElementById("neighbourhood");
  const latInput = document.getElementById("latitude");
  const lonInput = document.getElementById("longitude");
  const apiUrlInput = document.getElementById("apiUrl");
  const checkConnBtn = document.getElementById("checkConn");
  const connDot = document.getElementById("connDot");
  const connText = document.getElementById("connText");
  const submitBtn = document.getElementById("submitBtn");
  const btnLabel = submitBtn.querySelector(".btn-label");
  const btnSpinner = submitBtn.querySelector(".btn-spinner");
  const formError = document.getElementById("formError");
  const fillSampleBtn = document.getElementById("fillSample");
  const pickOnMapBtn = document.getElementById("pickOnMap");

  const resultCard = document.getElementById("resultCard");
  const resultIdle = document.getElementById("resultIdle");
  const resultContent = document.getElementById("resultContent");
  const badgeValue = document.getElementById("badgeValue");
  const probList = document.getElementById("probList");

  const pinGroup = document.getElementById("pinGroup");
  const pinDot = document.getElementById("pinDot");
  const pinPulse = document.getElementById("pinPulse");
  const mapCoords = document.getElementById("mapCoords");
  const boroughPaths = Array.from(document.querySelectorAll(".borough"));

  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistory");

  /* =========================================================
     Init: populate borough / neighbourhood selects
     ========================================================= */
  function populateBoroughs() {
    groupSelect.innerHTML = '<option value="" disabled selected>Select a borough</option>';
    BOROUGH_ORDER.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      groupSelect.appendChild(opt);
    });
  }

  function populateNeighbourhoods(borough) {
    if (!borough || !BOROUGH_NEIGHBOURHOODS[borough]) {
      neighSelect.innerHTML = '<option value="">Choose a borough first</option>';
      neighSelect.disabled = true;
      return;
    }
    neighSelect.disabled = false;
    neighSelect.innerHTML = '<option value="" disabled selected>Select a neighbourhood</option>';
    BOROUGH_NEIGHBOURHOODS[borough].forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      neighSelect.appendChild(opt);
    });
  }

  populateBoroughs();

  groupSelect.addEventListener("change", () => {
    populateNeighbourhoods(groupSelect.value);
    highlightBorough(groupSelect.value);
  });

  /* =========================================================
     Map: highlight borough + place pin
     ========================================================= */
  function highlightBorough(name) {
    const cssMap = {
      Manhattan: "manhattan", Brooklyn: "brooklyn", Queens: "queens",
      Bronx: "bronx", "Staten Island": "staten"
    };
    boroughPaths.forEach((p) => p.classList.remove("active"));
    const target = cssMap[name];
    if (target) {
      const el = document.querySelector(`.borough.${target}`);
      if (el) el.classList.add("active");
    }
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function placePin(lat, lon) {
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      pinGroup.setAttribute("opacity", "0");
      mapCoords.textContent = "Enter coordinates to place the pin";
      return;
    }
    const xFrac = clamp((lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin), -0.08, 1.08);
    const yFrac = clamp((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin), -0.08, 1.08);
    const x = 20 + xFrac * 320;
    const y = 15 + yFrac * 370;
    pinGroup.setAttribute("transform", `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);
    pinGroup.setAttribute("opacity", "1");
    mapCoords.textContent = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  function syncPinFromInputs() {
    placePin(parseFloat(latInput.value), parseFloat(lonInput.value));
  }
  latInput.addEventListener("input", syncPinFromInputs);
  lonInput.addEventListener("input", syncPinFromInputs);

  pickOnMapBtn.addEventListener("click", () => {
    const borough = groupSelect.value;
    if (!borough) {
      flashError("Pick a borough first, then drop a starting pin.");
      return;
    }
    const c = BOROUGH_CENTERS[borough];
    latInput.value = c.lat.toFixed(6);
    lonInput.value = c.lon.toFixed(6);
    syncPinFromInputs();
  });

  /* =========================================================
     Connection check
     ========================================================= */
  function setConnStatus(state, label) {
    connDot.classList.remove("ok", "bad", "pending");
    if (state) connDot.classList.add(state);
    connText.textContent = label;
  }

  async function pingApi() {
    const base = apiUrlInput.value.trim().replace(/\/$/, "");
    if (!base) { setConnStatus("bad", "No endpoint set"); return; }
    setConnStatus("pending", "Checking…");
    try {
      const res = await fetch(base + "/", { method: "GET" });
      if (res.ok) {
        setConnStatus("ok", "Connected");
      } else {
        setConnStatus("bad", `Responded with ${res.status}`);
      }
    } catch (err) {
      setConnStatus("bad", "Unreachable — check URL / CORS");
    }
  }
  checkConnBtn.addEventListener("click", pingApi);

  /* =========================================================
     Persisted API URL
     ========================================================= */
  const savedUrl = localStorage.getItem(STORAGE_KEYS.apiUrl);
  if (savedUrl) apiUrlInput.value = savedUrl;
  apiUrlInput.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.apiUrl, apiUrlInput.value.trim());
  });

  /* =========================================================
     Sample data
     ========================================================= */
  fillSampleBtn.addEventListener("click", () => {
    groupSelect.value = "Manhattan";
    populateNeighbourhoods("Manhattan");
    neighSelect.value = "Hell's Kitchen";
    highlightBorough("Manhattan");
    latInput.value = "40.763700";
    lonInput.value = "-73.991600";
    document.getElementById("price").value = "175";
    document.getElementById("minimum_nights").value = "2";
    document.getElementById("availability_365").value = "220";
    document.getElementById("number_of_reviews").value = "48";
    document.getElementById("reviews_per_month").value = "1.85";
    document.getElementById("calculated_host_listings_count").value = "1";
    syncPinFromInputs();
    hideFormError();
  });

  /* =========================================================
     Form submission
     ========================================================= */
  function flashError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }
  function hideFormError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnSpinner.hidden = !isLoading;
    btnLabel.textContent = isLoading ? "Running…" : "Run prediction";
  }

  function collectPayload() {
    return {
      latitude: parseFloat(latInput.value),
      longitude: parseFloat(lonInput.value),
      price: parseFloat(document.getElementById("price").value),
      minimum_nights: parseInt(document.getElementById("minimum_nights").value, 10),
      number_of_reviews: parseInt(document.getElementById("number_of_reviews").value, 10),
      reviews_per_month: parseFloat(document.getElementById("reviews_per_month").value),
      calculated_host_listings_count: parseInt(document.getElementById("calculated_host_listings_count").value, 10),
      availability_365: parseInt(document.getElementById("availability_365").value, 10),
      neighbourhood_group: groupSelect.value,
      neighbourhood: neighSelect.value
    };
  }

  function renderResult(payload, predicted, probabilities) {
    resultIdle.hidden = true;
    resultContent.hidden = false;
    resultCard.dataset.state = "done";

    badgeValue.textContent = predicted;
    badgeValue.dataset.room = predicted;

    // classes_ order from the trained pipeline
    const classOrder = ["Entire home/apt", "Private room", "Shared room"];
    probList.innerHTML = "";
    classOrder.forEach((cls, i) => {
      const pct = (probabilities[i] * 100);
      const meta = ROOM_CLASS_META[cls];
      const row = document.createElement("div");
      row.className = "prob-row";
      row.innerHTML = `
        <div class="prob-row-top">
          <span class="p-label">${cls}</span>
          <span class="p-value">${pct.toFixed(1)}%</span>
        </div>
        <div class="prob-track">
          <div class="prob-fill ${meta.css}" style="width:0%"></div>
        </div>`;
      probList.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector(".prob-fill").style.width = pct.toFixed(1) + "%";
      });
    });

    addHistoryEntry(payload, predicted);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!groupSelect.value || !neighSelect.value) {
      flashError("Choose both a borough and a neighbourhood.");
      return;
    }

    const base = apiUrlInput.value.trim().replace(/\/$/, "");
    if (!base) {
      flashError("Set the model endpoint URL at the top of the page first.");
      return;
    }

    const payload = collectPayload();
    setLoading(true);

    try {
      const res = await fetch(base + "/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let detail = `Request failed with status ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody && errBody.detail) {
            detail = typeof errBody.detail === "string"
              ? errBody.detail
              : JSON.stringify(errBody.detail);
          }
        } catch (_) { /* ignore parse failure */ }
        flashError(detail);
        setConnStatus("bad", `Error ${res.status}`);
        return;
      }

      const data = await res.json();
      setConnStatus("ok", "Connected");
      renderResult(payload, data.predicted_room_type, data.probability);
    } catch (err) {
      flashError("Couldn't reach the model endpoint. Confirm the FastAPI server is running and the URL/CORS settings are correct.");
      setConnStatus("bad", "Unreachable — check URL / CORS");
    } finally {
      setLoading(false);
    }
  });

  /* =========================================================
     History
     ========================================================= */
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
    } catch (_) { return []; }
  }
  function saveHistory(items) {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(items));
  }

  function renderHistory() {
    const items = loadHistory();
    if (items.length === 0) {
      historyList.innerHTML = '<li class="history-empty">Predictions you run will appear here.</li>';
      return;
    }
    historyList.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML = `
        <span class="h-loc">${item.neighbourhood}, ${item.group}</span>
        <span class="h-room" data-room="${item.room}">${ROOM_CLASS_META[item.room]?.short || item.room}</span>`;
      historyList.appendChild(li);
    });
  }

  function addHistoryEntry(payload, predicted) {
    const items = loadHistory();
    items.unshift({
      group: payload.neighbourhood_group,
      neighbourhood: payload.neighbourhood,
      room: predicted,
      ts: Date.now()
    });
    saveHistory(items.slice(0, MAX_HISTORY));
    renderHistory();
  }

  clearHistoryBtn.addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
  });

  renderHistory();
  placePin(NaN, NaN);
})();
