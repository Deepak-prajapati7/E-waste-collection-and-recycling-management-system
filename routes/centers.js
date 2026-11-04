const express = require('express');
const router = express.Router();
const RecyclingCenter = require('../models/RecyclingCenter');

const DEFAULT_CENTERS = [
  {
    name: 'EcoCycle Certified Hub - Jaipur Central',
    address: 'Plot 42, Malviya Industrial Area, Jaipur, Rajasthan 302017',
    city: 'Jaipur',
    phone: '+91 98765 43210',
    email: 'jaipur@ecocycle.org',
    lat: 26.8524,
    lng: 75.8074,
    verifiedPartner: true,
    acceptedCategories: ['Computers', 'Mobile phones', 'Batteries', 'Televisions', 'Printers', 'Cables'],
    openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
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
    acceptedCategories: ['Computers', 'Large Appliances', 'Batteries', 'Cables'],
    openingHours: 'Mon - Sat: 9:30 AM - 6:30 PM',
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
    acceptedCategories: ['All Electronics', 'Batteries', 'Large Appliances', 'Computers'],
    openingHours: 'Mon - Sun: 8:30 AM - 8:00 PM',
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
    acceptedCategories: ['Computers', 'Mobile phones', 'Printers', 'Audio equipment', 'Cables'],
    openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
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
    acceptedCategories: ['Computers', 'Networking equipment', 'Mobile phones', 'Batteries'],
    openingHours: 'Mon - Sat: 10:00 AM - 6:30 PM',
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
    acceptedCategories: ['Computers', 'Networking equipment', 'Mobile phones', 'Batteries'],
    openingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
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
    acceptedCategories: ['Computers', 'Laptops', 'Servers', 'Peripherals', 'Cables'],
    openingHours: 'Mon - Sat: 9:30 AM - 6:30 PM',
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
    acceptedCategories: ['Computers', 'Mobile phones', 'Televisions', 'Audio equipment'],
    openingHours: 'Mon - Sat: 10:00 AM - 6:30 PM',
  },
  {
    name: 'Kopar Khairane CleanTech Recovery Unit',
    address: 'TTC Industrial Area, MIDC Kopar Khairane, Navi Mumbai 400709',
    city: 'Mumbai',
    phone: '+91 98765 43218',
    email: 'navimumbai@ecocycle.org',
    lat: 19.1025,
    lng: 73.0112,
    verifiedPartner: true,
    acceptedCategories: ['Industrial Electronics', 'Home Appliances', 'Batteries'],
    openingHours: 'Mon - Fri: 9:00 AM - 5:30 PM',
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
    acceptedCategories: ['Computers', 'Mobile phones', 'Televisions', 'Batteries', 'Cables'],
    openingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
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
    acceptedCategories: ['Computers', 'Monitors', 'Audio equipment', 'Mobile phones'],
    openingHours: 'Mon - Sat: 10:00 AM - 7:00 PM',
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
    acceptedCategories: ['Enterprise IT', 'Laptops', 'Networking', 'Smartphones', 'Batteries'],
    openingHours: 'Mon - Sat: 9:30 AM - 7:00 PM',
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
    acceptedCategories: ['Automotive Electronics', 'Computers', 'White Goods', 'Cables'],
    openingHours: 'Mon - Sat: 9:00 AM - 6:30 PM',
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
    acceptedCategories: ['Computers', 'Power Supplies', 'Transformers', 'Circuit Boards'],
    openingHours: 'Mon - Sat: 9:30 AM - 6:00 PM',
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
    acceptedCategories: ['All Electronics', 'Mobile phones', 'Batteries', 'Televisions'],
    openingHours: 'Mon - Sat: 10:00 AM - 6:30 PM',
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
    acceptedCategories: ['Computers', 'Printers', 'Mobile phones', 'Cables'],
    openingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
  },
];

// GET /api/centers
router.get('/', async (req, res, next) => {
  try {
    let centers = await RecyclingCenter.find().sort({ name: 1 });
    if (!centers || centers.length === 0) {
      try {
        await RecyclingCenter.insertMany(DEFAULT_CENTERS);
        centers = await RecyclingCenter.find().sort({ name: 1 });
      } catch (_) {
        return res.json(DEFAULT_CENTERS);
      }
    }
    return res.json(centers);
  } catch (err) {
    return res.json(DEFAULT_CENTERS);
  }
});

module.exports = router;

