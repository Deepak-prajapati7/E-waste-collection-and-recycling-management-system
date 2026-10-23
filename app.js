const categories = [
  { name: 'Computers', code: 'PC', description: 'Desktop computers, laptops, monitors, keyboards, and mice.' },
  { name: 'Mobile Phones', code: 'PH', description: 'Mobile phones, tablets, chargers, and accessories.' },
  { name: 'Batteries', code: 'BT', description: 'Rechargeable and household batteries. Keep damaged batteries separate.' },
  { name: 'Televisions', code: 'TV', description: 'LCD, LED, plasma, and other electronic displays.' },
  { name: 'Printers', code: 'PR', description: 'Printers, scanners, fax machines, and ink or toner units.' },
  { name: 'Cables', code: 'CB', description: 'Power cords, adapters, USB cables, and other wiring.' },
  { name: 'Game consoles', code: 'GC', description: 'Gaming consoles, controllers, and handheld gaming devices.' },
  { name: 'Audio equipment', code: 'AU', description: 'Speakers, headphones, radios, and stereo equipment.' },
  { name: 'Cameras', code: 'CA', description: 'Digital cameras, camcorders, lenses, and related accessories.' },
  { name: 'Small appliances', code: 'SA', description: 'Small electric kitchen, grooming, and household appliances.' },
  { name: 'Networking equipment', code: 'NW', description: 'Routers, modems, switches, and network accessories.' },
  { name: 'Wearables', code: 'WR', description: 'Smartwatches, fitness trackers, and other electronic wearables.' },
  { name: 'Lamps and lighting', code: 'LT', description: 'LED lamps and electronic lighting. Ask the shop about special handling.' },
  { name: 'Other small electronics', code: 'OT', description: 'Calculators, toys, power banks, and other small electronic devices.' },
];

const geocodingEndpoint = 'https://nominatim.openstreetmap.org/search';
const overpassEndpoint = 'https://overpass-api.de/api/interpreter';
const geocodedLocations = new Map();
let nearbyCenters = [];
let activeSearchController = null;
let lastGeocodingRequestAt = 0;

const initialRequests = [
  { id: 1001, user: 'Rahul Sharma', email: 'rahul@example.com', category: 'Computers', pickupDate: '2026-10-20', address: 'Jaipur, Rajasthan', status: 'Collected' },
  { id: 1002, user: 'Priya Verma', email: 'priya@example.com', category: 'Mobile Phones', pickupDate: '2026-10-22', address: 'Delhi, India', status: 'Approved' },
  { id: 1003, user: 'Amit Gupta', email: 'amit@example.com', category: 'Batteries', pickupDate: '2026-10-24', address: 'Lucknow, UP', status: 'Scheduled' },
  { id: 1004, user: 'Sneha Patel', email: 'sneha@example.com', category: 'Televisions', pickupDate: '2026-10-25', address: 'Ahmedabad, Gujarat', status: 'Pending' },
  { id: 1005, user: 'Rohit Singh', email: 'rohit@example.com', category: 'Printers', pickupDate: '2026-10-26', address: 'Pune, Maharashtra', status: 'Rejected' },
  { id: 1006, user: 'Meera Nair', email: 'meera@example.com', category: 'Cables', pickupDate: '2026-10-28', address: 'Kochi, Kerala', status: 'Completed' }
];

const requestStatuses = ['Pending', 'Approved', 'Scheduled', 'Collected', 'Processing', 'Completed', 'Rejected'];
let requests = initialRequests;
try {
  const savedRequests = localStorage.getItem('ecocycle-requests');
  if (savedRequests) {
    const parsedRequests = JSON.parse(savedRequests);
    if (!Array.isArray(parsedRequests) || parsedRequests.some((request) => !request || typeof request !== 'object')) {
      throw new TypeError('Saved requests must be a list of request records.');
    }
    requests = parsedRequests;
  }
} catch (error) {
  console.error('Unable to read saved collection requests. Using the sample request list.', error);
}
let currentUser = null;
let authMode = 'login';

