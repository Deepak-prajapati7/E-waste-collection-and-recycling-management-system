require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const WasteCategory = require('../models/WasteCategory');
const RecyclingCenter = require('../models/RecyclingCenter');
const CollectionRequest = require('../models/CollectionRequest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecocycle';

const SEED_USERS = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'demo1234',
    role: 'user',
    phone: '9876500001',
    address: 'Jaipur, Rajasthan',
  },
  {
    name: 'Priya Verma',
    email: 'priya@example.com',
    password: 'demo1234',
    role: 'user',
    phone: '9876500002',
    address: 'Delhi, India',
  },
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'demo1234',
    role: 'admin',
    phone: '9876500000',
    address: 'EcoCycle Operations HQ, Jaipur',
  },
];

const SEED_CATEGORIES = [
  { name: 'Computers', code: 'PC', desc: 'Desktops, laptops, monitors, keyboards and mice', note: 'Remove personal data', avgWeightPerUnit: 6.5 },
  { name: 'Mobile phones', code: 'PH', desc: 'Phones, tablets, chargers and accessories', note: 'Remove SIM and memory cards', avgWeightPerUnit: 0.3 },
  { name: 'Batteries', code: 'BT', desc: 'Rechargeable and household batteries', note: 'Keep damaged batteries separate', avgWeightPerUnit: 0.5 },
  { name: 'Televisions', code: 'TV', desc: 'LCD, LED, plasma and other displays', note: 'Handle screens upright', avgWeightPerUnit: 14.0 },
  { name: 'Printers', code: 'PR', desc: 'Printers, scanners, fax machines, ink and toner units', note: 'Remove loose cartridges', avgWeightPerUnit: 7.0 },
  { name: 'Cables', code: 'CB', desc: 'Power cords, adapters, USB cables and other wiring', note: 'Bundle neatly', avgWeightPerUnit: 0.8 },
  { name: 'Game consoles', code: 'GC', desc: 'Consoles, controllers and handheld devices', note: 'Sign out of accounts', avgWeightPerUnit: 3.2 },
  { name: 'Audio equipment', code: 'AU', desc: 'Speakers, headphones, radios and stereo equipment', note: 'Keep accessories together', avgWeightPerUnit: 2.4 },
  { name: 'Cameras', code: 'CA', desc: 'Digital cameras, camcorders, lenses and accessories', note: 'Remove memory cards', avgWeightPerUnit: 0.9 },
  { name: 'Small appliances', code: 'SA', desc: 'Small electric kitchen, grooming and household appliances', note: 'Clean food containers', avgWeightPerUnit: 2.2 },
  { name: 'Networking equipment', code: 'NW', desc: 'Routers, modems, switches and network accessories', note: 'Reset credentials', avgWeightPerUnit: 1.1 },
  { name: 'Wearables', code: 'WR', desc: 'Smartwatches, fitness trackers and other electronic wearables', note: 'Built-in batteries: do not open', avgWeightPerUnit: 0.2 },
  { name: 'Lamps and lighting', code: 'LT', desc: 'LED lamps and electronic lighting', note: 'Ask the point about special handling', avgWeightPerUnit: 0.4 },
  { name: 'Other small electronics', code: 'OT', desc: 'Calculators, toys, power banks and other small devices', note: 'Power banks: treat as batteries', avgWeightPerUnit: 0.6 },
];

