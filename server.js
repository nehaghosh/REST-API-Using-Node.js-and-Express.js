// server.js
// CA1: REST API for managing Events using Node.js + Express.js (in-memory storage)

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ---------------------------------------------
// In-memory data store
// ---------------------------------------------
let events = [
  {
    id: 1,
    name: 'Tech Fest 2026',
    category: 'Technology',
    date: '2026-08-10',
    status: 'Scheduled'
  },
  {
    id: 2,
    name: 'Annual Sports Meet',
    category: 'Sports',
    date: '2026-09-05',
    status: 'Scheduled'
  }
];
let nextId = 3; // simple auto-increment id generator

const VALID_STATUSES = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];

// ---------------------------------------------
// Validation middleware
// ---------------------------------------------

// Validates the body when creating a new event (all fields required)
function validateEvent(req, res, next) {
  const { name, category, date, status } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('category is required and must be a non-empty string');
  }
  if (!date || isNaN(Date.parse(date))) {
    errors.push('date is required and must be a valid date (e.g. YYYY-MM-DD)');
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    errors.push(`status is required and must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors;
    return next(err);
  }
  next();
}

// Validates just the status field (for PATCH status-only updates)
function validateStatus(req, res, next) {
  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = [`status is required and must be one of: ${VALID_STATUSES.join(', ')}`];
    return next(err);
  }
  next();
}

// Finds an event by id in the array, attaches it to req, or returns 404
function findEventOr404(req, res, next) {
  const id = parseInt(req.params.id, 10);
  const event = events.find(e => e.id === id);
  if (!event) {
    const err = new Error(`Event with id ${req.params.id} not found`);
    err.statusCode = 404;
    return next(err);
  }
  req.event = event;
  next();
}

// ---------------------------------------------
// Routes
// ---------------------------------------------

// 1. Retrieve all events
app.get('/api/events', (req, res) => {
  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// 2. Retrieve an event by ID
app.get('/api/events/:id', findEventOr404, (req, res) => {
  res.status(200).json({ success: true, data: req.event });
});

// 3. Add a new event (with validation)
app.post('/api/events', validateEvent, (req, res) => {
  const { name, category, date, status } = req.body;
  const newEvent = {
    id: nextId++,
    name: name.trim(),
    category: category.trim(),
    date,
    status
  };
  events.push(newEvent);
  res.status(201).json({ success: true, data: newEvent });
});

// 4. Update complete event details
app.put('/api/events/:id', findEventOr404, validateEvent, (req, res) => {
  const { name, category, date, status } = req.body;
  req.event.name = name.trim();
  req.event.category = category.trim();
  req.event.date = date;
  req.event.status = status;
  res.status(200).json({ success: true, data: req.event });
});

// 5. Update only the event status
app.patch('/api/events/:id/status', findEventOr404, validateStatus, (req, res) => {
  req.event.status = req.body.status;
  res.status(200).json({ success: true, data: req.event });
});

// 6. Delete an event by ID
app.delete('/api/events/:id', findEventOr404, (req, res) => {
  events = events.filter(e => e.id !== req.event.id);
  res.status(200).json({
    success: true,
    message: `Event with id ${req.event.id} deleted successfully`
  });
});

// ---------------------------------------------
// Fallback for unknown routes (404)
// ---------------------------------------------
app.use((req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// ---------------------------------------------
// Centralized error-handling middleware
// (must have 4 arguments so Express recognizes it as an error handler)
// ---------------------------------------------
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.details && { details: err.details })
  });
});

// ---------------------------------------------
// Start server
// ---------------------------------------------
app.listen(PORT, () => {
  console.log(`CA1 Events API running on http://localhost:${PORT}`);
});

module.exports = app;