const totalRequests = document.getElementById('totalRequests');
const totalCenters = document.getElementById('totalCenters');
const totalCategories = document.getElementById('totalCategories');
const categoriesGrid = document.getElementById('categoriesGrid');
const centersGrid = document.getElementById('centersGrid');
const requestsTableBody = document.getElementById('requestsTableBody');
const categorySelect = document.getElementById('categorySelect');
const requestSearch = document.getElementById('requestSearch');
const adminStatusFilter = document.getElementById('adminStatusFilter');
const locationSearchForm = document.getElementById('locationSearchForm');
const locationSearch = document.getElementById('locationSearch');
const locationsMessage = document.getElementById('locationsMessage');
const searchLocationsButton = document.getElementById('searchLocationsButton');
const findNearbyButton = document.getElementById('findNearbyButton');
const deliveryMethod = document.getElementById('deliveryMethod');
const pickupAddress = document.getElementById('pickupAddress');
const dropoffLocation = document.getElementById('dropoffLocation');
const pickupAddressField = document.getElementById('pickupAddressField');
const dropoffLocationField = document.getElementById('dropoffLocationField');
const themeToggle = document.getElementById('themeToggle');
const authSection = document.getElementById('authSection');
const dashboardContent = document.getElementById('dashboardContent');
const authForm = document.getElementById('authForm');
const authRole = document.getElementById('authRole');
const authEmail = document.getElementById('authEmail');
const authName = document.getElementById('authName');
const authNameField = document.getElementById('authNameField');
const authPassword = document.getElementById('authPassword');
const authMessage = document.getElementById('authMessage');
const pickupForm = document.getElementById('pickupForm');
const pickupMessage = document.getElementById('pickupMessage');
const dashboardMessage = document.getElementById('dashboardMessage');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function getLocalDateValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function saveRequests() {
  try {
    localStorage.setItem('ecocycle-requests', JSON.stringify(requests));
    return true;
  } catch (error) {
    console.error('Unable to save collection requests in this browser.', error);
    return false;
  }
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  themeToggle.querySelector('.theme-toggle-icon').textContent = isDark ? '☀' : '☾';
  themeToggle.querySelector('.theme-toggle-label').textContent = isDark ? 'Light mode' : 'Dark mode';
  localStorage.setItem('ecocycle-theme', isDark ? 'dark' : 'light');
}

function renderSummary() {
  const userRequests = currentUser.role === 'admin'
    ? requests
    : requests.filter((request) => request.email?.toLowerCase() === currentUser.email.toLowerCase());
  totalRequests.textContent = userRequests.length;
  totalCenters.textContent = nearbyCenters.length;
  totalCategories.textContent = categories.length;

  if (currentUser.role === 'admin') {
    const pendingRequests = requests
      .filter((request) => request.status?.toLowerCase() === 'pending').length;
    document.getElementById('adminTotalRequests').textContent = requests.length;
    document.getElementById('adminPendingRequests').textContent = pendingRequests;
    document.getElementById('adminInProgressRequests').textContent = requests
      .filter((request) => ['approved', 'scheduled', 'collected', 'processing'].includes(request.status?.toLowerCase())).length;
    document.getElementById('adminCompletedRequests').textContent = requests
      .filter((request) => request.status?.toLowerCase() === 'completed').length;
    document.getElementById('adminHeroPendingCount').textContent = pendingRequests;
  }
}

function renderCategories() {
  categoriesGrid.innerHTML = categories.map((category) => `
    <article class="category-card">
      <div class="category-header">
        <div class="category-icon" aria-hidden="true">${category.code}</div>
      </div>
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <div class="category-meta">
        <span>Acceptance varies by shop</span>
        <span>Check first</span>
      </div>
    </article>
  `).join('');

  categorySelect.innerHTML = categories.map((category) => `
    <option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>
  `).join('');
}

function distanceBetween(latitude1, longitude1, latitude2, longitude2) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDifference = radians(latitude2 - latitude1);
  const longitudeDifference = radians(longitude2 - longitude1);
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(radians(latitude1)) * Math.cos(radians(latitude2))
    * Math.sin(longitudeDifference / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distance) {
  return distance < 1
    ? `${Math.round(distance * 1000)} m away`
    : `${distance.toFixed(1)} km away`;
}

async function readApiJson(response, serviceName) {
  try {
    return await response.json();
  } catch {
    throw new Error(`${serviceName} returned an invalid response. Please try again.`);
  }
}

function getCenterCoordinates(element) {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  return { latitude, longitude };
}

