const ipStore = new Map();

function createRateLimiter(config) {
  const { windowMs, maxRequests, message } = config;

  return function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    if (!ipStore.has(ip)) {
      ipStore.set(ip, {
        count: 1,
        startTime: now,
      });
      return next();
    }

    const ipData = ipStore.get(ip);

    if (now - ipData.startTime > windowMs) {
      ipStore.set(ip, {
        count: 1,
        startTime: now,
      });
      return next();
    }

    ipData.count += 1;

    if (ipData.count > maxRequests) {
      return res.error(429, message);
    }

    next();
  };
}

const apiRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: "Too many requests",
});

module.exports = { createRateLimiter, apiRateLimiter };
