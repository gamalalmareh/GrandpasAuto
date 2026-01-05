const express = require('express');
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/leads - Submit new lead (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, vehicleInterest, notes } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, phone' 
      });
    }

    const newLead = new Lead({
      name,
      email,
      phone,
      vehicleInterest: vehicleInterest || '',
      notes: notes || '',
      status: 'new'
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/leads - Get all leads (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id - Update lead status (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (status && !['new', 'contacted', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: new, contacted, converted, or lost' 
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/leads/:id - Delete lead (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