function renderCenters(origin) {
  centersGrid.innerHTML = nearbyCenters.map((center) => {
    const tags = center.tags;
    const address = [
      tags['addr:full'],
      [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
      tags['addr:place'],
      tags['addr:suburb'],
      tags['addr:city'],
      tags['addr:postcode']
    ].filter(Boolean).join(', ');
    const isElectronicsShop = Boolean(tags.shop);
    const phone = tags['contact:phone'] || tags.phone;
    const phoneLink = phone ? phone.replace(/[^\d+]/g, '') : '';
    const osmUrl = `https://www.openstreetmap.org/${encodeURIComponent(center.type)}/${encodeURIComponent(center.id)}`;
    const distance = distanceBetween(origin.latitude, origin.longitude, center.latitude, center.longitude);
    const dropoffAddress = address || `Near ${center.locationLabel}`;

    return `
      <article class="center-card">
        <div class="center-top">
          <div class="center-badge">${isElectronicsShop ? 'SHOP' : 'RECYCLING'}</div>
          <span class="center-distance">${formatDistance(distance)}</span>
        </div>
        <div class="center-meta">
          <strong>${escapeHtml(tags.name || tags.operator || 'E-waste recycling point')}</strong>
          <span>${escapeHtml(dropoffAddress)}</span>
        </div>
        ${phone ? `<p class="center-detail">Phone: <a href="tel:${escapeHtml(phoneLink)}">${escapeHtml(phone)}</a></p>` : ''}
        ${tags.opening_hours ? `<p class="center-detail">Hours: ${escapeHtml(tags.opening_hours)}</p>` : ''}
        <p class="center-detail">${isElectronicsShop ? 'Potential drop-off option. Contact the shop to confirm e-waste acceptance.' : 'Listed for electrical or electronic recycling in OpenStreetMap.'}</p>
        <a class="map-link" href="${osmUrl}" target="_blank" rel="noopener noreferrer">View location on OpenStreetMap <span aria-hidden="true">↗</span></a>
        ${currentUser?.role === 'user' ? `<button class="primary-btn use-location" type="button" data-location="${escapeHtml(tags.name ? `${tags.name}, ${dropoffAddress}` : dropoffAddress)}">Use for drop-off request</button>` : ''}
      </article>
    `;
  }).join('');

  if (!nearbyCenters.length) {
    centersGrid.innerHTML = '<p class="empty-locations">No mapped e-waste recycling points were found in this area. Try a nearby city or a larger town.</p>';
  }
}

async function geocodeLocation(query, signal) {
  const cacheKey = query.toLowerCase();
  if (geocodedLocations.has(cacheKey)) return geocodedLocations.get(cacheKey);

  const waitTime = Math.max(0, 1100 - (Date.now() - lastGeocodingRequestAt));
  if (waitTime) await new Promise((resolve) => window.setTimeout(resolve, waitTime));
  lastGeocodingRequestAt = Date.now();

  const url = new URL(geocodingEndpoint);
  url.search = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'in',
    q: query
  }).toString();
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) {
    throw new Error(`City search is unavailable right now (HTTP ${response.status}). Please try again shortly.`);
  }
  const results = await readApiJson(response, 'The city search');
  if (!Array.isArray(results) || (results.length > 0 && !results[0])) {
    throw new Error('The city search returned an unexpected response. Please try again.');
  }
  if (!results.length) {
    throw new Error('We could not find that place in India. Try a nearby city or postcode.');
  }

  const location = {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
    label: results[0].name || query
  };
  if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new Error('The city search returned invalid coordinates. Please try another place.');
  }
  geocodedLocations.set(cacheKey, location);
  return location;
}

