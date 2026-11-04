// Global Express error handler
const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ error: `An account with that ${field} already exists.` });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'An unexpected server error occurred.',
  });
};

module.exports = errorHandler;