const SEED_CENTERS = [
  {
    name: 'EcoCycle Certified Hub - Jaipur Central',
    address: 'Plot 42, Malviya Industrial Area, Jaipur, Rajasthan 302017',
    city: 'Jaipur',
    phone: '+91 98765 43210',
    email: 'jaipur@ecocycle.org',
    lat: 26.8524,
    lng: 75.8074,
    verifiedPartner: true,
  },
  {
    name: 'Pink City E-Waste Reclamation Point',
    address: 'Road No. 5, Vishwakarma Industrial Area (VKIA), Jaipur, Rajasthan 302013',
    city: 'Jaipur',
    phone: '+91 98765 43214',
    email: 'jaipur.north@ecocycle.org',
    lat: 26.9856,
    lng: 75.7689,
    verifiedPartner: true,
  },
  {
    name: 'Green Earth Recycling & Recovery Centre',
    address: 'Sector 18, Electronic City, Gurugram, Delhi NCR 122015',
    city: 'Delhi',
    phone: '+91 98765 43211',
    email: 'delhi@greenearth.org',
    lat: 28.4985,
    lng: 77.0818,
    verifiedPartner: true,
  },
  {
    name: 'EcoCycle Capital Circular Hub - Okhla',
    address: 'Phase II, Okhla Industrial Area, New Delhi 110020',
    city: 'Delhi',
    phone: '+91 98765 43215',
    email: 'delhi.okhla@ecocycle.org',
    lat: 28.5355,
    lng: 77.2732,
    verifiedPartner: true,
  },
  {
    name: 'NCR E-Waste & Electronics Collection Station',
    address: 'Sector 62, Electronic City, Noida, Uttar Pradesh 201309',
    city: 'Delhi',
    phone: '+91 98765 43216',
    email: 'noida@ecocycle.org',
    lat: 28.6280,
    lng: 77.3649,
    verifiedPartner: true,
  },
  {
    name: 'EcoTech Electronic Scrap & Circular Hub',
    address: 'Peenya Industrial Area 2nd Stage, Bengaluru, Karnataka 560058',
    city: 'Bengaluru',
    phone: '+91 98765 43212',
    email: 'bengaluru@ecotech.org',
    lat: 13.0285,
    lng: 77.5192,
    verifiedPartner: true,
  },
  {
    name: 'Silicon Plateau E-Waste Depot - Whitefield',
    address: 'EPIP Zone, Whitefield, Bengaluru, Karnataka 560066',
    city: 'Bengaluru',
    phone: '+91 98765 43217',
    email: 'whitefield@ecocycle.org',
    lat: 12.9840,
    lng: 77.7290,
    verifiedPartner: true,
  },
  {
    name: 'Mumbai E-Waste Reclamation Facility',
    address: 'MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
    city: 'Mumbai',
    phone: '+91 98765 43213',
    email: 'mumbai@ecocycle.org',
    lat: 19.1136,
    lng: 72.8697,
    verifiedPartner: true,
  },
  {
    name: 'Coromandel Green Recycling Depot',
    address: 'Guindy Industrial Estate, Chennai, Tamil Nadu 600032',
    city: 'Chennai',
    phone: '+91 98765 43219',
    email: 'chennai@ecocycle.org',
    lat: 13.0067,
    lng: 80.2023,
    verifiedPartner: true,
  },
  {
    name: 'Bengal Circular Materials Facility',
    address: 'Sector V, Salt Lake, Kolkata, West Bengal 700091',
    city: 'Kolkata',
    phone: '+91 98765 43221',
    email: 'kolkata@ecocycle.org',
    lat: 22.5802,
    lng: 88.4312,
    verifiedPartner: true,
  },
  {
    name: 'Cyberabad E-Waste Recovery Hub',
    address: 'Madhapur, HITEC City, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    phone: '+91 98765 43222',
    email: 'hyderabad@ecocycle.org',
    lat: 17.4435,
    lng: 78.3772,
    verifiedPartner: true,
  },
  {
    name: 'Pune Eco-Recycle Facility',
    address: 'MIDC Bhosari, Pimpri-Chinchwad, Pune, Maharashtra 411026',
    city: 'Pune',
    phone: '+91 98765 43224',
    email: 'pune@ecocycle.org',
    lat: 18.6298,
    lng: 73.8441,
    verifiedPartner: true,
  },
  {
    name: 'Gujarat CleanTech & Metals Hub',
    address: 'GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat 382445',
    city: 'Ahmedabad',
    phone: '+91 98765 43226',
    email: 'ahmedabad@ecocycle.org',
    lat: 22.9567,
    lng: 72.6312,
    verifiedPartner: true,
  },
  {
    name: 'Awadh E-Waste Collection & Circular Point',
    address: 'Transport Nagar, Kanpur Road, Lucknow, Uttar Pradesh 226012',
    city: 'Lucknow',
    phone: '+91 98765 43227',
    email: 'lucknow@ecocycle.org',
    lat: 26.7821,
    lng: 80.8924,
    verifiedPartner: true,
  },
  {
    name: 'City Beautiful Clean E-Recycle Hub',
    address: 'Industrial Area Phase 1, Chandigarh 160002',
    city: 'Chandigarh',
    phone: '+91 98765 43228',
    email: 'chandigarh@ecocycle.org',
    lat: 30.7046,
    lng: 76.7985,
    verifiedPartner: true,
  },
];