async function findNearbyCenters(origin, signal) {
  const radius = 25000;
  const electricalRecyclingTags = [
    'recycling:electrical_appliances',
    'recycling:electrical',
    'recycling:electrical_items',
    'recycling:electronics',
    'recycling:small_appliances',
    'recycling:computer',
    'recycling:mobile_phones'
  ];
  const recyclingSearches = electricalRecyclingTags.map((tag) =>
    `  nwr(around:${radius},${origin.latitude},${origin.longitude})["amenity"="recycling"]["${tag}"~"^(yes|only|limited|separate)$",i];`
  ).join('\n');
  const shopSearch = `  nwr(around:${radius},${origin.latitude},${origin.longitude})["shop"~"^(electronics|electrical|computer|mobile_phone)$",i];`;
  const scrapYardSearch = `  nwr(around:${radius},${origin.latitude},${origin.longitude})["amenity"="scrap_yard"];`;
  const query = `[out:json][timeout:25];\n(\n${recyclingSearches}\n${shopSearch}\n${scrapYardSearch}\n);\nout tags center;`;
  const response = await fetch(overpassEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ data: query }),
    signal
  });
  if (!response.ok) {
    throw new Error(`The OpenStreetMap search is unavailable right now (HTTP ${response.status}). Please try again shortly.`);
  }
  const data = await readApiJson(response, 'The OpenStreetMap search');
  if (!data || !Array.isArray(data.elements) || data.remark) {
    throw new Error('The OpenStreetMap search returned an unexpected response. Please try again.');
  }

  const uniqueElements = new Map();
  for (const element of data.elements) {
    const coordinates = getCenterCoordinates(element);
    if (!coordinates) continue;
    const key = `${element.type}/${element.id}`;
    uniqueElements.set(key, {
      ...element,
      ...coordinates,
      tags: element.tags || {},
      locationLabel: origin.label
    });
  }

  nearbyCenters = [...uniqueElements.values()]
    .map((center) => ({
      ...center,
      distance: distanceBetween(origin.latitude, origin.longitude, center.latitude, center.longitude)
    }))
    .sort((first, second) => first.distance - second.distance)
    .slice(0, 50);
  renderCenters(origin);
  if (currentUser) renderSummary();
  locationsMessage.textContent = nearbyCenters.length
    ? `${nearbyCenters.length} nearby electronics shop${nearbyCenters.length === 1 ? '' : 's'} or mapped recycling point${nearbyCenters.length === 1 ? '' : 's'} found within 25 km of ${origin.label}. Confirm e-waste acceptance with each shop.`
    : `No electronics shops or mapped e-waste recycling points were found within 25 km of ${origin.label}. Try a nearby city or a larger town.`;
}

function setLocationSearchBusy(isBusy) {
  locationSearch.disabled = isBusy;
  searchLocationsButton.disabled = isBusy;
  findNearbyButton.disabled = isBusy;
  searchLocationsButton.textContent = isBusy ? 'Searching…' : 'Search';
}

async function searchCentersAt(origin) {
  activeSearchController?.abort();
  const controller = new AbortController();
  activeSearchController = controller;
  setLocationSearchBusy(true);
  centersGrid.replaceChildren();
  locationsMessage.textContent = `Searching OpenStreetMap for e-waste recycling points near ${origin.label}…`;

  try {
    await findNearbyCenters(origin, controller.signal);
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error('Unable to search OpenStreetMap for nearby e-waste recycling points.', error);
    nearbyCenters = [];
    centersGrid.innerHTML = '<p class="empty-locations">Nearby locations could not be loaded. Check your connection and try again.</p>';
    if (currentUser) renderSummary();
    locationsMessage.textContent = error instanceof Error
      ? error.message
      : 'Nearby locations could not be loaded. Please try again.';
  } finally {
    if (activeSearchController === controller) {
      activeSearchController = null;
      setLocationSearchBusy(false);
    }
  }
}

async function searchCentersByCity(query) {
  activeSearchController?.abort();
  const controller = new AbortController();
  activeSearchController = controller;
  setLocationSearchBusy(true);
  centersGrid.replaceChildren();
  locationsMessage.textContent = `Finding ${query} on the map…`;

  try {
    const origin = await geocodeLocation(query, controller.signal);
    if (controller.signal.aborted) return;
    await findNearbyCenters(origin, controller.signal);
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error('Unable to find a location or nearby e-waste recycling points.', error);
    nearbyCenters = [];
    centersGrid.innerHTML = '<p class="empty-locations">Nearby locations could not be loaded. Check your connection and try again.</p>';
    if (currentUser) renderSummary();
    locationsMessage.textContent = error instanceof Error
      ? error.message
      : 'Nearby locations could not be loaded. Please try again.';
  } finally {
    if (activeSearchController === controller) {
      activeSearchController = null;
      setLocationSearchBusy(false);
    }
  }
}

function visibleRequests(filterText = '', statusFilter = 'all') {
  const ownedRequests = currentUser.role === 'admin'
    ? requests
    : requests.filter((request) => request.email?.toLowerCase() === currentUser.email.toLowerCase());
  const value = filterText.trim().toLowerCase();
  return ownedRequests.filter((request) => {
    const matchesSearch = !value || [request.id, request.user, request.email, request.category, request.address, request.location, request.method, request.status]
      .some((field) => String(field ?? '').toLowerCase().includes(value));
    const matchesStatus = statusFilter === 'all' || request.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });
}

