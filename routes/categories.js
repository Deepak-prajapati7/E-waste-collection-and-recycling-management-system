const express = require('express');
const router = express.Router();
const WasteCategory = require('../models/WasteCategory');

// Fallback initial categories list
const DEFAULT_CATEGORIES = [
  { name: 'Computers', code: 'PC', desc: 'Desktops, laptops, monitors, keyboards and mice', note: 'Remove sensitive data', avgWeightPerUnit: 6.5, carbonOffsetPerKg: 1.8 },
  { name: 'Mobile phones', code: 'PH', desc: 'Phones, tablets, chargers and accessories', note: 'Remove SIM and memory cards', avgWeightPerUnit: 0.3, carbonOffsetPerKg: 2.5 },
  { name: 'Batteries', code: 'BT', desc: 'Rechargeable and household batteries', note: 'Keep damaged batteries separate', avgWeightPerUnit: 0.5, carbonOffsetPerKg: 1.2 },
  { name: 'Televisions', code: 'TV', desc: 'LCD, LED, plasma and other displays', note: 'Handle screens upright', avgWeightPerUnit: 14.0, carbonOffsetPerKg: 1.5 },
  { name: 'Printers', code: 'PR', desc: 'Printers, scanners, fax machines, ink and toner units', note: 'Remove loose cartridges', avgWeightPerUnit: 7.0, carbonOffsetPerKg: 1.3 },
  { name: 'Cables', code: 'CB', desc: 'Power cords, adapters, USB cables and other wiring', note: 'Bundle neatly', avgWeightPerUnit: 0.8, carbonOffsetPerKg: 2.1 },
  { name: 'Game consoles', code: 'GC', desc: 'Consoles, controllers and handheld devices', note: 'Sign out of accounts', avgWeightPerUnit: 3.2, carbonOffsetPerKg: 1.6 },
  { name: 'Audio equipment', code: 'AU', desc: 'Speakers, headphones, radios and stereo equipment', note: 'Keep accessories together', avgWeightPerUnit: 2.4, carbonOffsetPerKg: 1.4 },
  { name: 'Cameras', code: 'CA', desc: 'Digital cameras, camcorders, lenses and accessories', note: 'Remove memory cards', avgWeightPerUnit: 0.9, carbonOffsetPerKg: 1.9 },
  { name: 'Small appliances', code: 'SA', desc: 'Small electric kitchen, grooming and household appliances', note: 'Clean food containers', avgWeightPerUnit: 2.2, carbonOffsetPerKg: 1.1 },
  { name: 'Networking equipment', code: 'NW', desc: 'Routers, modems, switches and network accessories', note: 'Reset credentials', avgWeightPerUnit: 1.1, carbonOffsetPerKg: 1.7 },
  { name: 'Wearables', code: 'WR', desc: 'Smartwatches, fitness trackers and other electronic wearables', note: 'Built-in batteries: do not open', avgWeightPerUnit: 0.2, carbonOffsetPerKg: 2.2 },
  { name: 'Lamps and lighting', code: 'LT', desc: 'LED lamps and electronic lighting', note: 'Ask the point about special handling', avgWeightPerUnit: 0.4, carbonOffsetPerKg: 1.0 },
  { name: 'Other small electronics', code: 'OT', desc: 'Calculators, toys, power banks and other small devices', note: 'Power banks: treat as batteries', avgWeightPerUnit: 0.6, carbonOffsetPerKg: 1.5 },
];

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    let categories = await WasteCategory.find().sort({ name: 1 });
    if (!categories || categories.length === 0) {
      // Auto-seed if empty
      try {
        await WasteCategory.insertMany(DEFAULT_CATEGORIES);
        categories = await WasteCategory.find().sort({ name: 1 });
      } catch (_) {
        return res.json(DEFAULT_CATEGORIES);
      }
    }
    return res.json(categories);
  } catch (err) {
    return res.json(DEFAULT_CATEGORIES);
  }
});

module.exports = router;