const SEED_REQUESTS = [
  {
    numericId: 1730000001,
    user: 'Rahul Sharma',
    email: 'rahul@example.com',
    category: 'Computers',
    method: 'Pickup',
    qty: 2,
    date: '2026-11-08',
    location: 'Plot 15, Malviya Nagar, Jaipur, Rajasthan',
    phone: '9876500001',
    notes: '2 old desktop towers and monitor with power cables',
    status: 'Scheduled',
    estimatedWeight: 13.0,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 3), by: 'Rahul Sharma', note: 'Submitted via web' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 2), by: 'System Admin', note: 'Verified by dispatcher' },
      { status: 'Scheduled', at: new Date(Date.now() - 86400000 * 1), by: 'System Admin', note: 'Assigned to EcoCycle Van #3' },
    ],
  },
  {
    numericId: 1730000002,
    user: 'Rahul Sharma',
    email: 'rahul@example.com',
    category: 'Mobile phones',
    method: 'Drop-off',
    qty: 3,
    date: '2026-10-20',
    location: 'EcoCycle Certified Hub - Jaipur Central',
    phone: '9876500001',
    notes: 'Old Android smartphones, batteries intact',
    status: 'Completed',
    estimatedWeight: 1.5,
    actualWeight: 1.5,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 15), by: 'Rahul Sharma' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 14), by: 'System Admin' },
      { status: 'Collected', at: new Date(Date.now() - 86400000 * 13), by: 'Jaipur Hub Staff' },
      { status: 'Processing', at: new Date(Date.now() - 86400000 * 12), by: 'Recovery Dept' },
      { status: 'Completed', at: new Date(Date.now() - 86400000 * 10), by: 'Recovery Dept', note: 'Precious metals recovered' },
    ],
  },
  {
    numericId: 1730000003,
    user: 'Priya Verma',
    email: 'priya@example.com',
    category: 'Batteries',
    method: 'Pickup',
    qty: 5,
    date: '2026-11-12',
    location: 'Flat 4B, Green Glen, Delhi',
    phone: '9876500002',
    notes: 'Laptop batteries in protective casing',
    status: 'Pending',
    estimatedWeight: 2.5,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 3600000 * 4), by: 'Priya Verma', note: 'Awaiting dispatcher review' },
    ],
  },
  {
    numericId: 1730000004,
    user: 'Rahul Sharma',
    email: 'rahul@example.com',
    category: 'Televisions',
    method: 'Pickup',
    qty: 1,
    date: '2026-10-12',
    location: 'B-14, Vaishali Nagar, Jaipur, Rajasthan',
    phone: '9876500001',
    notes: '43-inch LED TV with stand and remote',
    status: 'Completed',
    estimatedWeight: 14.0,
    actualWeight: 13.8,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 28), by: 'Rahul Sharma', note: 'Booked home pickup' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 27), by: 'System Admin', note: 'Crew slot confirmed' },
      { status: 'Scheduled', at: new Date(Date.now() - 86400000 * 26), by: 'System Admin', note: 'Assigned to Van #2' },
      { status: 'Collected', at: new Date(Date.now() - 86400000 * 25), by: 'Jaipur Hub Staff' },
      { status: 'Processing', at: new Date(Date.now() - 86400000 * 23), by: 'Recovery Dept' },
      { status: 'Completed', at: new Date(Date.now() - 86400000 * 21), by: 'Recovery Dept', note: 'Display panel & PCB recycled' },
    ],
  },
  {
    numericId: 1730000005,
    user: 'Priya Verma',
    email: 'priya@example.com',
    category: 'Printers',
    method: 'Drop-off',
    qty: 2,
    date: '2026-11-04',
    location: 'EcoCycle Capital Circular Hub - Okhla, Delhi',
    phone: '9876500002',
    notes: 'LaserJet office printers, cartridges removed',
    status: 'Processing',
    estimatedWeight: 14.0,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 9), by: 'Priya Verma' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 8), by: 'System Admin' },
      { status: 'Collected', at: new Date(Date.now() - 86400000 * 7), by: 'Okhla Hub Staff' },
      { status: 'Processing', at: new Date(Date.now() - 86400000 * 5), by: 'Recovery Dept', note: 'Sorting steel chassis & fuser assembly' },
    ],
  },
  {
    numericId: 1730000006,
    user: 'Rahul Sharma',
    email: 'rahul@example.com',
    category: 'Networking equipment',
    method: 'Drop-off',
    qty: 4,
    date: '2026-11-10',
    location: 'EcoCycle Certified Hub - Jaipur Central',
    phone: '9876500001',
    notes: 'Dual-band Wi-Fi routers and gigabit switch',
    status: 'Approved',
    estimatedWeight: 4.4,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 2), by: 'Rahul Sharma' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 1), by: 'System Admin', note: 'Drop-off window open 9 AM – 6 PM' },
    ],
  },
  {
    numericId: 1730000007,
    user: 'Priya Verma',
    email: 'priya@example.com',
    category: 'Small appliances',
    method: 'Pickup',
    qty: 3,
    date: '2026-10-03',
    location: 'Sector 62, Noida, Delhi NCR',
    phone: '9876500002',
    notes: 'Electric kettle, toaster, and induction cooktop',
    status: 'Completed',
    estimatedWeight: 6.6,
    actualWeight: 6.4,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 38), by: 'Priya Verma' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 37), by: 'System Admin' },
      { status: 'Collected', at: new Date(Date.now() - 86400000 * 35), by: 'Noida Field Team' },
      { status: 'Completed', at: new Date(Date.now() - 86400000 * 33), by: 'Recovery Dept', note: 'Copper coils & heating elements recovered' },
    ],
  },
  {
    numericId: 1730000008,
    user: 'Rahul Sharma',
    email: 'rahul@example.com',
    category: 'Wearables',
    method: 'Drop-off',
    qty: 2,
    date: '2026-11-13',
    location: 'VKIA Authorized E-Waste Depot - North Jaipur',
    phone: '9876500001',
    notes: 'Fitness trackers with original charging cradles',
    status: 'Pending',
    estimatedWeight: 0.4,
    history: [
      { status: 'Pending', at: new Date(Date.now() - 3600000 * 9), by: 'Rahul Sharma', note: 'Submitted for weekend drop-off' },
    ],
  },
];

async function runSeed(connectNow = true) {
  if (connectNow) {
    console.log('🔄 Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');
  }

  for (const cat of SEED_CATEGORIES) {
    await WasteCategory.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  for (const center of SEED_CENTERS) {
    await RecyclingCenter.findOneAndUpdate({ name: center.name }, center, { upsert: true, new: true });
  }
  for (const u of SEED_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await new User(u).save();
    }
  }
  for (const req of SEED_REQUESTS) {
    const exists = await CollectionRequest.findOne({ numericId: req.numericId });
    if (!exists) {
      await new CollectionRequest(req).save();
    }
  }
}

async function seedDatabase() {
  try {
    await runSeed(true);
    console.log(`✅ Seeded ${SEED_CATEGORIES.length} Categories, ${SEED_CENTERS.length} Centers, ${SEED_USERS.length} Users, ${SEED_REQUESTS.length} Requests.`);
    console.log('\n🎉 MongoDB database seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  runSeed,
  SEED_USERS,
  SEED_CATEGORIES,
  SEED_CENTERS,
  SEED_REQUESTS,
};

