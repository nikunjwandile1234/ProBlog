const { validateToken } = require("../services/auth");

/* ============================= */
/* Check Auth Cookie Middleware */
/* ============================= */
function checkForAuthCookie(cookieName) {
  return (req, res, next) => {
    const token = req.cookies?.[cookieName];

    if (!token) {
      req.user = null;
      res.locals.user = null;
      return next();
    }

    try {
      const user = validateToken(token);

      req.user = user;
      res.locals.user = user;
    } catch (err) {
      // ❌ Invalid / expired token → clear it
      res.clearCookie(cookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      req.user = null;
      res.locals.user = null;
    }

    next();
  };
}

/* ============================= */
/* Require Login */
/* ============================= */
function requireAuth(req, res, next) {
  if (!req.user) {
    // Save where user wanted to go
    return res.redirect("/user/signin");
  }
  next();
}

/* ============================= */
/* Require Admin */
/* ============================= */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).send("Admin access only");
  }
  next();
}

module.exports = { checkForAuthCookie, requireAuth, requireAdmin };



