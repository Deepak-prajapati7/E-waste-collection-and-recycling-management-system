const express = require('express');
const router = express.Router();
const CollectionRequest = require('../models/CollectionRequest');
const WasteCategory = require('../models/WasteCategory');
const { authenticate, requireAdmin } = require('../middleware/auth');

const VALID_STATUSES = [
  'Pending',
  'Approved',
  'Scheduled',
  'Collected',
  'Processing',
  'Completed',
  'Rejected',
  'Cancelled',
];

const mongoose = require('mongoose');

// In-memory fallback dataset for when MongoDB is connecting or offline
let memoryRequests = [
  {
    numericId: 1730000001,
    id: 1730000001,
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
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    history: [
      { status: 'Pending', at: new Date(Date.now() - 86400000 * 3), by: 'Rahul Sharma', note: 'Submitted via web' },
      { status: 'Approved', at: new Date(Date.now() - 86400000 * 2), by: 'System Admin', note: 'Verified by dispatcher' },
      { status: 'Scheduled', at: new Date(Date.now() - 86400000 * 1), by: 'System Admin', note: 'Assigned to EcoCycle Van #3' },
    ],
  },
  {
    numericId: 1730000002,
    id: 1730000002,
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
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
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
    id: 1730000003,
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
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    history: [
      { status: 'Pending', at: new Date(Date.now() - 3600000 * 4), by: 'Priya Verma', note: 'Awaiting dispatcher review' },
    ],
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to find a request by either numericId or Mongo _id
const findRequestById = async (id) => {
  if (isDbConnected()) {
    const numId = Number(id);
    if (!Number.isNaN(numId) && numId > 0) {
      const doc = await CollectionRequest.findOne({ numericId: numId });
      if (doc) return doc;
    }
    try {
      return await CollectionRequest.findById(id);
    } catch (_) {}
  }
  return memoryRequests.find((r) => String(r.id || r.numericId) === String(id));
};

// GET /api/requests - List requests
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, method, search } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (req.user.role !== 'admin') {
        filter.email = req.user.email.toLowerCase();
      }
      if (status && status !== 'all' && VALID_STATUSES.includes(status)) {
        filter.status = status;
      }
      if (method && ['Pickup', 'Drop-off'].includes(method)) {
        filter.method = method;
      }
      if (search && search.trim()) {
        const q = search.trim();
        const regex = new RegExp(q, 'i');
        filter.$or = [
          { user: regex },
          { email: regex },
          { category: regex },
          { location: regex },
          { notes: regex },
        ];
        const numQuery = Number(q);
        if (!Number.isNaN(numQuery)) {
          filter.$or.push({ numericId: numQuery });
        }
      }
      const requests = await CollectionRequest.find(filter).sort({ createdAt: -1 });
      return res.json(requests);
    }

    // Memory fallback
    let list = [...memoryRequests];
    if (req.user.role !== 'admin') {
      list = list.filter((r) => r.email.toLowerCase() === req.user.email.toLowerCase());
    }
    if (status && status !== 'all' && VALID_STATUSES.includes(status)) {
      list = list.filter((r) => r.status === status);
    }
    if (method && ['Pickup', 'Drop-off'].includes(method)) {
      list = list.filter((r) => r.method === method);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        [r.user, r.email, r.category, r.location, r.notes, r.id, r.numericId]
          .some((f) => String(f || '').toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/requests - Submit a new collection request
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { category, method, qty, date, location, phone, notes } = req.body;

    if (!category || !String(category).trim()) {
      return res.status(400).json({ error: 'Please choose an e-waste category.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Please select a collection date.' });
    }
    if (!location || !String(location).trim()) {
      return res.status(400).json({
        error: method === 'Drop-off' ? 'Please enter or select a drop-off point.' : 'Please enter the pickup address.',
      });
    }

    const cleanQty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    const cleanMethod = method === 'Drop-off' ? 'Drop-off' : 'Pickup';
    const numId = Date.now();
    const createdAt = new Date().toISOString();

    const requestData = {
      numericId: numId,
      id: numId,
      user: req.user.name,
      email: req.user.email.toLowerCase(),
      category: String(category).trim(),
      method: cleanMethod,
      qty: cleanQty,
      date: String(date),
      location: String(location).trim(),
      phone: phone ? String(phone).trim() : '',
      notes: notes ? String(notes).trim() : '',
      status: 'Pending',
      estimatedWeight: cleanQty * 2.5,
      createdAt,
      history: [
        {
          status: 'Pending',
          at: new Date(),
          by: req.user.name,
          note: 'Request submitted online',
        },
      ],
    };

    if (isDbConnected()) {
      try {
        const catDoc = await WasteCategory.findOne({ name: category });
        if (catDoc && catDoc.avgWeightPerUnit) {
          requestData.estimatedWeight = cleanQty * catDoc.avgWeightPerUnit;
        }
      } catch (_) {}

      const newRequest = new CollectionRequest(requestData);
      await newRequest.save();
      memoryRequests.unshift(newRequest.toJSON());
      return res.status(201).json(newRequest);
    }

    // Memory fallback
    memoryRequests.unshift(requestData);
    return res.status(201).json(requestData);
  } catch (err) {
    next(err);
  }
});

// GET /api/requests/:id - Single request details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const request = await findRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Collection request not found.' });
    }

    if (req.user.role !== 'admin' && request.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ error: 'You are not authorized to view this request.' });
    }

    return res.json(request);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/requests/:id/status - Update request status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Please choose a valid collection status.' });
    }

    const request = await findRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Collection request not found.' });
    }

    if (req.user.role !== 'admin') {
      const isOwner = request.email.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwner || request.status !== 'Pending' || status !== 'Cancelled') {
        return res.status(403).json({ error: 'Users can only cancel their own pending requests.' });
      }
    }

    const historyEntry = {
      status,
      at: new Date(),
      by: req.user.name,
      note: note ? String(note).trim() : '',
    };

    if (typeof request.save === 'function') {
      request.status = status;
      request.history = request.history || [];
      request.history.push(historyEntry);
      await request.save();
      return res.json(request);
    }

    // Memory item update
    request.status = status;
    request.history = request.history || [];
    request.history.push(historyEntry);
    return res.json(request);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/requests/:id - Delete a request (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const request = await findRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Collection request not found.' });
    }

    if (isDbConnected() && request._id) {
      await CollectionRequest.findByIdAndDelete(request._id);
    }

    memoryRequests = memoryRequests.filter(
      (r) => String(r.id || r.numericId) !== String(req.params.id)
    );

    return res.json({ ok: true, message: 'Request deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
