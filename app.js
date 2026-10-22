const categories = [
  { name: 'Computers', icon: '💻', description: 'Desktops, laptops, monitors, and old hardware systems.', volume: '24% share' },
  { name: 'Mobile Phones', icon: '📱', description: 'Phones, chargers, accessories, and damaged devices.', volume: '19% share' },
  { name: 'Batteries', icon: '🔋', description: 'Li-ion, lead-acid, and rechargeable storage batteries.', volume: '17% share' },
  { name: 'Televisions', icon: '📺', description: 'LCD, LED, and outdated display equipment.', volume: '14% share' },
  { name: 'Printers', icon: '🖨️', description: 'Scanners, copiers, ink units, and printer hardware.', volume: '12% share' },
  { name: 'Cables', icon: '🔌', description: 'Wires, adapters, routers, and network hardware.', volume: '14% share' },
];

const centers = [
  {
    name: 'Green Earth Recycling',
    city: 'Jaipur, Rajasthan',
    phone: '+91 9876543210',
    email: 'green@example.com',
    note: 'Certified dismantling and material recovery hub.'
  },
  {
    name: 'EcoTech Recycling Center',
    city: 'Delhi, India',
    phone: '+91 9876543211',
    email: 'ecotech@example.com',
    note: 'High-efficiency processing with safe e-waste handling.'
  },
  {
    name: 'Urban Renewal Hub',
    city: 'Bengaluru, India',
    phone: '+91 9876543212',
    email: 'urbanrenewal@example.com',
    note: 'Integrated circular economy center for business pickups.'
  }
];

const requests = [
  { id: 1001, user: 'Rahul Sharma', category: 'Computers', pickupDate: '2026-10-20', address: 'Jaipur, Rajasthan', status: 'Collected' },
  { id: 1002, user: 'Priya Verma', category: 'Mobile Phones', pickupDate: '2026-10-22', address: 'Delhi, India', status: 'Approved' },
  { id: 1003, user: 'Amit Gupta', category: 'Batteries', pickupDate: '2026-10-24', address: 'Lucknow, UP', status: 'Scheduled' },
  { id: 1004, user: 'Sneha Patel', category: 'Televisions', pickupDate: '2026-10-25', address: 'Ahmedabad, Gujarat', status: 'Pending' },
  { id: 1005, user: 'Rohit Singh', category: 'Printers', pickupDate: '2026-10-26', address: 'Pune, Maharashtra', status: 'Rejected' },
  { id: 1006, user: 'Meera Nair', category: 'Cables', pickupDate: '2026-10-28', address: 'Kochi, Kerala', status: 'Completed' }
];

const chartValues = [68, 72, 94, 86, 102, 90, 118, 132, 116, 136, 124, 110];

const totalRequests = document.getElementById('totalRequests');
const totalCenters = document.getElementById('totalCenters');
const recoveryRate = document.getElementById('recoveryRate');
const collectedCount = document.getElementById('collectedCount');
const recycledWeight = document.getElementById('recycledWeight');
const activeCollections = document.getElementById('activeCollections');
const materialsRecovered = document.getElementById('materialsRecovered');
const categoriesGrid = document.getElementById('categoriesGrid');
const centersGrid = document.getElementById('centersGrid');
const requestsTableBody = document.getElementById('requestsTableBody');
const categorySelect = document.getElementById('categorySelect');
const requestSearch = document.getElementById('requestSearch');
const chartBars = document.getElementById('chartBars');

function renderSummary() {
  totalRequests.textContent = requests.length;
  totalCenters.textContent = centers.length;
  recoveryRate.textContent = '92%';
  collectedCount.textContent = requests.filter((request) => request.status === 'Collected' || request.status === 'Completed').length;
  recycledWeight.textContent = `${(requests.length * 140).toLocaleString()} kg`;
  activeCollections.textContent = requests.filter((request) => ['Approved', 'Scheduled', 'Collected'].includes(request.status)).length;
  materialsRecovered.textContent = `${(requests.length * 18).toLocaleString()} tons`;
}

function renderCategories() {
  categoriesGrid.innerHTML = categories.map((category) => `
    <article class="category-card">
      <div class="category-header">
        <div class="category-icon">${category.icon}</div>
        <span class="status-pill active">${category.volume}</span>
      </div>
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <div class="category-meta">
        <span>Collection ready</span>
        <span>24h</span>
      </div>
    </article>
  `).join('');

  categorySelect.innerHTML = categories.map((category) => `
    <option value="${category.name}">${category.name}</option>
  `).join('');
}

function renderCenters() {
  centersGrid.innerHTML = centers.map((center) => `
    <article class="center-card">
      <div class="center-top">
        <div class="center-badge">♻️</div>
        <span class="status-pill active">Live</span>
      </div>
      <div class="center-meta">
        <strong>${center.name}</strong>
        <span>${center.city}</span>
      </div>
      <p>${center.note}</p>
      <div class="center-contact">
        <span>📞 ${center.phone}</span>
        <span>✉️ ${center.email}</span>
      </div>
    </article>
  `).join('');
}

function renderRequests(filterText = '') {
  const filtered = requests.filter((request) => {
    const value = filterText.trim().toLowerCase();
    if (!value) return true;
    return [request.user, request.category, request.address].some((field) => field.toLowerCase().includes(value));
  });

  requestsTableBody.innerHTML = filtered.map((request) => `
    <tr>
      <td>#${request.id}</td>
      <td>${request.user}</td>
      <td>${request.category}</td>
      <td>${request.pickupDate}</td>
      <td>${request.address}</td>
      <td><span class="status-tag ${request.status.toLowerCase()}">${request.status}</span></td>
    </tr>
  `).join('');
}

function renderChart() {
  const max = Math.max(...chartValues);
  chartBars.innerHTML = chartValues.map((value) => `
    <span style="height: ${(value / max) * 100}%"></span>
  `).join('');
}

requestSearch.addEventListener('input', (event) => {
  renderRequests(event.target.value);
});

document.getElementById('pickupForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.querySelector('input[type="text"]').value || 'New Customer';
  const category = form.querySelector('select').value;
  const date = form.querySelector('input[type="date"]').value || '2026-10-30';
  const address = form.querySelector('textarea').value || 'New address';

  requests.unshift({
    id: 1000 + Math.floor(Math.random() * 900),
    user: name,
    category,
    pickupDate: date,
    address,
    status: 'Pending'
  });

  renderSummary();
  renderRequests(requestSearch.value);
  form.reset();
});

renderSummary();
renderCategories();
renderCenters();
renderRequests();
renderChart();