function renderRequests(filterText = requestSearch.value) {
  const isAdmin = currentUser.role === 'admin';
  const ownedCount = isAdmin
    ? requests.length
    : requests.filter((request) => request.email?.toLowerCase() === currentUser.email.toLowerCase()).length;
  const shownRequests = visibleRequests(filterText, isAdmin ? adminStatusFilter.value : 'all');
  document.getElementById('requestCount').textContent = isAdmin
    ? `Showing ${shownRequests.length} of ${ownedCount} requests`
    : `${shownRequests.length} ${shownRequests.length === 1 ? 'request' : 'requests'}`;

  requestsTableBody.innerHTML = shownRequests.map((request) => {
    const status = escapeHtml(request.status);
    const method = escapeHtml(request.method || 'Pickup');
    const manageCell = isAdmin ? `
      <td class="request-actions">
        <div class="request-actions-controls">
          <label class="sr-only" for="status-${escapeHtml(request.id)}">Update request #${escapeHtml(request.id)} status</label>
          <select id="status-${escapeHtml(request.id)}" class="request-status" data-request-id="${escapeHtml(request.id)}">
            ${requestStatuses.map((option) => `<option value="${option}" ${option === request.status ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
          <button class="delete-request" type="button" data-delete-id="${escapeHtml(request.id)}" aria-label="Delete request #${escapeHtml(request.id)}">Delete</button>
        </div>
      </td>
    ` : '';

    return `
      <tr>
        <td><span class="request-id">#${escapeHtml(request.id)}</span></td>
        <td><span class="table-primary">${escapeHtml(request.user)}</span><span class="table-secondary">${escapeHtml(request.email || '')}</span></td>
        <td><span class="table-primary">${escapeHtml(request.category)}</span></td>
        <td><span class="method-pill">${method}</span></td>
        <td><span class="table-primary">${escapeHtml(request.pickupDate)}</span></td>
        <td><span class="table-primary">${escapeHtml(request.location || request.address)}</span></td>
        <td><span class="status-tag ${status.toLowerCase()}">${status}</span></td>
        ${manageCell}
      </tr>
    `;
  }).join('');

  if (!shownRequests.length) {
    const columnCount = isAdmin ? 8 : 7;
    requestsTableBody.innerHTML = `<tr><td class="empty-state" colspan="${columnCount}">${isAdmin ? 'No requests match your search.' : 'You have no collection requests yet.'}</td></tr>`;
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === 'signup';
  authNameField.hidden = !isSignup;
  authName.required = isSignup;
  authPassword.autocomplete = isSignup ? 'new-password' : 'current-password';
  document.getElementById('authTitle').textContent = isSignup ? 'Create your account' : 'Sign in to your account';
  document.getElementById('authDescription').textContent = isSignup
    ? 'Set up a demo account to get started.'
    : 'Choose how you want to continue.';
  document.getElementById('authSubmit').textContent = isSignup ? 'Create account' : 'Sign in';
  document.getElementById('loginTab').classList.toggle('active', !isSignup);
  document.getElementById('signupTab').classList.toggle('active', isSignup);
  document.getElementById('loginTab').setAttribute('aria-selected', String(!isSignup));
  document.getElementById('signupTab').setAttribute('aria-selected', String(isSignup));
  authMessage.textContent = '';
}

function setDashboardMode() {
  const isAdmin = currentUser.role === 'admin';
  document.body.classList.toggle('admin-mode', isAdmin);
  authSection.hidden = true;
  dashboardContent.hidden = false;
  document.getElementById('adminOverview').hidden = !isAdmin;
  document.getElementById('adminHeroPanel').hidden = !isAdmin;
  document.querySelector('.process-card').hidden = isAdmin;
  document.getElementById('categories').hidden = isAdmin;
  document.getElementById('categoriesNavLink').hidden = isAdmin;
  adminStatusFilter.hidden = !isAdmin;
  document.querySelector('.main-nav').hidden = false;
  document.getElementById('accountLabel').textContent = `${currentUser.name} · ${isAdmin ? 'Admin' : 'User'}`;
  document.getElementById('accountLabel').hidden = false;
  document.getElementById('logoutButton').hidden = false;
  document.getElementById('pickup').hidden = isAdmin;
  document.getElementById('heroEyebrow').textContent = isAdmin ? 'Administrator workspace' : 'Your recycling space';
  document.getElementById('heroTitle').textContent = isAdmin
    ? 'Keep every collection moving forward.'
    : 'Recycle your old electronics responsibly.';
  document.getElementById('heroDescription').textContent = isAdmin
    ? 'A clear view of every collection. Review new requests, track progress, and keep recycling on schedule.'
    : 'Arrange a home pickup or find a nearby drop-off shop. Follow your request through processing.';
  document.getElementById('adminHeroDate').textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());
  document.getElementById('heroPrimaryAction').textContent = isAdmin ? 'Review requests' : 'Arrange a collection';
  document.getElementById('heroPrimaryAction').href = isAdmin ? '#impact' : '#pickup';
  document.getElementById('heroPrimaryAction').hidden = false;
  document.getElementById('heroSecondaryAction').textContent = isAdmin ? 'View drop-off points' : 'Find a drop-off shop';
  document.getElementById('heroSecondaryAction').href = '#centers';
  document.getElementById('requestsTitle').textContent = isAdmin ? 'All collection requests' : 'My collection requests';
  document.getElementById('actionsHeading').hidden = !isAdmin;
  requestSearch.placeholder = isAdmin ? 'Search customer or item' : 'Search my requests';
  document.querySelector('.table-section .eyebrow').textContent = isAdmin ? 'Request management' : 'Your activity';
  document.querySelector('.main-nav a[href="#centers"]').textContent = isAdmin ? 'Drop-off points' : 'Drop-off shops';
  document.querySelector('.main-nav a[href="#impact"]').textContent = isAdmin ? 'Requests' : 'Impact';
  document.querySelectorAll('.hero-metrics span').forEach((label, index) => {
    label.textContent = isAdmin
      ? ['All requests', 'Mapped drop-off points', 'Accepted categories'][index]
      : ['Your requests', 'Mapped drop-off points', 'Accepted categories'][index];
  });

  document.getElementById('pickupName').value = currentUser.name;
  document.getElementById('pickupEmail').value = currentUser.email;
  document.getElementById('pickupName').readOnly = true;
  document.getElementById('pickupEmail').readOnly = true;
  document.getElementById('pickupDate').min = getLocalDateValue();
  updateCollectionMethod();
  renderSummary();
  renderRequests();
}

function updateCollectionMethod() {
  const isDropoff = deliveryMethod.value === 'dropoff';
  pickupAddressField.hidden = isDropoff;
  pickupAddress.required = !isDropoff;
  dropoffLocationField.hidden = !isDropoff;
  dropoffLocation.required = isDropoff;
  document.getElementById('collectionDateLabel').textContent = isDropoff ? 'Drop-off date' : 'Pickup date';
}

function startSession(profile) {
  currentUser = profile;
  try {
    localStorage.setItem('ecocycle-session', JSON.stringify(profile));
  } catch (error) {
    console.error('Unable to save the demo session in this browser.', error);
    authMessage.textContent = 'Signed in for this visit, but the browser could not save your session.';
  }
  setDashboardMode();
}

document.getElementById('loginTab').addEventListener('click', () => setAuthMode('login'));
document.getElementById('signupTab').addEventListener('click', () => setAuthMode('signup'));

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = authEmail.value.trim().toLowerCase();
  const role = authRole.value;
  const name = authMode === 'signup'
    ? authName.value.trim()
    : email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  if (!name || !email || !authPassword.value) {
    authMessage.textContent = 'Enter your name, email, and password to continue.';
    return;
  }

  startSession({ name, email, role });
});

document.getElementById('logoutButton').addEventListener('click', () => {
  localStorage.removeItem('ecocycle-session');
  currentUser = null;
  document.body.classList.remove('admin-mode');
  dashboardContent.hidden = true;
  authSection.hidden = false;
  document.querySelector('.main-nav').hidden = true;
  document.getElementById('accountLabel').hidden = true;
  document.getElementById('logoutButton').hidden = true;
  authForm.reset();
  setAuthMode('login');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

requestSearch.addEventListener('input', (event) => {
  renderRequests();
});

adminStatusFilter.addEventListener('change', () => {
  renderRequests();
});

locationSearchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (searchLocationsButton.disabled) return;
  const query = locationSearch.value.trim();
  if (query) await searchCentersByCity(query);
});

findNearbyButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationsMessage.textContent = 'Your browser does not support location sharing. Enter a city or postcode instead.';
    return;
  }

  activeSearchController?.abort();
  activeSearchController = null;
  setLocationSearchBusy(true);
  locationsMessage.textContent = 'Waiting for your location permission…';
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => searchCentersAt({
      latitude: coords.latitude,
      longitude: coords.longitude,
      label: 'your location'
    }),
    (error) => {
      setLocationSearchBusy(false);
      locationsMessage.textContent = error.code === error.PERMISSION_DENIED
        ? 'Location permission was declined. Enter a city or postcode to search instead.'
        : 'Your location could not be determined. Check your device settings or search by city.';
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});

centersGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.use-location');
  if (!button || currentUser?.role !== 'user') return;

  deliveryMethod.value = 'dropoff';
  updateCollectionMethod();
  dropoffLocation.value = button.dataset.location;
  document.getElementById('pickup').scrollIntoView({ behavior: 'smooth', block: 'start' });
  dropoffLocation.focus({ preventScroll: true });
  pickupMessage.textContent = 'Drop-off location added. Choose a date and submit your request.';
});

deliveryMethod.addEventListener('change', updateCollectionMethod);

requestsTableBody.addEventListener('change', (event) => {
  const select = event.target.closest('.request-status');
  if (!select || currentUser.role !== 'admin') return;
  const request = requests.find((item) => String(item.id) === select.dataset.requestId);
  if (!request) return;

  request.status = select.value;
  const saved = saveRequests();
  renderSummary();
  renderRequests(requestSearch.value);
  dashboardMessage.textContent = saved
    ? `Request #${request.id} updated to ${request.status}.`
    : `Request #${request.id} updated for this visit, but could not be saved in this browser.`;
});

requestsTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-delete-id]');
  if (!button || currentUser.role !== 'admin') return;
  const requestId = button.dataset.deleteId;
  if (!window.confirm(`Delete request #${requestId}? This cannot be undone.`)) return;

  requests = requests.filter((request) => String(request.id) !== requestId);
  const saved = saveRequests();
  renderSummary();
  renderRequests(requestSearch.value);
  dashboardMessage.textContent = saved
    ? `Request #${requestId} deleted.`
    : `Request #${requestId} deleted for this visit, but could not be saved in this browser.`;
});

