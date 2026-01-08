const { validateToken } = require("../services/auth");

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
    } catch {
      req.user = null;
      res.locals.user = null;
    }
    next();
  };
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/user/signin");
  next();
}

module.exports = { checkForAuthCookie, requireAuth };


