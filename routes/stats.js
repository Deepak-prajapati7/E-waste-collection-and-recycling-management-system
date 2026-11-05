const express = require('express');
const router = express.Router();
const CollectionRequest = require('../models/CollectionRequest');
const { authenticate } = require('../middleware/auth');

const mongoose = require('mongoose');

// GET /api/stats
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isUserAdmin = req.user.role === 'admin';
    let requests = [];

    if (mongoose.connection.readyState === 1) {
      const filter = isUserAdmin ? {} : { email: req.user.email.toLowerCase() };
      requests = await CollectionRequest.find(filter);
    } else {
      // Fallback
      requests = [
        {
          id: 1730000001,
          category: 'Computers',
          qty: 2,
          status: 'Scheduled',
          email: 'rahul@example.com',
          estimatedWeight: 13.0,
        },
        {
          id: 1730000002,
          category: 'Mobile phones',
          qty: 3,
          status: 'Completed',
          email: 'rahul@example.com',
          actualWeight: 1.5,
          estimatedWeight: 1.5,
        },
        {
          id: 1730000003,
          category: 'Batteries',
          qty: 5,
          status: 'Pending',
          email: 'priya@example.com',
          estimatedWeight: 2.5,
        },
      ];
      if (!isUserAdmin) {
        requests = requests.filter((r) => r.email === req.user.email.toLowerCase());
      }
    }

    const totalRequests = requests.length;
    const pendingCount = requests.filter((r) => r.status === 'Pending').length;
    const inProgressCount = requests.filter((r) =>
      ['Approved', 'Scheduled', 'Collected', 'Processing'].includes(r.status)
    ).length;
    const completedCount = requests.filter((r) => r.status === 'Completed').length;
    const cancelledCount = requests.filter((r) =>
      ['Rejected', 'Cancelled'].includes(r.status)
    ).length;

    // Environmental impact calculations
    // Estimated e-waste weight (kg)
    const totalWeightKg = requests.reduce((acc, r) => {
      const w = r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8;
      return acc + w;
    }, 0);

    const completedWeightKg = requests
      .filter((r) => r.status === 'Completed')
      .reduce((acc, r) => acc + (r.actualWeight || r.estimatedWeight || (r.qty || 1) * 2.8), 0);

    // 1 kg e-waste diverted ≈ 1.44 kg CO2 prevented
    const co2SavedKg = Math.round(completedWeightKg * 1.44);

    // Metals recovery estimations (approx. standard percentages)
    const copperRecoveredGrams = Math.round(completedWeightKg * 120); // ~120g per kg
    const aluminumRecoveredGrams = Math.round(completedWeightKg * 140); // ~140g per kg
    const goldTracesMg = Math.round(completedWeightKg * 35); // ~35mg per kg

    // Status distribution
    const statusCounts = {};
    [
      'Pending',
      'Approved',
      'Scheduled',
      'Collected',
      'Processing',
      'Completed',
      'Rejected',
      'Cancelled',
    ].forEach((st) => {
      statusCounts[st] = requests.filter((r) => r.status === st).length;
    });

    // Category distribution
    const categoryCounts = {};
    requests.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    return res.json({
      totalRequests,
      pendingCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10,
      completedWeightKg: Math.round(completedWeightKg * 10) / 10,
      co2SavedKg,
      copperRecoveredGrams,
      aluminumRecoveredGrams,
      goldTracesMg,
      statusCounts,
      categoryCounts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