themeToggle.addEventListener('click', () => {
  setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
});

pickupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (currentUser?.role !== 'user') return;
  const formData = new FormData(pickupForm);
  const nextId = Math.max(1000, ...requests.map((request) => Number(request.id) || 0)) + 1;
  const request = {
    id: nextId,
    user: currentUser.name,
    email: currentUser.email,
    category: formData.get('category'),
    pickupDate: formData.get('pickupDate'),
    method: deliveryMethod.value === 'dropoff' ? 'Drop-off' : 'Pickup',
    location: deliveryMethod.value === 'dropoff'
      ? String(formData.get('dropoffLocation')).trim()
      : String(formData.get('address')).trim(),
    status: 'Pending'
  };

  requests.unshift(request);
  const saved = saveRequests();
  renderSummary();
  renderRequests(requestSearch.value);
  pickupForm.reset();
  updateCollectionMethod();
  document.getElementById('pickupName').value = currentUser.name;
  document.getElementById('pickupEmail').value = currentUser.email;
  pickupMessage.textContent = saved
    ? `${request.method} request #${request.id} submitted. You can follow its status below.`
    : `${request.method} request #${request.id} submitted for this visit, but could not be saved in this browser.`;
});

document.getElementById('pickupDate').min = getLocalDateValue();
setTheme(localStorage.getItem('ecocycle-theme') === 'dark' ? 'dark' : 'light');
renderCategories();

const savedSession = localStorage.getItem('ecocycle-session');
if (savedSession) {
  try {
    const profile = JSON.parse(savedSession);
    if (profile && ['admin', 'user'].includes(profile.role) && profile.email && profile.name) {
      startSession(profile);
    } else {
      localStorage.removeItem('ecocycle-session');
    }
  } catch (error) {
    console.error('Unable to read the saved demo session.', error);
    localStorage.removeItem('ecocycle-session');
  }
}
