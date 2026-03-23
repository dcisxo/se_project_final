module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = status === 500 ? "An unexpected error occurred" : err.message;
  res.status(status).json({ message });
};
